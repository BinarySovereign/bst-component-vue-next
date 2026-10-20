// 键盘操作：上下方向键切换菜单项，Enter / 空格选中，Esc 关闭
import { DISABLED_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * 键盘操作：上下方向键切换菜单项，Enter / 空格选中，Esc 关闭
 *
 * 菜单打开后按 `ArrowDown` / `ArrowUp` 在项序列间循环切换高亮（分割线与禁用项会被跳过），
 * 按 `Enter` 或空格触发 `item-select` 并自动关闭；按 `Esc` 触发 `esc-key-down`。
 */
export const keyboardInteractionExample: ContextMenuStory = {
  args: { items: DISABLED_ITEMS },
  render: (args) =>
    createDemo(args, {
      trackEvents: true,
      hint: '右键打开后按 ↑ / ↓ 切换、Enter / 空格选中、Esc 关闭（分割线与禁用项会被跳过）',
    }),
};
