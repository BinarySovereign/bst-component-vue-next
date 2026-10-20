// 打开状态下增删菜单项：尺寸变化会触发重新夹取
import { TEXT_ONLY_ITEMS, createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * 打开状态下增删菜单项：尺寸变化会触发重新夹取
 *
 * 先在右下角打开菜单（会被夹取），再点「追加一项」：面板变高后应重新上移，
 * 依旧完整落在视口内；「重置列表」恢复为示例的初始数据。
 */
export const dynamicItemsExample: ContextMenuStory = {
  args: { items: TEXT_ONLY_ITEMS, isCloseOnOutsideClick: false },
  render: (args) =>
    createDemo(args, {
      toolbar: 'dynamic',
      dynamicItems: true,
      trackEvents: true,
      hint: '右键打开后点「追加一项」：面板变高会重新夹取坐标',
    }),
};
