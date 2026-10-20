// `teleport=false`：面板留在组件所在位置，但定位仍为 `position: fixed`
import { TELEPORT_ARG_INLINE, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * `teleport=false`：面板留在组件所在位置，但定位仍为 `position: fixed`
 *
 * 注意：Docs 页必须用 iframe 渲染（`docs.story.inline = false`）。
 * Storybook 的 Docs 会给每个 story 包一层带 `transform: matrix(...)` 的容器，
 * 而带 transform 的祖先会成为 `position: fixed` 的包含块，导致面板坐标相对该容器计算，
 * 加上外层 `overflow: hidden` 后被完全裁剪 —— 表现就是「右键后看不到菜单」。
 */
export const inlineRenderingExample: ContextMenuStory = {
  args: { teleport: TELEPORT_ARG_INLINE },
  parameters: {
    docs: { story: { inline: false, iframeHeight: 420 } },
  },
  render: (args) =>
    createDemo(args, {
      hint: '右键打开：面板不再挂到 body，而是留在组件所在层级',
    }),
};
