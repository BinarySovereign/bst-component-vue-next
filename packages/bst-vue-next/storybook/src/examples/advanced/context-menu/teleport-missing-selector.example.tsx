// `teleport` 选择器不存在：回落到 `body`
import { TELEPORT_ARG_MISSING, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * `teleport` 选择器不存在：回落到 `body`
 *
 * 组件解析不到目标容器时不会让菜单消失，而是退化为默认挂载点；
 * 同时保持原选择器写法，便于在开发时从 DOM 上直接看出配置错误。
 */
export const teleportMissingSelectorExample: ContextMenuStory = {
  args: { teleport: TELEPORT_ARG_MISSING },
  render: (args) =>
    createDemo(args, {
      hint: '右键打开：目标容器不存在，面板回落到 body（检查 DOM 验证）',
    }),
};
