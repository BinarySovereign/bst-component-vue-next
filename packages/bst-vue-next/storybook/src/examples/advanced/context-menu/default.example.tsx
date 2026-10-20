// 默认形态：左右文本、分割线与禁用项
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * 默认形态：左右文本、分割线与禁用项
 *
 * 覆盖 Props：`items`、`isVisible`、`position` 与三档默认关闭行为。
 */
export const defaultExample: ContextMenuStory = {
  render: (args) => createDemo(args),
};
