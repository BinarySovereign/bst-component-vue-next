# BstContextMenu 开发计划

> 范围：`packages/bst-advanced-components/context-menu` 的核心源码。
> 类型（`packages/bst-types`）与样式（`packages/bst-styles`）已完成，本方案不再改动。
> 规范来源：`packages/bst-basic-components/template/README.md`、`packages/bst-styles/README.md`。
> 本次不含单元测试与快照测试。

---

## 目录

| 章节 | 小节 |
| --- | --- |
| [1. 文件清单](#1-文件清单) | — |
| [2. 具体文件实现方案](#2-具体文件实现方案) | [2.1 constants](#21-srcconstantsts) · [2.2 utils](#22-srcutilsts) · [2.3 prop.hooks](#23-srchooksprophooksts) · [2.4 context-menu.hooks](#24-srchookscontext-menuhooksts) · [2.5 context-menu-item.hooks](#25-srchookscontext-menu-itemhooksts) · [2.6 life.hooks](#26-srchookslifehooksts) · [2.7 controller.hooks](#27-srchookscontrollerhooksts) · [2.8 hooks/index](#28-srchooksindexts) · [2.9 context-menu-item.tsx](#29-srcelementscontext-menu-itemtsx) · [2.10 context-menu.tsx](#210-srccontext-menutsx) · [2.11 index.ts](#211-indexts) |
| [3. AI 验收标准](#3-ai-验收标准) | — |
| [4. 人工验收标准](#4-人工验收标准) | — |

---

## 1. 文件清单

| 文件 | 职责 | 直接依赖 |
| --- | --- | --- |
| `src/constants.ts` | 组件名、类名、错误文案、动画与几何常量 | — |
| `src/utils.ts` | 无副作用纯函数 | `bst-types` |
| `src/hooks/prop.hooks.ts` | 入参派生与归一化 | `utils` || `src/hooks/context-menu.hooks.ts` | 显隐状态机、位置夹取、关闭与选择链路 | `prop.hooks`、`constants`、`utils` |
| `src/hooks/context-menu-item.hooks.ts` | 单项渲染数据与交互 | `constants`、`utils` |
| `src/hooks/life.hooks.ts` | 全部生命周期、监听器增删 | — |
| `src/hooks/controller.hooks.ts` | 组装上述 hooks，输出视图所需能力 | 上述全部 |
| `src/hooks/index.ts` | 只导出 controller | — |
| `src/elements/context-menu-item.tsx` | 菜单项视图 | `context-menu-item.hooks` |
| `src/context-menu.tsx` | 根组件视图 | `controller.hooks` |
| `index.ts` | 对外导出组件与类型 | — |

```plaintext
context-menu/
├─ index.ts
└─ src/
   ├─ context-menu.tsx
   ├─ constants.ts
   ├─ utils.ts
   ├─ hooks/
   │  ├─ index.ts
   │  ├─ controller.hooks.ts
   │  ├─ prop.hooks.ts
   │  ├─ life.hooks.ts
   │  ├─ context-menu.hooks.ts
   │  └─ context-menu-item.hooks.ts
   └─ elements/
      └─ context-menu-item.tsx
```

---

## 2. 具体文件实现方案

每个文件按「实现基础 → 实现原理 → 实现方式 → 示例代码」四段组织，顺序与第 1 节清单一致。

| 代码文件 | 使用类型 |
| --- | --- |
| `src/constants.ts` | `BstContextMenuItem`（另含 `PropType`） |
| `src/utils.ts` | `BstContextMenuItem`、`BstContextMenuPosition` |
| `src/hooks/prop.hooks.ts` | `BstContextMenuProps`、`BstContextMenuItem`、`BstContextMenuPosition` |
| `src/hooks/context-menu.hooks.ts` | `BstContextMenuProps`、`BstContextMenuItem`、`BstContextMenuPosition`、`BstContextMenuItemSelectContext` |
| `src/hooks/context-menu-item.hooks.ts` | `BstContextMenuItem` |
| `src/hooks/life.hooks.ts` | `BstContextMenuProps` |
| `src/hooks/controller.hooks.ts` | `BstContextMenuProps`、`BstContextMenuItem` |
| `src/hooks/index.ts` | 无（仅 re-export） |
| `src/elements/context-menu-item.tsx` | `BstContextMenuItem` |
| `src/context-menu.tsx` | `BstContextMenuProps`、`BstContextMenuEmits` |
| `index.ts` | `BstContextMenuProps`、`BstContextMenuEmits`、`BstContextMenuSlots`、`BstContextMenuExpose`、`BstContextMenuItem`、`BstContextMenuItemType`、`BstContextMenuItemSelectContext`、`BstContextMenuClickOutsideContext`、`BstContextMenuScrollOutsideContext`、`BstContextMenuEscKeyDownContext`、`BstContextMenuPosition` |

### 2.1 `src/constants.ts`

#### 实现基础

| 项 | 内容 |
| --- | --- |
| 规范 | `template/README.md`：前缀 `BST_{COMPONENT}_CONSTANT_`，必备「组件标识」「错误提示」两组 |
| 类名来源 | 样式包 `web/advanced-components/context-menu/` 的 8 个类名 |
| 数值来源 | `@anim-duration-base`（0.2s）、`@context-menu-viewport-gap`（`@pop-padding-l` = 8px） |
| 依赖 | 无 |
| 消费方 | 全部 hooks（文案与常量）、两个视图文件（类名） |

#### 实现原理

| 原理 | 说明 |
| --- | --- |
| 类名单点定义 | 样式包是唯一视觉来源，组件只负责挂类名；集中后样式侧改名只需改一处 |
| `as const` | 保留字面量类型，避免宽化为 `string` |
| 常量取代魔法值 | 动画时长与视口间距在 Less 侧已有令牌，集中此处便于逐条对照 |
| 文案集中 | `prop.hooks` 的 validator 与 `utils` 的归一化共用同一套告警文案 |
| props 分工 | 每个组件的 props 声明与其实现文件同处：根组件在 `prop.hooks.ts`，子元素在 `context-menu-item.tsx` |
| 无循环依赖 | 本文件不引用 `hooks`，也不声明任何 props |

#### 实现方式

| 规则 | 说明 |
| --- | --- |
| 前缀 | 全部以 `BST_CONTEXT_MENU_CONSTANT_` 开头 |
| 必备两组 | `..._COMPONENT_NAMES`、`..._ERROR_MESSAGES` |
| 类名表 | `..._CLASS_NAMES` 覆盖 8 个类名，含 3 个状态类 |
| 数值常量 | 动画 200 / 兜底缓冲 60 / 视口间距 8 / `Escape` / 默认坐标 |
| 根组件 props | 不属本文件，见 §2.3 `prop.hooks.ts` 的 `contextMenuProps` |
| 子元素 props | 不属本文件，见 §2.9 `context-menu-item.tsx` 的 `contextMenuItemProps` |
| 提示格式 | 每条固定以 `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}]` 开头，后接英文提示 |
| 提示覆盖 | 与 `BstContextMenuProps` 的 15 项入参一一对应；另加 1 条 `items` 内部的 `key` 校验 |
| 边界 | 不放派生值与单文件专用常量 |

| 提示键 | 对应入参 |
| --- | --- |
| `IS_VISIBLE_INVALID` | `isVisible` |
| `ITEMS_INVALID` | `items` |
| `ITEM_KEY_INVALID` | `items[].key`（`items` 内部字段） |
| `POSITION_INVALID` | `position` |
| `IS_CLOSE_ON_OUTSIDE_CLICK_INVALID` | `isCloseOnOutsideClick` |
| `IS_CLOSE_ON_OUTSIDE_SCROLL_INVALID` | `isCloseOnOutsideScroll` |
| `IS_CLOSE_ON_ESC_KEY_DOWN_INVALID` | `isCloseOnEscKeyDown` |
| `MAX_HEIGHT_INVALID` | `maxHeight` |
| `TELEPORT_INVALID` | `teleport` |
| `ON_ITEM_SELECT_INVALID` | `onItemSelect` |
| `ON_CLICK_OUTSIDE_INVALID` | `onClickOutside` |
| `ON_SCROLL_OUTSIDE_INVALID` | `onScrollOutside` |
| `ON_ESC_KEY_DOWN_INVALID` | `onEscKeyDown` |
| `ON_AFTER_ENTER_INVALID` | `onAfterEnter` |
| `ON_AFTER_LEAVE_INVALID` | `onAfterLeave` |

#### 示例代码

```ts
export const BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES = {
  ROOT: 'BstContextMenu',
  ITEM: 'BstContextMenuItem',
} as const;

export const BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES = {
  ROOT: 'bst-context-menu',
  ROOT_IS_OPEN: 'bst-context-menu-is-open',
  ROOT_IS_CLOSING: 'bst-context-menu-is-closing',
  ITEM: 'bst-context-menu-item',
  ITEM_LEFT_TEXT: 'bst-context-menu-item-left-text',
  ITEM_RIGHT_TEXT: 'bst-context-menu-item-right-text',
  ITEM_IS_DIVIDER: 'bst-context-menu-item-is-divider',
  ITEM_IS_DISABLED: 'bst-context-menu-item-is-disabled',
  ITEM_IS_ACTIVE: 'bst-context-menu-item-is-active',
} as const;

/** 告警前缀：`[BstContextMenu]` */
const ROOT_TAG = `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}]`;

/**
 * 校验告警文案
 *
 * 格式：`[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}]` + 英文提示
 * 覆盖：`BstContextMenuProps` 的全部 14 项入参 + `items[].key`
 */
export const BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES = {
  IS_VISIBLE_INVALID: `${ROOT_TAG} "isVisible" must be a boolean.`,
  ITEMS_INVALID: `${ROOT_TAG} "items" must be an array of BstContextMenuItem.`,
  ITEM_KEY_INVALID: `${ROOT_TAG} "items[].key" must be a string or a number; the item has been ignored.`,
  POSITION_INVALID: `${ROOT_TAG} "position" must be an object with numeric "x" and "y".`,
  IS_CLOSE_ON_OUTSIDE_CLICK_INVALID: `${ROOT_TAG} "isCloseOnOutsideClick" must be a boolean.`,
  IS_CLOSE_ON_OUTSIDE_SCROLL_INVALID: `${ROOT_TAG} "isCloseOnOutsideScroll" must be a boolean.`,
  IS_CLOSE_ON_ESC_KEY_DOWN_INVALID: `${ROOT_TAG} "isCloseOnEscKeyDown" must be a boolean.`,
  MAX_HEIGHT_INVALID: `${ROOT_TAG} "maxHeight" must be a number or a CSS length string.`,
  TELEPORT_INVALID: `${ROOT_TAG} "teleport" must be a boolean or a selector string.`,
  ON_ITEM_SELECT_INVALID: `${ROOT_TAG} "onItemSelect" must be a function.`,
  ON_CLICK_OUTSIDE_INVALID: `${ROOT_TAG} "onClickOutside" must be a function.`,
  ON_SCROLL_OUTSIDE_INVALID: `${ROOT_TAG} "onScrollOutside" must be a function.`,
  ON_ESC_KEY_DOWN_INVALID: `${ROOT_TAG} "onEscKeyDown" must be a function.`,
  ON_AFTER_ENTER_INVALID: `${ROOT_TAG} "onAfterEnter" must be a function.`,
  ON_AFTER_LEAVE_INVALID: `${ROOT_TAG} "onAfterLeave" must be a function.`,
} as const;

/** 入场/出场动画时长（对应 `@anim-duration-base`：0.2s） */
export const BST_CONTEXT_MENU_CONSTANT_ANIMATION_DURATION = 200;

/** 兜底定时器额外缓冲，吸收定时器与动画帧的偏差 */
export const BST_CONTEXT_MENU_CONSTANT_ANIMATION_FALLBACK_BUFFER = 60;

/** 面板与视口的安全间距（对应 `@context-menu-viewport-gap`） */
export const BST_CONTEXT_MENU_CONSTANT_VIEWPORT_GAP = 8;

export const BST_CONTEXT_MENU_CONSTANT_KEY_ESCAPE = 'Escape';

export const BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION = { x: 0, y: 0 } as const;
```

### 2.2 `src/utils.ts`

#### 实现基础

| 项 | 内容 |
| --- | --- |
| 输入类型 | `BstContextMenuItem`、`BstContextMenuPosition`（来自 `bst-types`） |
| 依赖 | 仅 `bst-types` |
| 消费方 | `prop.hooks`（归一化、长度转换）、`context-menu.hooks`（夹取、命中判定）、`context-menu-item.hooks`（分割/禁用判定） |
| 约束 | 无副作用；除 `isInsideContextMenu` 的 `contains` 外不接触 DOM |

#### 实现原理

| 原理 | 说明 |
| --- | --- |
| 纯函数优先 | 逻辑可独立调用与验证，不依赖组件实例 |
| 夹取算法 | 先求允许的最大坐标，`max(gap)` 兜底菜单大于视口的情形，再 `min(max())` 双向夹取 |
| key 去重 | `Set` 记录已出现 key，O(n) 完成，保留首次出现项 |
| 长度双形态 | `number` 补 `px`，`string` trim 后原样，非法值返回 `undefined` 交回样式包默认值 |

#### 实现方式

| 函数 | 签名 | 行为 |
| --- | --- | --- |
| `toCssLength` | `(value?: number \| string) => string \| undefined` | `number → 'Npx'`；`NaN` / 负数 / 空串 → `undefined` |
| `normalizeContextMenuItems` | `(items?: unknown) => BstContextMenuItem[]` | 清洗 + 按 `key` 去重 |
| `isContextMenuDivider` | `(item: BstContextMenuItem) => boolean` | `type === 'divider'` |
| `isContextMenuItemDisabled` | `(item: BstContextMenuItem) => boolean` | 分割线恒 `false`，其余取 `isDisabled === true` |
| `clampContextMenuPosition` | `(options: ClampOptions) => BstContextMenuPosition` | 视口内坐标夹取 |
| `resolveContextMenuTeleport` | `(teleport: boolean \| string) => string \| false` | `true → 'body'`、`false → false`、`string` 原样 |
| `isInsideContextMenu` | `(root: HTMLElement \| null, target: EventTarget \| null) => boolean` | `root` 为空或 `target` 非 `Node` → `false` |

| 归一化规则 | 处理 |
| --- | --- |
| `items` 非数组 | `console.warn(ITEMS_INVALID)`，回落 `[]` |
| `key` 为空串或非 `string \| number` | `console.warn(ITEM_KEY_INVALID)` 并丢弃 |
| `key` 重复 | 保留首次出现项，后续丢弃 |
| `type` 非 `'item' \| 'divider'` | 视为 `'item'` |
| `divider` 带文本或 `action` | 只保留分割线语义，忽略文本与 `action` |

#### 示例代码

```ts
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

export function toCssLength(value?: number | string): string | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? `${value}px` : undefined;
  }

  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

export function isContextMenuDivider(item: BstContextMenuItem): boolean {
  return item.type === 'divider';
}

export function isContextMenuItemDisabled(item: BstContextMenuItem): boolean {
  return !isContextMenuDivider(item) && item.isDisabled === true;
}

export function normalizeContextMenuItems(items?: unknown): BstContextMenuItem[] {
  if (!Array.isArray(items)) {
    console.warn(BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES.ITEMS_INVALID);

    return [];
  }

  const seen = new Set<string | number>();
  const result: BstContextMenuItem[] = [];

  for (const raw of items as BstContextMenuItem[]) {
    const key = raw?.key;

    if (typeof key !== 'string' && typeof key !== 'number') {
      console.warn(BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES.ITEM_KEY_INVALID);
      continue;
    }

    if (seen.has(key)) continue;

    seen.add(key);

    const isDivider = raw.type === 'divider';

    result.push(
      isDivider
        ? { key, type: 'divider' }
        : {
            key,
            type: 'item',
            leftText: raw.leftText,
            rightText: raw.rightText,
            isDisabled: raw.isDisabled === true,
            action: raw.action,
          },
    );
  }

  return result;
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
  if (!root || !(target instanceof Node)) return false;

  return root.contains(target);
}
```

### 2.3 `src/hooks/prop.hooks.ts`

#### 实现基础

| 项 | 内容 |
| --- | --- |
| 输入 | `BstContextMenuProps` 全部 15 项（9 个数据项 + 6 个 `on*` 监听器） |
| 依赖 | `constants`（告警文案、默认坐标）、`utils`（归一化、长度转换、Teleport 归一化） |
| 输出 | 运行时 props 声明、归一化列表、内联长度、Teleport 目标 |
| 消费方 | `context-menu.tsx`（引用 `contextMenuProps`）、`controller.hooks` |

#### 实现原理

| 原理 | 说明 |
| --- | --- |
| 声明与派生同文件 | props 声明与其入参清洗同处一个文件，读实现时无需跨文件跳转 |
| 全量声明 | 15 项全部声明为运行时 props，每项都有对应 validator，保证 `ERROR_MESSAGES` 无未使用的键 |
| `on*` 与 `emits` 共存 | 监听器声明为 props 后由 Vue 从 `vnode.props` 读取；`emit()` 同样读 `vnode.props`，因此既能被校验又仍能正常派发 |
| 统一 validator 工厂 | `createValidator(message, isValid)` 统一「放行 `undefined` → 不合法则 `console.warn` → 返回 `false`」的流程 |
| 工厂默认值 | 数组 / 对象默认值必须用函数，避免实例间共享同一引用 |
| `computed` 缓存 | 归一化只在 `items` 变化时重算，避免每次渲染都去重 |
| 长度双形态 | 统一经 `toCssLength`；未传返回 `undefined`，交由样式包的默认宽高兜底 |
| 校验不外溢 | 告警只在本文件发出，其他 hooks 不重复校验 |

#### 实现方式

| prop | 类型 | 默认值 | validator 判定 | 告警文案 |
| --- | --- | --- | --- | --- |
| `isVisible` | `Boolean` | `false` | `typeof === 'boolean'` | `IS_VISIBLE_INVALID` |
| `items` | `Array` | `() => []` | `Array.isArray` | `ITEMS_INVALID` |
| `position` | `Object` | `() => ({ x: 0, y: 0 })` | `x` / `y` 均为有限数字 | `POSITION_INVALID` |
| `isCloseOnOutsideClick` | `Boolean` | `true` | `typeof === 'boolean'` | `IS_CLOSE_ON_OUTSIDE_CLICK_INVALID` |
| `isCloseOnOutsideScroll` | `Boolean` | `true` | `typeof === 'boolean'` | `IS_CLOSE_ON_OUTSIDE_SCROLL_INVALID` |
| `isCloseOnEscKeyDown` | `Boolean` | `true` | `typeof === 'boolean'` | `IS_CLOSE_ON_ESC_KEY_DOWN_INVALID` |
| `maxHeight` | `[Number, String]` | `undefined` | `toCssLength` 非 `undefined` | `MAX_HEIGHT_INVALID` |
| `teleport` | `[Boolean, String]` | `true` | `boolean` 或非空字符串 | `TELEPORT_INVALID` |
| `onItemSelect` | `Function` | `undefined` | `typeof === 'function'` | `ON_ITEM_SELECT_INVALID` |
| `onClickOutside` | `Function` | `undefined` | `typeof === 'function'` | `ON_CLICK_OUTSIDE_INVALID` |
| `onScrollOutside` | `Function` | `undefined` | `typeof === 'function'` | `ON_SCROLL_OUTSIDE_INVALID` |
| `onEscKeyDown` | `Function` | `undefined` | `typeof === 'function'` | `ON_ESC_KEY_DOWN_INVALID` |
| `onAfterEnter` | `Function` | `undefined` | `typeof === 'function'` | `ON_AFTER_ENTER_INVALID` |
| `onAfterLeave` | `Function` | `undefined` | `typeof === 'function'` | `ON_AFTER_LEAVE_INVALID` |

| 边界 | 规则 |
| --- | --- |
| 不持有 | 显隐状态、事件逻辑、坐标计算 |
| 不声明 | 任何 `update:xxx` 监听器（不是 prop） |
| 返回 | 一律为 `ComputedRef`，供 controller 转发 |
| `items` 内部 | 单个项的 `key` 校验由 `utils` 完成，使用 `ITEM_KEY_INVALID` |
| Teleport 兜底 | 选择器未命中时回落 `body`；SSR 环境（无 `document`）直接透传选择器 |

#### 示例代码

```ts
import { computed } from 'vue';
import type { ComputedRef, PropType } from 'vue';
import type {
  BstContextMenuItem,
  BstContextMenuPosition,
  BstContextMenuProps,
} from '@binarysovereign/bst-types';

import {
  BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION,
  BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES,
} from '../constants';
import { normalizeContextMenuItems, resolveContextMenuTeleport, toCssLength } from '../utils';

const MESSAGES = BST_CONTEXT_MENU_CONSTANT_ERROR_MESSAGES;

/** 单个入参的合法性判定 */
type PropValueValidator = (value: unknown) => boolean;

/** Props 运行期校验结果 */
export interface UseContextMenuPropReturn {
  normalizedItems: ComputedRef<BstContextMenuItem[]>;
  maxHeightStyle: ComputedRef<string | undefined>;
  teleportTarget: ComputedRef<string | false>;
}

/** 校验失败时输出告警并返回 false，供 Vue validator 使用 */
function createValidator(message: string, isValid: PropValueValidator): PropValueValidator {
  return (value: unknown): boolean => {
    if (value === undefined || isValid(value)) return true;

    console.warn(message);

    return false;
  };
}

/** 布尔值判定 */
function isBoolean(value: unknown): boolean {
  return typeof value === 'boolean';
}

/** 函数判定 */
function isFunction(value: unknown): boolean {
  return typeof value === 'function';
}

/** 坐标对象判定：x / y 均为有限数字 */
function isPosition(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;

  const { x, y } = value as BstContextMenuPosition;

  return Number.isFinite(x) && Number.isFinite(y);
}

/** CSS 长度判定 */
function isCssLength(value: unknown): boolean {
  return toCssLength(value as number | string) !== undefined;
}

/** teleport 判定：布尔值或非空选择器 */
function isTeleport(value: unknown): boolean {
  if (typeof value === 'boolean') return true;

  return typeof value === 'string' && value.trim().length > 0;
}

/** BstContextMenu 运行时 props 声明：15 项入参，每项带 validator */
export const contextMenuProps = {
  isVisible: { type: Boolean, default: false, validator: createValidator(MESSAGES.IS_VISIBLE_INVALID, isBoolean) },
  items: {
    type: Array as PropType<BstContextMenuItem[]>,
    default: (): BstContextMenuItem[] => [],
    validator: createValidator(MESSAGES.ITEMS_INVALID, Array.isArray),
  },
  position: {
    type: Object as PropType<BstContextMenuPosition>,
    default: (): BstContextMenuPosition => ({
      x: BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION.x,
      y: BST_CONTEXT_MENU_CONSTANT_DEFAULT_POSITION.y,
    }),
    validator: createValidator(MESSAGES.POSITION_INVALID, isPosition),
  },
  isCloseOnOutsideClick: {
    type: Boolean,
    default: true,
    validator: createValidator(MESSAGES.IS_CLOSE_ON_OUTSIDE_CLICK_INVALID, isBoolean),
  },
  isCloseOnOutsideScroll: {
    type: Boolean,
    default: true,
    validator: createValidator(MESSAGES.IS_CLOSE_ON_OUTSIDE_SCROLL_INVALID, isBoolean),
  },
  isCloseOnEscKeyDown: {
    type: Boolean,
    default: true,
    validator: createValidator(MESSAGES.IS_CLOSE_ON_ESC_KEY_DOWN_INVALID, isBoolean),
  },
  maxHeight: {
    type: [Number, String] as PropType<number | string>,
    default: undefined,
    validator: createValidator(MESSAGES.MAX_HEIGHT_INVALID, isCssLength),
  },
  teleport: {
    type: [Boolean, String] as PropType<boolean | string>,
    default: true,
    validator: createValidator(MESSAGES.TELEPORT_INVALID, isTeleport),
  },
  onItemSelect: {
    type: Function as PropType<BstContextMenuProps['onItemSelect']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_ITEM_SELECT_INVALID, isFunction),
  },
  onClickOutside: {
    type: Function as PropType<BstContextMenuProps['onClickOutside']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_CLICK_OUTSIDE_INVALID, isFunction),
  },
  onScrollOutside: {
    type: Function as PropType<BstContextMenuProps['onScrollOutside']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_SCROLL_OUTSIDE_INVALID, isFunction),
  },
  onEscKeyDown: {
    type: Function as PropType<BstContextMenuProps['onEscKeyDown']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_ESC_KEY_DOWN_INVALID, isFunction),
  },
  onAfterEnter: {
    type: Function as PropType<BstContextMenuProps['onAfterEnter']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_AFTER_ENTER_INVALID, isFunction),
  },
  onAfterLeave: {
    type: Function as PropType<BstContextMenuProps['onAfterLeave']>,
    default: undefined,
    validator: createValidator(MESSAGES.ON_AFTER_LEAVE_INVALID, isFunction),
  },
} as const;

/** 解析 Teleport 目标，选择器未命中或非法时回落 body */
function resolveTeleportTarget(teleport: boolean | string): string | false {
  const target = resolveContextMenuTeleport(teleport);

  if (typeof target !== 'string') return target;

  try {
    return document.querySelector(target) ? target : 'body';
  } catch {
    return 'body';
  }
}

/**
 * 处理 Props 的归一化与派生值。
 *
 * @param props 组件入参
 * @returns 归一化列表与内联样式量
 */
export function useContextMenuProp(props: BstContextMenuProps): UseContextMenuPropReturn {
  const normalizedItems = computed((): BstContextMenuItem[] => normalizeContextMenuItems(props.items));

  const maxHeightStyle = computed((): string | undefined => toCssLength(props.maxHeight));

  const teleportTarget = computed((): string | false => resolveTeleportTarget(props.teleport ?? true));

  return { normalizedItems, maxHeightStyle, teleportTarget };
}
```

### 2.4 `src/hooks/context-menu.hooks.ts`

#### 实现基础

| 项 | 内容 |
| --- | --- |
| 输入 | `props`、`emit`、`items`、`maxHeightStyle` |
| 依赖 | `constants`、`utils` |
| 输出 | 状态、坐标、根节点样式与类名、键盘高亮与事件方法 |
| 消费方 | `controller.hooks` |
| 约束 | 不写 `watch` / `onMounted` / `onUnmounted`（归 `life.hooks`） |

#### 实现原理

| 原理 | 说明 |
| --- | --- |
| 三层状态分离 | `props.isVisible` 是受控值，`innerVisible` 是内部真值，`phase` 决定渲染与动画类；`isVisible` 为 `undefined` 时视为 `false` |
| 状态机驱动渲染 | 只有 `phase !== 'idle'` 才渲染；`closing` 期间保留节点以播完出场动画 |
| 首帧防闪烁 | `isMeasuring` 期间内联 `visibility: hidden`，`nextTick` 测量并夹取后再显示 |
| 动画双路径收尾 | 样式在 `prefers-reduced-motion` 下把 `animation` 置 `none`，`animationend` 永不触发，必须有兜底定时器 |
| 选择链路 | 先 `emit('item-select')` 再执行 `action`，`hide()` 放 `finally` 保证一定关闭 |
| 键盘导航 | 菜单项不进入 Tab 序列；`ArrowUp` / `ArrowDown` 在可操作项间循环移动高亮，`Enter` / 空格选中高亮项 |
| 关闭触发统一收敛 | 三个监听回调均先判开关，再 `emit` 对应事件并 `hide()` |
| 定位归组件 | 样式包不提供 `position` / `left` / `top`，由 `rootStyle` 内联 `position: fixed` 与坐标 |

| 当前 | 触发 | 下一状态 | 副作用 |
| --- | --- | --- | --- |
| `idle` | `show(x?, y?)` | `opening` | 写入坐标、`isMeasuring = true` |
| `opening` | `animationend` / 兜底定时器 | `open` | 清除 `isMeasuring`、`emit('after-enter')` |
| `open` | `hide()` | `closing` | 挂 `-is-closing`、启动兜底定时器 |
| `closing` | `animationend` / 兜底定时器 | `idle` | 卸载节点、`emit('after-leave')` |
| `closing` | `hide()` | `closing` | 幂等返回 |

#### 实现方式

| 成员 | 行为 |
| --- | --- |
| `show(x?, y?)` | `x` / `y` 有值先更新 `position`，再置 `innerVisible = true` |
| `hide()` | 已隐藏时返回，否则置 `innerVisible = false`；`closing` 幂等由 `applyVisible` 保证 |
| `applyVisible(next)` | 状态机入口，由 `life.hooks` 的 `innerVisible` watch 调用：转 `opening` / `closing` 并启动兜底定时器 |
| `cleanup()` | 清理兜底定时器，供 `onUnmounted` 调用 |
| `measureAndClamp()` | `nextTick` → 读尺寸 → `clampContextMenuPosition` → 夹取有变则 `emit('update:position')` → 清除 `isMeasuring` |
| `handleAnimationEnd(e)` | 校验 `e.target === rootRef` 后调 `finish()` |
| `finish()` | 幂等收尾：清定时器，按 `phase` 转 `open` / `idle` 并 `emit` 对应事件 |
| `handleItemSelect(item, index, e)` | 跳过分割线 / 禁用项 → `emit` → `try/finally` 执行 `action` 与 `hide()` |
| `activeIndex` | 键盘高亮项下标，`-1` 表示无；每次重新打开与列表变化时重置 |
| `handleKeyDown(e)` | `Escape` 关闭；`ArrowUp` / `ArrowDown` 调用 `resolveContextMenuItemIndex` 循环切换高亮；`Enter` / 空格且有高亮项时选中 |
| `handleItemHover(index)` | 鼠标移入普通项时同步高亮，分割线与禁用项忽略 |
| `resetActiveIndex()` | 清空键盘高亮，由 `life.hooks` 在列表变化时调用 |
| `handleOutsideClick(e)` | 开关开启且 `!isInsideContextMenu` → `emit('click-outside', { nativeEvent })` + `hide()` |
| `handleOutsideScroll(e)` | 开关开启且目标在面板外 → `emit('scroll-outside', { nativeEvent })` + `hide()` |
| `rootClass` | 按 `phase` 组合 `ROOT` / `ROOT_IS_OPEN` / `ROOT_IS_CLOSING` |
| `rootStyle` | `position: fixed` + `left` / `top` + 可选 `maxHeight` + `visibility` |

#### 示例代码

```ts
export type ContextMenuPhase = 'idle' | 'opening' | 'open' | 'closing';

const FALLBACK_DELAY =
  BST_CONTEXT_MENU_CONSTANT_ANIMATION_DURATION +
  BST_CONTEXT_MENU_CONSTANT_ANIMATION_FALLBACK_BUFFER;

export function useContextMenu(options: {
  props: BstContextMenuProps;
  emit: ContextMenuEmit;
  maxHeightStyle: ComputedRef<string | undefined>;
}): UseContextMenuReturn {
  const { props, emit, maxHeightStyle } = options;

  const phase = ref<ContextMenuPhase>('idle');
  const innerVisible = ref(props.isVisible ?? false);
  const isMeasuring = ref(false);
  const position = ref<BstContextMenuPosition>({ ...props.position });
  const rootRef = ref<HTMLElement | null>(null);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let isFinished = false;

  const isActive = computed(() => phase.value !== 'idle');

  function finish(): void {
    if (isFinished) return;

    isFinished = true;
    cleanup();
    isMeasuring.value = false;

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
    clearTimeout(timer);
    timer = undefined;
  }

  function startFallback(): void {
    isFinished = false;
    cleanup();
    timer = setTimeout(finish, FALLBACK_DELAY);
  }

  /** 状态机入口：由 life.hooks 对 innerVisible 的 watch 驱动 */
  function applyVisible(next: boolean): void {
    if (next) {
      if (phase.value === 'opening' || phase.value === 'open') return;

      phase.value = 'opening';
      isMeasuring.value = true;
      startFallback();
      void measureAndClamp();

      return;
    }

    if (phase.value === 'idle' || phase.value === 'closing') return;

    phase.value = 'closing';
    startFallback();
  }

  function show(x?: number, y?: number): void {
    if (x !== undefined && y !== undefined) position.value = { x, y };
    innerVisible.value = true;
  }

  function hide(): void {
    if (!innerVisible.value) return;

    innerVisible.value = false;
  }

  async function measureAndClamp(): Promise<void> {
    await nextTick();

    const el = rootRef.value;

    if (!el) {
      isMeasuring.value = false;

      return;
    }

    const clamped = clampContextMenuPosition({
      x: position.value.x,
      y: position.value.y,
      menuWidth: el.offsetWidth,
      menuHeight: el.offsetHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      gap: BST_CONTEXT_MENU_CONSTANT_VIEWPORT_GAP,
    });

    if (clamped.x !== position.value.x || clamped.y !== position.value.y) {
      position.value = clamped;
      emit('update:position', clamped);
    }

    isMeasuring.value = false;
  }

  function handleAnimationEnd(event: AnimationEvent): void {
    if (event.target !== rootRef.value) return;

    finish();
  }

  function handleItemSelect(
    item: BstContextMenuItem,
    index: number,
    nativeEvent: MouseEvent | KeyboardEvent,
  ): void {
    if (isContextMenuDivider(item) || isContextMenuItemDisabled(item)) return;

    const context = { item, index, nativeEvent };

    emit('item-select', context);

    try {
      item.action?.(context);
    } finally {
      hide();
    }
  }

  function handleOutsideClick(event: MouseEvent): void {
    if (props.isCloseOnOutsideClick === false) return;
    if (isInsideContextMenu(rootRef.value, event.target)) return;

    emit('click-outside', { nativeEvent: event });
    hide();
  }

  function handleOutsideScroll(event: Event): void {
    if (props.isCloseOnOutsideScroll === false) return;
    if (isInsideContextMenu(rootRef.value, event.target)) return;

    emit('scroll-outside', { nativeEvent: event });
    hide();
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === BST_CONTEXT_MENU_CONSTANT_KEY_ESCAPE) {
      if (props.isCloseOnEscKeyDown === false) return;

      emit('esc-key-down', { nativeEvent: event });
      hide();
      return;
    }

    if (event.key === BST_CONTEXT_MENU_CONSTANT_KEY_ARROW_DOWN) {
      event.preventDefault();
      moveActive(1);
      return;
    }

    if (event.key === BST_CONTEXT_MENU_CONSTANT_KEY_ARROW_UP) {
      event.preventDefault();
      moveActive(-1);
      return;
    }

    if (event.key !== BST_CONTEXT_MENU_CONSTANT_KEY_ENTER && event.key !== BST_CONTEXT_MENU_CONSTANT_KEY_SPACE) return;

    const item = items.value[activeIndex.value];

    if (!item) return;

    event.preventDefault();
    handleItemSelect(item, activeIndex.value, event);
  }

  const rootClass = computed(() => {
    const names = [BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT];

    if (phase.value === 'opening') names.push(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT_IS_OPEN);
    if (phase.value === 'closing') names.push(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ROOT_IS_CLOSING);

    return names;
  });

  const rootStyle = computed<CSSProperties>(() => ({
    position: 'fixed',
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    maxHeight: maxHeightStyle.value,
    visibility: isMeasuring.value ? 'hidden' : undefined,
  }));

  return {
    phase,
    innerVisible,
    isActive,
    isMeasuring,
    position,
    rootRef,
    rootClass,
    rootStyle,
    show,
    hide,
    applyVisible,
    cleanup,
    measureAndClamp,
    handleAnimationEnd,
    handleItemSelect,
    handleItemHover,
    resetActiveIndex,
    handleOutsideClick,
    handleOutsideScroll,
    handleKeyDown,
  };
}
```

### 2.5 `src/hooks/context-menu-item.hooks.ts`

#### 实现基础

| 项 | 内容 |
| --- | --- |
| 输入 | `item`、`index`、`isActive`、`onSelect`、`onHover` |
| 依赖 | `constants`（类名）、`utils`（分割 / 禁用判定） |
| 输出 | 类名、无障碍属性、点击与鼠标移入处理函数 |
| 消费方 | `elements/context-menu-item.tsx` |

#### 实现原理

| 原理 | 说明 |
| --- | --- |
| 单一职责 | 只回答「这一项怎么渲染、怎么交互」，不知道菜单开关 |
| 类名与属性分离 | `itemClass` 负责视觉状态类，`itemAttrs` 负责 `role` / `aria-*` |
| 状态类同节点 | `ITEM_IS_DIVIDER` / `ITEM_IS_DISABLED` / `ITEM_IS_ACTIVE` 是 `&.` 复合选择器，必须与 `ITEM` 写在同一节点 |
| 键鼠同入口 | 点击与鼠标移入均以分割线 / 禁用项为拦截边界，高亮同步共用同一份判定 |

#### 实现方式

| 输出 | 内容 |
| --- | --- |
| `isDivider` | `isContextMenuDivider(item)` |
| `isDisabled` | `isContextMenuItemDisabled(item)` |
| `itemClass` | `[ITEM]` + 条件追加 `ITEM_IS_DIVIDER` / `ITEM_IS_DISABLED` / `ITEM_IS_ACTIVE` |
| `itemAttrs`（普通项） | `role="menuitem"`（不进入 Tab 序列） |
| `itemAttrs`（禁用项） | `role="menuitem"`、`aria-disabled="true"` |
| `itemAttrs`（分割线） | `role="separator"`、`aria-hidden="true"` |
| `handleClick` | 调 `onSelect(item, index, event)` |
| `handleMouseenter` | 普通项调 `onHover(index)`，同步键盘高亮 |
| 边界 | 分割线与禁用项不调用 `onSelect` / `onHover` |

#### 示例代码

```ts
export interface UseContextMenuItemOptions {
  item: BstContextMenuItem;
  index: number;
  isActive: Ref<boolean>;
  onSelect: (item: BstContextMenuItem, index: number, nativeEvent: MouseEvent | KeyboardEvent) => void;
  onHover: (index: number) => void;
}

export interface UseContextMenuItemReturn {
  isDivider: ComputedRef<boolean>;
  isDisabled: ComputedRef<boolean>;
  itemClass: ComputedRef<string[]>;
  itemAttrs: ComputedRef<Record<string, unknown>>;
  handleClick: (event: MouseEvent) => void;
  handleMouseenter: () => void;
}

export function useContextMenuItem(options: UseContextMenuItemOptions): UseContextMenuItemReturn {
  const { item, index, isActive, onSelect, onHover } = options;

  const isDivider = computed(() => isContextMenuDivider(item));
  const isDisabled = computed(() => isContextMenuItemDisabled(item));

  const itemClass = computed(() => {
    const names = [BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM];

    if (isDivider.value) names.push(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_DIVIDER);
    if (isDisabled.value) names.push(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_DISABLED);
    if (isActive.value && !isDivider.value && !isDisabled.value) {
      names.push(BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_IS_ACTIVE);
    }

    return names;
  });

  const itemAttrs = computed<Record<string, unknown>>(() => {
    if (isDivider.value) return { role: 'separator', 'aria-hidden': 'true' };
    if (isDisabled.value) return { role: 'menuitem', 'aria-disabled': 'true' };

    return { role: 'menuitem' };
  });

  function handleClick(nativeEvent: MouseEvent): void {
    if (isDivider.value || isDisabled.value) return;

    onSelect(item, index, nativeEvent);
  }

  function handleMouseenter(): void {
    if (isDivider.value || isDisabled.value) return;

    onHover(index);
  }

  return { isDivider, isDisabled, itemClass, itemAttrs, handleClick, handleMouseenter };
}
```

### 2.6 `src/hooks/life.hooks.ts`

#### 实现基础

| 项 | 内容 |
| --- | --- |
| 输入 | `isActive`、`innerVisible`、`props`、`rootRef`、六个回调 |
| 依赖 | `vue` 的 `watch` / `nextTick` / `onUnmounted` |
| 输出 | 无（只产生副作用） |
| 消费方 | `controller.hooks` |

#### 实现原理

| 原理 | 说明 |
| --- | --- |
| 生命周期唯一归属 | 规范要求全部 `watch` / `onMounted` / `onUnmounted` 收拢在本文件，其他 hooks 禁止出现 |
| 只在可见期挂载监听 | 避免常驻监听与内存泄漏；卸载时无条件清理 |
| 用 `mousedown` 而非 `click` | `click` 在 `mouseup` 后，触发元素被菜单遮挡时会出现「打开即关闭」 |
| `nextTick` 后挂载 | 规避触发元素自身这一次 `mousedown` 立刻关闭菜单 |
| 滚动挂 `window` + `capture` | `scroll` 不冒泡，挂 `document` 收不到 |

#### 实现方式

| 生命周期 | 内容 |
| --- | --- |
| `watch(isActive)` | 变为 `true` → `nextTick` 后挂三组监听；变为 `false` → 全部移除 |
| `watch(props.isVisible)` | 调 `onVisiblePropChange(value ?? false)` |
| `watch(innerVisible)` | 调 `onInnerVisibleChange(value)` |
| `watch(props.position)` | 调 `onReMeasure()` |
| `watch(props.items)` | 调 `onReMeasure()`（高度可能变化） |
| `onUnmounted` | 移除全部监听并调 `onCleanup()` |

| 监听 | 目标 | 选项 |
| --- | --- | --- |
| `mousedown` | `document` | `{ capture: true }` |
| `scroll` | `window` | `{ capture: true }` |
| `keydown` | `document` | — |

#### 示例代码

```ts
export interface UseContextMenuLifeOptions {
  isActive: Ref<boolean>;
  innerVisible: Ref<boolean>;
  props: BstContextMenuProps;
  rootRef: Ref<HTMLElement | null>;
  onOutsideClick: (event: MouseEvent) => void;
  onOutsideScroll: (event: Event) => void;
  onEscKeyDown: (event: KeyboardEvent) => void;
  onVisiblePropChange: (visible: boolean) => void;
  onInnerVisibleChange: (visible: boolean) => void;
  onReMeasure: () => void;
  onCleanup: () => void;
}

export function useContextMenuLife(options: UseContextMenuLifeOptions): void {
  const detach = ref<(() => void) | null>(null);

  watch(options.isActive, async (active) => {
    detach.value?.();
    detach.value = null;

    if (!active) return;

    // 延后一拍，避开触发元素自身这一次 mousedown
    await nextTick();

    const listenerOptions = { capture: true };

    document.addEventListener('mousedown', options.onOutsideClick, listenerOptions);
    window.addEventListener('scroll', options.onOutsideScroll, listenerOptions);
    document.addEventListener('keydown', options.onEscKeyDown);

    detach.value = () => {
      document.removeEventListener('mousedown', options.onOutsideClick, listenerOptions);
      window.removeEventListener('scroll', options.onOutsideScroll, listenerOptions);
      document.removeEventListener('keydown', options.onEscKeyDown);
    };
  });

  watch(() => options.props.isVisible, (value) => options.onVisiblePropChange(value ?? false));
  watch(options.innerVisible, (value) => options.onInnerVisibleChange(value));
  watch(() => options.props.position, () => options.onReMeasure());
  watch(() => options.props.items, () => options.onReMeasure());

  onUnmounted(() => {
    detach.value?.();
    detach.value = null;
    options.onCleanup();
  });
}
```

### 2.7 `src/hooks/controller.hooks.ts`

#### 实现基础

| 项 | 内容 |
| --- | --- |
| 输入 | `props`、`emit`、`slots` |
| 依赖 | `prop.hooks` → `context-menu.hooks` → `life.hooks` → `context-menu-item.hooks` |
| 输出 | 视图所需全部数据、方法与子元素工厂 |
| 消费方 | `context-menu.tsx`（唯一） |

#### 实现原理

| 原理 | 说明 |
| --- | --- |
| 唯一出口 | 根组件只 `import` 本文件，不直接触及任何下游 hook |
| 只组装不判断 | 所有业务判断在各专职 hook 内完成，本文件只负责接线与转发 |
| 生命周期桥接 | 把 `context-menu.hooks` 的回调传给 `life.hooks` 的 `watch` 参数 |
| 插槽旁路信号 | `hasDefaultSlot` 告知视图是否需要绕过 `items` 渲染 |

#### 实现方式

| 成员 | 来源 / 行为 |
| --- | --- |
| `normalizedItems` / `teleportTarget` | 转发 `useContextMenuProp` |
| `maxHeightStyle` | 仅内部传给 `useContextMenu` 生成 `rootStyle`，不外泄 |
| `phase` / `isActive` / `rootRef` / `rootClass` / `rootStyle` | 转发 `useContextMenu` |
| `show` / `hide` / `handleAnimationEnd` / `handleItemSelect` | 转发 `useContextMenu` |
| `hasDefaultSlot` | `computed(() => Boolean(slots.default))` |
| 调用 `useContextMenuLife` | 传入 `isActive`、`innerVisible`、`props`、`rootRef` 与回调 |
| `onVisiblePropChange` | 写入 `innerVisible`，由 `life.hooks` 的 `watch` 捕获 |
| `onInnerVisibleChange` | `emit('update:isVisible', value)`，再调 `menu.applyVisible(value)` 进入状态机 |
| `onReMeasure` | 调 `measureAndClamp` |
| `onCleanup` | 转发 `menu.cleanup` 清理兜底定时器 |
| 不提供 `useItem` | 菜单项视图直接调用 `useContextMenuItem`，避免在渲染期重复创建 computed |

#### 示例代码

```ts
export function useContextMenuController(
  props: BstContextMenuProps,
  emit: ContextMenuEmit,
  slots: Slots,
): UseContextMenuControllerReturn {
  const { normalizedItems, maxHeightStyle, teleportTarget } =
    useContextMenuProp(props);

  const menu = useContextMenu({ props, emit, maxHeightStyle });

  const hasDefaultSlot = computed(() => Boolean(slots.default));

  useContextMenuLife({
    isActive: menu.isActive,
    innerVisible: menu.innerVisible,
    props,
    rootRef: menu.rootRef,
    onOutsideClick: menu.handleOutsideClick,
    onOutsideScroll: menu.handleOutsideScroll,
    onKeyDown: menu.handleKeyDown,
    onVisiblePropChange: (visible) => {
      menu.innerVisible.value = visible;
    },
    onInnerVisibleChange: (visible) => {
      emit('update:isVisible', visible);
      menu.applyVisible(visible);
    },
    onReMeasure: () => {
      void menu.measureAndClamp();
    },
    onCleanup: menu.cleanup,
  });

  return {
    phase: menu.phase,
    isActive: menu.isActive,
    rootRef: menu.rootRef,
    rootClass: menu.rootClass,
    rootStyle: menu.rootStyle,
    normalizedItems,
    teleportTarget,
    hasDefaultSlot,
    show: menu.show,
    hide: menu.hide,
    handleAnimationEnd: menu.handleAnimationEnd,
    handleItemSelect: menu.handleItemSelect,
  };
}
```

### 2.8 `src/hooks/index.ts`

#### 实现基础

| 项 | 内容 |
| --- | --- |
| 输入 | `controller.hooks.ts` 的命名导出 |
| 消费方 | `src/context-menu.tsx`、`index.ts` |

#### 实现原理

| 原理 | 说明 |
| --- | --- |
| 唯一导出 | 规范要求只导出 controller，防止视图绕过编排层直接调下游 hook |
| 无副作用 | 仅 re-export，不执行任何逻辑 |

#### 实现方式

| 规则 | 说明 |
| --- | --- |
| 只写一行 | `export { useContextMenuController } from './controller.hooks';` |
| 不导出类型 | 类型随函数签名自动推导 |
| 不 export * | 避免以后新增文件意外外泄 |

#### 示例代码

```ts
export { useContextMenuController } from './controller.hooks';
```

### 2.9 `src/elements/context-menu-item.tsx`

#### 实现基础

| 项 | 内容 |
| --- | --- |
| 输入 | `item`、`index`、`onSelect`（由根组件传入 `controller.handleItemSelect`） |
| props | 文件内声明 `contextMenuItemProps`（三项必填） |
| 依赖 | `useContextMenuItem`、`constants` |
| 插槽 | `item`：参数 `{ item, index }` |
| 约束 | 只做渲染，不写业务判断、不写样式 |

#### 实现原理

| 原理 | 说明 |
| --- | --- |
| 视图与逻辑分离 | 所有状态与判定来自 hook，组件只负责 JSX 结构 |
| 插槽替换粒度 | `item` 插槽只替换项内部内容，外层类名、点击、禁用、分割判定仍由组件控制 |
| 分割线不参与插槽 | 分割线是无内容节点，无文本、无焦点、不调用插槽 |
| 属性直接透传 | `itemAttrs` 已含 `role` / `aria-*`，用展开运算符挂上 |

#### 实现方式

| 分支 | 渲染内容 |
| --- | --- |
| 分割线 | 空 `div`，不渲染文本、不调用 `item` 插槽 |
| 有 `item` 插槽 | 插槽内容，不套 `-left-text` / `-right-text` |
| 默认 | `leftText` → `span.bst-context-menu-item-left-text`；`rightText` → `span.bst-context-menu-item-right-text` |

| 规则 | 说明 |
| --- | --- |
| 根节点 | `class={itemClass.value}` + `{...itemAttrs.value}` + `data-index` + 点击 / 鼠标移入处理函数 |
| 文本渲染 | 纯文本节点，不使用 `v-html` |
| 组件名 | `BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ITEM` |

#### 示例代码

```tsx
import { defineComponent, toRef } from 'vue';
import type { PropType, VNode } from 'vue';
import type { BstContextMenuItem } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES, BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES } from '../constants';
import { useContextMenuItem } from '../hooks/context-menu-item.hooks';

/** 子元素的运行时 props 声明：五项均必填 */
const contextMenuItemProps = {
  item: {
    type: Object as PropType<BstContextMenuItem>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  // 签名与 ContextMenuSelectEvent 等价，直接内联以避免与 hooks 互相引用
  onSelect: {
    type: Function as PropType<
      (item: BstContextMenuItem, index: number, nativeEvent: MouseEvent | KeyboardEvent) => void
    >,
    required: true,
  },
  onHover: {
    type: Function as PropType<(index: number) => void>,
    required: true,
  },
} as const;

export const ContextMenuItem = defineComponent({
  name: BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ITEM,
  props: contextMenuItemProps,
  setup(props, { slots }) {
    const { isDivider, itemClass, itemAttrs, handleClick, handleMouseenter } = useContextMenuItem({
      item: props.item,
      index: props.index,
      isActive: toRef(props, 'isActive'),
      onSelect: (item, index, event) => props.onSelect(item, index, event),
      onHover: (index) => props.onHover(index),
    });

    return () => (
      <div
        class={itemClass.value}
        {...itemAttrs.value}
        data-index={props.index}
        onClick={handleClick}
        onMouseenter={handleMouseenter}
      >
        {isDivider.value ? null : slots.item ? (
          slots.item({ item: props.item, index: props.index })
        ) : (
          <>
            <span class={BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_LEFT_TEXT}>{props.item.leftText}</span>
            <span class={BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_RIGHT_TEXT}>
              {props.item.rightText}
            </span>
          </>
        )}
      </div>
    );
  },
});
```

### 2.10 `src/context-menu.tsx`

#### 实现基础

| 项 | 内容 |
| --- | --- |
| 输入 | `useContextMenuController` 返回的全部能力 |
| props | 引用 `contextMenuProps`（`hooks/prop.hooks.ts`，15 项） |
| emits | 8 条，缺一不可 |
| 依赖 | `controller.hooks`、`prop.hooks`、`constants`、`elements/context-menu-item` |

```ts
'update:isVisible': (visible: boolean) => void;
'update:position': (position: BstContextMenuPosition) => void;
'item-select': (context: BstContextMenuItemSelectContext) => void;
'click-outside': (context: BstContextMenuClickOutsideContext) => void;
'scroll-outside': (context: BstContextMenuScrollOutsideContext) => void;
'esc-key-down': (context: BstContextMenuEscKeyDownContext) => void;
'after-enter': () => void;
'after-leave': () => void;
```

#### 实现原理

| 原理 | 说明 |
| --- | --- |
| 零业务逻辑 | 不写 `watch`、不写坐标计算、不写事件判定，全部来自 controller |
| v-model 对齐 | `v-model:is-visible` → prop `isVisible` + 事件 `update:isVisible`；`v-model:x` 传入的 prop 名就是 `x` |
| 载荷为裸值 | `v-model` 编译为 `$event => (v = $event)`，传对象会导致父级变量变成对象 |
| 无 `onUpdateXxx` | 监听器键名固定为 `onUpdate:isVisible`（冒号保留），`onUpdateVisible` 永不命中 |
| 渲染条件 | `phase !== 'idle'`；`closing` 期间保留节点以播完出场动画 |
| Teleport 三态 | `false` 原地、`string` 选择器、默认 `'body'` |
| 插槽优先级 | `default` 完全覆盖 `items`；`item` 仅替换单项内容 |
| 定位恒为 fixed | 无论是否 Teleport，均按视口坐标定位 |

| 项 | 正确 | 错误 |
| --- | --- | --- |
| 显隐绑定 | `v-model:is-visible` | `v-model:visible`（prop 为 `visible`，`isVisible` 恒为 `undefined`） |
| 位置绑定 | `v-model:position` | — |
| 载荷 | 裸 `boolean` / `BstContextMenuPosition` | `{ visible }` / `{ position }` |
| TSX 监听器 | `{ 'onUpdate:isVisible': fn }` | `onUpdateVisible` / `onUpdatePosition` |

#### 实现方式

| 规则 | 说明 |
| --- | --- |
| `name` | `BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT` |
| `props` | 直接引用 `contextMenuProps`，不内联声明 |
| `emits` | 按上文 8 条逐项声明 |
| `expose` | `{ show, hide }`，对应 `BstContextMenuExpose` |
| 根节点 | `ref` / `class` / `style` / `role="menu"` / `onAnimationend` |
| 列表 key | `item.key`（已去重） |
| `default` 插槽 | 存在时直接调用 `slots.default()`，忽略 `items` |
| 无 `default` 时 | 遍历 `normalizedItems`，逐项渲染 `ContextMenuItem` |
| Teleport | `teleportTarget === false` 时直接返回面板，否则包一层 `<Teleport>` |

#### 示例代码

```tsx
import { defineComponent } from 'vue';

import { BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES } from './constants';
import { ContextMenuItem } from './elements/context-menu-item';
import { useContextMenuController } from './hooks';
import { contextMenuProps } from './hooks/prop.hooks';

export const BstContextMenu = defineComponent({
  name: BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT,
  props: contextMenuProps,
  emits: [
    'update:isVisible',
    'update:position',
    'item-select',
    'click-outside',
    'scroll-outside',
    'esc-key-down',
    'after-enter',
    'after-leave',
  ],
  setup(props, { emit, slots, expose }) {
    const controller = useContextMenuController(props, emit, slots);

    expose({ show: controller.show, hide: controller.hide });

    return () => {
      if (!controller.isActive.value) return null;

      const panel = (
        <div
          ref={controller.rootRef}
          class={controller.rootClass.value}
          style={controller.rootStyle.value}
          role="menu"
          onAnimationend={controller.handleAnimationEnd}
        >
          {controller.hasDefaultSlot.value
            ? slots.default?.()
            : controller.normalizedItems.value.map((item, index) => (
                <ContextMenuItem
                  key={item.key}
                  item={item}
                  index={index}
                  onSelect={controller.handleItemSelect}
                />
              ))}
        </div>
      );

      return controller.teleportTarget.value === false ? (
        panel
      ) : (
        <Teleport to={controller.teleportTarget.value}>{panel}</Teleport>
      );
    };
  },
});
```

### 2.11 `index.ts`

#### 实现基础

| 项 | 内容 |
| --- | --- |
| 输入 | `BstContextMenu` 与 `bst-types` 的对外类型 |
| 依赖 | `./src/context-menu`、`@binarysovereign/bst-types` |
| 消费方 | 主包聚合、按需入口 `@binarysovereign/vue-next/es/context-menu` |

#### 实现原理

| 原理 | 说明 |
| --- | --- |
| 只做转发 | 不实现任何逻辑，仅重组对外接口 |
| 类型来自共享包 | 全部类型定义在 `bst-types`，组件包不重复声明 |
| 无默认导出 | 按需入口按命名导出消费，避免聚合时多一层包装 |
| 无 `.ts` 扩展名 | 声明会内联进发布单元，带扩展名会让消费方报 TS5097 |

#### 实现方式

| 规则 | 说明 |
| --- | --- |
| 组件 | `export { BstContextMenu } from './src/context-menu';` |
| 类型 | 11 个，统一 `export type { ... }` |
| 顺序 | 先值导出，后类型导出 |

#### 示例代码

```ts
export { BstContextMenu } from './src/context-menu';

export type {
  BstContextMenuProps,
  BstContextMenuEmits,
  BstContextMenuSlots,
  BstContextMenuExpose,
  BstContextMenuItem,
  BstContextMenuItemType,
  BstContextMenuItemSelectContext,
  BstContextMenuClickOutsideContext,
  BstContextMenuScrollOutsideContext,
  BstContextMenuEscKeyDownContext,
  BstContextMenuPosition,
} from '@binarysovereign/bst-types';
```

---

## 3. AI 验收标准

| # | 检查项 | 判定方式 | 验收结果 |
| --- | --- | --- | --- |
| 1 | 文件完整性 | 第 1 节清单中 11 个文件全部存在，无多余文件、无空文件 | Y |
| 2 | 导出签名 | 每个文件的导出名与第 2 节示例一致 | Y |
| 3 | props 声明位置 | 根组件的 props 声明在 `prop.hooks.ts`，子元素的 3 项声明在 `context-menu-item.tsx`；均无引用外部分散 | Y |
| 4 | 生命周期位置 | 仅 `life.hooks.ts` 出现 `watch(` / `onMounted` / `onUnmounted` | Y |
| 5 | 根组件纯度 | `context-menu.tsx` 只调用 `useContextMenuController`，不含 `watch` / 坐标计算 / 事件判定 | Y |
| 6 | hooks 出口 | `hooks/index.ts` 只有一行 `export { useContextMenuController }` | Y |
| 7 | 类名一致 | `constants.ts` 的 8 个类名与样式包分片逐字一致 | Y |
| 8 | 文案覆盖 | `ERROR_MESSAGES` 恰好 16 个键，逐项对应 `BstContextMenuProps` 15 个入参 + `items[].key` | Y |
| 9 | 文案格式 | 每条均以 `[${BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ROOT}]` 开头，正文为英文 | Y |
| 10 | 文案消费 | 每个键均被 `prop.hooks` 或 `utils` 引用，无未使用项 | Y |
| 11 | 事件完整 | `context-menu.tsx` 的 `emits` 为 8 条，与 `BstContextMenuEmits` 对齐 | Y |
| 12 | v-model 契约 | 事件名为 `update:isVisible`，载荷为裸 `boolean`；全仓无 `onUpdateVisible` 实现 | Y |
| 13 | 零样式 | 源码中无 `<style>`、无 `.css` / `.less` 引入、无硬编码色值 | Y |
| 14 | 未越界修改 | 本次实现未改动 `bst-types` / `bst-styles` 源码（工作区存在本次实现之前的既有改动，见下方说明） | Y |
| 15 | 类型检查 | `pnpm typecheck` 退出码 0 | Y |
| 16 | 规范检查 | `pnpm exec eslint packages/bst-advanced-components/context-menu --max-warnings 0` 退出码 0 | Y |
| 17 | 构建产物 | `pnpm build:private` 后存在 `es/context-menu/index.mjs` 与 `index.d.ts` | Y |
| 18 | 类型内联 | 构建后 `.d.ts` 中对共享类型的引用已改写为 `../_types/index` | Y |

> 验收结果取值：`Y` = 通过，`N` = 不通过，`-` = 未验证。
>
> 第 14 项说明：`git status` 中 `bst-styles` / `bst-types` 的改动均产生于本次实现之前（样式与类型属于本方案的前置输入）；本次实现仅新增 `context-menu/` 下的文件，未触碰这两个包。

```bash
pnpm typecheck
pnpm exec eslint packages/bst-advanced-components/context-menu --max-warnings 0
pnpm build:private
```

---

## 4. 人工验收标准

> 前置：`pnpm build:style` 与 `pnpm build:private` 均已执行，页面引入全量样式。

| # | 场景 | 操作 | 预期 | 验收结果 |
| --- | --- | --- | --- | --- |
| 1 | 基本打开 | 调用 `show(x, y)` | 面板出现在指定坐标，淡入完成 | - |
| 2 | 右边缘 | 在靠近右边缘处打开 | 面板左移，右侧保留 8px 间距，不出视口 | - |
| 3 | 下边缘 | 在靠近底部处打开 | 面板上移，底部保留 8px 间距，不出视口 | - |
| 4 | 高于视口 | 传入长列表 | 面板贴顶，内部出现纵向滚动，页面不滚动 | - |
| 5 | 选中普通项 | 点击带 `action` 的项 | 先触发 `item-select`，再执行 `action`，随后淡出并移除节点 | - |
| 6 | 禁用项 | 点击 `isDisabled` 项 | 无事件、无 `action`、无悬停高亮，光标为 `not-allowed` | - |
| 7 | 分割线 | 渲染含 `divider` 的数据 | 1px 灰线，不可点击、不可聚焦 | - |
| 8 | 外部点击 | 点击面板外任意位置 | 关闭并触发 `click-outside` | - |
| 9 | 外部点击开关 | `isCloseOnOutsideClick=false` 后点击外部 | 不关闭、不触发事件 | - |
| 10 | 面板内滚动 | 滚动面板自身内容 | 不关闭 | - |
| 11 | 外部滚动 | 滚动页面 | 关闭并触发 `scroll-outside` | - |
| 12 | Esc | 按 Esc | 关闭并触发 `esc-key-down` | - |
| 13 | Esc 开关 | `isCloseOnEscKeyDown=false` 后按 Esc | 不关闭 | - |
| 14 | default 插槽 | 传入自定义内容 | 完全替代 `items` 渲染，位置与关闭逻辑不变 | - |
| 15 | item 插槽 | 自定义单项内容 | 仅内容变化，点击与禁用态仍生效 | - |
| 16 | teleport=false | 传 `:teleport="false"` | 面板渲染在调用位置的 DOM 内 | - |
| 17 | teleport 选择器 | 传合法选择器 | 面板挂到目标元素下；选择器未命中时回落 `body` | - |
| 18 | 减少动效 | 系统开启「减少动效」后打开/关闭 | 无动画，且能正常完成关闭与卸载 | - |
| 19 | 深色主题 | 切换 `theme-mode=dark` | 底色、文字、分割线跟随主题 | - |
| 20 | 键盘操作 | 上下方向键切换高亮，Enter / Space 选中 | 高亮在可操作项间循环，选中行为与鼠标一致 | - |
| 21 | 快速切换 | 连续多次 `show` / `hide` | 无残留节点、无重复监听、无控制台报错 | - |
| 22 | 受控绑定 | `v-model:is-visible` 双向绑定 | 内部关闭后父级变量同步变为 `false` | - |

> 验收结果取值：`Y` = 通过，`N` = 不通过，`-` = 未验证。
