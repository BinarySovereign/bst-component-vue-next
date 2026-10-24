// packages/bst-advanced-components/context-menu 上下文菜单组件的类型定义

/**
 * Copyright (c) 2026 Felix Tang (BinarySovereign). Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */

import type { VNode } from 'vue';

/** 上下文菜单项的类型 */
export type BstContextMenuItemType = 'item' | 'divider';

/** 菜单项点击事件参数 */
export interface BstContextMenuItemSelectContext {
  /** 被点击的菜单项数据 */
  item: BstContextMenuItem;
  /** 该菜单项在数组中的索引 */
  index: number;
  /** 原生鼠标事件 */
  nativeEvent: MouseEvent;
}

/** 菜单外部点击事件参数 */
export interface BstContextMenuClickOutsideContext {
  nativeEvent: MouseEvent;
}

/** 菜单外部滚动事件参数 */
export interface BstContextMenuScrollOutsideContext {
  nativeEvent: Event;
}

/** 菜单 Esc 键按下事件参数 */
export interface BstContextMenuEscKeyDownContext {
  nativeEvent: KeyboardEvent;
}

/** 上下文菜单的位置坐标 */
export interface BstContextMenuPosition {
  /** 挂到 body 时相对视口的 X 轴坐标，否则相对挂载容器左上角 */
  x: number;
  /** 挂到 body 时相对视口的 Y 轴坐标，否则相对挂载容器左上角 */
  y: number;
}

/** 上下文菜单的数据项 */
export interface BstContextMenuItem {
  /** 唯一标识，Key重复会自动去重 */
  key: string | number;
  /** 菜单项左侧显示的文本 */
  leftText?: string;
  /** 菜单项类型，默认为 `item`，`divider` 表示分割线 */
  type?: BstContextMenuItemType;
  /** 右侧显示的文本 */
  rightText?: string;
  /** 是否禁用该菜单项 */
  isDisabled?: boolean;
  /**
   * 点击该菜单项时执行的业务逻辑函数
   * @param context 包含当前项数据与原生事件
   */
  action?: (context: BstContextMenuItemSelectContext) => void;
}

/** 上下文菜单 Props */
export interface BstContextMenuProps {
  /** 是否显示菜单，支持 v-model:is-visible */
  isVisible?: boolean;
  /** 菜单的数据列表 */
  items?: BstContextMenuItem[];
  /** 菜单弹出的位置：挂到 body 时相对视口，否则相对挂载容器左上角，支持 v-model:position */
  position?: BstContextMenuPosition;
  /** 点击菜单外部是否自动关闭，默认 true */
  isCloseOnOutsideClick?: boolean;
  /** 菜单外部滚动是否自动关闭，默认为 true */
  isCloseOnOutsideScroll?: boolean;
  /** 键盘按下 Esc 是否自动关闭，默认为 true */
  isCloseOnEscKeyDown?: boolean;
  /** 菜单的最大高度，超出后显示滚动条，不传则由样式包 `calc(100vh - @context-menu-viewport-gap * 2)` 提供 */
  maxHeight?: number | string;
  /** 是否使用 Teleport 渲染到 body 下，默认 true */
  teleport?: boolean | string;
  /** 点击菜单项时的回调，等价于 `@item-select` */
  onItemSelect?: (context: BstContextMenuItemSelectContext) => void;
  /** 点击菜单外部时的回调，等价于 `@click-outside` */
  onClickOutside?: (context: BstContextMenuClickOutsideContext) => void;
  /** 菜单外部滚动时的回调，等价于 `@scroll-outside` */
  onScrollOutside?: (context: BstContextMenuScrollOutsideContext) => void;
  /** 按下 Esc 键时的回调，等价于 `@esc-key-down` */
  onEscKeyDown?: (context: BstContextMenuEscKeyDownContext) => void;
  /** 菜单完全展开后的回调，等价于 `@after-enter` */
  onAfterEnter?: () => void;
  /** 菜单完全关闭后的回调，等价于 `@after-leave` */
  onAfterLeave?: () => void;
}

/** 上下文菜单事件 (支持模板 `@event` 语法) */
export interface BstContextMenuEmits {
  /** 菜单显示状态改变时触发，用于支持 `v-model:is-visible` */
  'update:isVisible': (visible: boolean) => void;
  /** 菜单位置更新时触发，用于支持 `v-model:position` */
  'update:position': (position: BstContextMenuPosition) => void;
  /** 点击菜单项时触发（分割线和禁用的项不会触发） */
  'item-select': (context: BstContextMenuItemSelectContext) => void;
  /** 点击菜单外部时触发 */
  'click-outside': (context: BstContextMenuClickOutsideContext) => void;
  /** 菜单外部滚动时触发 */
  'scroll-outside': (context: BstContextMenuScrollOutsideContext) => void;
  /** 按下 Esc 键时触发 */
  'esc-key-down': (context: BstContextMenuEscKeyDownContext) => void;
  /** 菜单完全展开后的回调 */
  'after-enter': () => void;
  /** 菜单完全关闭后的回调 */
  'after-leave': () => void;
}

/** 上下文菜单插槽 */
export interface BstContextMenuSlots {
  /** 默认插槽，用于完全自定义菜单内容，会覆盖 items 渲染 */
  default?: () => VNode[];
  /** 自定义菜单项渲染插槽 */
  item?: (props: { item: BstContextMenuItem; index: number }) => VNode[];
}

/** 上下文菜单实例暴露的方法 */
export interface BstContextMenuExpose {
  /** 在指定坐标打开菜单 */
  show: (x?: number, y?: number) => void;
  /** 关闭菜单 */
  hide: () => void;
}
