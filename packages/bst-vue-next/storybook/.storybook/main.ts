// Storybook 主配置：开发与构建共用，不产出任何发布物
//
// 三处与本仓库结构强相关的取值：
// 1. stories 只扫 `src/stories`：story 集中存放，与 site 的示例目录约定对称；
// 2. framework.options.docgen 显式指定 `vue-component-meta`：默认引擎 `vue-docgen-api`
//    只处理 `.vue`，本仓库组件全部为 `.tsx`，不切换则 Autodocs 的属性表为空；
// 3. viteFinal 补入 Vue 与 Vue JSX 插件：`@storybook/vue3-vite` 自身只注入模板编译别名，
//    不含 SFC 与 JSX 转换能力。
import { defineMain } from '@storybook/vue3-vite/node';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { mergeConfig } from 'vite';

export default defineMain({
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      // 组件源码为 TSX，只有该引擎能从中提取 props / events / slots 供 Autodocs 使用
      docgen: 'vue-component-meta',
    },
  },
  // 目前只有 CSF story；若后续需要手写 MDX 文档页，再把 '../src/stories/**/*.mdx' 加进匹配
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  docs: {
    // 中文文档站风格：Autodocs 页面标题取「文档」而不是「Docs」
    defaultName: '文档',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      // vue() 供后续可能写入的 .vue story 使用；vueJsx() 是本仓库 .tsx 组件的必需项
      plugins: [vue(), vueJsx()],
      resolve: {
        // 仓库为单 Vue 实例场景，避免 Storybook 与工作区各自解析出不同副本
        dedupe: ['vue'],
      },
    });
  },
});
