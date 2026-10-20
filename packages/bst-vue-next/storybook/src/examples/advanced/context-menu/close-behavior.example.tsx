// 关闭行为可配置：三个开关全部关闭
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * 关闭行为可配置：三个开关全部关闭
 *
 * 此时点击外部、滚动、按 Esc 都不会关闭，只能用工具栏按钮手动关闭。
 */
export const closeBehaviorExample: ContextMenuStory = {
  args: {
    isCloseOnOutsideClick: false,
    isCloseOnOutsideScroll: false,
    isCloseOnEscKeyDown: false,
  },
  render: (args) =>
    createDemo(args, {
      toolbar: 'close',
      hint: '右键打开：点击外部 / 滚动 / Esc 均不会关闭，请用按钮',
    }),
};
