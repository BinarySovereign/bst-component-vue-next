/**
 * Copyright (c) 2026 Felix Tang (BinarySovereign). Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */

import { nextTick, ref } from 'vue';
import type { Ref } from 'vue';
import type { BstContextMenuPosition, BstContextMenuProps } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION, BST_CONTEXT_MENU_CONSTANT_METRICS } from '../constants';
import type { ContextMenuEmit } from '../types';
import {
  clampContextMenuPosition,
  isBrowserEnvironment,
  resolveContextMenuOffset,
  resolveContextMenuOrigin,
} from '../utils';

/** `useContextMenuPosition` 的入参 */
export interface UseContextMenuPositionOptions {
  /** 组件入参，用于读取期望坐标 */
  props: BstContextMenuProps;
  /** 事件派发函数，坐标被夹取时回写 `v-model:position` */
  emit: ContextMenuEmit;
  /** 面板根节点，测量所需 */
  rootRef: Ref<HTMLElement | null>;
}

/** `useContextMenuPosition` 的输出 */
export interface UseContextMenuPositionReturn {
  /** 当前生效坐标 */
  position: Ref<BstContextMenuPosition>;
  /** 挂载容器左上角的视口坐标 */
  origin: Ref<BstContextMenuPosition>;
  /** 包含块偏移补偿量 */
  offset: Ref<BstContextMenuPosition>;
  /** 是否处于首帧测量中 */
  isMeasuring: Ref<boolean>;
  /** 用已挂载元素的尺寸夹取目标坐标 */
  resolveMeasuredPosition: (target: BstContextMenuPosition) => BstContextMenuPosition | undefined;
  /** 写入夹取后的坐标，变化时回写 `v-model:position` */
  commitPosition: (next: BstContextMenuPosition) => void;
  /** 测量面板尺寸并把坐标夹取到视口内 */
  measureAndClamp: () => Promise<void>;
  /** 同步父级传入的坐标 */
  setPosition: (position: BstContextMenuPosition) => void;
}

function _createInitialPosition(position?: BstContextMenuPosition): BstContextMenuPosition {
  return {
    x: position?.x ?? BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION.x,
    y: position?.y ?? BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION.y,
  };
}

export function useContextMenuPosition(options: UseContextMenuPositionOptions): UseContextMenuPositionReturn {
  const { props, emit, rootRef } = options;

  const position = ref<BstContextMenuPosition>(_createInitialPosition(props.position));
  const origin = ref<BstContextMenuPosition>({ x: 0, y: 0 });
  const offset = ref<BstContextMenuPosition>({ x: 0, y: 0 });
  const isMeasuring = ref(false);
  let measureToken = 0;

  function resolveMeasuredPosition(target: BstContextMenuPosition): BstContextMenuPosition | undefined {
    const element = rootRef.value;

    if (!element || !isBrowserEnvironment()) return undefined;

    const rect = element.getBoundingClientRect();
    const nextOffset = resolveContextMenuOffset({
      appliedX: origin.value.x + position.value.x + offset.value.x,
      appliedY: origin.value.y + position.value.y + offset.value.y,
      actualX: rect.left,
      actualY: rect.top,
      width: rect.width,
      height: rect.height,
    });

    if (nextOffset) offset.value = nextOffset;

    origin.value = resolveContextMenuOrigin(element);

    const clamped = clampContextMenuPosition({
      x: origin.value.x + target.x,
      y: origin.value.y + target.y,
      menuWidth: element.offsetWidth,
      menuHeight: element.offsetHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      gap: BST_CONTEXT_MENU_CONSTANT_METRICS.VIEWPORT_GAP,
    });

    return { x: clamped.x - origin.value.x, y: clamped.y - origin.value.y };
  }

  function commitPosition(next: BstContextMenuPosition): void {
    if (next.x === position.value.x && next.y === position.value.y) return;

    position.value = next;
    emit('update:position', next);
  }

  async function measureAndClamp(): Promise<void> {
    const token = ++measureToken;

    await nextTick();

    if (token !== measureToken) return;

    const next = resolveMeasuredPosition(position.value);

    isMeasuring.value = false;

    if (next) commitPosition(next);
  }

  function setPosition(value: BstContextMenuPosition): void {
    position.value = { x: value.x, y: value.y };
  }

  return {
    position,
    origin,
    offset,
    isMeasuring,
    resolveMeasuredPosition,
    commitPosition,
    measureAndClamp,
    setPosition,
  };
}
