/**
 * Copyright (c) 2026 Felix Tang (BinarySovereign). Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */

import { defineComponent } from 'vue';
import type { Component, SetupContext } from 'vue';
import { mount } from '@vue/test-utils';
import type { DOMWrapper, VueWrapper } from '@vue/test-utils';
import type { BstContextMenuExpose, BstContextMenuItem, BstContextMenuProps } from '@binarysovereign/bst-types';

import { BstContextMenu } from '../index';
import { BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES } from '../src/constants';

export const DEFAULT_POSITION = { x: 100, y: 100 };

export const BASE_ITEMS: BstContextMenuItem[] = [
  { key: 'open', leftText: '打开', rightText: 'Ctrl+O' },
  { key: 'rename', leftText: '重命名' },
  { key: 'divider', type: 'divider' },
  { key: 'delete', leftText: '删除', isDisabled: true },
];

const mountedWrappers: VueWrapper[] = [];

const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
const originalInnerWidth = window.innerWidth;
const originalInnerHeight = window.innerHeight;

export function mountContextMenu(
  props: Partial<BstContextMenuProps> = {},
  slots: Record<string, unknown> = {},
): VueWrapper {
  const wrapper = mount(BstContextMenu, {
    props: {
      isVisible: true,
      position: DEFAULT_POSITION,
      teleport: false,
      items: BASE_ITEMS,
      ...props,
    },
    slots: slots as never,
    attachTo: document.body,
  });

  mountedWrappers.push(wrapper);

  return wrapper;
}

export function getExpose(wrapper: VueWrapper): BstContextMenuExpose {
  return wrapper.vm as unknown as BstContextMenuExpose;
}

export function createHarness(setupHook: (context: SetupContext) => void): Component {
  return defineComponent({
    name: 'ContextMenuTestHarness',
    setup(_props, context) {
      setupHook(context);

      return () => null;
    },
  });
}

export function getPanel(wrapper: VueWrapper): DOMWrapper<Element> {
  return wrapper.find(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT}`);
}

export function getPanelElement(wrapper: VueWrapper): HTMLElement {
  return getPanel(wrapper).element as unknown as HTMLElement;
}

export function getItems(wrapper: VueWrapper): Array<DOMWrapper<Element>> {
  return wrapper.findAll(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM}`);
}

export function getPanelInBody(): Element | null {
  return document.body.querySelector(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT}`);
}

export function mockElementSize(width: number, height: number): void {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => width,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get: () => height,
  });
}

export function resetElementSize(): void {
  if (originalOffsetWidth) {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
  } else {
    Reflect.deleteProperty(HTMLElement.prototype, 'offsetWidth');
  }

  if (originalOffsetHeight) {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
  } else {
    Reflect.deleteProperty(HTMLElement.prototype, 'offsetHeight');
  }
}

export function mockViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: height });
}

export function resetViewport(): void {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: originalInnerWidth,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: originalInnerHeight,
  });
}

export async function finishAnimation(wrapper: VueWrapper): Promise<void> {
  await getPanel(wrapper).trigger('animationend');
}

export function dispatchOutsideMousedown(): void {
  document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
}

export function dispatchOutsideScroll(): void {
  document.body.dispatchEvent(new Event('scroll'));
}

export function dispatchEscape(key = 'Escape'): void {
  dispatchKey(key);
}

/**
 * 在 `document` 上派发一次键盘事件。
 *
 * @param key 按键取值，如 `ArrowDown` / `Enter` / `Escape`
 */
export function dispatchKey(key: string): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));
}

export function cleanup(): void {
  for (const wrapper of mountedWrappers.splice(0)) {
    wrapper.unmount();
  }

  document.body.innerHTML = '';

  resetElementSize();
  resetViewport();
}
