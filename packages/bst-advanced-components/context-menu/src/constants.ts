// BstContextMenu 常量：组件标识、类名契约、告警文案与几何参数
// 类名与样式包 `web/advanced-components/context-menu` 一一对应，改动需两侧同步

/** 组件标识，供 `defineComponent` 的 `name` 与告警前缀复用 */
export const BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES = {
  ROOT: 'BstContextMenu',
  ITEM: 'BstContextMenuItem',
} as const;

/** 组件类名，与样式包分片严格对齐，禁止在组件内自造类名 */
export const BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES = {
  ROOT: 'bst-context-menu',
  ROOT_IS_OPEN: 'bst-context-menu-is-open',
  ROOT_IS_CLOSING: 'bst-context-menu-is-closing',
  ITEM: 'bst-context-menu-item',
  ITEM_LEFT_TEXT: 'bst-context-menu-item-left-text',
  ITEM_RIGHT_TEXT: 'bst-context-menu-item-right-text',
  ITEM_IS_DIVIDER: 'bst-context-menu-item-is-divider',
  ITEM_IS_DISABLED: 'bst-context-menu-item-is-disabled',
  ITEM_IS_ACTIVE: 'bst-context-menu-item-is-active',
} as const;

/** 告警前缀，形如 `[BstContextMenu]` */
const ROOT_TAG = `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}]`;

/**
 * 校验告警文案
 *
 * 格式固定为 `[组件名]` + 英文提示。
 * 覆盖 `BstContextMenuProps` 的全部 15 项入参，另含 `items[].key` 一条。
 */
export const BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES = {
  IS_VISIBLE_INVALID: `${ROOT_TAG} "isVisible" must be a boolean.`,
  ITEMS_INVALID: `${ROOT_TAG} "items" must be an array of BstContextMenuItem.`,
  ITEM_KEY_INVALID: `${ROOT_TAG} "items[].key" must be a non-empty string or a finite number; the item has been ignored.`,
  POSITION_INVALID: `${ROOT_TAG} "position" must be an object with numeric "x" and "y".`,
  IS_CLOSE_ON_OUTSIDE_CLICK_INVALID: `${ROOT_TAG} "isCloseOnOutsideClick" must be a boolean.`,
  IS_CLOSE_ON_OUTSIDE_SCROLL_INVALID: `${ROOT_TAG} "isCloseOnOutsideScroll" must be a boolean.`,
  IS_CLOSE_ON_ESC_KEY_DOWN_INVALID: `${ROOT_TAG} "isCloseOnEscKeyDown" must be a boolean.`,
  WIDTH_INVALID: `${ROOT_TAG} "width" must be a number or a CSS length string.`,
  MAX_HEIGHT_INVALID: `${ROOT_TAG} "maxHeight" must be a number or a CSS length string.`,
  TELEPORT_INVALID: `${ROOT_TAG} "teleport" must be a boolean or a non-empty selector string.`,
  ON_ITEM_SELECT_INVALID: `${ROOT_TAG} "onItemSelect" must be a function.`,
  ON_CLICK_OUTSIDE_INVALID: `${ROOT_TAG} "onClickOutside" must be a function.`,
  ON_SCROLL_OUTSIDE_INVALID: `${ROOT_TAG} "onScrollOutside" must be a function.`,
  ON_ESC_KEY_DOWN_INVALID: `${ROOT_TAG} "onEscKeyDown" must be a function.`,
  ON_AFTER_ENTER_INVALID: `${ROOT_TAG} "onAfterEnter" must be a function.`,
  ON_AFTER_LEAVE_INVALID: `${ROOT_TAG} "onAfterLeave" must be a function.`,
} as const;

/**
 * 入场 / 出场动画时长（毫秒）
 *
 * 来源：样式包 `@anim-duration-base`（0.2s），两侧改动需同步。
 */
export const BST_CONTEXT_MENU_CONSTANT_ANIMATION_DURATION = 200;

/**
 * 兜底定时器的额外缓冲（毫秒）
 *
 * 吸收动画帧调度与定时器精度带来的偏差，避免收尾早于动画结束。
 */
export const BST_CONTEXT_MENU_CONSTANT_ANIMATION_FALLBACK_BUFFER = 60;

/**
 * 面板与视口的安全间距（像素）
 *
 * 来源：样式包 `@context-menu-viewport-gap`（`@pop-padding-l`）。
 */
export const BST_CONTEXT_MENU_CONSTANT_VIEWPORT_GAP = 8;

/** Esc 键的 `KeyboardEvent.key` 取值 */
export const BST_CONTEXT_MENU_CONSTANT_KEY_ESCAPE = 'Escape';

/** 下方向键的 `KeyboardEvent.key` 取值 */
export const BST_CONTEXT_MENU_CONSTANT_KEY_ARROW_DOWN = 'ArrowDown';

/** 上方向键的 `KeyboardEvent.key` 取值 */
export const BST_CONTEXT_MENU_CONSTANT_KEY_ARROW_UP = 'ArrowUp';

/** Enter 键的 `KeyboardEvent.key` 取值 */
export const BST_CONTEXT_MENU_CONSTANT_KEY_ENTER = 'Enter';

/** 空格键的 `KeyboardEvent.key` 取值 */
export const BST_CONTEXT_MENU_CONSTANT_KEY_SPACE = ' ';

/** 未传入 `position` 时使用的默认坐标 */
export const BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION = {
  x: 0,
  y: 0,
} as const;
