// BstContextMenu 生命周期：监听器增删、受控同步与卸载清理
// 组件内所有 watch / onUnmounted 都收敛在本文件，其他 hooks 不出现生命周期钩子
import { nextTick, onUnmounted, watch } from 'vue';
import type { Ref } from 'vue';
import type { BstContextMenuPosition, BstContextMenuProps } from '@binarysovereign/bst-types';

/** `useContextMenuLife` 的入参 */
export interface UseContextMenuLifeOptions {
  /** 面板是否需要渲染 */
  isActive: Ref<boolean>;
  /** 内部显隐真值 */
  innerVisible: Ref<boolean>;
  /** 组件入参 */
  props: BstContextMenuProps;
  /** 面板根节点 */
  rootRef: Ref<HTMLElement | null>;
  /** 外部点击处理 */
  onOutsideClick: (event: MouseEvent) => void;
  /** 外部滚动处理 */
  onOutsideScroll: (event: Event) => void;
  /** 键盘处理（Esc / 上下方向键 / Enter / 空格） */
  onKeyDown: (event: KeyboardEvent) => void;
  /** 父级受控显隐变化 */
  onVisiblePropChange: (visible: boolean) => void;
  /** 内部显隐变化 */
  onInnerVisibleChange: (visible: boolean) => void;
  /** 父级坐标变化 */
  onPositionPropChange: (position: BstContextMenuPosition) => void;
  /** 需要重新测量位置 */
  onReMeasure: () => void;
  /** 菜单项列表变化，需重置键盘高亮 */
  onItemsChange: () => void;
  /** 卸载时的额外清理 */
  onCleanup: () => void;
}

/**
 * 注册上下文菜单的全部生命周期行为。
 *
 * 监听器只在面板可见期间存在：进入可见态时挂载，离开后立即移除，
 * 避免常驻监听带来的判断开销与内存泄漏。
 *
 * @param options 状态引用与回调集合
 */
export function useContextMenuLife(options: UseContextMenuLifeOptions): void {
  let detachListeners: (() => void) | null = null;

  /**
   * 移除当前已挂载的监听器。
   */
  function detach(): void {
    if (!detachListeners) return;

    detachListeners();
    detachListeners = null;
  }

  /**
   * 挂载三组外部事件监听。
   *
   * - 点击用 `mousedown`：`click` 在 `mouseup` 之后触发，触发元素被面板遮挡时
   *   会出现「打开即关闭」；
   * - 滚动必须 `capture`：`scroll` 不冒泡，挂到 `window` 才能收到；
   * - 键盘监听统一处理 Esc 与上下方向键导航；
   * - 监听在 `nextTick` 之后挂载，避开触发元素自身这一次事件。
   */
  async function attach(): Promise<void> {
    await nextTick();

    // 等待期间可能又切回隐藏态，此时不应再挂监听
    if (!options.isActive.value) return;

    const listenerOptions: AddEventListenerOptions = { capture: true };

    document.addEventListener('mousedown', options.onOutsideClick, listenerOptions);
    window.addEventListener('scroll', options.onOutsideScroll, listenerOptions);
    document.addEventListener('keydown', options.onKeyDown);

    detachListeners = function removeListeners(): void {
      document.removeEventListener('mousedown', options.onOutsideClick, listenerOptions);
      window.removeEventListener('scroll', options.onOutsideScroll, listenerOptions);
      document.removeEventListener('keydown', options.onKeyDown);
    };
  }

  watch(options.isActive, (isActive) => {
    detach();

    if (isActive) void attach();
  });

  if (options.isActive.value) void attach();

  // 父级受控值写入内部真值，内部真值再经 watch 派发事件并驱动状态机
  watch(
    () => options.props.isVisible,
    (value) => options.onVisiblePropChange(value === true),
  );

  watch(options.innerVisible, (value) => options.onInnerVisibleChange(value));

  // 位置变化与列表变化都可能改变面板尺寸，需要重新夹取；
  // 坐标本身也要同步进内部状态，否则受控坐标在挂载后的变更会被丢弃
  watch(
    () => options.props.position,
    (value) => {
      if (value) options.onPositionPropChange(value);

      options.onReMeasure();
    },
  );
  watch(
    () => options.props.items,
    () => {
      options.onItemsChange();
      options.onReMeasure();
    },
  );

  onUnmounted(() => {
    detach();
    options.onCleanup();
  });
}
