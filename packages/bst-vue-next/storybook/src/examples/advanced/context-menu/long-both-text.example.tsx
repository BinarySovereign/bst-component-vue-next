// 左右文本都很长：左侧截断，右侧快捷键保持完整
import { LONG_BOTH_TEXT_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** 左右文本都很长：左侧截断，右侧快捷键保持完整 */
export const longBothTextExample: ContextMenuStory = {
  args: { items: LONG_BOTH_TEXT_ITEMS },
  render: (args) => createDemo(args),
};
