// 事件追踪：8 个事件全部记录在画布上，同时写入 Actions 面板
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * 事件追踪：8 个事件全部记录在画布上，同时写入 Actions 面板
 *
 * 建议依次验证：打开（after-enter）→ 选一项（item-select、update:isVisible、after-leave）
 * → 重开 → 点外部（click-outside）→ 重开 → 滚动（scroll-outside）→ 重开 → Esc（esc-key-down）。
 */
export const eventsExample: ContextMenuStory = {
  render: (args) =>
    createDemo(args, {
      trackEvents: true,
      hint: '右键打开后分别尝试选项、点外部、滚动、Esc，观察下方事件列表',
    }),
};
