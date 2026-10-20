// 设计令牌清单
//
// 在构建期解析 `packages/bst-styles/web/tokens/*.less`，把令牌清单经虚拟模块交给
// 「样式预览」页的令牌表组件。
//
// 为什么在构建期解析，而不是运行时扫 `document.styleSheets`：
// 1. 站点由 VitePress SSR，运行时扫描只能在 `onMounted` 之后拿到数据，首屏必闪一次空表；
// 2. 构建期解析能按**源文件名**分组（结构层 / 色彩层），并直接给出明暗两套取值；
//    运行时扫描只拿得到「当前主题下的一个值」，无法表达「这个令牌是否随主题变化」；
// 3. 与 `demo-highlight.ts` 同一取径，站点工装保持一致。
//
// 色块的最终着色**不走**这里解析出的静态值：组件用 `var(--bst-*)` 内联着色，
// 于是色块会随站点主题实时切换；解析出的静态值只用于文本展示与「是否随主题变化」的判定。
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { Plugin } from 'vitepress';

/** 虚拟模块 id，供令牌表组件动态 import */
const VIRTUAL_MODULE_ID = 'virtual:bst-tokens';

/** 解析后的内部 id，前缀 \0 表示虚拟模块 */
const RESOLVED_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

/**
 * 令牌源目录，相对页面根目录（VitePress 会把 Vite 的 root 设为 srcDir）
 *
 * `srcDir` 为 `packages/bst-vue-next/site/src`，向上三级即 `packages/`，故可直接定位到样式包。
 * 读源码而非读构建产物：`.less` 里的分节注释是分组依据，构建产物已把注释丢掉。
 */
const TOKENS_DIR_FROM_SRC = '../../../bst-styles/web/tokens';

/** 结构层分片：与主题无关，`_variables.less` 为映射层不含令牌声明，故不在此列 */
const STRUCTURAL_FILES = [
  { file: '_font.less', title: '结构层 · 字体', description: '字体族、字号、行高。与主题无关，明暗两套取值相同。' },
  { file: '_radius.less', title: '结构层 · 圆角', description: '圆角阶梯。与主题无关，明暗两套取值相同。' },
  {
    file: '_size.less',
    title: '结构层 · 尺寸与间距',
    description: '尺寸阶梯、组件高度、各类边距与间距。与主题无关，明暗两套取值相同。',
  },
];

/** 色彩层分片：两套主题的令牌名必须一一对应，仅取值不同 */
const THEME_LIGHT_FILE = '_theme-light.less';
const THEME_DARK_FILE = '_theme-dark.less';

/** 单条令牌在虚拟模块里的形态 */
export interface BstTokenItem {
  /** 令牌名，含 `--bst-` 前缀 */
  name: string;
  /** 源文件中紧邻其上的分节注释，用于说明语义 */
  note: string;
  /** 亮色下解析后的实际取值（结构层即其唯一取值） */
  light: string;
  /** 暗色下解析后的实际取值；结构层与 `light` 相同 */
  dark: string;
  /** 原始声明中指向另一令牌时的 `var()` 写法，供溯源；非别名时为空串 */
  alias: string;
  /** 是否为色值，决定是否渲染色块 */
  isColor: boolean;
}

/** 令牌分组 */
export interface BstTokenGroup {
  title: string;
  description: string;
  items: BstTokenItem[];
}

/**
 * 从 Less 源码中提取全部 `--bst-*` 声明
 *
 * 只做行级解析：跟踪最近一条 `//` 注释作为分节说明，声明跨行时续读到分号为止。
 * 本包令牌取值均为单行，续读逻辑只作为防御。
 *
 * @param file 源文件绝对路径
 * @returns 声明列表，保持源文件中的出现顺序
 */
function parseDeclarations(file: string): Array<{ name: string; note: string; value: string }> {
  const lines = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(/\r?\n/);
  const declarations: Array<{ name: string; note: string; value: string }> = [];
  let note = '';

  for (let index = 0; index < lines.length; index += 1) {
    const comment = /^\s*\/\/\s*(.*)$/.exec(lines[index]);

    if (comment) {
      note = comment[1].trim();
      continue;
    }

    const declaration = /^\s*(--bst-[\w-]+)\s*:\s*(.*)$/.exec(lines[index]);

    if (!declaration) {
      continue;
    }

    let raw = declaration[2];

    // 值跨行时续读到分号
    while (!raw.includes(';') && index + 1 < lines.length) {
      index += 1;
      raw += ` ${lines[index].trim()}`;
    }

    const end = raw.indexOf(';');

    declarations.push({
      name: declaration[1],
      note,
      value: (end >= 0 ? raw.slice(0, end) : raw).replace(/\s+/g, ' ').trim(),
    });
  }

  return declarations;
}

/**
 * 判定取值是否为可直接渲染色块的色值
 *
 * `var()` 形式的取值也放行：色块的着色本就走 `var(--bst-*)`，能否解析交给浏览器。
 * 渐变图也归入可渲染：组件侧会改用 `background-image` 而非 `background-color`。
 *
 * @param value 令牌取值
 * @returns 是否为色值
 */
function isColorValue(value: string): boolean {
  return /^(#|rgba?\(|hsla?\(|color\(|gradient\(|var\(--bst-)/.test(value);
}

/**
 * 解析 `var(--bst-*)` 引用，得到实际取值
 *
 * 两套主题里大量令牌是别名（如 `--bst-text-color-primary: var(--bst-font-gray-1)`），
 * 直接展示原文则表格里全是 `var(...)`，看不出真实取值；此处按引用链反复替换直到稳定。
 * 带回退值的 `var(--x, y)` 不处理：本包声明均为单名字引用，保持规则简单可验证。
 *
 * @param raw 原始取值
 * @param lookup 该主题作用域下的查找表（结构层 + 该主题色彩层）
 * @param depth 递归深度，用于剪断意外的循环引用
 * @returns 解析后的取值
 */
function resolveValue(raw: string, lookup: Map<string, string>, depth = 0): string {
  if (depth >= 8 || !raw.includes('var(--bst-')) {
    return raw;
  }

  const next = raw.replace(/var\(\s*(--bst-[\w-]+)\s*\)/g, (match, name: string) => lookup.get(name) ?? match);

  return next === raw ? raw : resolveValue(next, lookup, depth + 1);
}

/**
 * 组装令牌分组
 *
 * @param tokensDir 令牌源目录绝对路径
 * @returns 分组列表
 */
function collectGroups(tokensDir: string): BstTokenGroup[] {
  // 结构层先收集：它是两套主题共同引用的基底，也是解析别名时的公共查找面
  const structural = new Map<string, string>();
  const structuralGroups: BstTokenGroup[] = STRUCTURAL_FILES.map(({ file, title, description }) => {
    const declarations = parseDeclarations(join(tokensDir, file));

    for (const { name, value } of declarations) {
      structural.set(name, value);
    }

    return {
      title,
      description,
      items: declarations.map(({ name, note, value }) => {
        const resolved = resolveValue(value, structural);

        return {
          name,
          note,
          light: resolved,
          dark: resolved,
          alias: resolved === value ? '' : value,
          isColor: isColorValue(resolved),
        };
      }),
    };
  });

  const light = new Map(parseDeclarations(join(tokensDir, THEME_LIGHT_FILE)).map((item) => [item.name, item]));
  const dark = new Map(parseDeclarations(join(tokensDir, THEME_DARK_FILE)).map((item) => [item.name, item]));

  // 两套主题各自的查找面：结构层 + 该主题色彩层
  const lightLookup = new Map([...structural, ...new Map([...light].map(([name, item]) => [name, item.value]))]);
  const darkLookup = new Map([...structural, ...new Map([...dark].map(([name, item]) => [name, item.value]))]);

  const colorItems: BstTokenItem[] = [...light.values()].map(({ name, note, value }) => {
    const darkRaw = dark.get(name)?.value ?? value;
    const lightResolved = resolveValue(value, lightLookup);
    const darkResolved = resolveValue(darkRaw, darkLookup);

    return {
      name,
      note,
      light: lightResolved,
      dark: darkResolved,
      alias: lightResolved === value ? '' : value,
      isColor: isColorValue(lightResolved),
    };
  });

  // 名集只在暗色一侧多出的令牌同样要暴露，否则主题间的缺口会被这页掩盖
  for (const { name, note, value } of dark.values()) {
    if (!light.has(name)) {
      const resolved = resolveValue(value, darkLookup);

      colorItems.push({
        name,
        note,
        light: resolved,
        dark: resolved,
        alias: resolved === value ? '' : value,
        isColor: isColorValue(resolved),
      });
    }
  }

  return [
    ...structuralGroups,
    {
      title: '色彩层（随主题变化）',
      description: '色板、文字色、背景色、边框、投影与滚动条色。明暗两套的令牌名一一对应，仅取值不同。',
      items: colorItems,
    },
  ];
}

/**
 * 设计令牌虚拟模块插件
 *
 * @returns Vite 插件
 */
export function bstTokensPlugin(): Plugin {
  // !important：VitePress 会把 Vite 的 root 设为 srcDir，不依赖 cwd 才能在任意目录启动脚本
  let srcDir = '';

  return {
    name: 'bst-tokens',

    configResolved(config) {
      srcDir = config.root;
    },

    resolveId(id) {
      return id === VIRTUAL_MODULE_ID ? RESOLVED_MODULE_ID : null;
    },

    load(id) {
      if (id !== RESOLVED_MODULE_ID) {
        return null;
      }

      if (srcDir === '') {
        throw new Error('bst-tokens：尚未取得页面根目录，configResolved 未被调用');
      }

      const tokensDir = resolve(srcDir, TOKENS_DIR_FROM_SRC);

      // 令牌源变化需让本虚拟模块失效，否则 dev 下看到的仍是旧清单
      for (const { file } of STRUCTURAL_FILES) {
        this.addWatchFile(join(tokensDir, file));
      }

      this.addWatchFile(join(tokensDir, THEME_LIGHT_FILE));
      this.addWatchFile(join(tokensDir, THEME_DARK_FILE));

      return `export default ${JSON.stringify(collectGroups(tokensDir))};`;
    },
  };
}
