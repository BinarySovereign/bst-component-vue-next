// 超出 `maxHeight` 时在面板内部滚动
import { MANY_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** 超出 `maxHeight` 时在面板内部滚动 */
export const maxHeightExample: ContextMenuStory = {
  args: { items: MANY_ITEMS, maxHeight: 160 },
  render: (args) => createDemo(args),
};
