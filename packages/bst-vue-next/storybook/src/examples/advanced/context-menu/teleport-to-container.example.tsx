// `teleport` 传选择器：渲染到指定容器
import { TELEPORT_ARG_CONTAINER, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * `teleport` 传选择器：渲染到指定容器，容器位于演示区上方
 *
 * 同上，目标容器仍在 story 的 DOM 内，Docs 页需用 iframe 渲染。
 */
export const teleportToContainerExample: ContextMenuStory = {
  args: { teleport: TELEPORT_ARG_CONTAINER },
  parameters: {
    docs: { story: { inline: false, iframeHeight: 420 } },
  },
  render: (args) =>
    createDemo(args, {
      portalHost: true,
      hint: '右键打开：面板会渲染到上方带虚线框的 Teleport 容器内',
    }),
};
