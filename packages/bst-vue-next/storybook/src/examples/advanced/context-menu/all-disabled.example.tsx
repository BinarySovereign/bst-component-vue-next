// 全部禁用：没有任何可激活项
import type { BstContextMenuItem } from '@binarysovereign/bst-types';

import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** 全部项禁用：验证无可激活项时的键盘与点击行为 */
const ALL_DISABLED_ITEMS: BstContextMenuItem[] = [
  { key: 'cut', leftText: '剪切', rightText: 'Ctrl+X', isDisabled: true },
  { key: 'copy', leftText: '复制', rightText: 'Ctrl+C', isDisabled: true },
  { key: 'paste', leftText: '粘贴', rightText: 'Ctrl+V', isDisabled: true },
];

/**
 * 全部禁用：没有任何可激活项
 *
 * 方向键找不到可高亮项，点击与 Enter / 空格均不会触发 `item-select`，
 * Esc、点击外部与滚动仍可正常关闭。
 */
export const allDisabledExample: ContextMenuStory = {
  args: { items: ALL_DISABLED_ITEMS },
  render: (args) =>
    createDemo(args, {
      trackEvents: true,
      hint: '右键打开：全部项禁用，方向键无高亮、点击与 Enter 均无 item-select',
    }),
};
