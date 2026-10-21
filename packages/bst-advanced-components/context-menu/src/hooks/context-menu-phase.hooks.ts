import { computed, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';

import { BST_CONTEXT_MENU_CONSTANT_METRICS } from '../constants';
import type { ContextMenuEmit, ContextMenuPhase } from '../types';
import { isBrowserEnvironment } from '../utils';

const FALLBACK_DELAY =
  BST_CONTEXT_MENU_CONSTANT_METRICS.ANIMATION_DURATION + BST_CONTEXT_MENU_CONSTANT_METRICS.ANIMATION_FALLBACK_BUFFER;

/** `useContextMenuPhase` 的入参 */
export interface UseContextMenuPhaseOptions {
  /** 事件派发函数，用于派发 `after-enter` / `after-leave` */
  emit: ContextMenuEmit;
  /** 阶段收尾回调，用于解除首帧隐藏 */
  onSettle: () => void;
}

/** `useContextMenuPhase` 的输出 */
export interface UseContextMenuPhaseReturn {
  /** 当前渲染阶段 */
  phase: Ref<ContextMenuPhase>;
  /** 是否需要渲染面板 */
  isActive: ComputedRef<boolean>;
  /** 是否处于打开链路（`opening` / `open`） */
  isEntering: () => boolean;
  /** 是否处于完全关闭态（`idle`） */
  isIdle: () => boolean;
  /** 进入开场阶段并启动兜底 */
  enter: () => void;
  /** 进入收场阶段并启动兜底 */
  leave: () => void;
  /** 结束当前阶段并派发对应事件 */
  settle: () => void;
  /** 清理兜底定时器 */
  cleanup: () => void;
}

export function useContextMenuPhase(options: UseContextMenuPhaseOptions): UseContextMenuPhaseReturn {
  const { emit, onSettle } = options;

  const phase = ref<ContextMenuPhase>('idle');
  const isActive = computed((): boolean => phase.value !== 'idle');

  let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
  let isSettled = false;

  function _startFallback(): void {
    isSettled = false;
    cleanup();

    if (!isBrowserEnvironment()) return;

    fallbackTimer = setTimeout(settle, FALLBACK_DELAY);
  }

  function isEntering(): boolean {
    return phase.value === 'opening' || phase.value === 'open';
  }

  function isIdle(): boolean {
    return phase.value === 'idle';
  }

  function enter(): void {
    phase.value = 'opening';
    _startFallback();
  }

  function leave(): void {
    if (phase.value === 'idle' || phase.value === 'closing') return;

    phase.value = 'closing';
    _startFallback();
  }

  function settle(): void {
    if (isSettled) return;

    isSettled = true;
    cleanup();
    onSettle();

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

  function cleanup(): void {
    if (fallbackTimer === undefined) return;

    clearTimeout(fallbackTimer);
    fallbackTimer = undefined;
  }

  return { phase, isActive, isEntering, isIdle, enter, leave, settle, cleanup };
}
