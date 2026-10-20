import { h } from 'vue';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import type { BstContextMenuItem } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES } from '../src/constants';
import { ContextMenuItem } from '../src/elements/context-menu-item';

const mountedWrappers: VueWrapper[] = [];

afterEach(() => {
  for (const wrapper of mountedWrappers.splice(0)) {
    wrapper.unmount();
  }

  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

function mountItem(
  item: BstContextMenuItem,
  index = 0,
  slots: Record<string, unknown> = {},
  isActive = false,
): { wrapper: VueWrapper; onSelect: ReturnType<typeof vi.fn>; onHover: ReturnType<typeof vi.fn> } {
  const onSelect = vi.fn();
  const onHover = vi.fn();
  const wrapper = mount(ContextMenuItem, {
    props: { item, index, isActive, onSelect, onHover },
    slots: slots as never,
    attachTo: document.body,
  });

  mountedWrappers.push(wrapper);

  return { wrapper, onSelect, onHover };
}

describe('BstContextMenuItem', () => {
  describe('props', () => {
    it('Props item: leftText', () => {
      const { wrapper } = mountItem({ key: 'a', leftText: '打开' });
      const left = wrapper.find(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_LEFT_TEXT}`);

      expect(left.exists()).toBe(true);
      expect(left.text()).toBe('打开');
      expect(wrapper.find(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_RIGHT_TEXT}`).exists()).toBe(false);
    });

    it('Props item: rightText', () => {
      const { wrapper } = mountItem({ key: 'a', rightText: 'Ctrl+O' });
      const right = wrapper.find(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_RIGHT_TEXT}`);

      expect(right.exists()).toBe(true);
      expect(right.text()).toBe('Ctrl+O');
      expect(wrapper.find(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_LEFT_TEXT}`).exists()).toBe(false);
    });

    it('Props item: both texts', () => {
      const { wrapper } = mountItem({ key: 'a', leftText: '打开', rightText: 'Ctrl+O' });
      const spans = wrapper.findAll('span');

      expect(spans).toHaveLength(2);
      expect(spans[0]?.text()).toBe('打开');
      expect(spans[1]?.text()).toBe('Ctrl+O');
    });

    it('Props item: no text', () => {
      const { wrapper } = mountItem({ key: 'a' });

      expect(wrapper.findAll('span')).toHaveLength(0);
      expect(wrapper.text()).toBe('');
    });

    it('Props item: divider', () => {
      const { wrapper } = mountItem({ key: 'a', type: 'divider', leftText: '文本' });

      expect(wrapper.text()).toBe('');
      expect(wrapper.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_DIVIDER);
    });

    it('Props item: disabled', () => {
      const { wrapper } = mountItem({ key: 'a', leftText: '删除', isDisabled: true });

      expect(wrapper.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_DISABLED);
      expect(wrapper.attributes('aria-disabled')).toBe('true');
    });

    it('Props isActive: true', () => {
      const { wrapper } = mountItem({ key: 'a', leftText: '打开' }, 0, {}, true);

      expect(wrapper.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);
    });

    it('Props isActive: false', () => {
      const { wrapper } = mountItem({ key: 'a', leftText: '打开' });

      expect(wrapper.classes()).not.toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);
    });

    it('Props isActive: ignored for disabled items', () => {
      const { wrapper } = mountItem({ key: 'a', isDisabled: true }, 0, {}, true);

      expect(wrapper.classes()).not.toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);
    });

    it('Props isActive: ignored for dividers', () => {
      const { wrapper } = mountItem({ key: 'a', type: 'divider' }, 0, {}, true);

      expect(wrapper.classes()).not.toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);
    });

    it('Props index: exposed to the item slot', () => {
      const slot = vi.fn(() => [h('span', { class: 'custom-content' }, 'custom')]);

      mountItem({ key: 'a', leftText: 'A' }, 3, { item: slot });

      expect(slot).toHaveBeenCalledWith({ item: { key: 'a', leftText: 'A' }, index: 3 });
    });
  });

  describe('slots', () => {
    it('<item> replaces the default content', () => {
      const { wrapper } = mountItem({ key: 'a', leftText: '左', rightText: '右' }, 0, {
        item: () => [h('span', { class: 'custom-content' }, 'custom')],
      });

      expect(wrapper.find('.custom-content').text()).toBe('custom');
      expect(wrapper.find(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_LEFT_TEXT}`).exists()).toBe(false);
      expect(wrapper.find(`.${BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_RIGHT_TEXT}`).exists()).toBe(false);
    });

    it('<item> keeps the interaction', async () => {
      const { wrapper, onSelect } = mountItem({ key: 'a' }, 1, {
        item: () => [h('span', { class: 'custom-content' }, 'custom')],
      });

      await wrapper.find('.custom-content').trigger('click');

      expect(onSelect).toHaveBeenCalledWith({ key: 'a' }, 1, expect.any(MouseEvent));
    });

    it('<item> is not called for dividers', () => {
      const slot = vi.fn(() => [h('span', { class: 'custom-content' }, 'custom')]);
      const { wrapper } = mountItem({ key: 'a', type: 'divider' }, 0, { item: slot });

      expect(slot).not.toHaveBeenCalled();
      expect(wrapper.find('.custom-content').exists()).toBe(false);
    });
  });

  describe('scenarios', () => {
    it('selects a regular item on click', async () => {
      const item: BstContextMenuItem = { key: 'a', leftText: 'A' };
      const { wrapper, onSelect } = mountItem(item, 2);

      await wrapper.trigger('click');

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(item, 2, expect.any(MouseEvent));
    });

    it('ignores clicks on disabled items', async () => {
      const { wrapper, onSelect } = mountItem({ key: 'a', isDisabled: true });

      await wrapper.trigger('click');

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('ignores clicks on dividers', async () => {
      const { wrapper, onSelect } = mountItem({ key: 'a', type: 'divider' });

      await wrapper.trigger('click');

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('syncs the highlight on mouseenter', async () => {
      const { wrapper, onHover } = mountItem({ key: 'a' }, 2);

      await wrapper.trigger('mouseenter');

      expect(onHover).toHaveBeenCalledWith(2);
    });

    it('ignores mouseenter on disabled items', async () => {
      const { wrapper, onHover } = mountItem({ key: 'a', isDisabled: true });

      await wrapper.trigger('mouseenter');

      expect(onHover).not.toHaveBeenCalled();
    });

    it('ignores mouseenter on dividers', async () => {
      const { wrapper, onHover } = mountItem({ key: 'a', type: 'divider' });

      await wrapper.trigger('mouseenter');

      expect(onHover).not.toHaveBeenCalled();
    });

    it('marks regular items as menu items', () => {
      const { wrapper } = mountItem({ key: 'a' });

      expect(wrapper.attributes('role')).toBe('menuitem');
      expect(wrapper.attributes('tabindex')).toBeUndefined();
      expect(wrapper.classes()).toContain(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM);
    });

    it('keeps disabled items out of the tab order', () => {
      const { wrapper } = mountItem({ key: 'a', isDisabled: true });

      expect(wrapper.attributes('role')).toBe('menuitem');
      expect(wrapper.attributes('tabindex')).toBeUndefined();
      expect(wrapper.attributes('aria-disabled')).toBe('true');
    });

    it('marks dividers as separators', () => {
      const { wrapper } = mountItem({ key: 'a', type: 'divider' });

      expect(wrapper.attributes('role')).toBe('separator');
      expect(wrapper.attributes('aria-hidden')).toBe('true');
    });
  });
});
