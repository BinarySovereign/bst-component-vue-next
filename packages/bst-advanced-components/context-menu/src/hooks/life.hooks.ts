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

export function useContextMenuLife(options: UseContextMenuLifeOptions): void {
  let detachListeners: (() => void) | null = null;

  function detach(): void {
    if (!detachListeners) return;

    detachListeners();
    detachListeners = null;
  }

  async function attach(): Promise<void> {
    await nextTick();

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

  watch(
    () => options.props.isVisible,
    (value) => options.onVisiblePropChange(value === true),
  );

  watch(options.innerVisible, (value) => options.onInnerVisibleChange(value));

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
