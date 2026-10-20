import { computed, nextTick, reactive, ref } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import type { BstContextMenuItem, BstContextMenuProps } from '@binarysovereign/bst-types';

import {
  BST_CONTEXT_MENU_CONSTANT_ANIMATION_DURATION,
  BST_CONTEXT_MENU_CONSTANT_ANIMATION_FALLBACK_BUFFER,
} from '../src/constants';
import { contextMenuProps, useContextMenuProp } from '../src/hooks/prop.hooks';
import type { UseContextMenuReturn } from '../src/hooks/context-menu.hooks';
import { useContextMenu } from '../src/hooks/context-menu.hooks';
import { useContextMenuController } from '../src/hooks/controller.hooks';
import type { UseContextMenuControllerReturn } from '../src/hooks/controller.hooks';
import { useContextMenuLife } from '../src/hooks/life.hooks';
import { createHarness } from './mount';

const FALLBACK_DELAY =
  BST_CONTEXT_MENU_CONSTANT_ANIMATION_DURATION + BST_CONTEXT_MENU_CONSTANT_ANIMATION_FALLBACK_BUFFER;

const mountedWrappers: VueWrapper[] = [];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();

  for (const wrapper of mountedWrappers.splice(0)) {
    wrapper.unmount();
  }

  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

function createProps(overrides: BstContextMenuProps = {}): BstContextMenuProps {
  return {
    isVisible: false,
    items: [],
    position: { x: 0, y: 0 },
    isCloseOnOutsideClick: true,
    isCloseOnOutsideScroll: true,
    isCloseOnEscKeyDown: true,
    teleport: true,
    ...overrides,
  };
}

function createSizedElement(width: number, height: number): HTMLElement {
  const element = document.createElement('div');

  Object.defineProperty(element, 'offsetWidth', { configurable: true, value: width });
  Object.defineProperty(element, 'offsetHeight', { configurable: true, value: height });

  return element;
}

/**
 * 构造一个带 `getBoundingClientRect` 结果的元素。
 *
 * jsdom 的 `getBoundingClientRect` 恒为 0，无法模拟包含块偏移，故在此显式替换。
 *
 * @param width 元素宽度
 * @param height 元素高度
 * @param left 实测视口 X 坐标
 * @param top 实测视口 Y 坐标
 * @returns 可直接挂到 `rootRef` 的元素
 */
function createRectElement(width: number, height: number, left: number, top: number): HTMLElement {
  const element = createSizedElement(width, height);

  setElementRect(element, width, height, left, top);

  return element;
}

/**
 * 改写元素的实测矩形。
 *
 * @param element 目标元素
 * @param width 元素宽度
 * @param height 元素高度
 * @param left 实测视口 X 坐标
 * @param top 实测视口 Y 坐标
 */
function setElementRect(element: HTMLElement, width: number, height: number, left: number, top: number): void {
  element.getBoundingClientRect = (): DOMRect => ({
    left,
    top,
    x: left,
    y: top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: (): Record<string, number> => ({ left, top, width, height }),
  });
}

interface MenuContext {
  menu: UseContextMenuReturn;
  emit: ReturnType<typeof vi.fn>;
  props: BstContextMenuProps;
}

function createMenu(
  overrides: BstContextMenuProps = {},
  styles: { width?: string; maxHeight?: string } = {},
): MenuContext {
  const props = createProps(overrides);
  const emit = vi.fn();
  const menu = useContextMenu({
    props,
    emit,
    items: computed(() => props.items ?? []),
    widthStyle: computed(() => styles.width),
    maxHeightStyle: computed(() => styles.maxHeight),
  });

  return { menu, emit, props };
}

describe('contextMenuProps', () => {
  it('rejects non-boolean booleans', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(contextMenuProps.isVisible.validator('true')).toBe(false);
    expect(contextMenuProps.isCloseOnOutsideClick.validator('true')).toBe(false);
    expect(contextMenuProps.isCloseOnOutsideScroll.validator('true')).toBe(false);
    expect(contextMenuProps.isCloseOnEscKeyDown.validator('true')).toBe(false);
    expect(warn).toHaveBeenCalledTimes(4);
  });

  it('rejects non-array items', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(contextMenuProps.items.validator({})).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid position', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(contextMenuProps.position.validator(null)).toBe(false);
    expect(contextMenuProps.position.validator('1,2')).toBe(false);
    expect(contextMenuProps.position.validator({ x: 1 })).toBe(false);
    expect(contextMenuProps.position.validator({ x: '1', y: 2 })).toBe(false);
    expect(contextMenuProps.position.validator({ x: Number.NaN, y: 2 })).toBe(false);
    expect(warn).toHaveBeenCalledTimes(5);
  });

  it('rejects invalid width and maxHeight', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(contextMenuProps.width.validator(-1)).toBe(false);
    expect(contextMenuProps.maxHeight.validator('')).toBe(false);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('rejects invalid teleport', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(contextMenuProps.teleport.validator('')).toBe(false);
    expect(contextMenuProps.teleport.validator('   ')).toBe(false);
    expect(contextMenuProps.teleport.validator(1)).toBe(false);
    expect(warn).toHaveBeenCalledTimes(3);
  });

  it('rejects non-function listeners', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(contextMenuProps.onItemSelect.validator('fn')).toBe(false);
    expect(contextMenuProps.onClickOutside.validator('fn')).toBe(false);
    expect(contextMenuProps.onScrollOutside.validator('fn')).toBe(false);
    expect(contextMenuProps.onEscKeyDown.validator('fn')).toBe(false);
    expect(contextMenuProps.onAfterEnter.validator('fn')).toBe(false);
    expect(contextMenuProps.onAfterLeave.validator('fn')).toBe(false);
    expect(warn).toHaveBeenCalledTimes(6);
  });
});

describe('useContextMenuProp', () => {
  it('recomputes normalized items when items change', () => {
    const props = reactive<BstContextMenuProps>(createProps({ items: [{ key: 'a' }] }));
    const result = useContextMenuProp(props);

    expect(result.normalizedItems.value[0]?.key).toBe('a');

    props.items = [{ key: 'b' }];

    expect(result.normalizedItems.value[0]?.key).toBe('b');
  });

  it('resolves teleport false', () => {
    const result = useContextMenuProp(createProps({ teleport: false }));

    expect(result.teleportTarget.value).toBe(false);
  });

  it('resolves teleport true to body', () => {
    const result = useContextMenuProp(createProps({ teleport: true }));

    expect(result.teleportTarget.value).toBe('body');
  });

  it('uses the default teleport when omitted', () => {
    const result = useContextMenuProp(createProps({ teleport: undefined }));

    expect(result.teleportTarget.value).toBe('body');
  });

  it('keeps an existing selector', () => {
    document.body.insertAdjacentHTML('beforeend', '<div id="menu-target"></div>');

    const result = useContextMenuProp(createProps({ teleport: '#menu-target' }));

    expect(result.teleportTarget.value).toBe('#menu-target');
  });

  it('falls back to body for a missing selector', () => {
    const result = useContextMenuProp(createProps({ teleport: '#missing' }));

    expect(result.teleportTarget.value).toBe('body');
  });

  it('falls back to body for an invalid selector', () => {
    const result = useContextMenuProp(createProps({ teleport: '[' }));

    expect(result.teleportTarget.value).toBe('body');
  });

  it('falls back to body without document', () => {
    vi.stubGlobal('document', undefined);

    const result = useContextMenuProp(createProps({ teleport: '#menu-target' }));

    expect(result.teleportTarget.value).toBe('body');
  });
});

describe('useContextMenu', () => {
  it('falls back to zero when the position is omitted', () => {
    const { menu } = createMenu({ position: undefined });

    expect(menu.rootStyle.value.left).toBe('0px');
    expect(menu.rootStyle.value.top).toBe('0px');
  });

  it('fills a missing axis with zero', () => {
    const { menu } = createMenu({ position: { x: 12 } as BstContextMenuProps['position'] });

    expect(menu.rootStyle.value.left).toBe('12px');
    expect(menu.rootStyle.value.top).toBe('0px');
  });

  it('finishes only once when the animation ends repeatedly', () => {
    vi.useFakeTimers();

    const { menu, emit } = createMenu();
    const element = document.createElement('div');

    menu.rootRef.value = element;
    menu.applyVisible(true);
    menu.handleAnimationEnd({ target: element } as unknown as AnimationEvent);
    menu.handleAnimationEnd({ target: element } as unknown as AnimationEvent);

    expect(emit).toHaveBeenCalledTimes(1);
  });

  it('does not restart the entry when opened while open', async () => {
    vi.useFakeTimers();

    const { menu, emit } = createMenu();

    menu.applyVisible(true);
    await vi.advanceTimersByTimeAsync(FALLBACK_DELAY);
    menu.applyVisible(true);
    await vi.advanceTimersByTimeAsync(FALLBACK_DELAY);

    expect(emit).toHaveBeenCalledTimes(1);

    menu.cleanup();
  });

  it('does not restart the leave when closed while closing', async () => {
    vi.useFakeTimers();

    const { menu, emit } = createMenu();

    menu.applyVisible(true);
    await vi.advanceTimersByTimeAsync(FALLBACK_DELAY);
    menu.applyVisible(false);
    menu.applyVisible(false);
    await vi.advanceTimersByTimeAsync(FALLBACK_DELAY);

    const leaveCalls = emit.mock.calls.filter(([event]) => event === 'after-leave');

    expect(leaveCalls).toHaveLength(1);
    expect(menu.innerVisible.value).toBe(false);
  });

  it('ignores dividers and disabled items', () => {
    const { menu, emit } = createMenu({ isVisible: true });
    const dividerAction = vi.fn();
    const disabledAction = vi.fn();
    const divider: BstContextMenuItem = { key: 'd', type: 'divider', action: dividerAction };
    const disabled: BstContextMenuItem = { key: 'a', isDisabled: true, action: disabledAction };

    menu.handleItemSelect(divider, 0, new MouseEvent('click'));
    menu.handleItemSelect(disabled, 1, new MouseEvent('click'));

    expect(emit).not.toHaveBeenCalledWith('item-select', expect.anything());
    expect(dividerAction).not.toHaveBeenCalled();
    expect(disabledAction).not.toHaveBeenCalled();

    menu.cleanup();
  });

  describe('keyboard navigation', () => {
    const ITEMS: BstContextMenuItem[] = [
      { key: 'a', leftText: 'A' },
      { key: 'divider', type: 'divider' },
      { key: 'b', leftText: 'B' },
      { key: 'disabled', leftText: 'C', isDisabled: true },
      { key: 'c', leftText: 'D' },
    ];

    /**
     * 派发一次键盘事件。
     *
     * @param menu 菜单实例
     * @param key 按键
     * @returns 派发用的事件对象
     */
    function press(menu: UseContextMenuReturn, key: string): KeyboardEvent {
      const event = new KeyboardEvent('keydown', { key, cancelable: true });

      menu.handleKeyDown(event);

      return event;
    }

    /**
     * 构造带指定子元素的菜单根节点。
     *
     * @param index 子元素的数据下标
     * @returns 根节点与子元素
     */
    function createRoot(index: number): { root: HTMLElement; child: HTMLElement } {
      const root = document.createElement('div');
      const child = document.createElement('div');

      child.setAttribute('data-index', String(index));
      root.append(child);

      return { root, child };
    }

    it('moves down from no highlight to the first selectable item', () => {
      const { menu } = createMenu({ items: ITEMS });

      const event = press(menu, 'ArrowDown');

      expect(event.defaultPrevented).toBe(true);
      expect(menu.activeIndex.value).toBe(0);
    });

    it('moves up from no highlight to the last selectable item', () => {
      const { menu } = createMenu({ items: ITEMS });

      press(menu, 'ArrowUp');

      expect(menu.activeIndex.value).toBe(4);
    });

    it('skips dividers and disabled items and wraps around', () => {
      const { menu } = createMenu({ items: ITEMS });

      press(menu, 'ArrowDown');
      press(menu, 'ArrowDown');
      press(menu, 'ArrowDown');
      press(menu, 'ArrowDown');

      // 0 → 2 → 4 → 回到 0
      expect(menu.activeIndex.value).toBe(0);
    });

    it('moves backwards with the up arrow', () => {
      const { menu } = createMenu({ items: ITEMS });

      press(menu, 'ArrowDown');
      press(menu, 'ArrowUp');

      expect(menu.activeIndex.value).toBe(4);
    });

    it('keeps the highlight when nothing is selectable', () => {
      const { menu } = createMenu({
        items: [
          { key: 'divider', type: 'divider' },
          { key: 'disabled', isDisabled: true },
        ],
      });

      const event = press(menu, 'ArrowDown');

      expect(event.defaultPrevented).toBe(true);
      expect(menu.activeIndex.value).toBe(-1);
    });

    it('keeps the highlight for an empty list', () => {
      const { menu } = createMenu();

      const event = press(menu, 'ArrowUp');

      expect(event.defaultPrevented).toBe(true);
      expect(menu.activeIndex.value).toBe(-1);
    });

    it('scrolls the highlighted item into view', async () => {
      const { menu } = createMenu({ items: ITEMS });
      const { root, child } = createRoot(0);
      const scrollIntoView = vi.fn();

      child.scrollIntoView = scrollIntoView;
      menu.rootRef.value = root;

      press(menu, 'ArrowDown');
      await nextTick();

      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
    });

    it('skips scrolling without a matched element', async () => {
      const { menu } = createMenu({ items: ITEMS });

      menu.rootRef.value = document.createElement('div');
      press(menu, 'ArrowDown');
      await nextTick();

      expect(menu.activeIndex.value).toBe(0);
    });

    it('skips scrolling when the element cannot scroll', async () => {
      const { menu } = createMenu({ items: ITEMS });
      const { root, child } = createRoot(0);

      Reflect.deleteProperty(child, 'scrollIntoView');
      menu.rootRef.value = root;

      press(menu, 'ArrowDown');
      await nextTick();

      expect(menu.activeIndex.value).toBe(0);
    });

    it('selects the highlighted item with Enter', () => {
      const { menu, emit } = createMenu({ items: ITEMS });

      press(menu, 'ArrowDown');

      const event = press(menu, 'Enter');

      expect(event.defaultPrevented).toBe(true);
      expect(emit).toHaveBeenCalledWith('item-select', {
        item: ITEMS[0],
        index: 0,
        nativeEvent: event,
      });
    });

    it('selects the highlighted item with Space', () => {
      const { menu, emit } = createMenu({ items: ITEMS });

      press(menu, 'ArrowDown');

      const event = press(menu, ' ');

      expect(event.defaultPrevented).toBe(true);
      expect(emit).toHaveBeenCalledWith('item-select', {
        item: ITEMS[0],
        index: 0,
        nativeEvent: event,
      });
    });

    it('leaves Enter to the page when nothing is highlighted', () => {
      const { menu, emit } = createMenu({ items: ITEMS });

      const event = press(menu, 'Enter');

      expect(event.defaultPrevented).toBe(false);
      expect(emit).not.toHaveBeenCalledWith('item-select', expect.anything());
    });

    it('leaves Enter to the page when the highlight index is stale', () => {
      const { menu, emit } = createMenu({ items: ITEMS });

      menu.activeIndex.value = 99;

      const event = press(menu, 'Enter');

      expect(event.defaultPrevented).toBe(false);
      expect(emit).not.toHaveBeenCalledWith('item-select', expect.anything());
    });

    it('ignores unrelated keys', () => {
      const { menu } = createMenu({ items: ITEMS });

      const event = press(menu, 'Tab');

      expect(event.defaultPrevented).toBe(false);
      expect(menu.activeIndex.value).toBe(-1);
    });

    it('closes on Escape and respects the switch', () => {
      const { menu, emit } = createMenu({ items: ITEMS, isCloseOnEscKeyDown: false });

      press(menu, 'Escape');

      expect(emit).not.toHaveBeenCalledWith('esc-key-down', expect.anything());

      menu.cleanup();
    });

    it('sets the highlight on hover', () => {
      const { menu } = createMenu({ items: ITEMS });

      menu.handleItemHover(2);

      expect(menu.activeIndex.value).toBe(2);
    });

    it('ignores hover for missing, divider and disabled items', () => {
      const { menu } = createMenu({ items: ITEMS });

      menu.handleItemHover(99);
      menu.handleItemHover(1);
      menu.handleItemHover(3);

      expect(menu.activeIndex.value).toBe(-1);
    });

    it('resets the highlight explicitly', () => {
      const { menu } = createMenu({ items: ITEMS });

      press(menu, 'ArrowDown');
      menu.resetActiveIndex();

      expect(menu.activeIndex.value).toBe(-1);
    });

    it('resets the highlight when opening again', () => {
      const { menu } = createMenu({ items: ITEMS });

      press(menu, 'ArrowDown');
      menu.applyVisible(true);

      expect(menu.activeIndex.value).toBe(-1);

      menu.cleanup();
    });
  });

  describe('animation handling', () => {
    it('does not schedule timers without a browser environment', async () => {
      vi.useFakeTimers();
      vi.stubGlobal('window', undefined);
      vi.stubGlobal('document', undefined);

      const { menu, emit } = createMenu();

      menu.applyVisible(true);
      await vi.advanceTimersByTimeAsync(FALLBACK_DELAY);

      expect(menu.phase.value).toBe('opening');
      expect(emit).not.toHaveBeenCalled();
    });
  });

  describe('measureAndClamp', () => {
    it('does nothing without a root element', async () => {
      const { menu, emit } = createMenu();

      menu.rootRef.value = null;
      await menu.measureAndClamp();

      expect(menu.isMeasuring.value).toBe(false);
      expect(emit).not.toHaveBeenCalled();
    });

    it('stops measuring without a browser environment', async () => {
      const { menu, emit } = createMenu({ position: { x: 2000, y: 2000 } });
      const element = createSizedElement(200, 100);

      menu.rootRef.value = element;
      vi.stubGlobal('window', undefined);
      vi.stubGlobal('document', undefined);
      await menu.measureAndClamp();

      expect(menu.isMeasuring.value).toBe(false);
      expect(emit).not.toHaveBeenCalled();
    });

    it('stops measuring when the document is missing', async () => {
      const { menu, emit } = createMenu({ position: { x: 2000, y: 2000 } });

      menu.rootRef.value = createSizedElement(200, 100);
      vi.stubGlobal('document', undefined);
      await menu.measureAndClamp();

      expect(menu.isMeasuring.value).toBe(false);
      expect(emit).not.toHaveBeenCalled();
    });

    it('compensates a transformed containing block', async () => {
      const { menu, emit } = createMenu({ position: { x: 100, y: 50 } });

      // 实测位置比写入值整体偏移 63px，等价于祖先带 transform 时的包含块原点
      menu.rootRef.value = createRectElement(200, 100, 163, 113);
      await menu.measureAndClamp();

      expect(menu.rootStyle.value.left).toBe('37px');
      expect(menu.rootStyle.value.top).toBe('-13px');
      expect(emit).not.toHaveBeenCalledWith('update:position', expect.anything());
    });

    it('keeps the compensation stable across repeated measurements', async () => {
      const { menu } = createMenu({ position: { x: 100, y: 50 } });
      const element = createRectElement(200, 100, 163, 113);

      menu.rootRef.value = element;
      await menu.measureAndClamp();

      // 补偿生效后元素落在期望坐标 100/50，再次测量不应改变结果
      setElementRect(element, 200, 100, 100, 50);
      await menu.measureAndClamp();

      expect(menu.rootStyle.value.left).toBe('37px');
      expect(menu.rootStyle.value.top).toBe('-13px');
    });

    it('clears the compensation once the offset disappears', async () => {
      const { menu } = createMenu({ position: { x: 100, y: 50 } });
      const element = createRectElement(200, 100, 163, 113);

      menu.rootRef.value = element;
      await menu.measureAndClamp();

      // 结构变化后祖先不再成为包含块：实测值等于当前写入值 37/-13
      setElementRect(element, 200, 100, 37, -13);
      await menu.measureAndClamp();

      expect(menu.rootStyle.value.left).toBe('100px');
      expect(menu.rootStyle.value.top).toBe('50px');
    });

    it('keeps the last compensation when the element has no size', async () => {
      const { menu } = createMenu({ position: { x: 100, y: 50 } });
      const element = createRectElement(200, 100, 163, 113);

      menu.rootRef.value = element;
      await menu.measureAndClamp();

      // 尺寸为 0 时无法判定偏移，应保留上一次结果
      setElementRect(element, 0, 0, 0, 0);
      await menu.measureAndClamp();

      expect(menu.rootStyle.value.left).toBe('37px');
      expect(menu.rootStyle.value.top).toBe('-13px');
    });
  });
});

interface LifeHarness {
  wrapper: VueWrapper;
  props: BstContextMenuProps;
  isActive: ReturnType<typeof ref<boolean>>;
  innerVisible: ReturnType<typeof ref<boolean>>;
  onOutsideClick: ReturnType<typeof vi.fn>;
  onOutsideScroll: ReturnType<typeof vi.fn>;
  onKeyDown: ReturnType<typeof vi.fn>;
  onVisiblePropChange: ReturnType<typeof vi.fn>;
  onInnerVisibleChange: ReturnType<typeof vi.fn>;
  onPositionPropChange: ReturnType<typeof vi.fn>;
  onReMeasure: ReturnType<typeof vi.fn>;
  onItemsChange: ReturnType<typeof vi.fn>;
  onCleanup: ReturnType<typeof vi.fn>;
}

function mountLifeHarness(initialActive = false): LifeHarness {
  const props = reactive<BstContextMenuProps>(createProps());
  const isActive = ref(initialActive);
  const innerVisible = ref(false);
  const rootRef = ref<HTMLElement | null>(null);
  const onOutsideClick = vi.fn();
  const onOutsideScroll = vi.fn();
  const onKeyDown = vi.fn();
  const onVisiblePropChange = vi.fn();
  const onInnerVisibleChange = vi.fn();
  const onPositionPropChange = vi.fn();
  const onReMeasure = vi.fn();
  const onItemsChange = vi.fn();
  const onCleanup = vi.fn();

  const Harness = createHarness(() => {
    useContextMenuLife({
      isActive,
      innerVisible,
      props,
      rootRef,
      onOutsideClick,
      onOutsideScroll,
      onKeyDown,
      onVisiblePropChange,
      onInnerVisibleChange,
      onPositionPropChange,
      onReMeasure,
      onItemsChange,
      onCleanup,
    });
  });

  const wrapper = mount(Harness);
  mountedWrappers.push(wrapper);

  return {
    wrapper,
    props,
    isActive,
    innerVisible,
    onOutsideClick,
    onOutsideScroll,
    onKeyDown,
    onVisiblePropChange,
    onInnerVisibleChange,
    onPositionPropChange,
    onReMeasure,
    onItemsChange,
    onCleanup,
  };
}

describe('useContextMenuLife', () => {
  it('ignores outside events when deactivated while listeners attach', async () => {
    const harness = mountLifeHarness();

    harness.isActive.value = true;
    await nextTick();
    harness.isActive.value = false;
    await flushPromises();

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await nextTick();

    expect(harness.onOutsideClick).not.toHaveBeenCalled();
  });

  it('syncs the controlled visibility prop', async () => {
    const harness = mountLifeHarness();

    harness.props.isVisible = true;
    await nextTick();
    expect(harness.onVisiblePropChange).toHaveBeenCalledWith(true);

    harness.props.isVisible = undefined;
    await nextTick();
    expect(harness.onVisiblePropChange).toHaveBeenLastCalledWith(false);
  });

  it('reports inner visibility changes', async () => {
    const harness = mountLifeHarness();

    harness.innerVisible.value = true;
    await nextTick();

    expect(harness.onInnerVisibleChange).toHaveBeenCalledWith(true);
  });

  it('remeasures when position changes', async () => {
    const harness = mountLifeHarness();

    harness.props.position = { x: 10, y: 20 };
    await nextTick();

    expect(harness.onPositionPropChange).toHaveBeenCalledWith({ x: 10, y: 20 });
    expect(harness.onReMeasure).toHaveBeenCalledTimes(1);
  });

  it('remeasures when items change', async () => {
    const harness = mountLifeHarness();

    harness.props.items = [{ key: 'a' }];
    await nextTick();

    expect(harness.onItemsChange).toHaveBeenCalledTimes(1);
    expect(harness.onReMeasure).toHaveBeenCalledTimes(1);
  });

  it('cleans up on unmount while hidden', () => {
    const harness = mountLifeHarness();

    harness.wrapper.unmount();

    expect(harness.onCleanup).toHaveBeenCalledTimes(1);
  });
});

interface ControllerHarness {
  wrapper: VueWrapper;
  props: BstContextMenuProps;
  emit: ReturnType<typeof vi.fn>;
  controller: UseContextMenuControllerReturn;
}

function mountControllerHarness(): ControllerHarness {
  const props = reactive<BstContextMenuProps>(createProps());
  const emit = vi.fn();
  const holder: { controller?: UseContextMenuControllerReturn } = {};

  const Harness = createHarness(({ slots }) => {
    holder.controller = useContextMenuController(props, emit, slots);
  });

  const wrapper = mount(Harness);
  mountedWrappers.push(wrapper);

  if (!holder.controller) throw new Error('controller is not ready');

  return { wrapper, props, emit, controller: holder.controller };
}

describe('useContextMenuController', () => {
  it('cleans up pending timers on unmount', async () => {
    vi.useFakeTimers();

    const { wrapper, emit, controller } = mountControllerHarness();

    controller.show(10, 10);
    await nextTick();
    await nextTick();
    wrapper.unmount();
    await vi.advanceTimersByTimeAsync(FALLBACK_DELAY);

    expect(emit).not.toHaveBeenCalledWith('after-enter');
  });
});
