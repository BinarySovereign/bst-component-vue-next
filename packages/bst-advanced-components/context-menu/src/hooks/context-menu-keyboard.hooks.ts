import { nextTick, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { BstContextMenuItem, BstContextMenuProps } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_ITEM_INDEX_ATTRIBUTE, BST_CONTEXT_MENU_CONSTANT_KEYS } from '../constants';
import type { ContextMenuEmit, ContextMenuSelectEvent } from '../types';
import { isContextMenuItemActionable, resolveContextMenuItemIndex } from '../utils';

/** `useContextMenuKeyboard` 的入参 */
export interface UseContextMenuKeyboardOptions {
  /** 组件入参，用于读取 Esc 关闭开关 */
  props: BstContextMenuProps;
  /** 事件派发函数，用于派发 `esc-key-down` */
  emit: ContextMenuEmit;
  /** 归一化后的菜单项列表 */
  items: ComputedRef<BstContextMenuItem[]>;
  /** 面板根节点，滚动高亮项所需 */
  rootRef: Ref<HTMLElement | null>;
  /** 菜单项激活回调，与鼠标点击共用同一入口 */
  onSelect: (item: BstContextMenuItem, index: number, nativeEvent: ContextMenuSelectEvent) => void;
  /** 关闭回调 */
  onClose: () => void;
}

/** `useContextMenuKeyboard` 的输出 */
export interface UseContextMenuKeyboardReturn {
  /** 当前键盘高亮的菜单项下标，`-1` 表示无 */
  activeIndex: Ref<number>;
  /** 键盘处理（Esc / 上下方向键 / Enter / 空格） */
  handleKeyDown: (event: KeyboardEvent) => void;
  /** 鼠标移入菜单项时同步键盘高亮 */
  handleItemHover: (index: number) => void;
  /** 重置键盘高亮 */
  resetActiveIndex: () => void;
}

function _isActivationKey(key: string): boolean {
  return key === BST_CONTEXT_MENU_CONSTANT_KEYS.ENTER || key === BST_CONTEXT_MENU_CONSTANT_KEYS.SPACE;
}

export function useContextMenuKeyboard(options: UseContextMenuKeyboardOptions): UseContextMenuKeyboardReturn {
  const { props, emit, items, rootRef, onSelect, onClose } = options;

  const activeIndex = ref(-1);

  function _findItemAt(index: number): BstContextMenuItem | undefined {
    return items.value[index];
  }

  function _scrollActiveIntoView(): void {
    const element = rootRef.value?.querySelector<HTMLElement>(
      `[${BST_CONTEXT_MENU_CONSTANT_ITEM_INDEX_ATTRIBUTE}="${activeIndex.value}"]`,
    );

    if (typeof element?.scrollIntoView === 'function') {
      element.scrollIntoView({ block: 'nearest' });
    }
  }

  function _moveActive(step: 1 | -1): void {
    const next = resolveContextMenuItemIndex(items.value, activeIndex.value, step);

    if (next === -1) return;

    activeIndex.value = next;
    void nextTick(_scrollActiveIntoView);
  }

  function resetActiveIndex(): void {
    activeIndex.value = -1;
  }

  function handleItemHover(index: number): void {
    const item = _findItemAt(index);

    if (!item || !isContextMenuItemActionable(item)) return;

    activeIndex.value = index;
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === BST_CONTEXT_MENU_CONSTANT_KEYS.ESCAPE) {
      if (props.isCloseOnEscKeyDown === false) return;

      emit('esc-key-down', { nativeEvent: event });
      onClose();
      return;
    }

    if (event.key === BST_CONTEXT_MENU_CONSTANT_KEYS.ARROW_DOWN) {
      event.preventDefault();
      _moveActive(1);
      return;
    }

    if (event.key === BST_CONTEXT_MENU_CONSTANT_KEYS.ARROW_UP) {
      event.preventDefault();
      _moveActive(-1);
      return;
    }

    if (!_isActivationKey(event.key)) return;

    const item = _findItemAt(activeIndex.value);

    if (!item) return;

    event.preventDefault();
    onSelect(item, activeIndex.value, event);
  }

  return { activeIndex, handleKeyDown, handleItemHover, resetActiveIndex };
}
