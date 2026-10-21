import { ref } from 'vue';
import type { ComputedRef, CSSProperties, Ref } from 'vue';
import type {
  BstContextMenuItem,
  BstContextMenuItemSelectContext,
  BstContextMenuPosition,
  BstContextMenuProps,
} from '@binarysovereign/bst-types';

import { useContextMenuKeyboard } from './context-menu-keyboard.hooks';
import { useContextMenuOutside } from './context-menu-outside.hooks';
import { useContextMenuPhase } from './context-menu-phase.hooks';
import { useContextMenuPosition } from './context-menu-position.hooks';
import { useContextMenuView } from './context-menu-view.hooks';
import type { ContextMenuEmit, ContextMenuPhase, ContextMenuSelectEvent } from '../types';
import { isBrowserEnvironment, isContextMenuItemActionable } from '../utils';

/** `useContextMenu` 的入参 */
export interface UseContextMenuOptions {
  /** 组件入参 */
  props: BstContextMenuProps;
  /** 事件派发函数 */
  emit: ContextMenuEmit;
  /** 归一化后的菜单项列表 */
  items: ComputedRef<BstContextMenuItem[]>;
  /** 宽度内联样式 */
  widthStyle: ComputedRef<string | undefined>;
  /** 最大高度内联样式 */
  maxHeightStyle: ComputedRef<string | undefined>;
}

/** `useContextMenu` 的输出 */
export interface UseContextMenuReturn {
  /** 当前渲染阶段 */
  phase: Ref<ContextMenuPhase>;
  /** 内部显隐真值 */
  innerVisible: Ref<boolean>;
  /** 是否需要渲染面板 */
  isActive: ComputedRef<boolean>;
  /** 当前键盘高亮的菜单项下标，`-1` 表示无 */
  activeIndex: Ref<number>;
  /** 是否处于首帧测量中 */
  isMeasuring: Ref<boolean>;
  /** 面板根节点 */
  rootRef: Ref<HTMLElement | null>;
  /** 根节点类名 */
  rootClass: ComputedRef<string[]>;
  /** 根节点内联样式 */
  rootStyle: ComputedRef<CSSProperties>;
  /** 在指定坐标打开菜单 */
  show: (x?: number, y?: number) => void;
  /** 同步父级传入的坐标 */
  setPosition: (position: BstContextMenuPosition) => void;
  /** 关闭菜单 */
  hide: () => void;
  /** 状态机入口：由显隐变化驱动 */
  applyVisible: (visible: boolean) => void;
  /** 清理兜底定时器 */
  cleanup: () => void;
  /** 测量面板尺寸并夹取坐标 */
  measureAndClamp: () => Promise<void>;
  /** 入场 / 出场动画结束 */
  handleAnimationEnd: (event: AnimationEvent) => void;
  /** 菜单项选中 */
  handleItemSelect: (item: BstContextMenuItem, index: number, nativeEvent: ContextMenuSelectEvent) => void;
  /** 鼠标移入菜单项时同步键盘高亮 */
  handleItemHover: (index: number) => void;
  /** 重置键盘高亮 */
  resetActiveIndex: () => void;
  /** 外部点击 */
  handleOutsideClick: (event: MouseEvent) => void;
  /** 外部滚动 */
  handleOutsideScroll: (event: Event) => void;
  /** 面板自身右键 */
  handleRootContextMenu: (event: MouseEvent) => void;
  /** 键盘处理（Esc / 上下方向键 / Enter / 空格） */
  handleKeyDown: (event: KeyboardEvent) => void;
}

export function useContextMenu(options: UseContextMenuOptions): UseContextMenuReturn {
  const { props, emit, items, widthStyle, maxHeightStyle } = options;

  const innerVisible = ref(props.isVisible === true);
  const rootRef = ref<HTMLElement | null>(null);

  const positionState = useContextMenuPosition({ props, emit, rootRef });

  const phaseState = useContextMenuPhase({
    emit,
    onSettle: (): void => {
      positionState.isMeasuring.value = false;
    },
  });

  const keyboard = useContextMenuKeyboard({ props, emit, items, rootRef, onSelect: handleItemSelect, onClose: hide });

  const outside = useContextMenuOutside({ props, emit, rootRef, onClose: hide });

  const view = useContextMenuView({
    phase: phaseState.phase,
    position: positionState.position,
    offset: positionState.offset,
    isMeasuring: positionState.isMeasuring,
    widthStyle,
    maxHeightStyle,
  });

  function applyVisible(visible: boolean): void {
    if (visible) {
      if (phaseState.isEntering()) return;

      keyboard.resetActiveIndex();

      const isFreshMount = phaseState.isIdle();
      const canMeasure = isBrowserEnvironment();

      phaseState.enter();
      positionState.isMeasuring.value = isFreshMount && canMeasure;

      if (canMeasure) void positionState.measureAndClamp();

      return;
    }

    phaseState.leave();
  }

  function show(x?: number, y?: number): void {
    if (x !== undefined && y !== undefined) {
      const target = { x, y };
      const measured = phaseState.isActive.value ? positionState.resolveMeasuredPosition(target) : undefined;

      if (measured) positionState.commitPosition(measured);
      else positionState.position.value = target;
    }

    innerVisible.value = true;
  }

  function hide(): void {
    if (!innerVisible.value) return;

    innerVisible.value = false;
  }

  function handleAnimationEnd(event: AnimationEvent): void {
    if (event.target !== rootRef.value) return;

    phaseState.settle();
  }

  function handleItemSelect(item: BstContextMenuItem, index: number, nativeEvent: ContextMenuSelectEvent): void {
    if (!isContextMenuItemActionable(item)) return;

    const context: BstContextMenuItemSelectContext = {
      item,
      index,
      nativeEvent: nativeEvent as MouseEvent,
    };

    emit('item-select', context);

    try {
      item.action?.(context);
    } finally {
      hide();
    }
  }

  if (innerVisible.value) applyVisible(true);

  return {
    phase: phaseState.phase,
    innerVisible,
    isActive: phaseState.isActive,
    activeIndex: keyboard.activeIndex,
    isMeasuring: positionState.isMeasuring,
    rootRef,
    rootClass: view.rootClass,
    rootStyle: view.rootStyle,
    show,
    hide,
    applyVisible,
    setPosition: positionState.setPosition,
    measureAndClamp: positionState.measureAndClamp,
    cleanup: phaseState.cleanup,
    handleAnimationEnd,
    handleItemSelect,
    handleItemHover: keyboard.handleItemHover,
    resetActiveIndex: keyboard.resetActiveIndex,
    handleKeyDown: keyboard.handleKeyDown,
    handleOutsideClick: outside.handleOutsideClick,
    handleOutsideScroll: outside.handleOutsideScroll,
    handleRootContextMenu: outside.handleRootContextMenu,
  };
}
