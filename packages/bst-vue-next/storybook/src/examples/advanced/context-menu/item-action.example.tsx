// 单项 `action`：`item-select` 之后执行该项自带的业务逻辑，随后自动关闭
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** 单项 `action`：`item-select` 之后执行该项自带的业务逻辑，随后自动关闭 */
export const itemActionExample: ContextMenuStory = {
  render: (args) =>
    createDemo(args, {
      useItemAction: true,
      trackEvents: true,
      hint: '右键打开并选择一项：先触发 item-select，再执行 action',
    }),
};
