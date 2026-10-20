// `width` 传数字：内部补 `px`
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** `width` 传数字：内部补 `px` */
export const numericWidthExample: ContextMenuStory = {
  args: { width: 240 },
  render: (args) => createDemo(args),
};
