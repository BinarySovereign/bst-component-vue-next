// BstContextMenu 编排中枢：组装下游 hooks，向视图输出统一能力
// 只做接线与转发，业务判断全部位于各专职 hook
import { computed } from 'vue';
import type { ComputedRef, CSSProperties, Ref, Slots } from 'vue';
import type { BstContextMenuItem, BstContextMenuProps } from '@binarysovereign/bst-types';

import { useContextMenu } from './context-menu.hooks';
import type { ContextMenuEmit, ContextMenuPhase, ContextMenuSelectEvent } from './context-menu.hooks';
import { useContextMenuLife } from './life.hooks';
import { useContextMenuProp } from './prop.hooks';

/** `useContextMenuController` 的输出，即视图可用的全部能力 */
export interface UseContextMenuControllerReturn {
  /** 当前渲染阶段 */
  phase: Ref<ContextMenuPhase>;
  /** 是否需要渲染面板 */
  isActive: ComputedRef<boolean>;
  /** 当前键盘高亮的菜单项下标，`-1` 表示无 */
  activeIndex: Ref<number>;
  /** 面板根节点 */
  rootRef: Ref<HTMLElement | null>;
  /** 根节点类名 */
  rootClass: ComputedRef<string[]>;
  /** 根节点内联样式 */
  rootStyle: ComputedRef<CSSProperties>;
  /** 归一化后的菜单项列表 */
  normalizedItems: ComputedRef<BstContextMenuItem[]>;
  /** Teleport 目标，`false` 表示原地渲染 */
  teleportTarget: ComputedRef<string | false>;
  /** 是否提供了默认插槽 */
  hasDefaultSlot: ComputedRef<boolean>;
  /** 在指定坐标打开菜单 */
  show: (x?: number, y?: number) => void;
  /** 关闭菜单 */
  hide: () => void;
  /** 动画结束处理 */
  handleAnimationEnd: (event: AnimationEvent) => void;
  /** 菜单项选中处理 */
  handleItemSelect: (item: BstContextMenuItem, index: number, nativeEvent: ContextMenuSelectEvent) => void;
  /** 鼠标移入菜单项时同步键盘高亮 */
  handleItemHover: (index: number) => void;
  /** 面板自身右键处理 */
  handleRootContextMenu: (event: MouseEvent) => void;
}

/**
 * 组装上下文菜单的全部运行时能力。
 *
 * 视图只依赖本函数的返回值，不直接触达任何下游 hook。
 *
 * @param props 组件入参
 * @param emit 事件派发函数
 * @param slots 组件插槽
 * @returns 视图所需的全部状态与方法
 */
export function useContextMenuController(
  props: BstContextMenuProps,
  emit: ContextMenuEmit,
  slots: Slots,
): UseContextMenuControllerReturn {
  const { normalizedItems, widthStyle, maxHeightStyle, teleportTarget } = useContextMenuProp(props);

  const menu = useContextMenu({ props, emit, items: normalizedItems, widthStyle, maxHeightStyle });

  const hasDefaultSlot = computed((): boolean => Boolean(slots.default));

  useContextMenuLife({
    isActive: menu.isActive,
    innerVisible: menu.innerVisible,
    props,
    rootRef: menu.rootRef,
    onOutsideClick: menu.handleOutsideClick,
    onOutsideScroll: menu.handleOutsideScroll,
    onKeyDown: menu.handleKeyDown,
    onVisiblePropChange: (visible) => {
      menu.innerVisible.value = visible;
    },
    onInnerVisibleChange: (visible) => {
      emit('update:isVisible', visible);
      menu.applyVisible(visible);
    },
    onPositionPropChange: menu.setPosition,
    onReMeasure: () => {
      void menu.measureAndClamp();
    },
    onItemsChange: menu.resetActiveIndex,
    onCleanup: menu.cleanup,
  });

  return {
    phase: menu.phase,
    isActive: menu.isActive,
    activeIndex: menu.activeIndex,
    rootRef: menu.rootRef,
    rootClass: menu.rootClass,
    rootStyle: menu.rootStyle,
    normalizedItems,
    teleportTarget,
    hasDefaultSlot,
    show: menu.show,
    hide: menu.hide,
    handleAnimationEnd: menu.handleAnimationEnd,
    handleItemSelect: menu.handleItemSelect,
    handleItemHover: menu.handleItemHover,
    handleRootContextMenu: menu.handleRootContextMenu,
  };
}
