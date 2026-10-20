// `width` 传字符串：原样作为 CSS 长度
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** `width` 传字符串：原样作为 CSS 长度 */
export const stringWidthExample: ContextMenuStory = {
  args: { width: '22rem' },
  render: (args) => createDemo(args),
};
