// 仅左文本：无右侧快捷键时的布局
import { TEXT_ONLY_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** 仅左文本：无右侧快捷键时的布局 */
export const textOnlyExample: ContextMenuStory = {
  args: { items: TEXT_ONLY_ITEMS },
  render: (args) => createDemo(args),
};
