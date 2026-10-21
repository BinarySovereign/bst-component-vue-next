// 构建期解析样式包令牌源码，经虚拟模块 virtual:bst-tokens 提供设计令牌清单。
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { Plugin } from 'vitepress';

const VIRTUAL_MODULE_ID = 'virtual:bst-tokens';

const RESOLVED_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

const TOKENS_DIR_FROM_SRC = '../../../bst-styles/web/tokens';

const STRUCTURAL_FILES = [
  { file: '_font.less', title: '结构层 · 字体', description: '字体族、字号、行高。与主题无关，明暗两套取值相同。' },
  { file: '_radius.less', title: '结构层 · 圆角', description: '圆角阶梯。与主题无关，明暗两套取值相同。' },
  {
    file: '_size.less',
    title: '结构层 · 尺寸与间距',
    description: '尺寸阶梯、组件高度、各类边距与间距。与主题无关，明暗两套取值相同。',
  },
];

const THEME_LIGHT_FILE = '_theme-light.less';
const THEME_DARK_FILE = '_theme-dark.less';

export interface BstTokenItem {
  name: string;
  note: string;
  light: string;
  dark: string;
  alias: string;
  isColor: boolean;
}

export interface BstTokenGroup {
  title: string;
  description: string;
  items: BstTokenItem[];
}

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

function isColorValue(value: string): boolean {
  return /^(#|rgba?\(|hsla?\(|color\(|gradient\(|var\(--bst-)/.test(value);
}

function resolveValue(raw: string, lookup: Map<string, string>, depth = 0): string {
  if (depth >= 8 || !raw.includes('var(--bst-')) {
    return raw;
  }

  const next = raw.replace(/var\(\s*(--bst-[\w-]+)\s*\)/g, (match, name: string) => lookup.get(name) ?? match);

  return next === raw ? raw : resolveValue(next, lookup, depth + 1);
}

function collectGroups(tokensDir: string): BstTokenGroup[] {
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

export function bstTokensPlugin(): Plugin {
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

      for (const { file } of STRUCTURAL_FILES) {
        this.addWatchFile(join(tokensDir, file));
      }

      this.addWatchFile(join(tokensDir, THEME_LIGHT_FILE));
      this.addWatchFile(join(tokensDir, THEME_DARK_FILE));

      return `export default ${JSON.stringify(collectGroups(tokensDir))};`;
    },
  };
}
