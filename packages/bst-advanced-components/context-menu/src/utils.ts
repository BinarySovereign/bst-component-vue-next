import type { BstContextMenuItem, BstContextMenuPosition } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES } from './constants';

export interface ClampOptions {
  x: number;
  y: number;
  menuWidth: number;
  menuHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  gap: number;
}

export interface ContextMenuOffsetOptions {
  appliedX: number;
  appliedY: number;
  actualX: number;
  actualY: number;
  width: number;
  height: number;
}

export function resolveContextMenuOffset(options: ContextMenuOffsetOptions): BstContextMenuPosition | undefined {
  const { appliedX, appliedY, actualX, actualY, width, height } = options;
  if (width <= 0 && height <= 0) return undefined;
  return { x: appliedX - actualX, y: appliedY - actualY };
}

export function toCssLength(value?: number | string): string | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? `${value}px` : undefined;
  }
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

export function isContextMenuDivider(item: BstContextMenuItem): boolean {
  return item.type === 'divider';
}

export function isContextMenuItemDisabled(item: BstContextMenuItem): boolean {
  return !isContextMenuDivider(item) && item.isDisabled === true;
}

export function isContextMenuItemActionable(item: BstContextMenuItem): boolean {
  return !isContextMenuDivider(item) && !isContextMenuItemDisabled(item);
}

export function resolveContextMenuItemIndex(items: BstContextMenuItem[], from: number, step: 1 | -1): number {
  const count = items.length;
  if (count === 0) return -1;
  const start = from < 0 || from >= count ? (step === 1 ? -1 : 0) : from;
  let cursor = start;
  for (let offset = 0; offset < count; offset += 1) {
    cursor = (cursor + step + count) % count;
    const item = items[cursor];
    if (isContextMenuItemActionable(item)) return cursor;
  }
  return -1;
}

function isValidItemKey(key: unknown): key is string | number {
  if (typeof key === 'string') return key.length > 0;
  return typeof key === 'number' && Number.isFinite(key);
}

export function normalizeContextMenuItems(items?: unknown): BstContextMenuItem[] {
  if (!Array.isArray(items)) {
    console.warn(BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES.ITEMS_INVALID);
    return [];
  }
  const seenKeys = new Set<string | number>();
  const normalized: BstContextMenuItem[] = [];
  for (const candidate of items as unknown[]) {
    const source = candidate as Partial<BstContextMenuItem> | null;
    const key = source?.key;
    if (!isValidItemKey(key)) {
      console.warn(BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES.ITEM_KEY_INVALID);
      continue;
    }
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    if (source?.type === 'divider') {
      normalized.push({ key, type: 'divider' });
      continue;
    }
    normalized.push({
      key,
      type: 'item',
      leftText: source?.leftText,
      rightText: source?.rightText,
      isDisabled: source?.isDisabled === true,
      action: source?.action,
    });
  }
  return normalized;
}

export function clampContextMenuPosition(options: ClampOptions): BstContextMenuPosition {
  const { x, y, menuWidth, menuHeight, viewportWidth, viewportHeight, gap } = options;
  const maxX = Math.max(gap, viewportWidth - menuWidth - gap);
  const maxY = Math.max(gap, viewportHeight - menuHeight - gap);
  return {
    x: Math.min(Math.max(x, gap), maxX),
    y: Math.min(Math.max(y, gap), maxY),
  };
}

export function resolveContextMenuTeleport(teleport: boolean | string): string | false {
  if (teleport === false) return false;
  if (teleport === true) return 'body';
  return teleport;
}

export function isInsideContextMenu(root: HTMLElement | null, target: EventTarget | null): boolean {
  if (!root || !target) return false;
  if (typeof Node === 'undefined') return false;
  return target instanceof Node && root.contains(target);
}

export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
