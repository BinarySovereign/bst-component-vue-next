// 样式包构建：把 `packages/bst-styles/web` 下的 Less 源码编译为可直接被消费方引用的 CSS 产物
//
// 产物落位与 `packages/bst-styles/package.json` 的 exports 一一对应，均位于包根 build/ 下：
//   build/web/index.css          全量样式（含令牌、混合器、归一化与全部组件）
//   build/web/base.css           归一化层单独产出，供宿主页面按需引入
//   build/web/tokens.css         设计令牌层
//   build/web/theme-light.css    亮色主题令牌
//   build/web/theme-dark.css     暗色主题令牌
//   build/web/basic-components/<组件名>/index.css     基础组件按需样式
//   build/web/advanced-components/<组件名>/index.css  高级组件按需样式
//   build/web/ai-components/<组件名>/index.css        AI 组件按需样式
// 每份 `.css` 另产出一份 `.min.css`（保留未压缩版可读性，压缩版供生产直接引用）
//
// 实现选择说明：本模块不经过 Rollup，而是直接调用 Less 与 PostCSS。
// 原因是纯 CSS 入口经 Rollup 只会绕行一层无收益的中间模块，而按需组件的「前置注入」
// 需要在源码层改写（见下方 buildSharedImports），直接编译能精确控制产物路径与内容。
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import autoprefixer from 'autoprefixer';
import { transform } from 'esbuild';
import less from 'less';
import postcss from 'postcss';

import { BANNER } from './banner.js';
import { BUILD_DIR, relativePosix, resolvePackage, toPosix } from './paths.js';

// 样式源码根：web 端源码全部位于其下
const WEB_DIR = 'web';

// 按需组件样式目录：一级子目录即按需产物单元，按组件分层分别扫描
const COMPONENT_ROOT_DIRS = [
  `${WEB_DIR}/basic-components`,
  `${WEB_DIR}/advanced-components`,
  `${WEB_DIR}/ai-components`,
];

// 不作为组件产出的目录：模板仅作规范骨架
const EXCLUDED_COMPONENT_DIRS = new Set(['template']);

// 与 web 端结构同源的固定入口，源码路径相对样式包根目录
const STRUCTURE_ENTRIES = {
  'web/index': `${WEB_DIR}/_index.less`,
  'web/base': `${WEB_DIR}/base/_reset.less`,
  'web/tokens': `${WEB_DIR}/tokens/_index.less`,
  'web/theme-light': `${WEB_DIR}/tokens/_theme-light.less`,
  'web/theme-dark': `${WEB_DIR}/tokens/_theme-dark.less`,
};

// 按需组件产物必须自带的前置层：令牌是 var() 的解析前提，混合器供组件分片直接调用
// 归一化层不进前置层：它属宿主页面语义，注入 N 份既重复又会污染宿主，统一由 web/base 单独产出
const COMPONENT_SHARED_FILES = [`${WEB_DIR}/tokens/_index.less`, `${WEB_DIR}/mixins/_index.less`];

/**
 * 扫描按需组件目录，返回需要产出的组件入口
 *
 * 跳过以下划线开头的私有目录与模板骨架，与 tdesign 的扫描规则保持一致
 *
 * @param {string} packageRoot 样式包根目录
 * @returns {Promise<Array<{ root: string, name: string }>>} 组件分层目录与名称列表（已排序）
 */
async function discoverComponents(packageRoot) {
  const components = [];

  for (const root of COMPONENT_ROOT_DIRS) {
    const componentsRoot = join(packageRoot, root);

    let entries;
    try {
      entries = await readdir(componentsRoot, { withFileTypes: true });
    } catch {
      // 分层目录尚不存在时视为该层无按需产物，不算错误
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('_') || EXCLUDED_COMPONENT_DIRS.has(entry.name)) continue;

      components.push({ root, name: entry.name });
    }
  }

  return components.sort((a, b) => `${a.root}/${a.name}`.localeCompare(`${b.root}/${b.name}`));
}

/**
 * 组装全部样式入口
 *
 * 入口名即产物相对路径（不含扩展名），结构入口恒定存在，故尚无组件时输入也不为空
 *
 * @param {string} packageRoot 样式包根目录
 * @returns {Promise<Map<string, string>>} 入口名 -> 源码绝对路径
 */
async function collectEntries(packageRoot) {
  const entries = new Map();

  for (const [name, source] of Object.entries(STRUCTURE_ENTRIES)) {
    entries.set(name, resolve(packageRoot, source));
  }

  const components = await discoverComponents(packageRoot);

  for (const { root, name } of components) {
    entries.set(`${root}/${name}/index`, resolve(packageRoot, root, name, '_index.less'));
  }

  return entries;
}

/**
 * 判定给定源码路径是否为按需组件入口
 *
 * 路径先归一化为 POSIX 风格再判断，否则 Windows 的反斜杠会让匹配恒为假
 *
 * @param {string} filename 源码绝对路径
 * @returns {boolean} 是否为组件入口
 */
function isComponentEntry(filename) {
  const posixPath = toPosix(filename);

  return posixPath.endsWith('/_index.less') && COMPONENT_ROOT_DIRS.some((root) => posixPath.includes(`/${root}/`));
}

/**
 * 生成组件入口的前置 `@import` 语句
 *
 * 相对路径按入口的实际层级计算，保证注入内容在任意嵌套深度下都能正确解析
 *
 * @param {string} packageRoot 样式包根目录
 * @param {string} entryFile 入口源码绝对路径
 * @returns {string} 待前置的 Less 片段
 */
function buildSharedImports(packageRoot, entryFile) {
  const entryDir = dirname(entryFile);
  return COMPONENT_SHARED_FILES.map((file) => {
    const specifier = relativePosix(entryDir, resolve(packageRoot, file));
    return `@import '${specifier}';`;
  }).join('\n');
}

/**
 * 剥离 CSS 注释
 *
 * 产物只保留统一的文件头 banner，源码注释（含 Less 的块注释）一概不进产物
 */
const stripComments = {
  postcssPlugin: 'bst-strip-comments',
  Once(root) {
    root.walkComments((comment) => comment.remove());
  },
};

/**
 * 编译单个入口为 CSS
 *
 * @param {string} packageRoot 样式包根目录
 * @param {string} source 源码绝对路径
 * @returns {Promise<string>} 编译后的 CSS 文本
 */
async function compileEntry(packageRoot, source) {
  const raw = await readFile(source, 'utf8');
  // 组件入口需前置共享层，否则其分片引用的令牌与混合器未定义，编译会直接失败
  const input = isComponentEntry(source) ? `${buildSharedImports(packageRoot, source)}\n${raw}` : raw;

  const { css } = await less.render(input, {
    filename: source,
    // 允许从样式包根目录开始解析 @import，与源码内的相对路径互补
    paths: [packageRoot],
    // 相对路径按入口所在目录解析
    relativeUrls: true,
  });

  // 依据根 package.json 的 browserslist 自动补全厂商前缀；
  // 先刷掉源码注释，避免注释随产物下发（产物只保留统一文件头）
  const processed = await postcss([stripComments, autoprefixer]).process(css, { from: source });

  return processed.css;
}

/**
 * 压缩 CSS 文本
 *
 * 复用已在依赖内的 esbuild，避免为压缩再引入 cssnano 一类的多余依赖
 *
 * @param {string} css 未压缩的 CSS 文本
 * @returns {Promise<string>} 压缩后的 CSS 文本
 */
async function minifyCss(css) {
  const result = await transform(css, { loader: 'css', minify: true, legalComments: 'inline' });
  return result.code.endsWith('\n') ? result.code : `${result.code}\n`;
}

/**
 * 构建样式包
 *
 * @param {object} [options] 构建选项
 * @param {string} [options.packageKey] 包标识，默认样式包
 * @returns {Promise<void>} 构建完成的 Promise
 */
export async function buildStyles({ packageKey = 'styles' } = {}) {
  const packageRoot = resolvePackage(packageKey);
  const outDir = join(packageRoot, BUILD_DIR);

  // 每次构建清空自身产物目录，避免已删除组件的残留文件继续存在于产物中
  await rm(outDir, { recursive: true, force: true });

  const entries = await collectEntries(packageRoot);

  for (const [name, source] of entries) {
    const compiled = await compileEntry(packageRoot, source);
    const target = join(outDir, `${name}.css`);

    // 未压缩版直接前置 banner；压缩版必须先压缩再前置，
    // 否则 banner 会被 esbuild 当作普通注释删除
    const css = `${BANNER}${compiled}`;
    const minCss = `${BANNER}${await minifyCss(compiled)}`;

    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, css, 'utf8');
    await writeFile(join(outDir, `${name}.min.css`), minCss, 'utf8');

    console.info(`  样式产物 ${name}.css  (${(css.length / 1024).toFixed(1)} KB)`);
  }

  console.info(`  样式构建完成：${entries.size} 个入口 -> ${relativePosix(process.cwd(), outDir)}`);
}
