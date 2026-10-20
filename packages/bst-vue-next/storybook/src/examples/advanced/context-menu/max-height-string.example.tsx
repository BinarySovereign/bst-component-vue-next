// `maxHeight` 传字符串：接受任意 CSS 长度，超出后内部滚动
import { MANY_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** `maxHeight` 传字符串：接受任意 CSS 长度，超出后内部滚动 */
export const maxHeightStringExample: ContextMenuStory = {
  args: { items: MANY_ITEMS, maxHeight: '30vh' },
  render: (args) =>
    createDemo(args, {
      hint: '右键打开：maxHeight="30vh"，超出后仅面板内部滚动',
    }),
};
