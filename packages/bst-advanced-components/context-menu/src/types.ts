/**
 * Copyright (c) 2026 Felix Tang (BinarySovereign). Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */

import type { BstContextMenuEmits } from '@binarysovereign/bst-types';

/** 面板渲染阶段：空闲 / 正在入场 / 已展开 / 正在退场 */
export type ContextMenuPhase = 'idle' | 'opening' | 'open' | 'closing';

/** 菜单项激活的原生事件：鼠标点击或键盘确认 */
export type ContextMenuSelectEvent = MouseEvent | KeyboardEvent;

/** 可调用的事件派发签名，事件名与载荷由 `BstContextMenuEmits` 推导 */
export interface ContextMenuEmit {
  /** 按事件名派发对应载荷 */
  <K extends keyof BstContextMenuEmits>(event: K, ...args: Parameters<BstContextMenuEmits[K]>): void;
}
