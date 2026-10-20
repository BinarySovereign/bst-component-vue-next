// BstContextMenu 状态机：显隐阶段、位置夹取、关闭触发与选择链路
// 只维护运行时状态与事件派发，生命周期钩子统一放在 life.hooks.ts
import { computed, nextTick, ref } from 'vue';
import type { ComputedRef, CSSProperties, Ref } from 'vue';
import type {
  BstContextMenuClickOutsideContext,
  BstContextMenuEscKeyDownContext,
  BstContextMenuItem,
  BstContextMenuItemSelectContext,
  BstContextMenuPosition,
  BstContextMenuProps,
  BstContextMenuScrollOutsideContext,
} from '@binarysovereign/bst-types';

import {
  BST_CONTEXT_MENU_CONSTANT_ANIMATION_DURATION,
  BST_CONTEXT_MENU_CONSTANT_ANIMATION_FALLBACK_BUFFER,
  BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES,
  BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION,
  BST_CONTEXT_MENU_CONSTANT_KEY_ARROW_DOWN,
  BST_CONTEXT_MENU_CONSTANT_KEY_ARROW_UP,
  BST_CONTEXT_MENU_CONSTANT_KEY_ENTER,
  BST_CONTEXT_MENU_CONSTANT_KEY_ESCAPE,
  BST_CONTEXT_MENU_CONSTANT_KEY_SPACE,
  BST_CONTEXT_MENU_CONSTANT_VIEWPORT_GAP,
} from '../constants';
import {
  clampContextMenuPosition,
  isContextMenuDivider,
  isContextMenuItemDisabled,
  isInsideContextMenu,
  resolveContextMenuItemIndex,
  resolveContextMenuOffset,
} from '../utils';

/** 面板渲染阶段 */
export type ContextMenuPhase = 'idle' | 'opening' | 'open' | 'closing';

/** 菜单项激活的原生事件：鼠标点击或键盘确认 */
export type ContextMenuSelectEvent = MouseEvent | KeyboardEvent;

/** 组件对外开放的事件签名 */
export interface ContextMenuEmit {
  /** 显隐变化，支持 `v-model:is-visible` */
  (event: 'update:isVisible', visible: boolean): void;
  /** 位置更新，支持 `v-model:position` */
  (event: 'update:position', position: BstContextMenuPosition): void;
  /** 菜单项被选中 */
  (event: 'item-select', context: BstContextMenuItemSelectContext): void;
  /** 点击了面板外部 */
  (event: 'click-outside', context: BstContextMenuClickOutsideContext): void;
  /** 面板外部发生滚动 */
  (event: 'scroll-outside', context: BstContextMenuScrollOutsideContext): void;
  /** 按下 Esc 键 */
  (event: 'esc-key-down', context: BstContextMenuEscKeyDownContext): void;
  /** 入场动画结束 */
  (event: 'after-enter'): void;
  /** 出场动画结束 */
  (event: 'after-leave'): void;
}

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
  /** 是否处于首帧测量中（用于内联 `visibility: hidden`） */
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
  /** 动画结束处理 */
  handleAnimationEnd: (event: AnimationEvent) => void;
  /** 菜单项选中处理 */
  handleItemSelect: (item: BstContextMenuItem, index: number, nativeEvent: ContextMenuSelectEvent) => void;
  /** 鼠标移入菜单项时同步键盘高亮 */
  handleItemHover: (index: number) => void;
  /** 重置键盘高亮 */
  resetActiveIndex: () => void;
  /** 外部点击处理 */
  handleOutsideClick: (event: MouseEvent) => void;
  /** 外部滚动处理 */
  handleOutsideScroll: (event: Event) => void;
  /** 面板自身右键处理 */
  handleRootContextMenu: (event: MouseEvent) => void;
  /** 键盘处理（Esc / 上下方向键 / Enter / 空格） */
  handleKeyDown: (event: KeyboardEvent) => void;
}

/** 兜底定时器总时长：动画时长 + 缓冲 */
const FALLBACK_DELAY =
  BST_CONTEXT_MENU_CONSTANT_ANIMATION_DURATION + BST_CONTEXT_MENU_CONSTANT_ANIMATION_FALLBACK_BUFFER;

/**
 * 判断当前是否处于浏览器环境。
 *
 * 服务端渲染时没有 `window` / `document`，测量、监听与兜底定时器都需要跳过。
 *
 * @returns 是否为浏览器环境
 */
function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * 创建初始坐标。
 *
 * 入参可能缺省或只带一个轴，缺失项回落到默认坐标。
 *
 * @param position Props 传入的期望坐标
 * @returns 完整的初始坐标
 */
function createInitialPosition(position?: BstContextMenuPosition): BstContextMenuPosition {
  return {
    x: position?.x ?? BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION.x,
    y: position?.y ?? BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION.y,
  };
}

/**
 * 管理上下文菜单的运行时状态。
 *
 * 三个状态各司其职：
 * - `innerVisible` 是内部显隐真值；
 * - `phase` 决定渲染与动画类；
 * - `isMeasuring` 控制首帧是否隐藏，避免坐标跳动被看到。
 *
 * @param options 组件入参、事件派发与内联样式量
 * @returns 视图所需的全部状态与方法
 */
export function useContextMenu(options: UseContextMenuOptions): UseContextMenuReturn {
  const { props, emit, items, widthStyle, maxHeightStyle } = options;

  const phase = ref<ContextMenuPhase>('idle');
  const innerVisible = ref(props.isVisible === true);
  const isMeasuring = ref(false);
  const activeIndex = ref(-1);
  const position = ref<BstContextMenuPosition>(createInitialPosition(props.position));
  // 包含块偏移补偿：祖先若带 transform / filter / perspective / contain: paint，
  // fixed 定位会以该祖先为包含块，需额外减去其原点偏移才能落在期望的视口坐标上
  const offset = ref<BstContextMenuPosition>({ x: 0, y: 0 });
  const rootRef = ref<HTMLElement | null>(null);

  let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
  let isSettled = false;

  const isActive = computed((): boolean => phase.value !== 'idle');

  /**
   * 清理兜底定时器。
   */
  function cleanup(): void {
    if (fallbackTimer === undefined) return;

    clearTimeout(fallbackTimer);
    fallbackTimer = undefined;
  }

  /**
   * 启动兜底定时器。
   *
   * 减少动效时样式把 `animation` 置为 `none`，`animationend` 永不触发，
   * 该定时器是唯一的收尾路径；服务端渲染下不启动，避免残留定时器。
   */
  function startFallback(): void {
    isSettled = false;
    cleanup();

    if (!isBrowserEnvironment()) return;

    fallbackTimer = setTimeout(finish, FALLBACK_DELAY);
  }

  /**
   * 结束当前阶段并派发对应事件。
   *
   * `animationend` 与兜底定时器都会调用，`isSettled` 保证只收尾一次。
   */
  function finish(): void {
    if (isSettled) return;

    isSettled = true;
    cleanup();
    isMeasuring.value = false;

    if (phase.value === 'opening') {
      phase.value = 'open';
      emit('after-enter');

      return;
    }

    if (phase.value === 'closing') {
      phase.value = 'idle';
      emit('after-leave');
    }
  }

  /**
   * 用已挂载元素的实际尺寸夹取目标坐标，并同步包含块偏移补偿。
   *
   * 偏移补偿必须基于「当前已渲染的位置」计算：调用方可能已经把新坐标写进
   * `position`，但 DOM 尚未重渲染，此时 `getBoundingClientRect` 仍对应旧值。
   * 因此本函数只接收目标坐标，不把 `position` 当作期望值。
   *
   * @param target 期望坐标
   * @returns 夹取后的坐标；元素未挂载或非浏览器环境时返回 `undefined`
   */
  function resolveMeasuredPosition(target: BstContextMenuPosition): BstContextMenuPosition | undefined {
    const element = rootRef.value;

    if (!element || !isBrowserEnvironment()) return undefined;

    const rect = element.getBoundingClientRect();
    const nextOffset = resolveContextMenuOffset({
      appliedX: position.value.x + offset.value.x,
      appliedY: position.value.y + offset.value.y,
      actualX: rect.left,
      actualY: rect.top,
      width: rect.width,
      height: rect.height,
    });

    if (nextOffset) offset.value = nextOffset;

    return clampContextMenuPosition({
      x: target.x,
      y: target.y,
      menuWidth: element.offsetWidth,
      menuHeight: element.offsetHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      gap: BST_CONTEXT_MENU_CONSTANT_VIEWPORT_GAP,
    });
  }

  /**
   * 写入夹取后的坐标，变化时回写 `v-model:position`。
   *
   * @param next 目标坐标
   */
  function commitPosition(next: BstContextMenuPosition): void {
    if (next.x === position.value.x && next.y === position.value.y) return;

    position.value = next;
    emit('update:position', next);
  }

  /**
   * 测量面板尺寸并把坐标夹取到视口内。
   *
   * 测量完成后才解除首帧隐藏；坐标被夹取时回写 `v-model:position`。
   * 同时用实测位置修正包含块偏移，使 `teleport: false` 在带 `transform` 的祖先内也能正确定位。
   * 服务端渲染无法测量，直接解除首帧隐藏并按请求坐标输出。
   */
  async function measureAndClamp(): Promise<void> {
    await nextTick();

    const next = resolveMeasuredPosition(position.value);

    isMeasuring.value = false;

    if (next) commitPosition(next);
  }

  /**
   * 状态机入口。
   *
   * 由内部显隐变化驱动：打开进入 `opening`，关闭进入 `closing`；
   * 重复的同向调用与 `closing` 期间的再次关闭均为幂等。
   *
   * @param visible 目标显隐状态
   */
  function applyVisible(visible: boolean): void {
    if (visible) {
      if (phase.value === 'opening' || phase.value === 'open') return;

      // 每次重新打开都从「无键盘高亮」开始，方向键第一次按下才定位到首/尾项
      activeIndex.value = -1;

      // 首次打开时元素尚未挂载，必须先隐藏再测量；从 closing 重开时元素仍在，
      // 无需隐藏，但同样必须重测：否则重开沿用的新坐标不会被夹取到视口内，
      // 表现为「只有第一次打开会贴边翻转」。
      const isFreshMount = phase.value === 'idle';
      const canMeasure = isBrowserEnvironment();

      phase.value = 'opening';
      isMeasuring.value = isFreshMount && canMeasure;
      startFallback();

      if (canMeasure) void measureAndClamp();

      return;
    }

    if (phase.value === 'idle' || phase.value === 'closing') return;

    phase.value = 'closing';
    startFallback();
  }

  /**
   * 在指定坐标打开菜单。
   *
   * 两个坐标都提供时才更新位置，避免半截坐标把面板拖到边缘。
   * 面板已挂载时立即夹取，否则等下一帧测量会让面板先闪到视口外。
   *
   * @param x 目标 X 轴坐标
   * @param y 目标 Y 轴坐标
   */
  function show(x?: number, y?: number): void {
    if (x !== undefined && y !== undefined) {
      const target = { x, y };
      // 首帧（rootRef 仍为 null）无法测量，交由 applyVisible 的异步测量补上；
      // 只有真正发生夹取时才回写 `v-model:position`，避免每次打开都多派发一次事件
      const measured = isActive.value ? resolveMeasuredPosition(target) : undefined;

      if (measured) commitPosition(measured);
      else position.value = target;
    }

    innerVisible.value = true;
  }

  /**
   * 同步父级传入的坐标。
   *
   * 受控场景下父级可能在挂载后通过 `v-model:position` 改写坐标，
   * 内部若不同步会始终停留在初始值，导致菜单总出现在默认位置。
   *
   * @param value 父级传入的坐标
   */
  function setPosition(value: BstContextMenuPosition): void {
    position.value = { x: value.x, y: value.y };
  }

  /**
   * 关闭菜单。
   *
   * 已隐藏时直接返回；实际的阶段切换由 `applyVisible` 完成。
   */
  function hide(): void {
    if (!innerVisible.value) return;

    innerVisible.value = false;
  }

  /**
   * 处理入场 / 出场动画结束。
   *
   * 只认面板根节点的动画，子元素动画冒泡上来的一律忽略。
   *
   * @param event 动画结束事件
   */
  function handleAnimationEnd(event: AnimationEvent): void {
    if (event.target !== rootRef.value) return;

    finish();
  }

  /**
   * 处理菜单项选中。
   *
   * 先派发 `item-select`，再执行单项的 `action`；
   * `hide()` 放在 `finally` 中，保证 `action` 抛错时菜单仍会关闭。
   *
   * @param item 被选中的菜单项
   * @param index 该项在列表中的索引
   * @param nativeEvent 触发激活的原生事件
   */
  function handleItemSelect(item: BstContextMenuItem, index: number, nativeEvent: ContextMenuSelectEvent): void {
    if (isContextMenuDivider(item) || isContextMenuItemDisabled(item)) return;

    const context: BstContextMenuItemSelectContext = {
      item,
      index,
      // 类型包把该字段声明为 MouseEvent；键盘激活时传入 KeyboardEvent，
      // 二者在此处语义相同，按字段声明类型收敛。
      nativeEvent: nativeEvent as MouseEvent,
    };

    emit('item-select', context);

    try {
      item.action?.(context);
    } finally {
      hide();
    }
  }

  /**
   * 重置键盘高亮。
   *
   * 列表变化或重新打开后旧下标可能失效，统一回到「无高亮项」。
   */
  function resetActiveIndex(): void {
    activeIndex.value = -1;
  }

  /**
   * 把键盘高亮同步到鼠标移入项。
   *
   * @param index 鼠标移入项的下标
   */
  function handleItemHover(index: number): void {
    const item = items.value[index] as BstContextMenuItem | undefined;

    if (!item || isContextMenuDivider(item) || isContextMenuItemDisabled(item)) return;

    activeIndex.value = index;
  }

  /**
   * 将高亮项滚动到面板可视区域内。
   *
   * 菜单项不在 Tab 序列中，浏览器不会因焦点变化自动滚动，须手动补齐。
   */
  function scrollActiveIntoView(): void {
    const element = rootRef.value?.querySelector<HTMLElement>(`[data-index="${activeIndex.value}"]`);

    if (typeof element?.scrollIntoView === 'function') {
      element.scrollIntoView({ block: 'nearest' });
    }
  }

  /**
   * 按方向键移动键盘高亮。
   *
   * @param step 前进方向：`1` 向下、`-1` 向上
   */
  function moveActive(step: 1 | -1): void {
    const next = resolveContextMenuItemIndex(items.value, activeIndex.value, step);

    if (next === -1) return;

    activeIndex.value = next;
    void nextTick(scrollActiveIntoView);
  }

  /**
   * 处理面板打开期间的键盘操作。
   *
   * Esc 关闭；上下方向键在可操作项之间循环切换高亮；
   * Enter / 空格选中当前高亮项（无高亮时交还给页面）。
   *
   * @param event 原生键盘事件
   */
  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === BST_CONTEXT_MENU_CONSTANT_KEY_ESCAPE) {
      if (props.isCloseOnEscKeyDown === false) return;

      emit('esc-key-down', { nativeEvent: event });
      hide();
      return;
    }

    if (event.key === BST_CONTEXT_MENU_CONSTANT_KEY_ARROW_DOWN) {
      event.preventDefault();
      moveActive(1);
      return;
    }

    if (event.key === BST_CONTEXT_MENU_CONSTANT_KEY_ARROW_UP) {
      event.preventDefault();
      moveActive(-1);
      return;
    }

    if (event.key !== BST_CONTEXT_MENU_CONSTANT_KEY_ENTER && event.key !== BST_CONTEXT_MENU_CONSTANT_KEY_SPACE) return;

    const item = items.value[activeIndex.value] as BstContextMenuItem | undefined;

    // 尚未用方向键定位到任何项（或列表缩短后下标失效）时，Enter / 空格不抢占页面原有行为
    if (!item) return;

    event.preventDefault();
    handleItemSelect(item, activeIndex.value, event);
  }

  /**
   * 处理面板外部点击。
   *
   * @param event 原生鼠标事件
   */
  function handleOutsideClick(event: MouseEvent): void {
    if (props.isCloseOnOutsideClick === false) return;
    if (isInsideContextMenu(rootRef.value, event.target)) return;

    emit('click-outside', { nativeEvent: event });
    hide();
  }

  /**
   * 处理面板外部滚动。
   *
   * 面板自身滚动时事件目标位于根节点内部，不会触发关闭。
   *
   * @param event 原生滚动事件
   */
  function handleOutsideScroll(event: Event): void {
    if (props.isCloseOnOutsideScroll === false) return;
    if (isInsideContextMenu(rootRef.value, event.target)) return;

    emit('scroll-outside', { nativeEvent: event });
    hide();
  }

  /**
   * 处理面板自身的右键。
   *
   * 面板本身就是右键唤起的结果，在其上再次右键不应再弹出浏览器原生菜单；
   * 同时阻止冒泡，避免原地渲染（`teleport: false`）时外层容器的右键处理被重复触发。
   *
   * @param event 原生右键事件
   */
  function handleRootContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

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
    // 样式包不负责定位，坐标与层级由组件内联；
    // 写入值需叠加包含块补偿，使期望坐标始终按视口语义生效
    position: 'fixed',
    left: `${position.value.x + offset.value.x}px`,
    top: `${position.value.y + offset.value.y}px`,
    width: widthStyle.value,
    maxHeight: maxHeightStyle.value,
    // 首帧先隐藏，测量完成后再显示，避免坐标跳动被看到
    visibility: isMeasuring.value ? 'hidden' : undefined,
  }));

  // 初始即为可见（父级挂载时传了 isVisible）时，也需要走一次状态机
  if (innerVisible.value) applyVisible(true);

  return {
    phase,
    innerVisible,
    isActive,
    activeIndex,
    isMeasuring,
    rootRef,
    rootClass,
    rootStyle,
    show,
    setPosition,
    hide,
    applyVisible,
    cleanup,
    measureAndClamp,
    handleAnimationEnd,
    handleItemSelect,
    handleItemHover,
    resetActiveIndex,
    handleOutsideClick,
    handleOutsideScroll,
    handleRootContextMenu,
    handleKeyDown,
  };
}
