/**
 * Copyright (c) 2026 Felix Tang (BinarySovereign). Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */

import { h, nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import type { BstContextMenuItem, BstContextMenuItemSelectContext } from '@binarysovereign/bst-types';

import { BstContextMenu } from '../index';
import { BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES } from '../src/constants';
import {
  BASE_ITEMS,
  DEFAULT_POSITION,
  cleanup,
  dispatchEscape,
  dispatchKey,
  dispatchOutsideMousedown,
  dispatchOutsideScroll,
  dispatchPageScroll,
  finishAnimation,
  getExpose,
  getItems,
  getPanel,
  getPanelElement,
  getPanelInBody,
  mockElementSize,
  mockPageScroll,
  mockViewport,
  mountContextMenu,
} from './mount';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('BstContextMenu', () => {
  describe('props', () => {
    it('Props isVisible: false', () => {
      const wrapper = mountContextMenu({ isVisible: false });

      expect(getPanel(wrapper).exists()).toBe(false);
    });

    it('Props isVisible: true', async () => {
      const wrapper = mountContextMenu();
      await flushPromises();

      const panel = getPanel(wrapper);

      expect(panel.exists()).toBe(true);
      expect(panel.attributes('role')).toBe('menu');
      expect(panel.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT);
      expect(panel.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT_IS_OPEN);
    });

    it('Props items: regular items', async () => {
      const wrapper = mountContextMenu({
        items: [
          { key: 'a', leftText: '打开', rightText: 'Ctrl+O' },
          { key: 'b', leftText: '重命名' },
        ],
      });
      await flushPromises();

      const leftTexts = wrapper.findAll(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_LEFT_TEXT}`);

      expect(leftTexts.map((node) => node.text())).toEqual(['打开', '重命名']);
      expect(wrapper.find(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_RIGHT_TEXT}`).text()).toBe('Ctrl+O');
    });

    it('Props items: divider', async () => {
      const wrapper = mountContextMenu({ items: [{ key: 'd', type: 'divider' }] });
      await flushPromises();

      const item = getItems(wrapper)[0];

      expect(item.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_DIVIDER);
      expect(item.text()).toBe('');
      expect(wrapper.find(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_LEFT_TEXT}`).exists()).toBe(false);
    });

    it('Props items: disabled item', async () => {
      const wrapper = mountContextMenu({ items: [{ key: 'a', leftText: '删除', isDisabled: true }] });
      await flushPromises();

      const item = getItems(wrapper)[0];

      expect(item.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_DISABLED);
      expect(item.attributes('aria-disabled')).toBe('true');
    });

    it('Props items: duplicate keys', async () => {
      const wrapper = mountContextMenu({
        items: [
          { key: 'a', leftText: 'first' },
          { key: 'a', leftText: 'second' },
        ],
      });
      await flushPromises();

      const items = getItems(wrapper);

      expect(items).toHaveLength(1);
      expect(items[0].text()).toBe('first');
    });

    it('Props items: empty array', async () => {
      const wrapper = mountContextMenu({ items: [] });
      await flushPromises();

      expect(getPanel(wrapper).exists()).toBe(true);
      expect(getItems(wrapper)).toHaveLength(0);
    });

    it('Props items: omitted', async () => {
      const wrapper = mountContextMenu({ items: undefined });
      await flushPromises();

      expect(getPanel(wrapper).exists()).toBe(true);
      expect(getItems(wrapper)).toHaveLength(0);
    });

    it('Props position: explicit coordinates', async () => {
      const wrapper = mountContextMenu({ position: { x: 120, y: 80 } });
      await flushPromises();

      const panel = getPanel(wrapper);

      expect(panel.attributes('style')).toContain('left: 120px');
      expect(panel.attributes('style')).toContain('top: 80px');
    });

    it('Props position: updates after mount', async () => {
      const wrapper = mountContextMenu({ position: { x: 120, y: 80 } });
      await flushPromises();

      await wrapper.setProps({ position: { x: 260, y: 140 } });
      await flushPromises();

      const panel = getPanel(wrapper);

      expect(panel.attributes('style')).toContain('left: 260px');
      expect(panel.attributes('style')).toContain('top: 140px');
    });

    it('Props maxHeight: numeric', async () => {
      const wrapper = mountContextMenu({ maxHeight: 240 });
      await flushPromises();

      expect(getPanelElement(wrapper).style.maxHeight).toBe('240px');
    });

    it('Props maxHeight: string', async () => {
      const wrapper = mountContextMenu({ maxHeight: '50vh' });
      await flushPromises();

      expect(getPanelElement(wrapper).style.maxHeight).toBe('50vh');
    });

    it('Props maxHeight: invalid', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const wrapper = mountContextMenu({ maxHeight: Number.NaN });

      await flushPromises();

      expect(warn).toHaveBeenCalled();
      expect(getPanelElement(wrapper).style.maxHeight).toBe('');
    });

    it('Props teleport: false', async () => {
      const wrapper = mountContextMenu({ teleport: false });
      await flushPromises();

      const panel = getPanel(wrapper);

      expect(panel.exists()).toBe(true);
      expect(wrapper.element.contains(panel.element)).toBe(true);
    });

    it('Props teleport: true', async () => {
      const wrapper = mountContextMenu({ teleport: true });
      await flushPromises();

      const panel = getPanelInBody();

      expect(getPanel(wrapper).exists()).toBe(false);
      expect(panel).not.toBeNull();
      expect(wrapper.element.contains(panel)).toBe(false);
    });

    it('Props teleport: existing selector', async () => {
      document.body.insertAdjacentHTML('beforeend', '<div id="menu-target"></div>');
      mountContextMenu({ teleport: '#menu-target' });
      await flushPromises();

      expect(document.querySelector('#menu-target .bst-context-menu')).not.toBeNull();
    });

    it('Props teleport: missing selector falls back to body', async () => {
      mountContextMenu({ teleport: '#missing' });
      await flushPromises();

      expect(getPanelInBody()).not.toBeNull();
    });

    it('Props onItemSelect', async () => {
      const onItemSelect = vi.fn();
      const wrapper = mountContextMenu({ onItemSelect });
      await flushPromises();

      await getItems(wrapper)[0]?.trigger('click');

      const context = onItemSelect.mock.calls[0]?.[0];

      expect(context.index).toBe(0);
      expect(context.item.key).toBe('open');
    });
  });

  describe('events', () => {
    it('Events.update:isVisible emits false on hide', async () => {
      const wrapper = mountContextMenu();
      await flushPromises();

      getExpose(wrapper).hide();
      await nextTick();

      expect(wrapper.emitted('update:isVisible')?.[0]).toEqual([false]);
    });

    it('Events.update:isVisible emits true on show', async () => {
      const wrapper = mountContextMenu({ isVisible: false });
      await flushPromises();

      getExpose(wrapper).show(10, 10);
      await flushPromises();

      expect(wrapper.emitted('update:isVisible')?.[0]).toEqual([true]);
    });

    it('Events.update:position emits the clamped position', async () => {
      mockViewport(320, 240);
      mockElementSize(200, 100);

      const wrapper = mountContextMenu({ position: { x: 300, y: 220 } });
      await flushPromises();

      expect(wrapper.emitted('update:position')?.[0]).toEqual([{ x: 112, y: 132 }]);
    });

    it('Events.item-select emits the selection context', async () => {
      const wrapper = mountContextMenu();
      await flushPromises();

      await getItems(wrapper)[0]?.trigger('click');

      const context = wrapper.emitted('item-select')?.[0]?.[0] as BstContextMenuItemSelectContext;

      expect(context.item).toEqual(expect.objectContaining({ key: 'open', leftText: '打开' }));
      expect(context.index).toBe(0);
      expect(context.nativeEvent).toBeInstanceOf(MouseEvent);
    });

    it('Events.click-outside emits the native event', async () => {
      const wrapper = mountContextMenu();
      await flushPromises();

      dispatchOutsideMousedown();
      await nextTick();

      expect(wrapper.emitted('click-outside')?.[0]?.[0]).toEqual({
        nativeEvent: expect.any(MouseEvent),
      });
    });

    it('Events.scroll-outside emits the native event', async () => {
      const wrapper = mountContextMenu();
      await flushPromises();

      dispatchOutsideScroll();
      await nextTick();

      expect(wrapper.emitted('scroll-outside')?.[0]?.[0]).toEqual({
        nativeEvent: expect.any(Event),
      });
    });

    it('Events.esc-key-down emits the native event', async () => {
      const wrapper = mountContextMenu();
      await flushPromises();

      dispatchEscape();
      await nextTick();

      expect(wrapper.emitted('esc-key-down')?.[0]?.[0]).toEqual({
        nativeEvent: expect.any(KeyboardEvent),
      });
    });

    it('Events.after-enter emits when the entry animation ends', async () => {
      const wrapper = mountContextMenu();
      await flushPromises();

      await finishAnimation(wrapper);

      expect(wrapper.emitted('after-enter')).toHaveLength(1);
    });

    it('Events.after-leave emits when the leave animation ends', async () => {
      const wrapper = mountContextMenu();
      await flushPromises();

      getExpose(wrapper).hide();
      await nextTick();
      await finishAnimation(wrapper);

      expect(wrapper.emitted('after-leave')).toHaveLength(1);
    });
  });

  describe('slots', () => {
    it('<default> overrides items', async () => {
      const wrapper = mountContextMenu(
        { items: BASE_ITEMS },
        { default: () => [h('div', { class: 'custom-default' }, 'custom')] },
      );
      await flushPromises();

      expect(wrapper.find('.custom-default').text()).toBe('custom');
      expect(getItems(wrapper)).toHaveLength(0);
    });

    it('<item> customizes every item', async () => {
      const wrapper = mountContextMenu(
        {
          items: [
            { key: 'a', leftText: 'A' },
            { key: 'b', leftText: 'B' },
          ],
        },
        {
          item: (slotProps: { item: BstContextMenuItem; index: number }) => [
            h('span', { class: 'custom-item' }, `${slotProps.item.key}-${slotProps.index}`),
          ],
        },
      );
      await flushPromises();

      const customItems = wrapper.findAll('.custom-item');

      expect(customItems.map((node) => node.text())).toEqual(['a-0', 'b-1']);
      expect(wrapper.find(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_LEFT_TEXT}`).exists()).toBe(false);
    });

    it('<item> keeps the interaction', async () => {
      const wrapper = mountContextMenu(
        { items: [{ key: 'a' }] },
        { item: () => [h('span', { class: 'custom-item' }, 'custom')] },
      );
      await flushPromises();

      await wrapper.find('.custom-item').trigger('click');
      await nextTick();

      expect(wrapper.emitted('item-select')).toHaveLength(1);
    });
  });

  describe('instanceFunctions', () => {
    it('show opens at explicit coordinates', async () => {
      const wrapper = mountContextMenu({ isVisible: false });
      await flushPromises();

      getExpose(wrapper).show(120, 80);
      await flushPromises();

      const panel = getPanel(wrapper);

      expect(panel.exists()).toBe(true);
      expect(panel.attributes('style')).toContain('left: 120px');
      expect(panel.attributes('style')).toContain('top: 80px');
    });

    it('show keeps coordinates when omitted', async () => {
      const wrapper = mountContextMenu({ position: DEFAULT_POSITION });
      await flushPromises();

      getExpose(wrapper).show();
      await flushPromises();

      expect(getPanel(wrapper).attributes('style')).toContain('left: 100px');
    });

    it('show ignores a single coordinate', async () => {
      const wrapper = mountContextMenu({ position: DEFAULT_POSITION });
      await flushPromises();

      getExpose(wrapper).show(120);
      await flushPromises();

      expect(getPanel(wrapper).attributes('style')).toContain('left: 100px');
    });

    it('hide closes the menu', async () => {
      const wrapper = mountContextMenu();
      await flushPromises();

      getExpose(wrapper).hide();
      await nextTick();

      expect(getPanel(wrapper).exists()).toBe(true);
      expect(getPanel(wrapper).classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT_IS_CLOSING);

      await finishAnimation(wrapper);

      expect(getPanel(wrapper).exists()).toBe(false);
    });

    it('hide is idempotent when already hidden', async () => {
      const wrapper = mountContextMenu({ isVisible: false });
      await flushPromises();

      getExpose(wrapper).hide();
      await nextTick();

      expect(wrapper.emitted('update:isVisible')).toBeUndefined();
    });
  });

  describe('scenarios', () => {
    describe('pointer behavior', () => {
      it('prevents the native context menu on the panel and stops it from bubbling', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        const bubbled = vi.fn();
        document.body.addEventListener('contextmenu', bubbled);

        try {
          const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
          getPanelElement(wrapper).dispatchEvent(event);

          expect(event.defaultPrevented).toBe(true);
          expect(bubbled).not.toHaveBeenCalled();
        } finally {
          document.body.removeEventListener('contextmenu', bubbled);
        }
      });
    });

    describe('close triggers', () => {
      it('closes on an outside mousedown', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchOutsideMousedown();
        await nextTick();

        expect(wrapper.emitted('click-outside')).toHaveLength(1);
        expect(wrapper.emitted('update:isVisible')?.[0]).toEqual([false]);
      });

      it('ignores a mousedown inside the panel', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        await getPanel(wrapper).trigger('mousedown');
        await nextTick();

        expect(wrapper.emitted('click-outside')).toBeUndefined();
        expect(wrapper.emitted('update:isVisible')).toBeUndefined();
      });

      it('keeps the menu open when outside clicks are disabled', async () => {
        const wrapper = mountContextMenu({ isCloseOnOutsideClick: false });
        await flushPromises();

        dispatchOutsideMousedown();
        await nextTick();

        expect(wrapper.emitted('click-outside')).toBeUndefined();
        expect(wrapper.emitted('update:isVisible')).toBeUndefined();
        expect(getPanel(wrapper).exists()).toBe(true);
      });

      it('closes on an outside scroll', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchOutsideScroll();
        await nextTick();

        expect(wrapper.emitted('scroll-outside')).toHaveLength(1);
        expect(wrapper.emitted('update:isVisible')?.[0]).toEqual([false]);
      });

      it('reports an outside scroll only once while closing', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchOutsideScroll();
        await nextTick();
        dispatchOutsideScroll();
        await nextTick();

        expect(wrapper.emitted('scroll-outside')).toHaveLength(1);
        expect(wrapper.emitted('update:isVisible')).toHaveLength(1);
      });

      it('ignores a page scroll that happened before opening', async () => {
        mockPageScroll(0, 120);

        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchPageScroll();
        await nextTick();

        expect(wrapper.emitted('scroll-outside')).toBeUndefined();
        expect(getPanel(wrapper).exists()).toBe(true);
      });

      it('closes when the page scrolls vertically after opening', async () => {
        mockPageScroll(0, 120);

        const wrapper = mountContextMenu();
        await flushPromises();

        mockPageScroll(0, 180);
        dispatchPageScroll();
        await nextTick();

        expect(wrapper.emitted('scroll-outside')).toHaveLength(1);
      });

      it('closes when the page scrolls horizontally after opening', async () => {
        mockPageScroll(0, 120);

        const wrapper = mountContextMenu();
        await flushPromises();

        mockPageScroll(60, 120);
        dispatchPageScroll();
        await nextTick();

        expect(wrapper.emitted('scroll-outside')).toHaveLength(1);
      });

      it('ignores a scroll inside the panel', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        getPanelElement(wrapper).dispatchEvent(new Event('scroll'));
        await nextTick();

        expect(wrapper.emitted('scroll-outside')).toBeUndefined();
      });

      it('keeps the menu open when outside scrolls are disabled', async () => {
        const wrapper = mountContextMenu({ isCloseOnOutsideScroll: false });
        await flushPromises();

        dispatchOutsideScroll();
        await nextTick();

        expect(wrapper.emitted('scroll-outside')).toBeUndefined();
        expect(getPanel(wrapper).exists()).toBe(true);
      });

      it('closes on Escape', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchEscape();
        await nextTick();

        expect(wrapper.emitted('esc-key-down')).toHaveLength(1);
        expect(wrapper.emitted('update:isVisible')?.[0]).toEqual([false]);
      });

      it('ignores other keys', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchEscape('Enter');
        await nextTick();

        expect(wrapper.emitted('esc-key-down')).toBeUndefined();
        expect(wrapper.emitted('update:isVisible')).toBeUndefined();
      });

      it('keeps the menu open when Escape is disabled', async () => {
        const wrapper = mountContextMenu({ isCloseOnEscKeyDown: false });
        await flushPromises();

        dispatchEscape();
        await nextTick();

        expect(wrapper.emitted('esc-key-down')).toBeUndefined();
        expect(getPanel(wrapper).exists()).toBe(true);
      });
    });

    describe('item interaction', () => {
      it('ignores divider clicks', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        await getItems(wrapper)[2]?.trigger('click');
        await nextTick();

        expect(wrapper.emitted('item-select')).toBeUndefined();
        expect(wrapper.emitted('update:isVisible')).toBeUndefined();
      });

      it('ignores disabled item clicks', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        await getItems(wrapper)[3]?.trigger('click');
        await nextTick();

        expect(wrapper.emitted('item-select')).toBeUndefined();
        expect(wrapper.emitted('update:isVisible')).toBeUndefined();
      });

      it('emits item-select before running the action and then closes', async () => {
        const order: string[] = [];
        const onItemSelect = (): void => {
          order.push('emit');
        };
        const wrapper = mountContextMenu({
          items: [
            {
              key: 'a',
              leftText: 'A',
              action: () => {
                order.push('action');
              },
            },
          ],
          onItemSelect,
        });
        await flushPromises();

        await getItems(wrapper)[0]?.trigger('click');
        await nextTick();

        expect(order).toEqual(['emit', 'action']);
        expect(wrapper.emitted('update:isVisible')?.[0]).toEqual([false]);
      });

      it('closes even when the action throws', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const wrapper = mount(BstContextMenu, {
          props: {
            isVisible: true,
            position: DEFAULT_POSITION,
            teleport: false,
            items: [
              {
                key: 'a',
                action: () => {
                  throw new Error('action failed');
                },
              },
            ],
          },
          attachTo: document.body,
          global: { config: { errorHandler: () => undefined } },
        });

        await flushPromises();

        await wrapper.find(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM}`).trigger('click');
        await nextTick();

        expect(wrapper.emitted('update:isVisible')?.[0]).toEqual([false]);

        wrapper.unmount();
      });

      it('selects the highlighted item with the keyboard', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchKey('ArrowDown');
        await nextTick();
        dispatchKey('Enter');
        await nextTick();

        expect(wrapper.emitted('item-select')).toHaveLength(1);
        expect(wrapper.emitted('update:isVisible')?.[0]).toEqual([false]);
      });
    });

    describe('keyboard navigation', () => {
      it('highlights the first selectable item on ArrowDown', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchKey('ArrowDown');
        await nextTick();

        expect(getItems(wrapper)[0]?.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);
      });

      it('skips dividers, disabled items and wraps around', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchKey('ArrowDown');
        await nextTick();
        dispatchKey('ArrowDown');
        await nextTick();

        const items = getItems(wrapper);

        // BASE_ITEMS：0 普通、1 普通、2 分割线、3 禁用 → 第二次仍落在 1
        expect(items[1]?.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);

        dispatchKey('ArrowDown');
        await nextTick();

        expect(getItems(wrapper)[0]?.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);
      });

      it('moves upwards from no highlight to the last selectable item', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchKey('ArrowUp');
        await nextTick();

        expect(getItems(wrapper)[1]?.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);
      });

      it('selects the highlighted item with Space', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchKey('ArrowDown');
        await nextTick();
        dispatchKey(' ');
        await nextTick();

        expect(wrapper.emitted('item-select')).toHaveLength(1);
        expect(wrapper.emitted('item-select')?.[0]?.[0]).toMatchObject({ item: BASE_ITEMS[0], index: 0 });
      });

      it('ignores Tab and does not steal focus', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchKey('Tab');
        await nextTick();

        expect(wrapper.emitted('item-select')).toBeUndefined();
        expect(wrapper.emitted('update:isVisible')).toBeUndefined();
        expect(getItems(wrapper)[0]?.classes()).not.toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);
        expect(getItems(wrapper)[0]?.attributes('tabindex')).toBeUndefined();
      });

      it('leaves Enter to the page when nothing is highlighted', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchKey('Enter');
        await nextTick();

        expect(wrapper.emitted('item-select')).toBeUndefined();
        expect(wrapper.emitted('update:isVisible')).toBeUndefined();
      });

      it('syncs the highlight on mouseenter', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        await getItems(wrapper)[1]?.trigger('mouseenter');
        await nextTick();

        expect(getItems(wrapper)[1]?.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);
      });
    });

    describe('animation lifecycle', () => {
      it('finishes entry and removes the open class', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        await finishAnimation(wrapper);

        expect(getPanel(wrapper).classes()).not.toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT_IS_OPEN);
        expect(wrapper.emitted('after-enter')).toHaveLength(1);
      });

      it('ignores animations bubbling from items', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        await getItems(wrapper)[0]?.trigger('animationend');
        await nextTick();

        expect(wrapper.emitted('after-enter')).toBeUndefined();
        expect(getPanel(wrapper).classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT_IS_OPEN);
      });

      it('finishes entry by fallback timer', async () => {
        vi.useFakeTimers();

        const wrapper = mountContextMenu();

        await nextTick();
        await vi.advanceTimersByTimeAsync(300);

        expect(wrapper.emitted('after-enter')).toHaveLength(1);
      });

      it('finishes leave by fallback timer', async () => {
        vi.useFakeTimers();

        const wrapper = mountContextMenu();

        await nextTick();
        getExpose(wrapper).hide();
        await nextTick();
        await vi.advanceTimersByTimeAsync(300);

        expect(wrapper.emitted('after-leave')).toHaveLength(1);
        expect(getPanel(wrapper).exists()).toBe(false);
      });

      it('reopens while closing', async () => {
        vi.useFakeTimers();

        const wrapper = mountContextMenu();

        await nextTick();
        getExpose(wrapper).hide();
        await nextTick();
        getExpose(wrapper).show(10, 10);
        await nextTick();

        expect(getPanel(wrapper).classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT_IS_OPEN);

        await vi.advanceTimersByTimeAsync(300);

        expect(wrapper.emitted('after-enter')).toHaveLength(1);
        expect(wrapper.emitted('after-leave')).toBeUndefined();
      });

      it('ignores repeated hide calls while closing', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        getExpose(wrapper).hide();
        await nextTick();
        getExpose(wrapper).hide();
        await nextTick();

        expect(wrapper.emitted('update:isVisible')).toHaveLength(1);
      });
    });

    describe('position clamp', () => {
      it('clamps when the menu exceeds the viewport', async () => {
        mockViewport(320, 240);
        mockElementSize(2000, 2000);

        const wrapper = mountContextMenu({ position: { x: 300, y: 220 } });
        await flushPromises();

        const panel = getPanel(wrapper);

        expect(panel.attributes('style')).toContain('left: 8px');
        expect(panel.attributes('style')).toContain('top: 8px');
      });

      it('remeasures and clamps when the position changes', async () => {
        mockViewport(320, 240);
        mockElementSize(200, 100);

        const wrapper = mountContextMenu({ position: { x: 100, y: 100 } });
        await flushPromises();

        await wrapper.setProps({ position: { x: 300, y: 220 } });
        await flushPromises();

        const positions = wrapper.emitted('update:position');

        expect(positions?.[positions.length - 1]).toEqual([{ x: 112, y: 132 }]);
      });

      it('clamps again when reopening during the closing phase', async () => {
        mockViewport(320, 240);
        mockElementSize(200, 100);

        const wrapper = mountContextMenu({ position: { x: 100, y: 100 } });
        await flushPromises();

        // 模拟真实右键：mousedown 先关闭菜单，contextmenu 紧接着在边缘重新打开
        getExpose(wrapper).hide();
        await nextTick();

        expect(getPanel(wrapper).classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT_IS_CLOSING);

        getExpose(wrapper).show(300, 220);
        await flushPromises();

        expect(getPanel(wrapper).attributes('style')).toContain('left: 112px');
        expect(getPanel(wrapper).attributes('style')).toContain('top: 132px');
      });

      it('clamps when show is called while the menu stays open', async () => {
        mockViewport(320, 240);
        mockElementSize(200, 100);

        const wrapper = mountContextMenu({
          position: { x: 100, y: 100 },
          isCloseOnOutsideClick: false,
        });
        await flushPromises();

        getExpose(wrapper).show(300, 220);
        await flushPromises();

        expect(getPanel(wrapper).attributes('style')).toContain('left: 112px');
        expect(getPanel(wrapper).attributes('style')).toContain('top: 132px');
      });

      it('remeasures and clamps when the items change', async () => {
        mockViewport(320, 240);
        mockElementSize(200, 100);

        const wrapper = mountContextMenu({ position: { x: 300, y: 220 } });
        await flushPromises();

        mockElementSize(2000, 2000);
        await wrapper.setProps({ items: [{ key: 'a', leftText: 'A' }] });
        await flushPromises();

        const positions = wrapper.emitted('update:position');

        expect(positions?.[positions.length - 1]).toEqual([{ x: 8, y: 8 }]);
      });

      it('clamps the default position to the viewport gap', async () => {
        const wrapper = mountContextMenu({ position: undefined });
        await flushPromises();

        expect(getPanel(wrapper).attributes('style')).toContain('left: 8px');
        expect(wrapper.emitted('update:position')?.[0]).toEqual([{ x: 8, y: 8 }]);
      });
    });

    describe('controlled mode', () => {
      it('closes when the parent sets isVisible to false', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        await wrapper.setProps({ isVisible: false });

        expect(getPanel(wrapper).classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT_IS_CLOSING);

        await finishAnimation(wrapper);

        expect(getPanel(wrapper).exists()).toBe(false);
      });

      it('opens when the parent sets isVisible to true', async () => {
        const wrapper = mountContextMenu({ isVisible: false });
        await flushPromises();

        await wrapper.setProps({ isVisible: true });
        await flushPromises();

        expect(getPanel(wrapper).exists()).toBe(true);
        expect(getPanel(wrapper).classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT_IS_OPEN);
      });

      it('reports internal closing to the parent', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        dispatchOutsideMousedown();
        await nextTick();

        expect(wrapper.emitted('update:isVisible')?.[0]).toEqual([false]);
      });

      it('does not emit on initial visibility', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        expect(wrapper.emitted('update:isVisible')).toBeUndefined();
      });
    });

    describe('teardown', () => {
      it('does not react to events after unmount', async () => {
        const wrapper = mountContextMenu();
        await flushPromises();

        wrapper.unmount();
        dispatchOutsideMousedown();
        dispatchOutsideScroll();
        dispatchEscape();
        await nextTick();

        expect(wrapper.emitted('click-outside')).toBeUndefined();
        expect(wrapper.emitted('scroll-outside')).toBeUndefined();
        expect(wrapper.emitted('esc-key-down')).toBeUndefined();
      });
    });
  });
});
