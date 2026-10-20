// 数据校验：重复 key、非法 key、空项与带文本的分割线
import { INVALID_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * 数据校验：重复 key、非法 key、空项与带文本的分割线
 *
 * 打开控制台可看到被丢弃项的告警；面板中只保留合法的首次出现项。
 */
export const invalidDataExample: ContextMenuStory = {
  args: { items: INVALID_ITEMS },
  render: (args) =>
    createDemo(args, {
      hint: '右键打开：重复 key、空 key、NaN key 均被丢弃，分割线忽略文本',
    }),
};
