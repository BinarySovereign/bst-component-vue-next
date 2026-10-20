// 分割线边界：开头、连续两条、结尾
import { DIVIDER_EDGE_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** 分割线边界：开头、连续两条、结尾，验证间距与禁用逻辑不互相干扰 */
export const dividerEdgesExample: ContextMenuStory = {
  args: { items: DIVIDER_EDGE_ITEMS },
  render: (args) =>
    createDemo(args, {
      hint: '右键打开：开头 / 连续 / 结尾的分割线，点击分割线不会触发 item-select',
    }),
};
