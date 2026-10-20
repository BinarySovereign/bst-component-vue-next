// BstContextMenu 工具函数：除 `isInsideContextMenu` 的 DOM 包含判定外均为纯计算
import type { BstContextMenuItem, BstContextMenuPosition } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES } from './constants';

/** 坐标夹取的输入参数 */
export interface ClampOptions {
  /** 期望的 X 轴坐标 */
  x: number;
  /** 期望的 Y 轴坐标 */
  y: number;
  /** 面板实际宽度 */
  menuWidth: number;
  /** 面板实际高度 */
  menuHeight: number;
  /** 当前视口宽度 */
  viewportWidth: number;
  /** 当前视口高度 */
  viewportHeight: number;
  /** 面板与视口的安全间距 */
  gap: number;
}

/** 包含块偏移补偿的输入参数 */
export interface ContextMenuOffsetOptions {
  /** 实际写入的 `left` 值 */
  appliedX: number;
  /** 实际写入的 `top` 值 */
  appliedY: number;
  /** 元素实际渲染的视口 X 坐标 */
  actualX: number;
  /** 元素实际渲染的视口 Y 坐标 */
  actualY: number;
  /** 元素实际宽度 */
  width: number;
  /** 元素实际高度 */
  height: number;
}

/**
 * 计算 `position: fixed` 的包含块偏移补偿。
 *
 * 祖先元素若带 `transform` / `filter` / `perspective` / `contain: paint`，
 * 它会成为 `fixed` 定位的包含块，`left` / `top` 不再相对视口生效。
 * 设实际写入值为 `applied`、实际渲染位置为 `actual`，则
 * `actual = applied + 包含块偏移`，因此补偿量 `= applied - actual`。
 *
 * 该结果代入 `left: position + 补偿` 后即可让元素落在期望的视口坐标上，
 * 且重复测量保持稳定（补偿量与前一次取值无关）。
 *
 * @param options 写入值、实际位置与元素尺寸
 * @returns 补偿量；元素无尺寸时返回 `undefined`，表示无法判定
 */
export function resolveContextMenuOffset(options: ContextMenuOffsetOptions): BstContextMenuPosition | undefined {
  const { appliedX, appliedY, actualX, actualY, width, height } = options;

  // 尺寸为 0 说明元素尚未真正参与布局（jsdom、display: none、尚未挂载），
  // 此时 getBoundingClientRect 恒为 0，直接计算会得到错误补偿
  if (width <= 0 && height <= 0) return undefined;

  return { x: appliedX - actualX, y: appliedY - actualY };
}

/**
 * 把宽度 / 最大高度转换成 CSS 长度。
 *
 * 数字补 `px`，字符串 trim 后原样返回；
 * `NaN`、负数、空串等非法值返回 `undefined`，交由样式包提供的默认值兜底。
 *
 * @param value Props 传入的数字或字符串长度
 * @returns 合法的 CSS 长度，或 `undefined`
 */
export function toCssLength(value?: number | string): string | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? `${value}px` : undefined;
  }

  const trimmed = value?.trim();

  if (!trimmed) return undefined;

  return trimmed;
}

/**
 * 判断菜单项是否为分割线。
 *
 * @param item 菜单项数据
 * @returns 是否为分割线
 */
export function isContextMenuDivider(item: BstContextMenuItem): boolean {
  return item.type === 'divider';
}

/**
 * 判断菜单项是否处于禁用态。
 *
 * 分割线不参与禁用判定，恒为 `false`。
 *
 * @param item 菜单项数据
 * @returns 是否禁用
 */
export function isContextMenuItemDisabled(item: BstContextMenuItem): boolean {
  return !isContextMenuDivider(item) && item.isDisabled === true;
}

/**
 * 查找下一个可键盘操作的菜单项下标。
 *
 * 从 `from` 出发按 `step` 前进，跳过分割线与禁用项，并在首尾之间循环；
 * `from` 为 `-1`（无高亮项）时，向下取第一项、向上取最后一项。
 *
 * @param items 菜单项列表
 * @param from 当前高亮项下标，`-1` 表示无
 * @param step 前进方向：`1` 向下、`-1` 向上
 * @returns 下一个可操作项下标；没有可操作项时返回 `-1`
 */
export function resolveContextMenuItemIndex(items: BstContextMenuItem[], from: number, step: 1 | -1): number {
  const count = items.length;

  if (count === 0) return -1;

  // 列表缩短后旧下标可能越界，按「无高亮项」重新起算
  const start = from < 0 || from >= count ? (step === 1 ? -1 : 0) : from;

  let cursor = start;

  for (let offset = 0; offset < count; offset += 1) {
    cursor = (cursor + step + count) % count;

    const item = items[cursor];

    if (!isContextMenuDivider(item) && !isContextMenuItemDisabled(item)) return cursor;
  }

  return -1;
}

/**
 * 判断菜单项 key 是否合法。
 *
 * 合法形态为非空字符串或有限数字。
 *
 * @param key 待判定的 key
 * @returns 是否合法
 */
function isValidItemKey(key: unknown): key is string | number {
  if (typeof key === 'string') return key.length > 0;

  return typeof key === 'number' && Number.isFinite(key);
}

/**
 * 归一化菜单数据。
 *
 * 规则：
 * 1. 非数组回落空数组；
 * 2. key 非法则告警并丢弃该项；
 * 3. key 重复保留首次出现项；
 * 4. type 非 `divider` 一律视为普通项；
 * 5. 分割线只保留 key，忽略文本与 action。
 *
 * @param items Props 传入的原始数据
 * @returns 可直接渲染的菜单项列表
 */
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

/**
 * 把期望坐标夹取到视口内。
 *
 * 先求允许的最大坐标（菜单大于视口时以 `gap` 兜底），再双向夹取；
 * 面板自身由样式提供 `overflow-y: auto`，因此贴边后仍可滚动。
 *
 * @param options 夹取所需的坐标、尺寸与间距
 * @returns 夹取后的坐标
 */
export function clampContextMenuPosition(options: ClampOptions): BstContextMenuPosition {
  const { x, y, menuWidth, menuHeight, viewportWidth, viewportHeight, gap } = options;

  const maxX = Math.max(gap, viewportWidth - menuWidth - gap);
  const maxY = Math.max(gap, viewportHeight - menuHeight - gap);

  return {
    x: Math.min(Math.max(x, gap), maxX),
    y: Math.min(Math.max(y, gap), maxY),
  };
}

/**
 * 把 `teleport` 归一化为 Teleport 组件的 `to` 取值。
 *
 * `true` 渲染到 `body`，`false` 原地渲染，字符串选择器原样透传。
 *
 * @param teleport Props 传入的 teleport 配置
 * @returns Teleport 目标，或 `false` 表示不启用 Teleport
 */
export function resolveContextMenuTeleport(teleport: boolean | string): string | false {
  if (teleport === false) return false;
  if (teleport === true) return 'body';

  return teleport;
}

/**
 * 判断事件目标是否位于面板内部。
 *
 * 用于外部点击与外部滚动的判定：目标不可判定时一律视为「不在内部」。
 *
 * @param root 面板根节点
 * @param target 事件目标
 * @returns 是否在面板内部
 */
export function isInsideContextMenu(root: HTMLElement | null, target: EventTarget | null): boolean {
  if (!root || !target) return false;

  // SSR 环境不存在 Node 全局对象；本函数只在浏览器事件回调中执行
  if (typeof Node === 'undefined') return false;

  return target instanceof Node && root.contains(target);
}
