// 空数据：面板仍然渲染，但没有任何菜单项
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** 空数据：面板仍然渲染，但没有任何菜单项 */
export const emptyItemsExample: ContextMenuStory = {
  args: { items: [] },
  render: (args) => createDemo(args),
};
