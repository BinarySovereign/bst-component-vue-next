// 文档站主题入口：继承默认主题、注册站点组件、桥接明暗开关，并引入组件库与站点样式。
import type { Theme } from 'vitepress';
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { watch } from 'vue';

import DemoBlock from './components/DemoBlock.vue';
import TokenPalette from './components/TokenPalette.vue';

import '@binarysovereign/styles/web/tokens.css';
import '@binarysovereign/styles/web/base.css';
import '@binarysovereign/styles/web/advanced-components/context-menu';

import './styles/vars.css';
import './styles/demo/index.css';
import './styles/preview.css';

export default {
  extends: DefaultTheme,

  enhanceApp({ app }) {
    app.component('DemoBlock', DemoBlock);
    app.component('TokenPalette', TokenPalette);
  },

  setup() {
    const { isDark } = useData();

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
