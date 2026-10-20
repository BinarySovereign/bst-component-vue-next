// 示例源码高亮
//
// 在构建期把 `src/examples/**/*.vue` 用 Shiki 渲染成高亮 HTML，经虚拟模块交给运行时组件。
//
// 实现取径的说明：
// - 站点不引任何 VitePress 示例渲染插件（它们已在 `docs/rules/dependencies.md` 中被逐条排除）；
// - 也不额外声明 `shiki`：vitepress 把内置的 `createMarkdownRenderer` 作为公开 API 导出，
//   复用它得到的高亮结果与页面正文代码块**同主题、同结构**（输出自带 `vp-code` 类，
//   默认主题的双主题着色规则可直接命中），连主题切换行为都天然一致；
// - 高亮在构建期完成，运行时不带 Shiki，虚拟模块被动态 import，自成独立 chunk。
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { createMarkdownRenderer } from 'vitepress';
import type { MarkdownOptions, MarkdownRenderer, Plugin } from 'vitepress';

/** 虚拟模块 id，供 theme 侧动态 import */
const VIRTUAL_MODULE_ID = 'virtual:bst-demo-highlight';

/** 解析后的内部 id，前缀 \0 表示虚拟模块 */
const RESOLVED_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

/** 示例目录，相对 srcDir */
const EXAMPLES_DIR = 'examples';

/** 示例源码的语言：示例统一为 .vue 单文件写法 */
const EXAMPLE_LANG = 'vue';

/** 示例文件后缀：只有该后缀才算示例，目录内的说明文档（README.md）不参与高亮 */
const EXAMPLE_EXT = '.vue';

/**
 * 递归收集目录下的示例文件
 *
 * 目录或子目录不存在时返回空数组，使「尚无示例」是合法状态而非构建错误
 * （组件未落地时 `src/examples` 可能不存在）。
 *
 * @param dir 目录绝对路径
 * @returns 示例文件绝对路径列表
 */
function collectExamples(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      return collectExamples(full);
    }

    return full.endsWith(EXAMPLE_EXT) ? [full] : [];
  });
}

/**
 * 把示例文件路径归一化为示例 id
 *
 * 同一份归一化在 `theme/demo-source.ts` 的组件索引里也执行一次（那边基于 glob 键），
 * 两处必须得出相同的 id，否则文档页取不到源码。保持一致的做法见双方注释。
 *
 * @param examplesDir 示例目录绝对路径
 * @param file 示例文件绝对路径
 * @returns 示例 id
 */
function toDemoId(examplesDir: string, file: string): string {
  const rel = relative(examplesDir, file).split(sep).join('/');

  return rel.slice(0, rel.length - EXAMPLE_EXT.length);
}

/**
 * 示例源码高亮插件
 *
 * @param markdownOptions 与站点 markdown 配置同源的选项，确保高亮主题与语言集一致
 * @returns Vite 插件
 */
export function demoHighlightPlugin(markdownOptions: MarkdownOptions): Plugin {
  // !important：VitePress 会把 Vite 的 root 设为 srcDir，故 config.root 即页面根目录本身，
  // 示例目录直接拼 'examples'，不要再拼 config.ts 里那层 'src'。
  // 不依赖 cwd 的原因：脚本可从仓库根或站点目录任一处启动。
  let srcDir = '';

  // 渲染器创建较昂贵，整个构建期只创建一次
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

      // 示例内容变化需让本虚拟模块失效，否则 dev 下展开源码看到的仍是旧内容
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
        // 去掉 markdown 渲染器为「参与 Vue 编译」而加的 v-pre：本模块的产物由 v-html 输出，
        // 不经过模板编译，留着只会作为无意义的 DOM 属性出现
        map[toDemoId(examplesDir, file)] = highlight(readFileSync(file, 'utf8'), EXAMPLE_LANG, '').replace(
          ' v-pre=""',
          '',
        );
      }

      return `export default ${JSON.stringify(map)};`;
    },
  };
}
