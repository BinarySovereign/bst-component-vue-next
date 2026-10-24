// 构建期把示例源码渲染成高亮 HTML，经虚拟模块 virtual:bst-demo-highlight 输出。
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { createMarkdownRenderer } from 'vitepress';
import type { MarkdownOptions, MarkdownRenderer, Plugin } from 'vitepress';

const VIRTUAL_MODULE_ID = 'virtual:bst-demo-highlight';

const RESOLVED_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

const EXAMPLES_DIR = 'examples';

interface ExampleSource {
  ext: string;
  lang: string;
  keySuffix: string;
}

const EXAMPLE_SOURCES: ExampleSource[] = [
  { ext: '.vue', lang: 'vue', keySuffix: '' },
  { ext: '.tsx', lang: 'tsx', keySuffix: '.tsx' },
];

function toSourceConfig(file: string): ExampleSource | undefined {
  return EXAMPLE_SOURCES.find((source) => file.endsWith(source.ext));
}

function collectExamples(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      return collectExamples(full);
    }

    return toSourceConfig(full) === undefined ? [] : [full];
  });
}

function toDemoId(examplesDir: string, file: string, ext: string): string {
  const rel = relative(examplesDir, file).split(sep).join('/');

  return rel.slice(0, rel.length - ext.length);
}

export function demoHighlightPlugin(markdownOptions: MarkdownOptions): Plugin {
  let srcDir = '';

  let rendererPromise: Promise<MarkdownRenderer> | undefined;

  return {
    name: 'bst-demo-highlight',

    configResolved(config) {
      srcDir = config.root;
    },

    resolveId(id) {
      return id === VIRTUAL_MODULE_ID ? RESOLVED_MODULE_ID : null;
    },

    async load(id) {
      if (id !== RESOLVED_MODULE_ID) {
        return null;
      }

      if (srcDir === '') {
        throw new Error('bst-demo-highlight：尚未取得页面根目录，configResolved 未被调用');
      }

      const examplesDir = join(srcDir, EXAMPLES_DIR);
      const files = collectExamples(examplesDir);

      for (const file of files) {
        this.addWatchFile(file);
      }

      rendererPromise ??= createMarkdownRenderer(srcDir, markdownOptions, '/');
      const renderer = await rendererPromise;
      const { highlight } = renderer.options;

      if (!highlight) {
        throw new Error('bst-demo-highlight：markdown 渲染器未提供 highlight 函数');
      }

      const map: Record<string, string> = {};

      for (const file of files) {
        const source = toSourceConfig(file);

        if (source === undefined) {
          continue;
        }

        const key = `${toDemoId(examplesDir, file, source.ext)}${source.keySuffix}`;

        map[key] = highlight(readFileSync(file, 'utf8'), source.lang, '').replace(' v-pre=""', '');
      }

      return `export default ${JSON.stringify(map)};`;
    },
  };
}
