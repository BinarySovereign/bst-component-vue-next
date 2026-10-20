// 组件包构建：以 Rollup 打包组件源码，产出 es / lib / umd 三种形态
//
//   es    ES 模块，保留模块结构，支持 `@binarysovereign/vue-next/es/button` 这类按需引入
//   lib   CommonJS，同样保留模块结构
//   umd   单文件 UMD 包，供浏览器 script 直接引入
//
// 产物统一落在 <包根>/build/<形态> 下，而非包根散放：build/ 是可随时重建的中间产物，
// 由 `--move main-package` 归拢到根 dist 后即被移除，故整体可被忽略与安全清理。
//
// 样式处理：组件源码不含任何样式（全部由 @binarysovereign/styles 提供），故本管线无 postcss 环节。
// 类型声明：由 tsc 单独产出后复制进各形态目录，见 buildTypes。
import { access, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, posix, relative } from 'node:path';

import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import url from '@rollup/plugin-url';
import { transform as esbuildTransform } from 'esbuild';
import { execa } from 'execa';
import { copy, mkdirp, pathExists, remove } from 'fs-extra';
import { glob } from 'glob';
import { rollup } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';

import { BANNER } from './banner.js';
import { BUILD_DIR, PACKAGE_DIRS, TEMP_DIR, relativePosix, resolvePackage, resolveRoot, toPosix } from './paths.js';

const require = createRequire(import.meta.url);

/**
 * 解析 TypeScript 编译器入口
 *
 * 不走 PATH 上的 `tsc`：脚本可能被直接以 `node scripts/build-package.js` 调用，
 * 此时 node_modules/.bin 不在 PATH 中，依赖命令名会直接失败。
 *
 * @returns {string} tsc 入口的绝对路径
 */
function resolveTscEntry() {
  // 用 require.resolve 而非拼接路径，兼容 pnpm 的 hoist 布局差异
  return require.resolve('typescript/bin/tsc');
}

// 产物形态目录，与 AGENTS.md 的约定一致
const OUTPUT_FORMATS = ['es', 'lib', 'umd'];

// 共享类型包：private 的纯类型包，不单独发布，声明在构建期内联进各组件产物
const SHARED_TYPES_KEY = 'bstTypes';
const SHARED_TYPES_NAME = '@binarysovereign/bst-types';

// 内联目录名，位于每个产物形态目录下（如 es/_types、lib/_types）
const INLINE_TYPES_DIR = '_types';

// 共享类型的层级前缀，与组件源码包一一对应
// 命名规范见 packages/bst-types/README.md：{basic/advanced/ai}-{component}.types.ts
// 各发布单元只内联自身层级的共享类型，跨层级依赖由声明文件间的相对引用按需带入
const SHARED_TYPE_TIER_PREFIX = {
  basicComponents: 'basic-',
  advancedComponents: 'advanced-',
  aiComponents: 'ai-',
};

// 声明文件中的相对模块说明符（'./x' 或 '../x'），用于收集共享类型内部依赖
const RELATIVE_SPECIFIER_PATTERN = /(['"])(\.\.?\/[^'"]+)\1/g;

// 包根入口，供 UMD 单文件产物使用
const PACKAGE_ENTRY = ['index.ts', 'index.tsx'];

// Babel 可处理的扩展名，TSX 需经 @vue/babel-plugin-jsx 转换为 Vue render 函数
const BABEL_EXTENSIONS = ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'];

// 无论依赖如何声明都必须外置的包：由宿主提供，不允许打进产物
const ALWAYS_EXTERNAL = ['vue', /^@vue\//, /^@babel\/runtime/];

// 聚合映射：CLI 目标名 -> { 组件源码包, 主包 }
// 键为对外暴露的构建目标名，值为 resolvePackage 使用的包标识，两者刻意区分：
// 目标名面向使用者（如 vue-next），包标识面向目录（如 vueNext）
export const AGGREGATE_MAP = {
  'vue-next': { source: 'basicComponents', target: 'vueNext' },
  'vue-next-pro': { source: 'advancedComponents', target: 'vueNextPro' },
  'vue-next-pro-ai': { source: 'aiComponents', target: 'vueNextProAi' },
};

/**
 * 读取包自身的 package.json
 *
 * @param {string} packageRoot 包根目录
 * @returns {Promise<object | null>} 解析结果，不存在时返回 null
 */
async function readPackageJson(packageRoot) {
  try {
    const raw = await readFile(join(packageRoot, 'package.json'), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * 收集需要外置的依赖
 *
 * 取自包自身的 dependencies / peerDependencies，再叠加 ALWAYS_EXTERNAL
 *
 * @param {object | null} pkg 包元数据
 * @returns {Array<string | RegExp>} Rollup external 配置
 */
function collectExternals(pkg) {
  const declared = [...Object.keys(pkg?.dependencies ?? {}), ...Object.keys(pkg?.peerDependencies ?? {})];
  return [...new Set([...declared, ...ALWAYS_EXTERNAL])];
}

/**
 * 收集参与构建的源码文件
 *
 * 排除类型声明、单测、示例与产物目录；types.ts 只含类型定义，无需产出运行时模块
 *
 * @param {string} packageRoot 包根目录
 * @returns {Promise<string[]>} 源码绝对路径列表
 */
async function collectInputs(packageRoot) {
  const normalizedRoot = toPosix(packageRoot);

  const patterns = [`${normalizedRoot}/**/*.ts`, `${normalizedRoot}/**/*.tsx`];

  const ignores = [
    `${normalizedRoot}/node_modules/**`,
    // 产物目录整体排除，各产物形态（es / lib / umd）即其子目录
    `${normalizedRoot}/${BUILD_DIR}/**`,
    `${normalizedRoot}/**/*.d.ts`,
    `${normalizedRoot}/**/types.ts`,
    `${normalizedRoot}/**/__test__/**`,
    `${normalizedRoot}/**/__tests__/**`,
    `${normalizedRoot}/**/_example/**`,
    `${normalizedRoot}/**/examples/**`,
    // 组件模板仅作规范骨架，不是可构建的组件，必须排除
    `${normalizedRoot}/template/**`,
  ];

  return glob(patterns, { ignore: ignores, absolute: true, nodir: true });
}

/**
 * 创建 Rollup 插件栈
 *
 * 处理顺序即数组顺序：esbuild 剥离类型并保留 JSX，随后由 Babel 的 Vue JSX 插件完成 JSX 转换
 *
 * @param {object} options 配置项
 * @param {string} options.version 用于注入 PKG_VERSION 的版本号
 * @returns {import('rollup').Plugin[]} 插件数组
 */
function createPlugins({ version }) {
  return [
    nodeResolve({ extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx'] }),
    commonjs(),
    // 只负责剥离 TS 类型，JSX 原样保留给 Babel 处理
    esbuild({ target: 'esnext', minify: false, jsx: 'preserve' }),
    babel({
      // 使用内置 helpers 而非 @babel/runtime：
      // runtime 模式要求每个组件包都把 @babel/runtime 声明为 dependencies，
      // 且需在 Babel 配置中启用 @babel/plugin-transform-runtime；
      // bundled 模式由 Rollup 在打包时去重复用 helper，产物自包含、无额外运行时依赖。
      // 若日后改为 runtime 模式，须同时补 @babel/runtime 依赖与 transform-runtime 插件。
      babelHelpers: 'bundled',
      extensions: BABEL_EXTENSIONS,
      // 固定 envName，避免外部 NODE_ENV 意外命中 babel.config.cjs 的 lib / umd 分支，
      // 那两个分支分别面向单独的 CommonJS 与 UMD 产物，不适用于这里的多形态构建
      envName: 'build',
      // 复用仓库根的 Babel 配置，避免目标浏览器在两处维护
      configFile: resolveRoot('babel.config.cjs'),
    }),
    json(),
    url(),
    replace({
      preventAssignment: true,
      values: { PKG_VERSION: JSON.stringify(version) },
    }),
    // 压缩放在插件栈末尾：此时其余插件对源代码的处理已全部结束
    createMinifyPlugin(),
  ];
}

/**
 * 创建产物压缩插件
 *
 * 压缩放在 renderChunk 而非转换阶段：此时模块已完成 TS / JSX 转换与依赖内联，
 * 压缩作用于最终代码，不会干扰 Babel 与 JSX 插件的处理。
 *
 * !important：Rollup 在调用 renderChunk 之前就已拼入 banner，因此必须先把 banner 摘出来，
 * 压缩剩余代码后再原样放回；否则压缩器会把 banner 当普通注释删掉。
 * 重新拼回会占用前若干行，sourcemap 的 mappings 需同步整体下移。
 *
 * @returns {import('rollup').Plugin} 压缩插件
 */
function createMinifyPlugin() {
  // banner 末尾带换行，按 \n 切分后会多出一个空串，故需减一
  const bannerLines = BANNER.split('\n').length - 1;

  return {
    name: 'bst-minify',
    async renderChunk(code) {
      const hasBanner = code.startsWith(BANNER);
      const source = hasBanner ? code.slice(BANNER.length) : code;

      const result = await esbuildTransform(source, {
        loader: 'js',
        // 同时压缩语法、空白与局部标识符
        minify: true,
        // 语法降级已由 Babel 依 browserslist 完成，此处只压缩，不做二次转换
        target: 'esnext',
        sourcemap: true,
      });

      const map = result.map ? JSON.parse(result.map) : null;

      // 没有 sourcemap 时无需平移；映射缺失时上面的 sourcemap: true 保证不会走到该分支
      if (map && hasBanner) {
        map.mappings = `${';'.repeat(bannerLines)}${map.mappings}`;
      }

      return { code: `${hasBanner ? BANNER : ''}${result.code}`, map };
    },
  };
}

/**
 * 查找包根入口文件，供 UMD 单文件产物使用
 *
 * @param {string} packageRoot 包根目录
 * @returns {Promise<string | null>} 入口绝对路径，不存在时返回 null
 */
async function findPackageEntry(packageRoot) {
  for (const candidate of PACKAGE_ENTRY) {
    const absolute = join(packageRoot, candidate);

    try {
      await access(absolute);

      return absolute;
    } catch {
      // 继续尝试下一个候选名
    }
  }

  return null;
}

/**
 * 构建单个产物形态
 *
 * @param {object} options 配置项
 * @param {string[]} options.input 源码入口列表
 * @param {string} options.packageRoot 包根目录
 * @param {Array<string | RegExp>} options.external 外置依赖
 * @param {string} options.outDir 产物目录
 * @param {'es' | 'lib' | 'umd'} options.format 产物形态
 * @param {string} options.banner 产物 banner
 * @param {string} options.name UMD 全局变量名
 * @param {import('rollup').Plugin[]} options.plugins 插件栈
 * @returns {Promise<boolean>} 是否实际产出
 */
async function buildFormat({ input, packageRoot, external, outDir, format, banner, name, plugins }) {
  // UMD 需要单一入口：取包根 index.ts，无该文件时跳过
  if (format === 'umd') {
    const entry = await findPackageEntry(packageRoot);

    if (!entry) {
      console.info('  UMD 跳过：未找到包根入口 index.ts');

      return false;
    }

    const bundle = await rollup({ input: entry, external, plugins });

    await bundle.write({
      name,
      banner,
      format: 'umd',
      exports: 'named',
      globals: { vue: 'Vue' },
      sourcemap: true,
      file: join(outDir, `${name}.js`),
    });
    await bundle.close();

    return true;
  }

  const bundle = await rollup({ input, external, plugins });

  await bundle.write({
    banner,
    dir: outDir,
    format: format === 'es' ? 'es' : 'cjs',
    exports: 'named',
    sourcemap: true,
    // 保留源码模块结构，使按需引入路径与源码目录一一对应
    preserveModules: true,
    preserveModulesRoot: packageRoot,
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].js',
  });
  await bundle.close();

  return true;
}

/**
 * 构建组件包
 *
 * @param {object} options 配置项
 * @param {string} options.packageKey 包标识
 * @param {string} options.outKey 产物落位的包标识，默认与 packageKey 相同
 * @returns {Promise<boolean>} 是否产出了产物
 */
export async function buildComponents({ packageKey, outKey = packageKey }) {
  const packageRoot = resolvePackage(packageKey);
  const buildRoot = join(resolvePackage(outKey), BUILD_DIR);
  const pkg = await readPackageJson(packageRoot);

  const inputs = await collectInputs(packageRoot);

  if (inputs.length === 0) {
    // 仓库尚处骨架阶段时属预期状态，明确提示而非静默通过
    console.info(`  组件构建跳过：${relativePosix(process.cwd(), packageRoot)} 下暂无可构建的 .ts/.tsx 源码`);

    return false;
  }

  // 先清空目标形态目录，避免已删除模块的产物残留
  await Promise.all(OUTPUT_FORMATS.map((format) => remove(join(buildRoot, format))));

  const version = pkg?.version ?? '0.0.0';
  const name = pkg?.name?.split('/').pop() ?? 'bst';
  const external = collectExternals(pkg);
  const plugins = createPlugins({ version });

  for (const format of OUTPUT_FORMATS) {
    const outDir = join(buildRoot, format);

    // 不预先建目录：Rollup 写产物时自建父目录，
    // 提前创建会让「未产出的形态」留下空目录，进而被后续聚合误判为已有产物
    const produced = await buildFormat({
      input: inputs,
      packageRoot,
      external,
      outDir,
      format,
      // banner 由 Rollup 在生成阶段写入，故源码注释被剥离后仍能保留统一文件头
      banner: BANNER,
      name: name.replace(/[^a-zA-Z0-9_$]/g, ''),
      plugins,
    });

    if (produced) {
      console.info(`  产物 ${format} -> ${relativePosix(process.cwd(), outDir)}`);
    }
  }

  return true;
}

/**
 * 转义正则元字符
 *
 * @param {string} value 原始文本
 * @returns {string} 可用于 RegExp 的文本
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 把导入路径补全为共享类型声明文件的相对路径
 *
 * 统一产出 POSIX 风格路径：共享类型目录会被原样复制进 `_types`，
 * 使用 POSIX 分隔符才能与 glob 结果、正则解析出的路径保持可比较。
 *
 * @param {string} relativePath 相对共享类型 src 目录的路径
 * @returns {string} 补全 `.d.ts` 后的相对路径
 */
function normalizeDeclarationPath(relativePath) {
  const normalized = relativePath.replace(/^\.\//, '');

  if (normalized.endsWith('.d.ts')) {
    return normalized;
  }

  if (normalized.endsWith('.ts')) {
    return `${normalized.slice(0, -3)}.d.ts`;
  }

  return `${normalized}.d.ts`;
}

/**
 * 解析共享类型中的模块说明符，定位真实存在的声明文件
 *
 * 说明符可能省略扩展名，也可能指向目录（由目录下的 index.d.ts 承载），
 * 因此按「补全扩展名 -> 目录入口」的顺序探测。
 *
 * @param {string} sourceDir 共享类型声明源码目录
 * @param {string} relativePath 相对该目录的路径
 * @returns {Promise<string | null>} 命中的相对路径，均不存在时返回 null
 */
async function resolveSharedDeclaration(sourceDir, relativePath) {
  const normalized = posix.normalize(relativePath).replace(/^\.\//, '');
  const candidates = normalized.endsWith('.d.ts')
    ? [normalized]
    : [`${normalizeDeclarationPath(normalized)}`, `${normalized.replace(/\/$/, '')}/index.d.ts`];

  for (const candidate of candidates) {
    if (await pathExists(join(sourceDir, candidate))) {
      return candidate;
    }
  }

  return null;
}

/**
 * 收集共享类型声明及其相对引用依赖
 *
 * 以本包实际用到的共享类型为起点，沿声明内部的相对引用递归展开：
 * 跨层级依赖（如高级类型引用基础类型）会随之被带入，保证内联结果自包含。
 *
 * @param {string} sourceDir 共享类型声明源码目录
 * @param {Iterable<string>} seeds 起点的相对路径
 * @returns {Promise<Set<string>>} 需要内联的相对路径集合
 */
async function collectSharedDeclarations(sourceDir, seeds) {
  const collected = new Set();
  const queue = await Promise.all([...seeds].map((seed) => resolveSharedDeclaration(sourceDir, seed)));

  while (queue.length > 0) {
    const relativePath = queue.pop();

    if (!relativePath || collected.has(relativePath)) {
      continue;
    }

    collected.add(relativePath);

    const source = await readFile(join(sourceDir, relativePath), 'utf8');

    for (const match of source.matchAll(RELATIVE_SPECIFIER_PATTERN)) {
      const dependency = posix.normalize(posix.join(posix.dirname(relativePath), match[2]));

      if (!collected.has(dependency)) {
        queue.push(await resolveSharedDeclaration(sourceDir, dependency));
      }
    }
  }

  return collected;
}

/**
 * 按实际内联结果裁剪共享类型统一入口
 *
 * 共享类型的 `index` 会转出全部层级，若不裁剪，基础组件包也会把高级 / AI 类型一并带走。
 * 只删除指向未内联文件的 import / export 语句，注释与空行原样保留；
 * 全部语句被裁掉时补一个空 `export`，避免入口不再是模块。
 *
 * @param {string} source 原始 index 声明内容
 * @param {Set<string>} included 已内联的相对路径集合
 * @returns {string} 裁剪后的声明内容
 */
function filterSharedIndex(source, included) {
  const kept = source.split('\n').filter((line) => {
    if (!/^\s*(export|import)\b/.test(line)) {
      return true;
    }

    const specifiers = [...line.matchAll(RELATIVE_SPECIFIER_PATTERN)];

    if (specifiers.length === 0) {
      return true;
    }

    return specifiers.every((match) => included.has(normalizeDeclarationPath(match[2])));
  });

  const content = kept.join('\n');

  return /^\s*export\b/m.test(content) ? content : `${content.trimEnd()}\nexport {};\n`;
}

/**
 * 把共享类型包的声明内联进产物，并改写包名引用
 *
 * 共享类型包是 private 的纯类型包，不会单独发布。若声明中保留
 * `@binarysovereign/bst-types` 的包名引用，消费方要么装不到该包，
 * 要么各发布单元不再自包含（本仓库以 dist 单元方式分发，必须自包含）。
 *
 * 处理分三步：
 *   1. 扫描本包声明，确认实际用到了哪些共享类型；
 *      裸包名引用指向统一入口，按本包层级裁剪后取用，避免把其他层级一并内联；
 *   2. 只把这些声明（连同其相对引用依赖）复制到 `<es|lib>/_types/`；
 *   3. 把产物内所有 `.d.ts` 中的包名引用，按文件位置改写为指向 `_types` 的相对路径。
 *
 * 只处理声明文件：源码中的共享类型一律以 `import type` 引入，esbuild 会整条擦除，
 * 运行时产物里不存在该模块的引用。
 *
 * @param {object} options 配置项
 * @param {string} options.typesTempDir tsc 的临时产出目录
 * @param {string} options.buildRoot 包产物根目录
 * @param {keyof typeof SHARED_TYPE_TIER_PREFIX} options.packageKey 组件源码包标识
 * @returns {Promise<boolean>} 是否执行了内联
 */
async function inlineSharedTypes({ typesTempDir, buildRoot, packageKey }) {
  // tsc 以仓库根为 rootDir，故共享类型的声明位于 <temp>/<包目录>/src 下
  const sourceDir = join(typesTempDir, PACKAGE_DIRS[SHARED_TYPES_KEY], 'src');

  if (!(await pathExists(sourceDir))) {
    return false;
  }

  const declarations = await glob('**/*.d.ts', { cwd: sourceDir, absolute: true, nodir: true });

  if (declarations.length === 0) {
    return false;
  }

  const tierPrefix = SHARED_TYPE_TIER_PREFIX[packageKey];

  if (!tierPrefix) {
    throw new Error(`未知的组件源码包标识：${packageKey}`);
  }

  // 同时匹配根入口与子路径两种写法，引号单双均可（verbatimModuleSyntax 会保留源码引号风格）
  const specifierPattern = new RegExp(`(['"])${escapeRegExp(SHARED_TYPES_NAME)}(/[^'"]*)?\\1`, 'g');
  const indexSourcePath = join(sourceDir, 'index.d.ts');

  // 收集本包声明中的共享类型引用：裸包名走统一入口，子路径直接定位文件
  const seeds = new Set();
  let usesBarrelEntry = false;

  for (const format of ['es', 'lib']) {
    const outDir = join(buildRoot, format);

    // UMD 无声明产物，缺失时跳过
    if (!(await pathExists(outDir))) {
      continue;
    }

    const normalizedInlineDir = `${toPosix(join(outDir, INLINE_TYPES_DIR))}/`;
    const files = await glob('**/*.d.ts', { cwd: outDir, absolute: true, nodir: true });

    for (const file of files) {
      // 内联目录内部的引用本就是相对路径，无需再解析
      if (toPosix(file).startsWith(normalizedInlineDir)) {
        continue;
      }

      const source = await readFile(file, 'utf8');

      for (const match of source.matchAll(specifierPattern)) {
        const subPath = (match[2] ?? '').replace(/^\//, '');

        if (subPath) {
          seeds.add(subPath);
        } else {
          usesBarrelEntry = true;
        }
      }
    }
  }

  // 裸包名引用会转出共享类型包的全部层级，这里只取本包层级，
  // 其余层级仅在声明间存在真实相对引用时才会被带入
  if (usesBarrelEntry && (await pathExists(indexSourcePath))) {
    const indexSource = await readFile(indexSourcePath, 'utf8');

    for (const match of indexSource.matchAll(RELATIVE_SPECIFIER_PATTERN)) {
      const relativePath = normalizeDeclarationPath(match[2]);

      if (posix.basename(relativePath).startsWith(tierPrefix)) {
        seeds.add(relativePath);
      }
    }
  }

  const collected = await collectSharedDeclarations(sourceDir, seeds);

  // 没有任何共享类型引用时无需内联，也不必创建 _types 目录；
  // 同时清掉可能残留的上一轮产物，避免旧类型混入本次发布单元
  if (!usesBarrelEntry && collected.size === 0) {
    for (const format of ['es', 'lib']) {
      const outDir = join(buildRoot, format);

      if (await pathExists(outDir)) {
        await remove(join(outDir, INLINE_TYPES_DIR));
      }
    }

    return false;
  }

  let inlined = false;

  for (const format of ['es', 'lib']) {
    const outDir = join(buildRoot, format);

    // 形态目录不存在时不应创建空目录
    if (!(await pathExists(outDir))) {
      continue;
    }

    const inlineDir = join(outDir, INLINE_TYPES_DIR);

    // _types 只可能由上一步产出，先清空避免上一轮的残留混入
    await remove(inlineDir);

    // 只内联本包实际用到的声明，保持各发布单元的类型边界
    for (const relativePath of collected) {
      const destination = join(inlineDir, relativePath);

      await mkdirp(dirname(destination));
      await copy(join(sourceDir, relativePath), destination, { overwrite: true });
    }

    // 统一入口按内联结果裁剪，避免转出未内联的层级
    if (usesBarrelEntry) {
      const originalIndex = (await pathExists(indexSourcePath)) ? await readFile(indexSourcePath, 'utf8') : '';

      await mkdirp(inlineDir);
      await writeFile(join(inlineDir, 'index.d.ts'), filterSharedIndex(originalIndex, collected), 'utf8');
    }

    const normalizedInlineDir = `${toPosix(inlineDir)}/`;
    const files = await glob('**/*.d.ts', { cwd: outDir, absolute: true, nodir: true });

    for (const file of files) {
      // 内联目录内部的引用本就是相对路径，无需改写
      if (toPosix(file).startsWith(normalizedInlineDir)) {
        continue;
      }

      const original = await readFile(file, 'utf8');

      if (!original.includes(SHARED_TYPES_NAME)) {
        continue;
      }

      const rewritten = original.replace(specifierPattern, (_match, quote, subPath = '') => {
        const absolute = subPath ? join(inlineDir, subPath.slice(1)) : join(inlineDir, 'index');
        let specifier = relativePosix(dirname(file), absolute);

        // 相对说明符必须以 ./ 或 ../ 开头，否则会被当作包名
        if (!specifier.startsWith('.')) {
          specifier = `./${specifier}`;
        }

        return `${quote}${specifier}${quote}`;
      });

      if (rewritten !== original) {
        await writeFile(file, rewritten, 'utf8');
      }
    }

    inlined = true;
  }

  return inlined;
}

/**
 * 为产物中的声明文件补上统一文件头
 *
 * 源码注释已由 tsconfig.build.json 的 removeComments 剥离，此处只负责写入唯一保留的 banner。
 * 以「文件是否已以 banner 开头」判定，保证重复执行不会叠加。
 *
 * @param {string} buildRoot 包产物根目录
 * @returns {Promise<number>} 已补写 banner 的文件数
 */
async function applyDeclarationBanner(buildRoot) {
  let written = 0;

  for (const format of ['es', 'lib']) {
    const outDir = join(buildRoot, format);

    // UMD 无声明产物，形态目录不存在时不应创建空目录
    if (!(await pathExists(outDir))) {
      continue;
    }

    const files = await glob('**/*.d.ts', { cwd: outDir, absolute: true, nodir: true });

    for (const file of files) {
      const original = await readFile(file, 'utf8');

      if (original.startsWith(BANNER)) {
        continue;
      }

      await writeFile(file, `${BANNER}${original}`, 'utf8');
      written += 1;
    }
  }

  return written;
}

/**
 * 生成并分发类型声明
 *
 * 先用 tsc 产出声明文件，再复制进 es / lib 两种形态目录，使两种引入方式都带类型
 *
 * @param {object} options 配置项
 * @param {string} options.packageKey 包标识
 * @param {string} options.outKey 产物落位的包标识
 * @returns {Promise<void>} 构建完成的 Promise
 */
export async function buildTypes({ packageKey, outKey = packageKey }) {
  const buildRoot = join(resolvePackage(outKey), BUILD_DIR);
  const tsconfigPath = resolveRoot('tsconfig.build.json');

  try {
    await access(tsconfigPath);
  } catch {
    console.info(`  类型声明跳过：${relativePosix(process.cwd(), tsconfigPath)} 不存在`);

    return;
  }

  // 临时目录置于 node_modules 下，避免被自身的产物扫描再次读入
  const typesTempDir = resolveRoot(TEMP_DIR);
  const packageDirName = PACKAGE_DIRS[packageKey];

  // 用 node 执行 tsc 入口而非依赖 PATH 上的 tsc 命令
  await execa(
    process.execPath,
    [resolveTscEntry(), '--project', tsconfigPath, '--outDir', typesTempDir, '--emitDeclarationOnly'],
    { cwd: resolveRoot(), stdio: 'inherit' },
  );

  // tsc 以仓库根为 rootDir，故某包的声明位于 <temp>/<包目录> 下
  const emittedDir = join(typesTempDir, packageDirName);

  try {
    await access(emittedDir);
  } catch {
    console.info('  类型声明跳过：tsc 未产出该包的声明文件');
    await remove(typesTempDir);

    return;
  }

  // 过滤一律基于「相对该包声明目录」的路径判断：
  // 临时目录位于 node_modules 下，若对绝对路径做 node_modules 判断会把全部声明误滤掉
  const isDispatchable = (src) => {
    const rel = toPosix(relative(emittedDir, src));

    return !rel.split('/').includes('node_modules') && !rel.endsWith('.d.ts.map');
  };

  for (const format of ['es', 'lib']) {
    // 声明文件与 JS 模块同层，保持 import 路径与 .d.ts 查找规则一致
    await copy(emittedDir, join(buildRoot, format), { overwrite: true, filter: isDispatchable });
  }

  // 共享类型是 private 的纯类型包，必须内联进产物才能让发布单元保持自包含；
  // 只内联本包层级实际用到的声明，避免基础包混入高级 / AI 类型
  const inlined = await inlineSharedTypes({ typesTempDir, buildRoot, packageKey });

  // 声明文件同样只保留统一文件头（共享类型内联后一并处理，覆盖 _types 目录）
  await applyDeclarationBanner(buildRoot);

  // 以实际产出量为准回报，避免"复制了 0 个文件却提示成功"的假通过
  const dispatched = (await glob('**/*.d.ts', { cwd: emittedDir, nodir: true })).length;

  await remove(typesTempDir);

  if (dispatched === 0) {
    // 静默通过会掩盖配置偏差（如 include 未覆盖某个包），因此显式区分"产出为空"
    console.info('  类型声明：tsc 未产出任何声明文件');

    return;
  }

  const inlineHint = inlined ? `，已内联共享类型 -> ${INLINE_TYPES_DIR}` : '';

  console.info(`  类型声明 ${dispatched} 个 -> es / lib${inlineHint}`);
}

/**
 * 把源码包的构建产物聚合到主包
 *
 * @param {object} options 配置项
 * @param {keyof typeof AGGREGATE_MAP} options.target 主包标识
 * @returns {Promise<void>} 聚合完成的 Promise
 */
export async function aggregatePackage({ target }) {
  const mapping = AGGREGATE_MAP[target];

  if (!mapping) {
    throw new Error(`未知的聚合目标：${target}（可选值：${Object.keys(AGGREGATE_MAP).join(' / ')}）`);
  }

  const sourceRoot = resolvePackage(mapping.source);
  const sourceBuild = join(sourceRoot, BUILD_DIR);
  const outBuild = join(resolvePackage(mapping.target), BUILD_DIR);

  const existing = [];

  for (const format of OUTPUT_FORMATS) {
    const formatDir = join(sourceBuild, format);

    try {
      await access(formatDir);
    } catch {
      // 该形态无产物目录，跳过
      continue;
    }

    // 目录存在不代表有产物：确认其中确有文件，避免聚合空目录
    const files = await glob('**/*', { cwd: formatDir, nodir: true });

    if (files.length > 0) {
      existing.push(format);
    }
  }

  if (existing.length === 0) {
    console.info(`  聚合跳过：${relativePosix(process.cwd(), sourceBuild)} 尚无产物，请先执行 build:private`);

    return;
  }

  const pkg = await readPackageJson(resolvePackage(mapping.target));
  await mkdirp(outBuild);

  for (const format of existing) {
    await remove(join(outBuild, format));
    await copy(join(sourceBuild, format), join(outBuild, format));
    console.info(`  聚合 ${format} -> ${relativePosix(process.cwd(), join(outBuild, format))}`);
  }

  if (pkg?.name) {
    console.info(`  主包 ${pkg.name} 聚合完成`);
  }
}

export { OUTPUT_FORMATS, readPackageJson, collectExternals };
