// `default` 插槽：完全接管菜单内容，`items` 被忽略
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * `default` 插槽：完全接管菜单内容，`items` 被忽略
 *
 * 自定义内容需自行保证可访问性（`role="menuitem"` 与键盘响应）。
 */
export const defaultSlotExample: ContextMenuStory = {
  render: (args) =>
    createDemo(args, {
      useDefaultSlot: true,
      hint: '右键打开：内容由 default 插槽提供，items 不会渲染',
    }),
};
