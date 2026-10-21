// 面板内部滚动：滚动面板自身不会触发关闭
import { MANY_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * 面板内部滚动：滚动面板自身不会触发关闭
 *
 * 面板高度被限制在 160px，滚轮在面板内滚动只移动菜单项，
 * 不应出现 `scroll-outside`；把指针移出面板再滚动才会触发。
 */
export const innerScrollExample: ContextMenuStory = {
  args: { items: MANY_ITEMS, maxHeight: 160 },
  render: (args) =>
    createDemo(args, {
      trackEvents: true,
      hint: '右键打开后在面板内滚动：不应出现 scroll-outside；移出面板滚动才会触发',
    }),
};
