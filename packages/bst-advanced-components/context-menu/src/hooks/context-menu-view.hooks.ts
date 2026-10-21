import { computed } from 'vue';
import type { ComputedRef, CSSProperties, Ref } from 'vue';
import type { BstContextMenuPosition } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES } from '../constants';
import type { ContextMenuPhase } from '../types';

/** `useContextMenuView` 的入参 */
export interface UseContextMenuViewOptions {
  /** 当前渲染阶段 */
  phase: Ref<ContextMenuPhase>;
  /** 当前生效坐标 */
  position: Ref<BstContextMenuPosition>;
  /** 包含块偏移补偿量 */
  offset: Ref<BstContextMenuPosition>;
  /** 是否处于首帧测量中 */
  isMeasuring: Ref<boolean>;
  /** 宽度内联样式 */
  widthStyle: ComputedRef<string | undefined>;
  /** 最大高度内联样式 */
  maxHeightStyle: ComputedRef<string | undefined>;
}

/** `useContextMenuView` 的输出 */
export interface UseContextMenuViewReturn {
  /** 根节点类名 */
  rootClass: ComputedRef<string[]>;
  /** 根节点内联样式 */
  rootStyle: ComputedRef<CSSProperties>;
}

export function useContextMenuView(options: UseContextMenuViewOptions): UseContextMenuViewReturn {
  const { phase, position, offset, isMeasuring, widthStyle, maxHeightStyle } = options;

  const rootClass = computed((): string[] => {
    const classNames: string[] = [BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT];

    if (phase.value === 'opening') {
      classNames.push(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT_IS_OPEN);
    }

    if (phase.value === 'closing') {
      classNames.push(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT_IS_CLOSING);
    }

    return classNames;
  });

  const rootStyle = computed((): CSSProperties => ({
    position: 'fixed',
    left: `${position.value.x + offset.value.x}px`,
    top: `${position.value.y + offset.value.y}px`,
    width: widthStyle.value,
    maxHeight: maxHeightStyle.value,
    visibility: isMeasuring.value ? 'hidden' : undefined,
  }));

  return { rootClass, rootStyle };
}
