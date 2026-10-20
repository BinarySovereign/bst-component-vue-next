// 文档站主题入口
//
// 三件事：继承 VitePress 默认主题、注册站点自有的全局示例组件、
// 把 VitePress 的暗色开关桥接到组件库的令牌开关。
import type { Theme } from 'vitepress';
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { watch } from 'vue';

import DemoBlock from './components/DemoBlock.vue';
import TokenPalette from './components/TokenPalette.vue';

// 组件库样式：走 @binarysovereign/styles 的导出子路径（= build/web/*.css），与真实消费方的引入路径一致，
// 故前置条件是先在仓库根执行 `pnpm build:style`（该包自身不含构建脚本，构建由 scripts/build-package.js 驱动）。
//
// 只取「令牌 + 归一化」，不取全量 index.css：全量引入在本仓库属不推荐用法（见 AGENTS.md）。
// **组件按需样式逐个登记**：站内示例渲染的是真实组件，缺哪一行对应组件就是「裸奔」的。
// 引入写法（`.../{basic,advanced}-components/<组件名>`，**不带** `/index.css`）见样式包 README 与安装指南。
import '@binarysovereign/styles/web/tokens.css';
import '@binarysovereign/styles/web/base.css';
// 高级组件：ContextMenu 示例页
import '@binarysovereign/styles/web/advanced-components/context-menu';

// 站点外壳样式：与组件库样式互不混写
import './styles/vars.css';
import './styles/demo.css';
import './styles/preview.css';

export default {
  extends: DefaultTheme,

  enhanceApp({ app }) {
    // 供 markdown 内直接书写 <DemoBlock demo="..." />，无需每个页面重复 import
    app.component('DemoBlock', DemoBlock);
    // 样式预览页专用：设计令牌总览表
    app.component('TokenPalette', TokenPalette);
  },

  setup() {
    const { isDark } = useData();

    // 组件库令牌的暗色开关是 `:root[theme-mode='dark']` / `:root.bst-theme-dark`，
    // 而 VitePress 切换暗色只给 <html> 挂 `.dark` 类，两者不同名，必须在此桥接，
    // 否则暗色下组件仍按亮色取值。immediate 保证首屏即同步；
    // SSR 阶段没有 document，用 typeof 守卫跳过。
    watch(
      isDark,
      (dark) => {
        if (typeof document === 'undefined') {
          return;
        }

        document.documentElement.setAttribute('theme-mode', dark ? 'dark' : 'light');
      },
      { immediate: true },
    );
  },
} satisfies Theme;
