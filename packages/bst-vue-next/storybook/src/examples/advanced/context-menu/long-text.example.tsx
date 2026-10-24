// 长文本：面板自动包裹内容，左右文本均不折行
import { LONG_TEXT_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/** 长文本：面板自动包裹内容，左右文本均不折行 */
export const longTextExample: ContextMenuStory = {
  args: { items: LONG_TEXT_ITEMS },
  render: (args) => createDemo(args),
};
