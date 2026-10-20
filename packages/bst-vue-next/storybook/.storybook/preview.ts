// 预览侧配置：全局样式、主题切换与公共参数
import type { Decorator, Preview } from '@storybook/vue3-vite';

// 全量样式：组件源码不含任何样式，缺这一行所有组件都是「裸奔」的。
// 该入口指向 @binarysovereign/styles 的构建产物，故启动前需先跑 `pnpm build:style`。
import '@binarysovereign/styles/web';

/**
 * 主题装饰器：把主题开关写到 `<html>` 上
 *
 * 样式包为主题提供了两个等价开关（`:root.bst-theme-dark` 与 `:root[theme-mode='dark']`），
 * 这里两者同时写入，避免只改一侧时预览表现与真实使用不一致。
 *
 * 返回值必须是用模板引用 `<story />` 的组件：Storybook 的 `decorateStory` 会把下一层
 * story 组件注入到 `components.story`，只有模板才能取到它。**不能用 `h(story)`**——
 * 装饰器收到的第一个参数是「取 story 的函数」而非组件，直接当组件处理会渲染出
 * `[object Object]`。
 *
 * @param _story Storybook 注入的 story 取值函数，本装饰器不直接调用它
 * @param context story 上下文，用于读取工具栏选中的主题
 * @returns 包裹主题副作用后的装饰组件
 */
const withTheme: Decorator = (_story, context) => {
  const isDark = context.globals.theme === 'dark';

  document.documentElement.classList.toggle('bst-theme-dark', isDark);
  document.documentElement.setAttribute('theme-mode', isDark ? 'dark' : 'light');

  return { template: '<story />' };
};

const preview: Preview = {
  decorators: [withTheme],
  parameters: {
    // 首次接入只记录问题、不阻断预览；待基线稳定后可改为 'error'
    a11y: { test: 'todo' },
    // Controls 默认展开，减少逐个点开面板的操作
    controls: { expanded: true },
  },
  globalTypes: {
    theme: {
      description: '设计令牌主题',
      toolbar: {
        title: '主题',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: '浅色' },
          { value: 'dark', title: '深色' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
};

export default preview;
