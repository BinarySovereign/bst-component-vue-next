/**
 * Copyright (c) 2026 Felix Tang (BinarySovereign). Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */

import {
  clampContextMenuPosition,
  isContextMenuItemActionable,
  isContextMenuDivider,
  isContextMenuItemDisabled,
  isInsideContextMenu,
  normalizeContextMenuItems,
  resolveContextMenuItemIndex,
  resolveContextMenuOffset,
  resolveContextMenuOrigin,
  toCssLength,
} from '../src/utils';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('toCssLength', () => {
  it('320 -> 320px', () => {
    expect(toCssLength(320)).toBe('320px');
  });

  it('0 -> 0px', () => {
    expect(toCssLength(0)).toBe('0px');
  });

  it('-1 -> undefined', () => {
    expect(toCssLength(-1)).toBeUndefined();
  });

  it('NaN -> undefined', () => {
    expect(toCssLength(Number.NaN)).toBeUndefined();
  });

  it('Infinity -> undefined', () => {
    expect(toCssLength(Number.POSITIVE_INFINITY)).toBeUndefined();
  });

  it('string trims whitespace', () => {
    expect(toCssLength(' 12rem ')).toBe('12rem');
  });

  it('empty or blank string -> undefined', () => {
    expect(toCssLength('')).toBeUndefined();
    expect(toCssLength('   ')).toBeUndefined();
  });

  it('undefined -> undefined', () => {
    expect(toCssLength(undefined)).toBeUndefined();
  });
});

describe('isContextMenuDivider', () => {
  it('divider -> true', () => {
    expect(isContextMenuDivider({ key: 'a', type: 'divider' })).toBe(true);
  });

  it('item or missing type -> false', () => {
    expect(isContextMenuDivider({ key: 'a', type: 'item' })).toBe(false);
    expect(isContextMenuDivider({ key: 'a' })).toBe(false);
  });
});

describe('isContextMenuItemDisabled', () => {
  it('disabled item -> true', () => {
    expect(isContextMenuItemDisabled({ key: 'a', isDisabled: true })).toBe(true);
  });

  it('item without a true flag -> false', () => {
    expect(isContextMenuItemDisabled({ key: 'a' })).toBe(false);
    expect(isContextMenuItemDisabled({ key: 'a', isDisabled: false })).toBe(false);
  });

  it('divider ignores disabled flag', () => {
    expect(isContextMenuItemDisabled({ key: 'a', type: 'divider', isDisabled: true })).toBe(false);
  });
});

describe('isContextMenuItemActionable', () => {
  it('regular item -> true', () => {
    expect(isContextMenuItemActionable({ key: 'a' })).toBe(true);
    expect(isContextMenuItemActionable({ key: 'a', type: 'item' })).toBe(true);
  });

  it('disabled item -> false', () => {
    expect(isContextMenuItemActionable({ key: 'a', isDisabled: true })).toBe(false);
  });

  it('divider -> false', () => {
    expect(isContextMenuItemActionable({ key: 'a', type: 'divider' })).toBe(false);
    expect(isContextMenuItemActionable({ key: 'a', type: 'divider', isDisabled: true })).toBe(false);
  });
});

describe('normalizeContextMenuItems', () => {
  it('non-array input -> empty array with warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(normalizeContextMenuItems(undefined)).toEqual([]);
    expect(normalizeContextMenuItems({})).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });

  it('empty array -> empty array without warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(normalizeContextMenuItems([])).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
  });

  it('duplicate keys keep the first occurrence', () => {
    const result = normalizeContextMenuItems([
      { key: 'a', leftText: 'first' },
      { key: 'a', leftText: 'second' },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.leftText).toBe('first');
  });

  it('numeric zero key is valid', () => {
    const [item] = normalizeContextMenuItems([{ key: 0 }]);

    expect(item.key).toBe(0);
    expect(item.type).toBe('item');
  });

  it('empty string key is dropped with warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(normalizeContextMenuItems([{ key: '' }])).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });

  it('non-finite numeric key is dropped with warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(normalizeContextMenuItems([{ key: Number.NaN }, { key: Number.POSITIVE_INFINITY }])).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('object key is dropped with warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(normalizeContextMenuItems([{ key: {} }])).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });

  it('null key is dropped with warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(normalizeContextMenuItems([{ key: null }])).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });

  it('null candidate is dropped with warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(normalizeContextMenuItems([null])).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });

  it('unknown type is normalized to item', () => {
    expect(normalizeContextMenuItems([{ key: 'a', type: 'unknown' }])[0]?.type).toBe('item');
  });

  it('divider keeps only key and type', () => {
    expect(
      normalizeContextMenuItems([
        {
          key: 'a',
          type: 'divider',
          leftText: 'left',
          rightText: 'right',
          isDisabled: true,
          action: () => undefined,
        },
      ]),
    ).toEqual([{ key: 'a', type: 'divider' }]);
  });

  it('item keeps text and action', () => {
    const action = (): void => undefined;
    const [item] = normalizeContextMenuItems([{ key: 'a', leftText: 'left', rightText: 'right', action }]);

    expect(item.leftText).toBe('left');
    expect(item.rightText).toBe('right');
    expect(item.action).toBe(action);
  });

  it('non-boolean disabled flag is normalized to false', () => {
    const result = normalizeContextMenuItems([{ key: 'a', isDisabled: 1 }]);

    expect(result[0]?.isDisabled).toBe(false);
  });
});

describe('clampContextMenuPosition', () => {
  const baseOptions = {
    menuWidth: 200,
    menuHeight: 100,
    viewportWidth: 1024,
    viewportHeight: 768,
    gap: 8,
  };

  it('keeps position inside the viewport', () => {
    expect(clampContextMenuPosition({ ...baseOptions, x: 100, y: 50 })).toEqual({ x: 100, y: 50 });
  });

  it('clamps negative coordinates to the gap', () => {
    expect(clampContextMenuPosition({ ...baseOptions, x: -20, y: 0 })).toEqual({ x: 8, y: 8 });
  });

  it('clamps coordinates exceeding the limit', () => {
    expect(clampContextMenuPosition({ ...baseOptions, x: 1000, y: 800 })).toEqual({ x: 816, y: 660 });
  });

  it('falls back to the gap when the menu exceeds the viewport', () => {
    expect(
      clampContextMenuPosition({
        ...baseOptions,
        x: 400,
        y: 400,
        menuWidth: 2000,
        menuHeight: 2000,
      }),
    ).toEqual({ x: 8, y: 8 });
  });

  it('keeps boundary coordinates unchanged', () => {
    expect(clampContextMenuPosition({ ...baseOptions, x: 816, y: 660 })).toEqual({ x: 816, y: 660 });
  });
});

describe('resolveContextMenuOffset', () => {
  const baseOptions = {
    appliedX: 100,
    appliedY: 50,
    actualX: 163,
    actualY: 113,
    width: 200,
    height: 100,
  };

  it('returns the offset between applied and actual coordinates', () => {
    expect(resolveContextMenuOffset(baseOptions)).toEqual({ x: -63, y: -63 });
  });

  it('returns zero when the element lands on the applied coordinates', () => {
    expect(resolveContextMenuOffset({ ...baseOptions, actualX: 100, actualY: 50 })).toEqual({ x: 0, y: 0 });
  });

  it('returns positive values when the element is shifted towards the origin', () => {
    expect(resolveContextMenuOffset({ ...baseOptions, actualX: 40, actualY: 10 })).toEqual({ x: 60, y: 40 });
  });

  it('returns undefined when the element has no size', () => {
    expect(resolveContextMenuOffset({ ...baseOptions, width: 0, height: 0 })).toBeUndefined();
  });

  it('still resolves when only one axis has size', () => {
    expect(resolveContextMenuOffset({ ...baseOptions, width: 0, height: 100 })).toEqual({ x: -63, y: -63 });
  });
});

describe('resolveContextMenuOrigin', () => {
  function createParent(left: number, top: number): HTMLElement {
    const parent = document.createElement('div');

    parent.getBoundingClientRect = (): DOMRect => ({
      left,
      top,
      x: left,
      y: top,
      right: left + 100,
      bottom: top + 100,
      width: 100,
      height: 100,
      toJSON: (): Record<string, number> => ({ left, top, width: 100, height: 100 }),
    });

    return parent;
  }

  it('returns the viewport origin without an element', () => {
    expect(resolveContextMenuOrigin(null)).toEqual({ x: 0, y: 0 });
  });

  it('returns the viewport origin without a browser environment', () => {
    const parent = createParent(50, 520);
    const element = document.createElement('div');

    parent.appendChild(element);
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('document', undefined);

    expect(resolveContextMenuOrigin(element)).toEqual({ x: 0, y: 0 });
  });

  it('returns the viewport origin without a parent', () => {
    expect(resolveContextMenuOrigin(document.createElement('div'))).toEqual({ x: 0, y: 0 });
  });

  it('returns the viewport origin when mounted on the body', () => {
    const element = document.createElement('div');

    document.body.appendChild(element);

    expect(resolveContextMenuOrigin(element)).toEqual({ x: 0, y: 0 });
  });

  it('returns the viewport origin when mounted on the document element', () => {
    const element = document.createElement('div');

    document.documentElement.appendChild(element);

    expect(resolveContextMenuOrigin(element)).toEqual({ x: 0, y: 0 });

    element.remove();
  });

  it('returns the top-left corner of the mounting container', () => {
    const parent = createParent(50, 520);
    const element = document.createElement('div');

    parent.appendChild(element);

    expect(resolveContextMenuOrigin(element)).toEqual({ x: 50, y: 520 });
  });
});

describe('resolveContextMenuItemIndex', () => {
  const items = [
    { key: 'a' },
    { key: 'divider', type: 'divider' as const },
    { key: 'b' },
    { key: 'disabled', isDisabled: true },
    { key: 'c' },
  ];

  it('returns -1 for an empty list', () => {
    expect(resolveContextMenuItemIndex([], -1, 1)).toBe(-1);
    expect(resolveContextMenuItemIndex([], -1, -1)).toBe(-1);
  });

  it('starts at the first selectable item when moving down without a highlight', () => {
    expect(resolveContextMenuItemIndex(items, -1, 1)).toBe(0);
  });

  it('starts at the last selectable item when moving up without a highlight', () => {
    expect(resolveContextMenuItemIndex(items, -1, -1)).toBe(4);
  });

  it('skips dividers and disabled items', () => {
    expect(resolveContextMenuItemIndex(items, 0, 1)).toBe(2);
    expect(resolveContextMenuItemIndex(items, 2, 1)).toBe(4);
    expect(resolveContextMenuItemIndex(items, 4, -1)).toBe(2);
  });

  it('wraps around both directions', () => {
    expect(resolveContextMenuItemIndex(items, 4, 1)).toBe(0);
    expect(resolveContextMenuItemIndex(items, 0, -1)).toBe(4);
  });

  it('treats an out-of-range index as no highlight', () => {
    expect(resolveContextMenuItemIndex(items, 99, 1)).toBe(0);
    expect(resolveContextMenuItemIndex(items, 99, -1)).toBe(4);
  });

  it('returns -1 when no item is selectable', () => {
    const blocked = [
      { key: 'divider', type: 'divider' as const },
      { key: 'disabled', isDisabled: true },
    ];

    expect(resolveContextMenuItemIndex(blocked, -1, 1)).toBe(-1);
    expect(resolveContextMenuItemIndex(blocked, -1, -1)).toBe(-1);
  });

  it('returns the only selectable item in both directions', () => {
    const single = [{ key: 'a' }];

    expect(resolveContextMenuItemIndex(single, -1, 1)).toBe(0);
    expect(resolveContextMenuItemIndex(single, 0, -1)).toBe(0);
  });
});

describe('isInsideContextMenu', () => {
  it('null root -> false', () => {
    expect(isInsideContextMenu(null, document.body)).toBe(false);
  });

  it('null target -> false', () => {
    expect(isInsideContextMenu(document.body, null)).toBe(false);
  });

  it('non Node target -> false', () => {
    expect(isInsideContextMenu(document.body, {} as EventTarget)).toBe(false);
  });

  it('descendant target -> true', () => {
    const root = document.createElement('div');
    const child = document.createElement('span');
    root.appendChild(child);

    expect(isInsideContextMenu(root, child)).toBe(true);
  });

  it('outer target -> false', () => {
    expect(isInsideContextMenu(document.createElement('div'), document.createElement('span'))).toBe(false);
  });

  it('missing Node global -> false', () => {
    vi.stubGlobal('Node', undefined);

    expect(isInsideContextMenu(document.body, document.body)).toBe(false);
  });
});
