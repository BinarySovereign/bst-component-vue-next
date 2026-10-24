/**
 * Copyright (c) 2026 Felix Tang (BinarySovereign). Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */

import type { Ref } from 'vue';
import type { BstContextMenuProps } from '@binarysovereign/bst-types';

import type { ContextMenuEmit } from '../types';
import { isInsideContextMenu } from '../utils';

/** `useContextMenuOutside` 的入参 */
export interface UseContextMenuOutsideOptions {
  /** 组件入参，用于读取外部点击 / 滚动的关闭开关 */
  props: BstContextMenuProps;
  /** 事件派发函数，用于派发 `click-outside` / `scroll-outside` */
  emit: ContextMenuEmit;
  /** 面板根节点，用于判定事件目标是否在面板内部 */
  rootRef: Ref<HTMLElement | null>;
  /** 关闭回调 */
  onClose: () => void;
}

/** `useContextMenuOutside` 的输出 */
export interface UseContextMenuOutsideReturn {
  /** 外部点击处理 */
  handleOutsideClick: (event: MouseEvent) => void;
  /** 外部滚动处理 */
  handleOutsideScroll: (event: Event) => void;
  /** 面板自身右键处理 */
  handleRootContextMenu: (event: MouseEvent) => void;
}

export function useContextMenuOutside(options: UseContextMenuOutsideOptions): UseContextMenuOutsideReturn {
  const { props, emit, rootRef, onClose } = options;

  function _shouldClose(isCloseEnabled: boolean, target: EventTarget | null): boolean {
    if (!isCloseEnabled) return false;

    return !isInsideContextMenu(rootRef.value, target);
  }

  function handleOutsideClick(event: MouseEvent): void {
    if (!_shouldClose(props.isCloseOnOutsideClick !== false, event.target)) return;

    emit('click-outside', { nativeEvent: event });
    onClose();
  }

  function handleOutsideScroll(event: Event): void {
    if (!_shouldClose(props.isCloseOnOutsideScroll !== false, event.target)) return;

    emit('scroll-outside', { nativeEvent: event });
    onClose();
  }

  function handleRootContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  return { handleOutsideClick, handleOutsideScroll, handleRootContextMenu };
}
