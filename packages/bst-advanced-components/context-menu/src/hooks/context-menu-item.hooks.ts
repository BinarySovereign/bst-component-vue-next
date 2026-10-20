// BstContextMenu 单项逻辑：类名、无障碍属性与点击交互
// 只回答「这一项怎么渲染、怎么交互」，键盘导航与菜单显隐由根组件统一处理
import { computed } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { BstContextMenuItem } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES } from '../constants';
import type { ContextMenuSelectEvent } from './context-menu.hooks';
import { isContextMenuDivider, isContextMenuItemDisabled } from '../utils';

/** `useContextMenuItem` 的入参 */
export interface UseContextMenuItemOptions {
  /** 当前菜单项数据 */
  item: BstContextMenuItem;
  /** 该项在列表中的索引 */
  index: number;
  /** 是否为键盘导航当前高亮项 */
  isActive: Ref<boolean>;
  /** 激活回调，与根菜单共用同一入口 */
  onSelect: (item: BstContextMenuItem, index: number, nativeEvent: ContextMenuSelectEvent) => void;
  /** 鼠标移入回调，用于把高亮同步到该项 */
  onHover: (index: number) => void;
}

/** `useContextMenuItem` 的输出 */
export interface UseContextMenuItemReturn {
  /** 是否为分割线 */
  isDivider: ComputedRef<boolean>;
  /** 是否禁用 */
  isDisabled: ComputedRef<boolean>;
  /** 根节点类名 */
  itemClass: ComputedRef<string[]>;
  /** 根节点无障碍属性 */
  itemAttrs: ComputedRef<Record<string, string>>;
  /** 点击处理 */
  handleClick: (event: MouseEvent) => void;
  /** 鼠标移入处理 */
  handleMouseenter: () => void;
}

/**
 * 解析单项的无障碍属性。
 *
 * 分割线不可交互；普通项与禁用项均不进入 Tab 序列，
 * 键盘导航由根组件通过上下方向键统一驱动。
 *
 * @param isDivider 是否为分割线
 * @param isDisabled 是否禁用
 * @returns 需要挂到根节点的属性
 */
function resolveItemAttrs(isDivider: boolean, isDisabled: boolean): Record<string, string> {
  if (isDivider) return { role: 'separator', 'aria-hidden': 'true' };

  if (isDisabled) return { role: 'menuitem', 'aria-disabled': 'true' };

  return { role: 'menuitem' };
}

/**
 * 处理单个菜单项的渲染数据与交互。
 *
 * @param options 菜单项数据、索引、高亮状态与交互回调
 * @returns 类名、无障碍属性与事件处理函数
 */
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

    // 分割线与禁用项不参与键盘高亮
    if (isActive.value && !isDivider.value && !isDisabled.value) {
      classNames.push(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);
    }

    return classNames;
  });

  const itemAttrs = computed((): Record<string, string> => resolveItemAttrs(isDivider.value, isDisabled.value));

  /**
   * 处理点击。
   *
   * 分割线与禁用项在此拦截，鼠标与键盘因此共享同一套判定。
   *
   * @param nativeEvent 原生鼠标事件
   */
  function handleClick(nativeEvent: MouseEvent): void {
    if (isDivider.value || isDisabled.value) return;

    onSelect(item, index, nativeEvent);
  }

  /**
   * 处理鼠标移入。
   *
   * 把键盘高亮同步到当前项，避免上下键高亮与鼠标悬浮同时出现在两项上。
   */
  function handleMouseenter(): void {
    if (isDivider.value || isDisabled.value) return;

    onHover(index);
  }

  return { isDivider, isDisabled, itemClass, itemAttrs, handleClick, handleMouseenter };
}
