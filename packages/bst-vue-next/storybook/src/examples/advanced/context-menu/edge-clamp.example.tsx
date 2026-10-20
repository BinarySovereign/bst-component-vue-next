// 视口边缘自动翻转：越界坐标被夹取回视口内
import { createDemo } from './shared';
import type { ContextMenuStory } from './types';

/**
 * 视口边缘自动翻转：越界坐标被夹取回视口内
 *
 * 四个按钮分别把坐标写到四角之外，面板应当整体回退，保持距视口边缘 8px 的安全间距。
 *
 * 「关闭后在右下重开」复现真实右键的事件时序：`mousedown` 先关闭已打开的菜单，
 * `contextmenu` 紧接着在新坐标重开。这条路径曾经会跳过测量，导致第二次打开时
 * 面板从右侧/底部溢出视口。
 */
export const edgeClampExample: ContextMenuStory = {
  // 工具栏在面板外，关掉外部点击才能连点不同按钮
  args: { isCloseOnOutsideClick: false },
  render: (args) =>
    createDemo(args, {
      toolbar: 'edge',
      hint: '用上方按钮在四角打开：越界坐标会被夹取，面板始终完整可见',
    }),
};
