import { computed } from 'vue';
import type { ComputedRef, PropType } from 'vue';
import type { BstContextMenuItem, BstContextMenuPosition, BstContextMenuProps } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION, BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES } from '../constants';
import { isBrowserEnvironment, normalizeContextMenuItems, resolveContextMenuTeleport, toCssLength } from '../utils';

const MESSAGES = BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES;

type PropValueValidator = (value: unknown) => boolean;

/** `useContextMenuProp` 的输出 */
export interface UseContextMenuPropReturn {
  /** 归一化后的菜单项列表 */
  normalizedItems: ComputedRef<BstContextMenuItem[]>;
  /** 最大高度内联样式，未传或非法时为 `undefined` */
  maxHeightStyle: ComputedRef<string | undefined>;
  /** Teleport 目标，`false` 表示原地渲染 */
  teleportTarget: ComputedRef<string | false>;
}

function createValidator(message: string, isValid: PropValueValidator): PropValueValidator {
  return (value: unknown): boolean => {
    if (value === undefined || isValid(value)) return true;

    console.warn(message);

    return false;
  };
}

function isBoolean(value: unknown): boolean {
  return typeof value === 'boolean';
}

function isFunction(value: unknown): boolean {
  return typeof value === 'function';
}

function isPosition(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;

  const { x, y } = value as BstContextMenuPosition;

  return Number.isFinite(x) && Number.isFinite(y);
}

function isCssLength(value: unknown): boolean {
  return toCssLength(value as number | string) !== undefined;
}

function isTeleport(value: unknown): boolean {
  if (typeof value === 'boolean') return true;

  return typeof value === 'string' && value.trim().length > 0;
}

function resolveTeleportTarget(teleport: boolean | string): string | false {
  const target = resolveContextMenuTeleport(teleport);

  if (typeof target !== 'string') return target;

  if (!isBrowserEnvironment()) return 'body';

  try {
    return document.querySelector(target) ? target : 'body';
  } catch {
    return 'body';
  }
}

export const contextMenuProps = {
  isVisible: {
    type: Boolean,
    default: false,
    validator: createValidator(MESSAGES.IS_VISIBLE_INVALID, isBoolean),
  },
  items: {
    type: Array as PropType<BstContextMenuItem[]>,
    default: (): BstContextMenuItem[] => [],
    validator: createValidator(MESSAGES.ITEMS_INVALID, Array.isArray),
  },
  position: {
    type: Object as PropType<BstContextMenuPosition>,
    default: (): BstContextMenuPosition => ({
      x: BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION.x,
      y: BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION.y,
    }),
    validator: createValidator(MESSAGES.POSITION_INVALID, isPosition),
  },
  isCloseOnOutsideClick: {
    type: Boolean,
    default: true,
    validator: createValidator(MESSAGES.IS_CLOSE_ON_OUTSIDE_CLICK_INVALID, isBoolean),
  },
  isCloseOnOutsideScroll: {
    type: Boolean,
    default: true,
    validator: createValidator(MESSAGES.IS_CLOSE_ON_OUTSIDE_SCROLL_INVALID, isBoolean),
  },
  isCloseOnEscKeyDown: {
    type: Boolean,
    default: true,
    validator: createValidator(MESSAGES.IS_CLOSE_ON_ESC_KEY_DOWN_INVALID, isBoolean),
  },
  maxHeight: {
    type: [Number, String] as PropType<number | string>,
    default: undefined,
    validator: createValidator(MESSAGES.MAX_HEIGHT_INVALID, isCssLength),
  },
  teleport: {
    type: [Boolean, String] as PropType<boolean | string>,
    default: true,
    validator: createValidator(MESSAGES.TELEPORT_INVALID, isTeleport),
  },
  onItemSelect: {
    type: Function as PropType<BstContextMenuProps['onItemSelect']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_ITEM_SELECT_INVALID, isFunction),
  },
  onClickOutside: {
    type: Function as PropType<BstContextMenuProps['onClickOutside']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_CLICK_OUTSIDE_INVALID, isFunction),
  },
  onScrollOutside: {
    type: Function as PropType<BstContextMenuProps['onScrollOutside']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_SCROLL_OUTSIDE_INVALID, isFunction),
  },
  onEscKeyDown: {
    type: Function as PropType<BstContextMenuProps['onEscKeyDown']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_ESC_KEY_DOWN_INVALID, isFunction),
  },
  onAfterEnter: {
    type: Function as PropType<BstContextMenuProps['onAfterEnter']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_AFTER_ENTER_INVALID, isFunction),
  },
  onAfterLeave: {
    type: Function as PropType<BstContextMenuProps['onAfterLeave']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_AFTER_LEAVE_INVALID, isFunction),
  },
} as const;

export function useContextMenuProp(props: BstContextMenuProps): UseContextMenuPropReturn {
  const normalizedItems = computed((): BstContextMenuItem[] => normalizeContextMenuItems(props.items));

  const maxHeightStyle = computed((): string | undefined => toCssLength(props.maxHeight));

  const teleportTarget = computed((): string | false => resolveTeleportTarget(props.teleport ?? true));

  return { normalizedItems, maxHeightStyle, teleportTarget };
}
