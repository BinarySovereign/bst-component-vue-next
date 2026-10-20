// 固定坐标（受控）：不使用 `show()`，仅改 Props
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * 固定坐标（受控）：不使用 `show()`，仅改 Props
 *
 * 用于验证父级写入 `isVisible` / `position` 能否驱动内部状态；
 * 菜单打开后点「坐标 +40 / +30」可验证坐标同步（曾经的缺陷点）。
 */
export const controlledPositionExample: ContextMenuStory = {
  // 工具栏在面板之外，关闭「外部点击关闭」才能连着点按钮调坐标
  args: { position: { x: 120, y: 120 }, isCloseOnOutsideClick: false },
  render: (args) =>
    createDemo(args, {
      toolbar: 'controlled',
      hint: '不右键，用下方按钮控制显隐与坐标（已关闭外部点击）',
    }),
};
