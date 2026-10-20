// 实例方法：通过组件 `ref` 调用 `show()` / `hide()`
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** 实例方法：通过组件 `ref` 调用 `show()` / `hide()` */
export const exposeMethodsExample: ContextMenuStory = {
  // 不关闭外部点击，才能用工具栏按钮演示 hide()
  args: { isCloseOnOutsideClick: false },
  render: (args) =>
    createDemo(args, {
      toolbar: 'expose',
      hint: '不使用右键，用下方按钮调用组件暴露的方法（已关闭外部点击）',
    }),
};
