// BstContextMenu Props：运行期声明、入参校验与归一化
// 只处理入参，不持有显隐状态，不做业务分支
import { computed } from 'vue';
import type { ComputedRef, PropType } from 'vue';
import type { BstContextMenuItem, BstContextMenuPosition, BstContextMenuProps } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION, BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES } from '../constants';
import { normalizeContextMenuItems, resolveContextMenuTeleport, toCssLength } from '../utils';

const MESSAGES = BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES;

/** 单个入参的合法性判定 */
type PropValueValidator = (value: unknown) => boolean;

/** Props 运行期校验结果 */
export interface UseContextMenuPropReturn {
  /** 归一化后的菜单项列表 */
  normalizedItems: ComputedRef<BstContextMenuItem[]>;
  /** 宽度内联样式，未传或非法时为 `undefined` */
  widthStyle: ComputedRef<string | undefined>;
  /** 最大高度内联样式，未传或非法时为 `undefined` */
  maxHeightStyle: ComputedRef<string | undefined>;
  /** Teleport 目标，`false` 表示原地渲染 */
  teleportTarget: ComputedRef<string | false>;
}

/**
 * 创建 Vue 的 props validator。
 *
 * 未传值时放行；非法时输出告警并返回 `false`，交由 Vue 继续提示类型不匹配。
 *
 * @param message 校验失败时输出的告警文案
 * @param isValid 具体合法性判定
 * @returns 可直接交给 `validator` 使用的函数
 */
function createValidator(message: string, isValid: PropValueValidator): PropValueValidator {
  return (value: unknown): boolean => {
    if (value === undefined || isValid(value)) return true;

    console.warn(message);

    return false;
  };
}

/**
 * 判断入参是否为布尔值。
 *
 * @param value 待判定值
 * @returns 是否为布尔值
 */
function isBoolean(value: unknown): boolean {
  return typeof value === 'boolean';
}

/**
 * 判断入参是否为函数。
 *
 * @param value 待判定值
 * @returns 是否为函数
 */
function isFunction(value: unknown): boolean {
  return typeof value === 'function';
}

/**
 * 判断入参是否为合法的坐标对象。
 *
 * @param value 待判定值
 * @returns `x`、`y` 是否均为有限数字
 */
function isPosition(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;

  const { x, y } = value as BstContextMenuPosition;

  return Number.isFinite(x) && Number.isFinite(y);
}

/**
 * 判断入参是否为合法的 CSS 长度。
 *
 * @param value 待判定值
 * @returns 转换后是否非 `undefined`
 */
function isCssLength(value: unknown): boolean {
  return toCssLength(value as number | string) !== undefined;
}

/**
 * 判断入参是否为合法的 `teleport` 配置。
 *
 * 布尔值直接放行；字符串要求为非空选择器。
 *
 * @param value 待判定值
 * @returns 是否合法
 */
function isTeleport(value: unknown): boolean {
  if (typeof value === 'boolean') return true;

  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * BstContextMenu 运行时 props 声明。
 *
 * 覆盖 `BstContextMenuProps` 的全部 15 项入参，每项均带 validator；
 * `update:xxx` 属于事件而非 prop，因此不在其中。
 */
export const contextMenuProps = {
  /** 是否显示菜单，与 `update:isVisible` 配对 */
  isVisible: {
    type: Boolean,
    default: false,
    validator: createValidator(MESSAGES.IS_VISIBLE_INVALID, isBoolean),
  },
  /** 菜单数据列表 */
  items: {
    type: Array as PropType<BstContextMenuItem[]>,
    default: (): BstContextMenuItem[] => [],
    validator: createValidator(MESSAGES.ITEMS_INVALID, Array.isArray),
  },
  /** 期望坐标，渲染前夹取到视口内 */
  position: {
    type: Object as PropType<BstContextMenuPosition>,
    default: (): BstContextMenuPosition => ({
      x: BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION.x,
      y: BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION.y,
    }),
    validator: createValidator(MESSAGES.POSITION_INVALID, isPosition),
  },
  /** 点击面板外部是否关闭 */
  isCloseOnOutsideClick: {
    type: Boolean,
    default: true,
    validator: createValidator(MESSAGES.IS_CLOSE_ON_OUTSIDE_CLICK_INVALID, isBoolean),
  },
  /** 面板外部滚动是否关闭 */
  isCloseOnOutsideScroll: {
    type: Boolean,
    default: true,
    validator: createValidator(MESSAGES.IS_CLOSE_ON_OUTSIDE_SCROLL_INVALID, isBoolean),
  },
  /** 按下 Esc 是否关闭 */
  isCloseOnEscKeyDown: {
    type: Boolean,
    default: true,
    validator: createValidator(MESSAGES.IS_CLOSE_ON_ESC_KEY_DOWN_INVALID, isBoolean),
  },
  /** 面板宽度，数字补 px，未传交由样式包默认值 */
  width: {
    type: [Number, String] as PropType<number | string>,
    default: undefined,
    validator: createValidator(MESSAGES.WIDTH_INVALID, isCssLength),
  },
  /** 面板最大高度，超出后内部滚动 */
  maxHeight: {
    type: [Number, String] as PropType<number | string>,
    default: undefined,
    validator: createValidator(MESSAGES.MAX_HEIGHT_INVALID, isCssLength),
  },
  /** Teleport 目标：`true` → `body`，`false` → 原地，字符串 → 选择器 */
  teleport: {
    type: [Boolean, String] as PropType<boolean | string>,
    default: true,
    validator: createValidator(MESSAGES.TELEPORT_INVALID, isTeleport),
  },
  /** 菜单项选中回调，等价于 `@item-select` */
  onItemSelect: {
    type: Function as PropType<BstContextMenuProps['onItemSelect']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_ITEM_SELECT_INVALID, isFunction),
  },
  /** 点击外部回调，等价于 `@click-outside` */
  onClickOutside: {
    type: Function as PropType<BstContextMenuProps['onClickOutside']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_CLICK_OUTSIDE_INVALID, isFunction),
  },
  /** 外部滚动回调，等价于 `@scroll-outside` */
  onScrollOutside: {
    type: Function as PropType<BstContextMenuProps['onScrollOutside']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_SCROLL_OUTSIDE_INVALID, isFunction),
  },
  /** Esc 键回调，等价于 `@esc-key-down` */
  onEscKeyDown: {
    type: Function as PropType<BstContextMenuProps['onEscKeyDown']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_ESC_KEY_DOWN_INVALID, isFunction),
  },
  /** 入场动画结束回调，等价于 `@after-enter` */
  onAfterEnter: {
    type: Function as PropType<BstContextMenuProps['onAfterEnter']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_AFTER_ENTER_INVALID, isFunction),
  },
  /** 出场动画结束回调，等价于 `@after-leave` */
  onAfterLeave: {
    type: Function as PropType<BstContextMenuProps['onAfterLeave']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_AFTER_LEAVE_INVALID, isFunction),
  },
} as const;

/**
 * 解析 Teleport 目标。
 *
 * 选择器未命中或不是合法选择器时回落 `body`，避免整块菜单消失；
 * 非浏览器环境下直接透传，由 Teleport 自行处理。
 *
 * @param teleport Props 传入的 teleport 配置
 * @returns 可用的 Teleport 目标
 */
function resolveTeleportTarget(teleport: boolean | string): string | false {
  const target = resolveContextMenuTeleport(teleport);

  if (typeof target !== 'string') return target;

  try {
    return document.querySelector(target) ? target : 'body';
  } catch {
    // 非法选择器会抛错，同样回落到 body
    return 'body';
  }
}

/**
 * 处理 Props 的归一化与派生值。
 *
 * @param props 组件入参
 * @returns 归一化列表与内联样式量
 */
export function useContextMenuProp(props: BstContextMenuProps): UseContextMenuPropReturn {
  const normalizedItems = computed((): BstContextMenuItem[] => normalizeContextMenuItems(props.items));

  const widthStyle = computed((): string | undefined => toCssLength(props.width));

  const maxHeightStyle = computed((): string | undefined => toCssLength(props.maxHeight));

  const teleportTarget = computed((): string | false => resolveTeleportTarget(props.teleport ?? true));

  return { normalizedItems, widthStyle, maxHeightStyle, teleportTarget };
}
