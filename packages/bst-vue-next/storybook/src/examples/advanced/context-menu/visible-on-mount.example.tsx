// 挂载即显示：`isVisible` 初始为 true
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * 挂载即显示：`isVisible` 初始为 true
 *
 * 无需右键，组件在首帧测量面板尺寸并夹取坐标；测量期间用 `visibility: hidden`
 * 避免面板闪动。事件日志应依次出现 `update:isVisible`、`update:position`、`after-enter`。
 */
export const visibleOnMountExample: ContextMenuStory = {
  args: { isVisible: true, position: { x: 40, y: 40 } },
  render: (args) =>
    createDemo(args, {
      trackEvents: true,
      hint: '无需右键：isVisible 初始为 true，面板在首帧测量后直接展开',
    }),
};
