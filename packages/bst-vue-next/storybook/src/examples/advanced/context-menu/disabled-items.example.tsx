// 禁用项：`isDisabled` 的项不响应点击，也不触发 `item-select`
import { DISABLED_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** 禁用项：`isDisabled` 的项不响应点击，也不触发 `item-select` */
export const disabledItemsExample: ContextMenuStory = {
  args: { items: DISABLED_ITEMS },
  render: (args) => createDemo(args),
};
