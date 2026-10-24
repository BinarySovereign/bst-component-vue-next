/**
 * Copyright (c) 2026 Felix Tang (BinarySovereign). Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */

/** 组件标识 */
export const BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES = {
  /** 根组件名 */
  ROOT: 'BstContextMenu',
  /** 菜单项子元素名 */
  ITEM: 'BstContextMenuItem',
} as const;

/** 组件类名 */
export const BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES = {
  /** 面板根节点 */
  ROOT: 'bst-context-menu',
  /** 面板入场阶段 */
  ROOT_IS_OPEN: 'bst-context-menu-is-open',
  /** 面板退场阶段 */
  ROOT_IS_CLOSING: 'bst-context-menu-is-closing',
  /** 菜单项根节点 */
  ITEM: 'bst-context-menu-item',
  /** 菜单项左侧文本 */
  ITEM_LEFT_TEXT: 'bst-context-menu-item-left-text',
  /** 菜单项右侧文本 */
  ITEM_RIGHT_TEXT: 'bst-context-menu-item-right-text',
  /** 分割线 */
  ITEM_IS_DIVIDER: 'bst-context-menu-item-is-divider',
  /** 禁用态 */
  ITEM_IS_DISABLED: 'bst-context-menu-item-is-disabled',
  /** 键盘高亮态 */
  ITEM_IS_ACTIVE: 'bst-context-menu-item-is-active',
} as const;

/** 菜单项下标属性名 */
export const BST_CONTEXT_MENU_CONSTANT_ITEM_INDEX_ATTRIBUTE = 'data-index';

/** 校验告警文案 */
export const BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES = {
  /** `isVisible` 非布尔 */
  IS_VISIBLE_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "isVisible" must be a boolean.`,
  /** `items` 非数组 */
  ITEMS_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "items" must be an array of BstContextMenuItem.`,
  /** `items[].key` 非法，该项被丢弃 */
  ITEM_KEY_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "items[].key" must be a non-empty string or a finite number; the item has been ignored.`,
  /** `position` 缺少数值坐标 */
  POSITION_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "position" must be an object with numeric "x" and "y".`,
  /** `isCloseOnOutsideClick` 非布尔 */
  IS_CLOSE_ON_OUTSIDE_CLICK_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "isCloseOnOutsideClick" must be a boolean.`,
  /** `isCloseOnOutsideScroll` 非布尔 */
  IS_CLOSE_ON_OUTSIDE_SCROLL_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "isCloseOnOutsideScroll" must be a boolean.`,
  /** `isCloseOnEscKeyDown` 非布尔 */
  IS_CLOSE_ON_ESC_KEY_DOWN_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "isCloseOnEscKeyDown" must be a boolean.`,
  /** `maxHeight` 非数字或 CSS 长度 */
  MAX_HEIGHT_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "maxHeight" must be a number or a CSS length string.`,
  /** `teleport` 非布尔或非空选择器 */
  TELEPORT_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "teleport" must be a boolean or a non-empty selector string.`,
  /** `onItemSelect` 非函数 */
  ON_ITEM_SELECT_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "onItemSelect" must be a function.`,
  /** `onClickOutside` 非函数 */
  ON_CLICK_OUTSIDE_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "onClickOutside" must be a function.`,
  /** `onScrollOutside` 非函数 */
  ON_SCROLL_OUTSIDE_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "onScrollOutside" must be a function.`,
  /** `onEscKeyDown` 非函数 */
  ON_ESC_KEY_DOWN_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "onEscKeyDown" must be a function.`,
  /** `onAfterEnter` 非函数 */
  ON_AFTER_ENTER_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "onAfterEnter" must be a function.`,
  /** `onAfterLeave` 非函数 */
  ON_AFTER_LEAVE_INVALID: `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}] "onAfterLeave" must be a function.`,
} as const;

/** 时间与几何度量 */
export const BST_CONTEXT_MENU_CONSTANT_METRICS = {
  /** 入场 / 出场动画时长（毫秒），取自样式包 `@anim-duration-base` */
  ANIMATION_DURATION: 200,
  /** 兜底定时器的额外缓冲（毫秒），吸收定时器精度偏差 */
  ANIMATION_FALLBACK_BUFFER: 60,
  /** 面板与视口的安全间距（像素） */
  VIEWPORT_GAP: 8,
} as const;

/** 键盘按键的 `KeyboardEvent.key` 取值 */
export const BST_CONTEXT_MENU_CONSTANT_KEYS = {
  /** Esc 键 */
  ESCAPE: 'Escape',
  /** 下方向键 */
  ARROW_DOWN: 'ArrowDown',
  /** 上方向键 */
  ARROW_UP: 'ArrowUp',
  /** Enter 键 */
  ENTER: 'Enter',
  /** 空格键 */
  SPACE: ' ',
} as const;

/** 未传入 `position` 时使用的默认坐标 */
export const BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION = {
  /** 默认 X 轴坐标 */
  x: 0,
  /** 默认 Y 轴坐标 */
  y: 0,
} as const;
