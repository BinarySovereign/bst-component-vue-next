// `item` 插槽：只替换单项内部内容，外层类名与交互保持不变
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** `item` 插槽：只替换单项内部内容，外层类名与交互保持不变 */
export const itemSlotExample: ContextMenuStory = {
  render: (args) =>
    createDemo(args, {
      useItemSlot: true,
      hint: '右键打开：左侧为序号与状态圆点，右侧为 kbd 徽标',
    }),
};
