// 长文本：左侧单行省略，右侧快捷键不折行
import { LONG_TEXT_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** 长文本：左侧单行省略，右侧快捷键不折行 */
export const longTextExample: ContextMenuStory = {
  args: { items: LONG_TEXT_ITEMS, width: 260 },
  render: (args) => createDemo(args),
};
