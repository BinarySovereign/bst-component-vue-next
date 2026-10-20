// 用 CSS 变量覆盖宽度：`--bst-context-menu-width`
import { TELEPORT_ARG_INLINE, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * 用 CSS 变量覆盖宽度：`--bst-context-menu-width`
 *
 * 组件的 `width` Props 优先级高于 CSS 变量，两者都没提供时样式包给出 320px 默认值。
 * 变量写在演示容器上，因此必须用 `teleport: false` 让面板留在容器内才能被继承。
 */
export const widthByCssVariableExample: ContextMenuStory = {
  args: { teleport: TELEPORT_ARG_INLINE },
  parameters: {
    docs: { story: { inline: false, iframeHeight: 420 } },
  },
  render: (args) =>
    createDemo(args, {
      containerStyle: { '--bst-context-menu-width': '200px' },
      hint: '右键打开：面板宽度由容器上的 --bst-context-menu-width: 200px 决定',
    }),
};
