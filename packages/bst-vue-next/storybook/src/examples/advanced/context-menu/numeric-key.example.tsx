// 数字 key：`key` 支持有限数字，且可与字符串 key 混用
import { NUMERIC_KEY_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** 数字 key：`key` 支持有限数字，且可与字符串 key 混用 */
export const numericKeyExample: ContextMenuStory = {
  args: { items: NUMERIC_KEY_ITEMS },
  render: (args) =>
    createDemo(args, {
      trackEvents: true,
      hint: '右键打开：数字 key 与字符串 key 共存，选中后事件载荷里的 key 保持原类型',
    }),
};
