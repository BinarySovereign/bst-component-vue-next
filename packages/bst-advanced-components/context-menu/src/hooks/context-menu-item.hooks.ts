// BstContextMenuItem 子元素对应的 hooks

/**
 * Copyright (c) 2026 Felix Tang (BinarySovereign). Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */

import { computed } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { BstContextMenuItem } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES } from '../constants';
import type { ContextMenuSelectEvent } from '../types';
import { isContextMenuItemActionable, isContextMenuDivider, isContextMenuItemDisabled } from '../utils';

export interface UseContextMenuItemOptions {
  /** 当前菜单项数据 */
  item: BstContextMenuItem;
  /** 该项在列表中的下标 */
  index: number;
  /** 是否为键盘导航当前高亮项 */
  isActive: Ref<boolean>;
  /** 激活回调，与根菜单共用同一入口 */
  onSelect: (item: BstContextMenuItem, index: number, nativeEvent: ContextMenuSelectEvent) => void;
  /** 鼠标移入回调，用于把高亮同步到该项 */
  onHover: (index: number) => void;
}

/** 菜单项无障碍属性，按分割线 / 禁用 / 普通三种形态收敛 */
export type ContextMenuItemAttrs =
  { role: 'separator'; 'aria-hidden': 'true' } | { role: 'menuitem'; 'aria-disabled': 'true' } | { role: 'menuitem' };

/** 菜单项默认渲染所需的文本数据 */
export interface ContextMenuItemContent {
  leftText?: string;
  rightText?: string;
}

export interface UseContextMenuItemReturn {
  /** 是否为分割线 */
  isDivider: ComputedRef<boolean>;
  /** 是否禁用 */
  isDisabled: ComputedRef<boolean>;
  /** 根节点类名 */
  itemClass: ComputedRef<string[]>;
  /** 根节点无障碍属性 */
  itemAttrs: ComputedRef<ContextMenuItemAttrs>;
  /** 默认渲染的文本数据，`undefined` 表示无默认内容 */
  itemContent: ComputedRef<ContextMenuItemContent | undefined>;
  /** 点击处理 */
  handleClick: (event: MouseEvent) => void;
  /** 鼠标移入处理 */
  handleMouseenter: () => void;
}

function resolveItemAttrs(isDivider: boolean, isDisabled: boolean): ContextMenuItemAttrs {
  if (isDivider) return { role: 'separator', 'aria-hidden': 'true' };
  if (isDisabled) return { role: 'menuitem', 'aria-disabled': 'true' };
  return { role: 'menuitem' };
}

export function useContextMenuItem(options: UseContextMenuItemOptions): UseContextMenuItemReturn {
  const { item, index, isActive, onSelect, onHover } = options;

  const isDivider = computed((): boolean => isContextMenuDivider(item));
  const isDisabled = computed((): boolean => isContextMenuItemDisabled(item));

  const itemClass = computed((): string[] => {
    const classNames: string[] = [BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM];

    if (isDivider.value) {
      classNames.push(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_DIVIDER);
    }

    if (isDisabled.value) {
      classNames.push(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_DISABLED);
    }

    if (isActive.value && isContextMenuItemActionable(item)) {
      classNames.push(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);
    }

    return classNames;
  });

  const itemAttrs = computed((): ContextMenuItemAttrs => resolveItemAttrs(isDivider.value, isDisabled.value));

  const itemContent = computed((): ContextMenuItemContent | undefined => {
    const { leftText, rightText } = item;
    if (!leftText && !rightText) return undefined;
    return { leftText, rightText };
  });

  function handleClick(nativeEvent: MouseEvent): void {
    if (!isContextMenuItemActionable(item)) return;
    onSelect(item, index, nativeEvent);
  }

  function handleMouseenter(): void {
    if (!isContextMenuItemActionable(item)) return;
    onHover(index);
  }

  return { isDivider, isDisabled, itemClass, itemAttrs, itemContent, handleClick, handleMouseenter };
}
