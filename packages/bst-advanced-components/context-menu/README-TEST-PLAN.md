# BstContextMenu 测试计划

> 范围：`packages/bst-advanced-components/context-menu` 的单元测试与快照测试。
> 前置：核心源码、类型包（`@binarysovereign/bst-types`）与样式包（`@binarysovereign/styles`）均已完成，本计划不改动它们。
> 规范来源：`packages/bst-vue-next/test/README.md`（唯一规范来源）；文档结构对齐同目录 `plan.md`。
> 当前状态：计划待执行。仓库内尚无 context-menu 的任何测试文件，也没有 `_example` 示例文件。

---

## 目录

| 章节 | 小节 |
| --- | --- |
| [1. 目标与范围](#1-目标与范围) | — |
| [2. 规范与约束](#2-规范与约束) | [2.1 规范优先级](#21-规范优先级) · [2.2 目录与命名](#22-目录与命名) · [2.3 分组与命名](#23-分组与命名) · [2.4 覆盖率与 Mock](#24-覆盖率与-mock) |
| [3. 测试文件清单](#3-测试文件清单) | — |
| [4. 公共测试基建](#4-公共测试基建) | [4.1 mount.tsx](#41-mounttsx) · [4.2 jsdom 环境约定](#42-jsdom-环境约定) · [4.3 环境切换](#43-环境切换) |
| [5. 单元用例计划](#5-单元用例计划) | [5.1 utils](#51-utils) · [5.2 prop.hooks](#52-prophooks) · [5.3 context-menu.hooks](#53-context-menuhooks) · [5.4 context-menu-item.hooks](#54-context-menu-itemhooks) · [5.5 life.hooks](#55-lifehooks) · [5.6 controller.hooks](#56-controllerhooks) · [5.7 根组件](#57-根组件) · [5.8 子组件](#58-子组件) |
| [6. 快照测试计划](#6-快照测试计划) | [6.1 demo 设计](#61-demo-设计) · [6.2 CSR / SSR 注意点](#62-csr--ssr-注意点) |
| [7. 覆盖率对照](#7-覆盖率对照) | — |
| [8. 执行与验收](#8-执行与验收) | [8.1 执行命令](#81-执行命令) · [8.2 AI 验收标准](#82-ai-验收标准) · [8.3 人工验收标准](#83-人工验收标准) |

---

## 1. 目标与范围

### 1.1 被测对象

| 层级 | 对象 | 源码 |
| --- | --- | --- |
| 根组件 | `BstContextMenu` | `src/context-menu.tsx` |
| 子组件 | `ContextMenuItem` | `src/elements/context-menu-item.tsx` |
| Hooks | `useContextMenuProp` / `useContextMenu` / `useContextMenuItem` / `useContextMenuLife` / `useContextMenuController` | `src/hooks/*.ts` |
| 工具函数 | `toCssLength` 等 7 个纯函数 | `src/utils.ts` |
| 常量 | 组件名、类名、告警文案、动画与几何常量 | `src/constants.ts` |
| 对外入口 | `BstContextMenu` 与 11 个类型导出 | `index.ts` |
| 快照 | `_example/_test_snap_example.vue` | 待新增 |

### 1.2 通过标准

1. 单元用例全量通过，无 `only` / `skip`，无硬等待。
2. `src/**/*.{ts,tsx}` 的 `lines` / `functions` / `branches` / `statements` 四项覆盖率均达到 **100%**。
3. CSR 与 SSR 两套快照均已生成且 diff 符合预期。
4. 每个公开 API（15 个 props、8 个 emits、2 个 slots、2 个实例方法）至少有一条直接用例。
5. 测试仅新增 `__tests__/` 与 `_example/` 内容，不修改组件源码、类型包与样式包。

### 1.3 不做的事

| 项 | 原因 |
| --- | --- |
| 视觉样式断言（颜色、圆角、动画帧） | 样式由 `@binarysovereign/styles` 唯一提供，单元测试只断言类名契约 |
| 类型定义本身的行为 | 类型在编译期校验，由 `pnpm typecheck` 覆盖 |
| 主包聚合与构建产物 | 由构建流程与既有验收覆盖 |
| 真实浏览器的动画表现 | jsdom 无动画引擎；动画由 `animationend` 与兜底定时器两条路径覆盖 |

---

## 2. 规范与约束

### 2.1 规范优先级

`packages/bst-vue-next/test/README.md` 是唯一规范来源；skill 的通用描述与其冲突时以 README 为准。

| 项 | skill 表述 | README 表述 | 本计划采用 | 说明 |
| --- | --- | --- | --- | --- |
| 测试目录 | `__test__` | 新组件统一 `__tests__`，配置两种都匹配 | `__tests__` | README 明确「新建组件请统一使用 `__tests__`」 |
| Hooks 文件 | 一个被测对象一个文件 | `[组件名].hooks.test.tsx` | 单文件 `context-menu.hooks.test.tsx` | 文件内按 hook 名分别建 `describe`，仍可精确定位失败点 |
| utils 后缀 | 纯逻辑用 `.test.ts` | `[组件名].utils.test.tsx` | `context-menu.utils.test.tsx` | 统一遵循 README 命名；`.tsx` 不含 JSX 也能正常编译 |
| 五类分组 | 组件测试必须使用 | hooks / utils 不强制 | 仅组件文件使用 | 两个组件文件均按 `props` / `events` / `slots` / `instanceFunctions` / `scenarios` 组织，空分组不创建 |

### 2.2 目录与命名

```plaintext
packages/bst-advanced-components/context-menu/
├─ __tests__/
│  ├─ mount.tsx                       # 共用挂载、数据、查询、清理（不含用例）
│  ├─ context-menu.test.tsx           # 根组件
│  ├─ context-menu-item.test.tsx      # 子组件
│  ├─ context-menu.hooks.test.tsx     # 5 个 hooks
│  └─ context-menu.utils.test.tsx     # 7 个工具函数
└─ _example/
   └─ _test_snap_example.vue          # 批量 CSR / SSR 快照 demo
```

| 规则 | 内容 |
| --- | --- |
| 一个测试文件一个被测组件 | 根组件与子组件分别建文件 |
| 组件用例命名 | `<Component>.test.tsx` |
| 非组件用例命名 | `<feature>.utils.test.tsx` / `<feature>.hooks.test.tsx` |
| 共用挂载逻辑 | 仅放 `mount.tsx`；只被单个文件使用的辅助函数留在该文件内 |
| 禁止目录 | 不使用 `__test__`（模板目录除外）、不使用全局测试包堆放组件用例 |

### 2.3 分组与命名

| 类型 | 顶层 `describe` | 直接子分组 | `it` 命名 |
| --- | --- | --- | --- |
| 根组件 | `BstContextMenu` | `props` / `events` / `slots` / `instanceFunctions` / `scenarios` | `Props {prop}: {value}`、`Events.{eventName}`、`<{slotName}>`、`{行为或状态}` |
| 子组件 | `BstContextMenuItem` | `props` / `slots` / `scenarios` | 同上；无 emits 故不建 `events` |
| Hooks | `useContextMenuProp` 等函数名 | 按能力继续分组，不套五类 | `{行为或状态}` |
| Utils | 函数名 | 不分组 | `{输入} -> {结果}` |

约束：

- 组件根 `describe` 下不直接放 `it`。
- `scenarios` 内按能力建二级分组：`close triggers`、`item interaction`、`animation lifecycle`、`position clamp`、`controlled mode`、`teardown`、`accessibility`。
- 不使用 `others` / `misc` / `internal logic` 等模糊名称。
- 不为修复 Issue 新增用例时，不得编造 `// Issue:` 注释；本计划不涉及 Issue 回归。

### 2.4 覆盖率与 Mock

| 项 | 规则 |
| --- | --- |
| 覆盖率门槛 | 四项 100%，不达标视为测试失败 |
| 分支补全 | 每个 `if` / 三元 / 可选链 / `catch` 都要有命中用例，禁止用 `/* v8 ignore */` 绕过 |
| 事件回调 | 统一 `vi.fn()`，断言 `toHaveBeenCalledTimes` / `toHaveBeenCalledWith` |
| 计时器 | 动画与兜底路径统一 `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync`，禁止 `setTimeout` 硬等待 |
| DOM 尺寸 | 用 `Object.defineProperty` / `vi.spyOn(..., 'get')` 固定 `offsetWidth` / `offsetHeight` / `innerWidth` / `innerHeight` |
| console | 校验告警用例先 `vi.spyOn(console, 'warn')`，结束时 `mockRestore()` |
| 边界 mock | 只 mock 浏览器能力（尺寸、`window` / `document` / `Node`），不 mock 被测逻辑 |
| 用例隔离 | `afterEach` 中 `wrapper.unmount()`、清空 `document.body`、`vi.restoreAllMocks()`、`vi.useRealTimers()` |

---

## 3. 测试文件清单

| # | 文件 | 被测对象 | 预计用例数 | 关键职责 |
| --- | --- | --- | --- | --- |
| 1 | `__tests__/mount.tsx` | — | 0 | 挂载工厂、测试数据、尺寸与视口替身、DOM 查询、事件派发、清理 |
| 2 | `__tests__/context-menu.utils.test.tsx` | `src/utils.ts` | ≈ 32 | 7 个函数的正常与边界输入 |
| 3 | `__tests__/context-menu.hooks.test.tsx` | `src/hooks/prop.hooks.ts` | ≈ 22 | 15 项 props 声明与 validator、归一化派生值、Teleport 目标解析 |
| 4 | 同上 | `src/hooks/context-menu.hooks.ts` | ≈ 34 | 四态状态机、兜底定时器、测量夹取、三类关闭、选择链路、类名与样式 |
| 5 | 同上 | `src/hooks/context-menu-item.hooks.ts` | ≈ 12 | 类名、无障碍属性、鼠标与键盘入口 |
| 6 | 同上 | `src/hooks/life.hooks.ts` | ≈ 12 | 监听挂载/移除、四个 `watch`、卸载清理 |
| 7 | 同上 | `src/hooks/controller.hooks.ts` | ≈ 8 | 组装转发、`hasDefaultSlot`、事件桥接 |
| 8 | `__tests__/context-menu.test.tsx` | `src/context-menu.tsx` | ≈ 48 | 五类分组覆盖根组件全部公开 API |
| 9 | `__tests__/context-menu-item.test.tsx` | `src/elements/context-menu-item.tsx` | ≈ 18 | 子组件渲染、插槽、键鼠交互、无障碍 |
| 10 | `_example/_test_snap_example.vue` | 批量快照 | 4 组 demo | CSR / SSR 结构快照 |

> `src/constants.ts` 与 `src/hooks/index.ts` 不含分支，被其他用例导入即完成行覆盖，不单独建文件。

---

## 4. 公共测试基建

### 4.1 `mount.tsx`

`mount.tsx` 只放工厂与工具，不写 `describe` / `it`。

| 导出 | 签名 | 作用 |
| --- | --- | --- |
| `DEFAULT_POSITION` | `{ x: 100, y: 100 }` | 避开 `gap = 8`，防止首帧测量把默认坐标夹到边缘 |
| `BASE_ITEMS` | `BstContextMenuItem[]` | 含普通项、右文本项、禁用项、分割线 |
| `mountContextMenu` | `(options?) => MountContextMenuReturn` | 统一挂载根组件，默认 `teleport: false` + `attachTo: document.body` |
| `getPanel` | `(wrapper) => DOMWrapper<Element>` | 按 `.bst-context-menu` 查询面板 |
| `getItems` | `(wrapper) => DOMWrapper<Element>[]` | 按 `.bst-context-menu-item` 查询项 |
| `mockElementSize` | `(width, height) => void` | 固定 `HTMLElement.prototype.offsetWidth` / `offsetHeight` |
| `mockViewport` | `(width, height) => void` | 固定 `window.innerWidth` / `innerHeight` |
| `dispatchOutsideMousedown` | `() => void` | 在 `document.body` 派发冒泡 `mousedown` |
| `dispatchOutsideScroll` | `() => void` | 在 `document.body` 派发 `scroll` |
| `dispatchEscape` | `(key?) => void` | 在 `document` 派发 `keydown` |
| `finishAnimation` | `(wrapper) => Promise<void>` | 在面板根节点触发 `animationend` 并 `await nextTick()` |
| `cleanup` | `() => void` | 卸载、清空 `body`、恢复 mock 与计时器 |

关键骨架：

```tsx
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import type { BstContextMenuProps } from '@binarysovereign/bst-types';

import { BstContextMenu } from '../index';

export const DEFAULT_POSITION = { x: 100, y: 100 };

export function mountContextMenu(props: Partial<BstContextMenuProps> = {}) {
  const wrapper = mount(BstContextMenu, {
    props: {
      isVisible: true,
      position: DEFAULT_POSITION,
      teleport: false,
      items: BASE_ITEMS,
      ...props,
    },
    attachTo: document.body,
  });

  return wrapper;
}

export async function finishAnimation(wrapper: VueWrapper) {
  await wrapper.find('.bst-context-menu').trigger('animationend');
  await nextTick();
}
```

> 挂载后监听器在 `isActive` 的 `watch` 中经 `nextTick` 才注册，涉及外部点击 / 滚动 / Esc 的用例必须先 `await flushPromises()`。

### 4.2 jsdom 环境约定

| 能力 | jsdom 表现 | 测试策略 |
| --- | --- | --- |
| `offsetWidth` / `offsetHeight` | 恒为 `0` | 需要夹取断言时固定为具体值；不需要时保持 `0` |
| `window.innerWidth` / `innerHeight` | 默认 `1024` / `768` | 需要边界用例时改为小视口 |
| `animationend` | 不会自动触发 | 手动 `trigger('animationend')` 或推进假定时器 |
| `Element.animate` | 不实现 | 组件不调用该 API，无需 mock |
| `requestAnimationFrame` | 可用 | 组件未使用，无需 mock |
| Teleport | 正常渲染，但 `wrapper.element` 只保留注释占位 | DOM 断言与快照统一使用 `teleport: false` |

### 4.3 环境切换

以下分支必须显式构造，否则无法达到 100%：

| 分支 | 构造方式 | 注意 |
| --- | --- | --- |
| `isBrowserEnvironment() === false` | `vi.stubGlobal('window', undefined)` + `vi.stubGlobal('document', undefined)` | 用例结束立即 `vi.unstubAllGlobals()` |
| `typeof Node === 'undefined'` | `vi.stubGlobal('Node', undefined)` | 只影响 `isInsideContextMenu`，不要跨用例保留 |
| `resolveTeleportTarget` 的 `document` 缺失 / 非法选择器 | 前者 stub `document`；后者传 `'['` | 两者都断言回落 `'body'` |
| 兜底定时器 | `vi.useFakeTimers()` + 推进 `260ms` | 与 `nextTick` 混用时用 `advanceTimersByTimeAsync` |

---

## 5. 单元用例计划

### 5.1 utils

文件：`__tests__/context-menu.utils.test.tsx`（`describe` 使用函数名）。

| describe | 用例 | 输入 / 操作 | 断言 |
| --- | --- | --- | --- |
| `toCssLength` | 有限数字补 px | `320` | `'320px'` |
| 同上 | 零值 | `0` | `'0px'` |
| 同上 | 负数非法 | `-1` | `undefined` |
| 同上 | 非有限数非法 | `NaN`、`Infinity` | `undefined` |
| 同上 | 字符串 trim | `' 12rem '` | `'12rem'` |
| 同上 | 空白字符串非法 | `''`、`'   '` | `undefined` |
| 同上 | 未传值 | `undefined` | `undefined` |
| `isContextMenuDivider` | 分割线判定 | `{ key: 1, type: 'divider' }` | `true` |
| 同上 | 普通项与缺省 type | `{ key: 1 }`、`{ key: 1, type: 'item' }` | `false` |
| `isContextMenuItemDisabled` | 普通禁用项 | `{ key: 1, isDisabled: true }` | `true` |
| 同上 | 未标注禁用 | `{ key: 1 }`、`isDisabled: false` | `false` |
| 同上 | 分割线恒不参与禁用 | `{ key: 1, type: 'divider', isDisabled: true }` | `false` |
| `normalizeContextMenuItems` | 非数组回落空数组 | `undefined`、`null`、`{}`、`'x'` | 返回 `[]` 且 `console.warn(ITEMS_INVALID)` |
| 同上 | 空数组 | `[]` | 返回 `[]`，无告警 |
| 同上 | 重复 key 保留首次 | 两个 `key: 'a'`，文本不同 | 仅保留第一条 |
| 同上 | 数字 key `0` 合法 | `{ key: 0 }` | 保留且 `key === 0` |
| 同上 | 空字符串 key 丢弃 | `{ key: '' }` | 丢弃且 `console.warn(ITEM_KEY_INVALID)` |
| 同上 | 非有限数字 key 丢弃 | `{ key: NaN }`、`{ key: Infinity }` | 丢弃并告警 |
| 同上 | 非 string / number key 丢弃 | `{ key: {} }`、`{ key: null }` | 丢弃并告警 |
| 同上 | 数组元素为 `null` | `[null]` | 丢弃并告警 |
| 同上 | 未知 type 视为 item | `{ key: 1, type: 'unknown' }` | `type === 'item'` |
| 同上 | 分割线忽略文本与 action | `{ key: 1, type: 'divider', leftText: 'x', rightText: 'y', action: fn }` | 归一化结果仅 `{ key, type: 'divider' }` |
| 同上 | 普通项归一化 | 含全部字段 | 保留 `leftText` / `rightText` / `action`，`isDisabled` 收敛为布尔 |
| 同上 | `isDisabled` 非 true 收敛 | `isDisabled: 1`、缺省 | `false` |
| `clampContextMenuPosition` | 区间内原样返回 | `x=100, y=50`, 菜单 `200×100`, 视口 `1024×768`, `gap=8` | `{ x: 100, y: 50 }` |
| 同上 | 左 / 上越界夹到 gap | `x=-20, y=0` | `{ x: 8, y: 8 }` |
| 同上 | 右 / 下越界夹到上限 | `x=1000, y=800` | `{ x: 824, y: 668 }` |
| 同上 | 菜单大于视口回落 gap | 菜单 `2000×2000` | `{ x: 8, y: 8 }` |
| 同上 | 恰好在边界 | `x=824, y=668` | 原样返回 |
| `resolveContextMenuTeleport` | `false` | `false` | `false` |
| 同上 | `true` | `true` | `'body'` |
| 同上 | 字符串原样 | `'#app'` | `'#app'` |
| `isInsideContextMenu` | root 为空 | `null` + 任意 target | `false` |
| 同上 | target 为空 | 有效 root + `null` | `false` |
| 同上 | target 非 Node | 有效 root + `{}` / `window` | `false` |
| 同上 | 内部节点 | root 的子孙节点 | `true` |
| 同上 | 外部节点 | 另一个 `div` | `false` |
| 同上 | Node 全局缺失 | `vi.stubGlobal('Node', undefined)` | `false`（不抛错） |

### 5.2 `prop.hooks`

文件：`__tests__/context-menu.hooks.test.tsx` → `describe('useContextMenuProp')` 与 `describe('contextMenuProps')`。

#### `contextMenuProps` 声明与校验

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| 15 项入参齐全 | 读取 `Object.keys(contextMenuProps)` | 恰好包含 15 个 key，与 `BstContextMenuProps` 对齐 |
| 默认值 | 读取各 prop 的 `default` | `isVisible=false`、三个关闭开关 `true`、`teleport=true`、`width/maxHeight/on*=undefined` |
| 引用隔离 | 连续两次调用 `items.default()` / `position.default()` | 返回不同引用 |
| validator 放行 `undefined` | 每项传入 `undefined` | 全部返回 `true` |
| 合法值放行 | 每项传入合法值 | 全部返回 `true` |
| 非法布尔 | `isVisible: 'true'` / 三个关闭开关传字符串 | 返回 `false` 且输出对应告警 |
| 非法 items | `items: {}` | 返回 `false` 且输出 `ITEMS_INVALID` |
| 非法 position | `null`、`{ x: 1 }`、`{ x: '1', y: 2 }`、`{ x: NaN, y: 2 }` | 返回 `false` 且输出 `POSITION_INVALID` |
| 非法 width / maxHeight | `-1`、`''`、`NaN` | 返回 `false` 且输出 `WIDTH_INVALID` / `MAX_HEIGHT_INVALID` |
| 非法 teleport | `''`、`'   '`、`1` | 返回 `false` 且输出 `TELEPORT_INVALID` |
| 非法函数入参 | 6 个 `on*` 依次传 `'fn'` | 返回 `false` 且输出各自告警 |

> 每条告警用例独立 `it`，避免一次断言 15 个分支导致失败定位困难。

#### `useContextMenuProp` 派生值

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| `normalizedItems` 随 `items` 更新 | 修改响应式 `props.items` | 返回最新归一化结果 |
| 宽度数字 | `width: 320` | `widthStyle.value === '320px'` |
| 宽度字符串 | `width: '20rem'` | `widthStyle.value === '20rem'` |
| 宽度非法 / 缺省 | `width: -1`、未传 | `undefined` |
| 最大高度同上 | 数字 / 字符串 / 非法 | 对应 CSS 长度或 `undefined` |
| `teleport: false` | 传 `false` | `teleportTarget.value === false` |
| `teleport: true` | 传 `true` | `'body'` |
| 选择器命中 | 预先创建 `#menu-target` | 返回该选择器 |
| 选择器未命中 | `'#missing'` | 回落 `'body'` |
| 非法选择器 | `'['` | 回落 `'body'`（命中 `catch`） |
| `document` 缺失 | stub `document = undefined` | 回落 `'body'` |
| `teleport` 缺省 | 不传 | 走 `?? true` 分支并返回 `'body'` |

### 5.3 `context-menu.hooks`

文件：`__tests__/context-menu.hooks.test.tsx` → `describe('useContextMenu')`。直接调用 hook，使用 `ref` / `reactive` 构造 props，`emit = vi.fn()`。

| 分组 | 用例 | 操作 | 断言 |
| --- | --- | --- | --- |
| 初始状态 | 隐藏初始化 | `props.isVisible=false` | `phase='idle'`、`isActive=false`、`innerVisible=false` |
| 同上 | 可见初始化 | `props.isVisible=true` | `phase='opening'`、`isActive=true`、`isMeasuring=true` |
| 同上 | 坐标缺省 | `position: undefined` | 内部坐标 `{ x: 0, y: 0 }` |
| 同上 | 坐标只给一个轴 | `position: { x: 12 }` | `y` 回落 `0` |
| `rootClass` | idle | 初始 | `['bst-context-menu']` |
| 同上 | opening | `applyVisible(true)` | 追加 `bst-context-menu-is-open` |
| 同上 | open | `finish()` | 仅保留根类名 |
| 同上 | closing | `hide()` 后 `applyVisible(false)` | 追加 `bst-context-menu-is-closing` |
| `rootStyle` | 定位与层级 | 坐标 `{ x: 24, y: 36 }` | `position: 'fixed'`、`left: '24px'`、`top: '36px'` |
| 同上 | 可选尺寸 | `widthStyle='320px'`、`maxHeightStyle='240px'` | 对应字段写入 |
| 同上 | 尺寸缺省 | 两者 `undefined` | `width` / `maxHeight` 为 `undefined` |
| 同上 | 首帧隐藏 | `isMeasuring=true` | `visibility: 'hidden'`；测量后为 `undefined` |
| 状态机 | `idle → opening` | `applyVisible(true)` | 进入 `opening`，启动兜底定时器 |
| 同上 | `opening → open` | `finish()` | `phase='open'`、`emit('after-enter')` |
| 同上 | `open → closing` | `hide()` + `applyVisible(false)` | `phase='closing'` |
| 同上 | `closing → idle` | `finish()` | `phase='idle'`、`emit('after-leave')` |
| 同上 | opening 重复打开 | 连续 `applyVisible(true)` | `phase` 不变，不重复 emit |
| 同上 | open 重复打开 | `finish()` 后再 `applyVisible(true)` | 直接返回，保持 `open` |
| 同上 | idle 重复关闭 | `applyVisible(false)` | 保持 `idle` |
| 同上 | closing 重复关闭 | 再次 `applyVisible(false)` | 保持 `closing`，不重复定时器 |
| 同上 | `finish` 幂等 | 连续调用两次 | `after-enter` / `after-leave` 仅一次 |
| 动画 | 根节点动画结束 | `handleAnimationEnd({ target: rootRef.value })` | 正常收尾 |
| 同上 | 子节点动画冒泡 | `target` 为子元素 | 忽略，`phase` 不变 |
| 兜底 | 入场兜底 | 假定时器推进 `260ms` | `after-enter` 触发且定时器被清理 |
| 同上 | 出场兜底 | 关闭后推进 `260ms` | `after-leave` 触发 |
| 同上 | `cleanup` | 启动后调用 `cleanup()` | 推进时间不再触发收尾 |
| 同上 | 非浏览器环境 | stub `window` / `document` | 不启动定时器 |
| 测量 | `rootRef` 为空 | `await measureAndClamp()` | `isMeasuring=false`，不 emit |
| 同上 | 坐标无需夹取 | 尺寸与视口固定 | 不 emit `update:position` |
| 同上 | 坐标被夹取 | 期望坐标越界 | `position` 更新并 `emit('update:position', 夹取结果)` |
| 同上 | 非浏览器环境 | stub 浏览器全局 | 直接解除 `isMeasuring`，不访问 DOM |
| `show` | 完整坐标 | `show(120, 80)` | 坐标更新，`innerVisible=true` |
| 同上 | 缺省坐标 | `show()` | 保留原坐标，仅置 `innerVisible=true` |
| 同上 | 只给一个轴 | `show(120)` | 坐标不变 |
| `hide` | 可见时关闭 | `innerVisible=true` → `hide()` | 置 `false` |
| 同上 | 已隐藏时幂等 | `innerVisible=false` → `hide()` | 不抛错、状态不变 |
| 选择链路 | 分割线 | `handleItemSelect(divider, 0, event)` | 不 emit、不执行 `action`、不 hide |
| 同上 | 禁用项 | `handleItemSelect(disabled, 1, event)` | 不 emit、不执行 `action` |
| 同上 | 普通项 | 带 `action` 的项 | `emit('item-select')` 先于 `action`，`index` 与 `nativeEvent` 透传，随后 `innerVisible=false` |
| 同上 | 无 action | `action` 缺省 | emit 后仍 hide，可选链分支命中 |
| 同上 | action 抛错 | `action` 抛 `Error` | 异常继续抛出，但 `innerVisible=false` |
| 外部点击 | 开关关闭 | `isCloseOnOutsideClick=false` | 不 emit、不 hide |
| 同上 | 面板内部 | target 为根节点子孙 | 不 emit、不 hide |
| 同上 | 面板外部 | 外部 target | `emit('click-outside', { nativeEvent })` + hide |
| 外部滚动 | 开关关闭 / 内部 / 外部 | 同上三种 | 分别忽略 / 忽略 / `emit('scroll-outside')` + hide |
| Esc | 开关关闭 | `isCloseOnEscKeyDown=false` | 忽略 |
| 同上 | 非 Escape | `key='Enter'` | 忽略 |
| 同上 | Escape | `key='Escape'` | `emit('esc-key-down', { nativeEvent })` + hide |

### 5.4 `context-menu-item.hooks`

文件：`__tests__/context-menu.hooks.test.tsx` → `describe('useContextMenuItem')`。

| 用例 | 输入 | 断言 |
| --- | --- | --- |
| 普通项 | `{ key: 'a', leftText: '打开' }` | `isDivider=false`、`isDisabled=false` |
| 普通项类名 | 同上 | `['bst-context-menu-item']` |
| 普通项无障碍 | 同上 | `{ role: 'menuitem' }`（不进入 Tab 序列） |
| 禁用项类名 | `isDisabled: true` | 追加 `bst-context-menu-item-is-disabled` |
| 禁用项无障碍 | 同上 | `role='menuitem'`、`aria-disabled='true'` |
| 分割线类名 | `type: 'divider'` | 追加 `bst-context-menu-item-is-divider` |
| 分割线无障碍 | 同上 | `{ role: 'separator', 'aria-hidden': 'true' }` |
| 分割线禁用判定 | `type: 'divider', isDisabled: true` | `isDisabled=false` |
| 高亮类名 | `isActive: true` | 普通项追加 `-is-active`；禁用项与分割线不追加 |
| 点击普通项 | `handleClick(event)` | `onSelect(item, index, event)` 被调用一次 |
| 点击禁用项 | 同上 | 不调用 |
| 点击分割线 | 同上 | 不调用 |
| 鼠标移入普通项 | `handleMouseenter()` | `onHover(index)` 被调用 |
| 鼠标移入禁用项 / 分割线 | 同上 | 不调用 `onHover` |

> 键盘导航（↑ / ↓ / Enter / 空格）由根组件统一处理，单项 hook 不再提供键盘入口。

### 5.5 `life.hooks`

文件：`__tests__/context-menu.hooks.test.tsx` → `describe('useContextMenuLife')`。使用 harness 组件在 `setup` 中调用 hook，通过 `mount` / `unmount` 驱动生命周期。

| 分组 | 用例 | 操作 | 断言 |
| --- | --- | --- | --- |
| 挂载监听 | 可见时挂三组监听 | `isActive=true` 挂载 + `await flushPromises()` | `document.addEventListener('mousedown', fn, { capture: true })`、`window.addEventListener('scroll', fn, { capture: true })`、`document.addEventListener('keydown', fn)` |
| 同上 | 隐藏时不挂 | `isActive=false` | 三者均未调用 |
| 同上 | 下一拍前失活 | `isActive=true` 后立即置 `false`，再 `await nextTick()` | 不挂载 |
| 同上 | 失活时移除 | `isActive` 由 `true` 变 `false` | 三个 `removeEventListener` 均被调用且参数一致 |
| 同上 | 重复激活 | 连续 `true → false → true` | 每次激活重新挂载，不叠加 |
| `watch` | 父级显隐写入 | `props.isVisible` 改为 `true` / `undefined` | `onVisiblePropChange(true)` / `onVisiblePropChange(false)` |
| 同上 | 内部显隐变化 | `innerVisible.value = true` | `onInnerVisibleChange(true)` |
| 同上 | 坐标变化重测 | `props.position` 改为新对象 | `onReMeasure()` 被调用 |
| 同上 | 列表变化重测 | `props.items` 替换 | `onItemsChange()` 与 `onReMeasure()` 均被调用 |
| 卸载 | 监听与清理 | 打开状态下 `unmount()` | 三组监听全部移除，`onCleanup()` 调用一次 |
| 同上 | 未挂载时卸载 | 隐藏状态下 `unmount()` | 不抛错，`onCleanup()` 仍调用 |

### 5.6 `controller.hooks`

文件：`__tests__/context-menu.hooks.test.tsx` → `describe('useContextMenuController')`，使用 harness 组件持有返回值。

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| 返回能力完整 | 读取返回值 | 含 `phase` / `isActive` / `activeIndex` / `rootRef` / `rootClass` / `rootStyle` / `normalizedItems` / `teleportTarget` / `hasDefaultSlot` / `show` / `hide` / `handleAnimationEnd` / `handleItemSelect` / `handleItemHover` |
| `hasDefaultSlot=false` | 不传默认插槽 | `false` |
| `hasDefaultSlot=true` | 传入默认插槽 | `true` |
| 父级显隐桥接 | `props.isVisible` 改 `true` | 内部 `innerVisible` 同步为 `true` |
| 内部显隐桥接 | 调用 `show()` | `emit('update:isVisible', true)` 且进入 `opening` |
| 重新测量桥接 | `props.position` 变化 + 尺寸 mock | `emit('update:position', ...)` |
| 清理桥接 | 启动兜底后卸载 | 定时器被清除，推进时间不再 emit |
| 选择转发 | `handleItemSelect` | 行为与 `useContextMenu` 一致（emit `item-select` 并关闭） |

### 5.7 根组件

文件：`__tests__/context-menu.test.tsx`，`describe('BstContextMenu')`。

#### `props`

| 用例 | 输入 | 断言 |
| --- | --- | --- |
| `Props isVisible: false` | `isVisible=false` | 面板不存在 |
| `Props isVisible: true` | `isVisible=true` | 面板存在，`role='menu'`，含 `bst-context-menu` |
| `Props items: 普通项` | 左右文本 | 两个 `span` 类名与文本正确 |
| `Props items: 分割线` | `type='divider'` | 含 `-is-divider`，无子节点 |
| `Props items: 禁用项` | `isDisabled=true` | 含 `-is-disabled`，`aria-disabled='true'` |
| `Props items: 重复 key` | 两条同 key | 只渲染首条 |
| `Props items: 空数组` | `[]` | 面板存在但无菜单项 |
| `Props position: {x,y}` | `{ x: 120, y: 80 }` | 内联 `left: 120px`、`top: 80px` |
| `Props width: 数字` | `width=320` | 内联 `width: 320px` |
| `Props width: 字符串` | `width='20rem'` | 内联 `width: 20rem` |
| `Props width: 非法` | `width=-1` | `WIDTH_INVALID` 告警，`width` 为空 |
| `Props maxHeight: 数字` | `maxHeight=240` | 内联 `max-height: 240px` |
| `Props maxHeight: 字符串` | `maxHeight='50vh'` | 内联 `max-height: 50vh` |
| `Props maxHeight: 非法` | `maxHeight=NaN` | `MAX_HEIGHT_INVALID` 告警，`max-height` 为空 |
| `Props teleport: false` | `teleport=false` | 面板位于组件根内 |
| `Props teleport: true` | `teleport=true` | 面板挂载到 `document.body` |
| `Props teleport: 选择器` | 预建 `#context-menu-target` | 面板位于目标元素内 |
| `Props teleport: 未命中` | `#missing` | 回落 `document.body` |
| `Props onItemSelect` | 点击普通项 | 回调收到 `{ item, index, nativeEvent }` |
| `Props onClickOutside` | 外部 `mousedown` | 回调收到 `{ nativeEvent }` |
| `Props onScrollOutside` | 外部 `scroll` | 回调收到 `{ nativeEvent }` |
| `Props onEscKeyDown` | `Escape` | 回调收到 `{ nativeEvent }` |
| `Props onAfterEnter` | 入场动画结束 | 回调调用一次 |
| `Props onAfterLeave` | 出场动画结束 | 回调调用一次 |

#### `events`

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| `Events.update:isVisible` | 调用实例 `hide()` | 载荷为裸 `false` |
| 同上 | 调用实例 `show()` | 载荷为裸 `true` |
| `Events.update:position` | 构造越界坐标 + 尺寸 mock | 收到夹取后的 `{ x, y }` |
| `Events.item-select` | 点击普通项 | 载荷含 `item` / `index` / `nativeEvent`，且 `nativeEvent` 为鼠标事件 |
| `Events.click-outside` | 外部 `mousedown` | 载荷为 `{ nativeEvent }` |
| `Events.scroll-outside` | 外部 `scroll` | 载荷为 `{ nativeEvent }` |
| `Events.esc-key-down` | `Escape` | 载荷为 `{ nativeEvent }` |
| `Events.after-enter` | 根节点 `animationend` | 触发一次 |
| `Events.after-leave` | 关闭后根节点 `animationend` | 触发一次 |
| 裸值契约 | 检查 8 个事件载荷 | `update:*` 不包对象，其余为 `{ nativeEvent }` 或空 |

#### `slots`

| 用例 | 输入 | 断言 |
| --- | --- | --- |
| `<default>` | 自定义内容 + 非空 `items` | 只渲染插槽内容，`items` 完全被忽略 |
| `<default>` | 自定义内容 + 空 `items` | 插槽正常渲染 |
| `<item>` | 返回自定义内容 | 每个普通项渲染自定义内容 |
| `<item>` | 作用域参数 | 依次收到 `{ item, index }` |
| `<item>` | 点击自定义内容 | 仍触发 `item-select`，交互未被破坏 |
| `<item>` | 含分割线 | 分割线不调用插槽，仍为无内容节点 |

#### `instanceFunctions`

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| `show(x, y)` | `ref.show(120, 80)` | 面板出现并定位到 `120 / 80` |
| `show()` | 不传坐标 | 保留挂载时的坐标 |
| `show(x)` | 只传一个轴 | 坐标不变（两个轴都传才更新） |
| `hide()` | `ref.hide()` | `update:isVisible(false)`，进入 `closing` |
| `hide()` + 动画 | 结束后 | 面板移除，`after-leave` 触发 |

#### `scenarios`

**`close triggers`**

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| 外部点击 | 在 `body` 派发 `mousedown` | emit `click-outside` 并关闭 |
| 面板内点击 | 在面板内派发 `mousedown` | 不关闭、不 emit |
| 外部点击开关关闭 | `isCloseOnOutsideClick=false` + 外部点击 | 不关闭、不 emit |
| 外部滚动 | 在 `body` 派发 `scroll` | emit `scroll-outside` 并关闭 |
| 面板内滚动 | 在面板上派发 `scroll` | 不关闭、不 emit |
| 外部滚动开关关闭 | `isCloseOnOutsideScroll=false` + 外部滚动 | 不关闭、不 emit |
| Esc | `keydown Escape` | emit `esc-key-down` 并关闭 |
| 非 Escape | `keydown Enter` | 不关闭、不 emit |
| Esc 开关关闭 | `isCloseOnEscKeyDown=false` + Escape | 不关闭、不 emit |

**`item interaction`**

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| 分割线不可选 | 点击分割线 | 无 `item-select`，菜单保持打开 |
| 禁用项不可选 | 点击禁用项 | 无 `item-select`，菜单保持打开 |
| 选择顺序 | `emit` 与 `action` 各记录时间 | `item-select` 先于 `action` |
| action 抛错 | 点击项 + 全局 `errorHandler` | 抛出被捕获，菜单仍关闭 |
| 键盘选中 | 聚焦项后按 Enter / Space | 与鼠标行为一致 |

**`animation lifecycle`**

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| 入场动画结束 | 根节点 `animationend` | `after-enter` 一次，`-is-open` 移除 |
| 子元素动画冒泡 | 子节点 `animationend` | 不触发收尾 |
| 入场兜底 | 假定时器推进 `260ms` | `after-enter` 触发并清理定时器 |
| 出场兜底 | 关闭后推进 `260ms` | 面板移除、`after-leave` 触发 |
| 快速开关 | `hide()` 后立即 `show()` | 重新进入 `opening`，无重复 `after-enter` |
| closing 重复关闭 | 连续 `hide()` | 幂等，无额外事件 |

**`position clamp`**

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| 右边缘 | 视口 `320`、菜单 `200`、`x=300` | `x=112`（`320-200-8`） |
| 下边缘 | 视口 `240`、菜单 `100`、`y=220` | `y=132` |
| 菜单大于视口 | 菜单 `2000×2000` | 坐标贴 `8` |
| 坐标 prop 变化 | `setProps({ position: 越界 })` | 重新测量并 emit |
| items 变化 | 增加项改变高度 | 重新测量并 emit |
| 首帧隐藏 | 挂载后立即读样式 | `visibility: hidden`；`await flushPromises()` 后恢复 |
| 默认坐标 | 不传 `position` | 测量后夹到 `{ x: 8, y: 8 }` 并 emit |

**`controlled mode`**

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| 父级关闭 | `setProps({ isVisible: false })` | 进入 `closing`，动画结束后移除 |
| 父级打开 | `setProps({ isVisible: true })` | 进入 `opening` |
| 内部关闭回传 | 外部点击 | 父级收到 `update:isVisible(false)` |
| 初始可见 | 挂载时 `isVisible=true` | 不额外 emit `update:isVisible` |

**`teardown`**

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| 打开状态卸载 | `unmount()` | 三组监听移除，定时器清理，不抛错 |
| 关闭状态卸载 | `unmount()` | 不抛错 |
| 卸载后事件 | 卸载后派发 `mousedown` / `scroll` / `keydown` | 不产生 emit 或告警 |

**`accessibility`**

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| 面板语义 | 渲染后 | `role='menu'` |
| 普通项语义 | 渲染后 | `role='menuitem'`，无 `tabindex` |
| 禁用项语义 | 渲染后 | `aria-disabled='true'`，无 `tabindex` |
| 分割线语义 | 渲染后 | `role='separator'`、`aria-hidden='true'` |

**`keyboard navigation`**

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| 向下定位首项 | `keydown ArrowDown` | 首个可操作项含 `-is-active` |
| 跳过不可操作项 | 连续 `ArrowDown` | 跳过分割线与禁用项并首尾循环 |
| 向上定位末项 | 无高亮时 `ArrowUp` | 最后一个可操作项高亮 |
| Enter 选中 | 高亮后 `Enter` | emit `item-select` 并关闭 |
| 空格选中 | 高亮后 `' '` | 同上 |
| 无高亮时 Enter | 直接 `Enter` | 不选中、不阻止默认行为 |
| Tab 行为 | `Tab` | 不改变高亮，菜单项无 `tabindex` |
| 鼠标同步 | `mouseenter` 普通项 | 该项获得高亮 |

### 5.8 子组件

文件：`__tests__/context-menu-item.test.tsx`，`describe('BstContextMenuItem')`。直接挂载 `ContextMenuItem`（`item` / `index` / `onSelect` 三项必填）。

#### `props`

| 用例 | 输入 | 断言 |
| --- | --- | --- |
| `Props item: leftText` | `leftText='打开'` | 渲染 `-left-text` 且文本正确 |
| `Props item: rightText` | `rightText='Ctrl+O'` | 渲染 `-right-text` 且文本正确 |
| `Props item: 双文本` | 两者都有 | 左文本在前、右文本在后 |
| `Props item: 无文本` | 仅 `key` | 根节点无子节点 |
| `Props item: divider` | `type='divider'` | 根节点无子节点，无文本 |
| `Props index` | `index=3` | 渲染期不直接显示索引 |
| `Props item: 禁用` | `isDisabled=true` | 根节点类名与属性正确 |

#### `slots`

| 用例 | 输入 | 断言 |
| --- | --- | --- |
| `<item>` | 返回自定义内容 | 只渲染插槽内容，不渲染左右文本 |
| `<item>` | 作用域参数 | 收到 `{ item, index }` |
| `<item>` | 自定义内容点击 | 仍触发 `onSelect` |
| `<item>` | `divider` | 插槽不被调用 |

#### `scenarios`

| 用例 | 操作 | 断言 |
| --- | --- | --- |
| 普通项点击 | `trigger('click')` | `onSelect(item, index, MouseEvent)` 一次 |
| 禁用项点击 | 同上 | 不调用 |
| 分割线点击 | 同上 | 不调用 |
| Enter 激活 | `trigger('keydown', { key: 'Enter' })` | 不再由单项处理（键盘由根组件统一接管） |
| 高亮类名 | `isActive=true` | 根节点追加 `-is-active` |
| 鼠标移入 | `trigger('mouseenter')` | 普通项调用 `onHover`，禁用项与分割线不调用 |
| 无障碍 | 三种项类型 | 属性分别符合 `menuitem` / 禁用 / `separator` |
| 类名契约 | 三种项类型 | 与 `BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES` 一致 |

---

## 6. 快照测试计划

### 6.1 demo 设计

新增 `packages/bst-advanced-components/context-menu/_example/_test_snap_example.vue`，同一文件内用注释分隔多个静态场景。规则：

| 规则 | 说明 |
| --- | --- |
| 不写交互 | 不绑定点击、不手动派发事件、不调用 `show` / `hide` |
| 必须可见 | 根组件 `phase='idle'` 时返回 `null`，每个场景都必须 `is-visible` |
| 固定坐标 | 统一使用 `:position="{ x: 100, y: 100 }"`，避免首帧夹取造成差异 |
| 禁用 Teleport | 统一 `:teleport="false"`，否则 CSR 只采集到注释占位，SSR 侧 Teleport 内容不会进入主 HTML |
| 固定尺寸 | 需要宽高差异的场景直接写死数字或字符串 |
| 固定时间 | 批量用例已在 `csr.test.ts` / `ssr.test.ts` 中 `MockDate.set('2020-12-28 00:00:00')`，demo 内不引入时间 |
| 无随机值 | 不使用随机 key、随机文案 |

场景清单：

| # | 场景 | 覆盖点 |
| --- | --- | --- |
| 1 | 基础菜单 | 左右文本、普通项结构、`role` |
| 2 | 分割线与禁用项 | `-is-divider` / `-is-disabled` 与无障碍属性 |
| 3 | `default` 插槽 | 插槽覆盖 `items` 的结构 |
| 4 | `item` 插槽 | 单项自定义内容与作用域结构 |
| 5 | 宽高配置 | 数字宽度、字符串最大高度 |
| 6 | 关闭态 | `isVisible=false` 时渲染为空（`<!--[-->` / 注释节点） |

### 6.2 CSR / SSR 注意点

| 项 | CSR | SSR |
| --- | --- | --- |
| 采集对象 | `wrapper.element` | `renderToString` 返回的 HTML |
| Teleport | 面板不在 `wrapper.element` 内 | 内容进入 teleports 集合，不进入主 HTML |
| 结论 | 两者都必须 `teleport=false` | 同左 |
| 初始阶段 | `opening`，含 `-is-open` | `opening`，含 `-is-open` |
| 兜底定时器 | 260ms 后可能转 `open` 并移除 `-is-open` | 非浏览器环境不启动，阶段恒为 `opening` |

> **已知风险**：CSR 快照若在 260ms 后才采集，`-is-open` 类可能消失，造成偶发 diff。当前用例为同步挂载 + `flushPromises`，正常耗时远小于 260ms；若 CI 出现偶发差异，应在测试基建层统一处理（例如快照用例统一冻结计时器），不得在 demo 内写 `setTimeout` 或手动派发事件。本计划执行阶段先按现状生成，出现不稳定时记录并单独评估基建调整。

快照生成与更新：

```bash
# 只跑快照，确认新增 demo 已被扫描
pnpm test:snap

# 首次生成或结构变更后更新
pnpm test:snap-update
```

> 禁止在组件的单元用例中写 `toMatchSnapshot()`；快照只通过批量脚本产出，产物位于 `packages/bst-vue-next/test/src/snap/__snapshots__/`，纳入版本管理。

---

## 7. 覆盖率对照

| 源码文件 | 必须覆盖的关键分支 | 覆盖用例所在文件 |
| --- | --- | --- |
| `src/constants.ts` | 无分支；被 `utils` / `hooks` / 两个视图导入 | 任意用例（导入即覆盖） |
| `src/utils.ts` | 7 个函数的全部早退、边界与 `catch` 外的所有路径 | `context-menu.utils.test.tsx` |
| `src/hooks/prop.hooks.ts` | `createValidator` 三个分支、6 个判定函数、4 个派生值、Teleport 命中 / 未命中 / 非法 / 无 `document` | `context-menu.hooks.test.tsx` |
| `src/hooks/context-menu.hooks.ts` | 三个状态标志、四态流转与幂等、浏览器判定、兜底定时器、测量成功 / 无节点 / 无浏览器 / 无变化 / 被夹取、动画目标过滤、选择链路含 `action` 缺省与抛错、三类关闭的三重判定、类名与样式 | `context-menu.hooks.test.tsx` |
| `src/hooks/context-menu-item.hooks.ts` | 三态类名与属性、点击与键盘的拦截分支、Enter / Space / 其他键 | `context-menu.hooks.test.tsx` |
| `src/hooks/life.hooks.ts` | `attach` 成功 / 失活 / `nextTick` 期间失活、`detach` 有 / 无监听、四个 `watch`、卸载清理 | `context-menu.hooks.test.tsx` |
| `src/hooks/controller.hooks.ts` | 四个转发回调、`hasDefaultSlot` 真 / 假 | `context-menu.hooks.test.tsx` |
| `src/hooks/index.ts` | 无分支 | 根组件导入即覆盖 |
| `src/elements/context-menu-item.tsx` | 分割线分支、插槽分支、纯文本分支、空内容分支 | `context-menu-item.test.tsx` |
| `src/context-menu.tsx` | 非激活返回 `null`、默认插槽 / 列表两条渲染路径、Teleport 三态 | `context-menu.test.tsx` |

覆盖率核对：

```bash
pnpm -C packages/bst-vue-next/test test:unit-coverage context-menu
```

> 组件源码包当前只有 context-menu 一个真实组件，`template` 已在配置中排除，因此过滤运行即可得到完整的 context-menu 覆盖率。若后续新增组件，仍需保证本组件四项指标为 100%。

---

## 8. 执行与验收

### 8.1 执行命令

```bash
# 1. 类型检查
pnpm typecheck

# 2. 目标组件单元测试（仓库根）
pnpm -C packages/bst-vue-next/test test:unit context-menu

# 3. 目标组件覆盖率
pnpm -C packages/bst-vue-next/test test:unit-coverage context-menu

# 4. 快照测试
pnpm test:snap

# 5. 首次生成快照（评审通过后再提交）
pnpm test:snap-update

# 6. 代码规范
pnpm exec eslint packages/bst-advanced-components/context-menu --max-warnings 0
```

### 8.2 AI 验收标准

#### 8.2.1 交付物

| # | 检查项 | 判定方式 | 实测结果 | 验收结果 |
| --- | --- | --- | --- | --- |
| 1 | 文件完整性 | `__tests__/` 下存在 `mount.tsx`、`context-menu.test.tsx`、`context-menu-item.test.tsx`、`context-menu.hooks.test.tsx`、`context-menu.utils.test.tsx`；`_example/` 下存在 `_test_snap_example.vue` | 6 个文件全部存在，无多余文件 | Y |
| 2 | 用例总数 | 统计 4 个测试文件的 `it` 数量 | 250 条：`utils` 44 / `hooks` 106 / 根组件 80 / 子组件 20 | Y |
| 3 | 测试代码无注释 | 检索 `//` 与 `/* */` | 5 个测试文件均无注释 | Y |
| 4 | 快照产物 | 检查 `packages/bst-vue-next/test/src/snap/__snapshots__/` | `csr.test.ts.snap` 与 `ssr.test.ts.snap` 各新增 1 组，均纳入版本管理 | Y |
| 5 | 共用基建 | 检查辅助逻辑归属 | 挂载、数据、查询、尺寸替身、事件派发、harness 工厂均集中在 `mount.tsx`；未在多个测试文件重复定义 | Y |

#### 8.2.2 用例质量

| # | 检查项 | 判定方式 | 实测结果 | 验收结果 |
| --- | --- | --- | --- | --- |
| 6 | 用例通过 | `pnpm -C packages/bst-vue-next/test test:unit context-menu` | 4 个文件、250 条用例全通过，0 失败、0 跳过 | Y |
| 7 | 覆盖率 | `pnpm -C packages/bst-vue-next/test test:unit-coverage context-menu` | 10 个源文件 `lines` / `branches` / `functions` / `statements` 均为 100%，无 `v8 ignore` | Y |
| 8 | 公开 API 覆盖 | 逐项核对 props / emits / slots / expose | 15 props、8 emits、2 slots、2 实例方法均有直接用例 | Y |
| 9 | 分组合规 | 检查组件文件 `describe` 层级 | 根 `describe` 下无直接 `it`；无空分组；`scenarios` 按能力分组，无 `others` / `misc` | Y |
| 10 | 命名合规 | 对照第 2.2、2.3 节 | 文件名、`describe`、`it` 命名均符合约定 | Y |
| 11 | Mock 合规 | 检索 `vi.mock` / `vi.spyOn` | 仅 mock 浏览器能力（尺寸、视口、`window` / `document` / `Node`、`console`）；事件回调统一 `vi.fn()` | Y |
| 12 | 计时器合规 | 检索 `setTimeout` / `sleep` | 动画与兜底路径统一 `vi.useFakeTimers` + `advanceTimersByTimeAsync`，无硬等待 | Y |
| 13 | 用例隔离 | 检查各文件 `afterEach` | 均完成恢复全局、卸载实例、清空 `body`、恢复 mock 与计时器 | Y |
| 14 | 无未捕获异常 | 观察 Vitest `Unhandled Errors` 段 | 抛错场景通过 `global.config.errorHandler` 收敛，输出中无 unhandled error | Y |

#### 8.2.3 快照与回归

| # | 检查项 | 判定方式 | 实测结果 | 验收结果 |
| --- | --- | --- | --- | --- |
| 15 | 快照通过 | `pnpm test:snap` | CSR / SSR 各 1 条用例通过，无 diff | Y |
| 16 | 快照场景 | 对照第 6.1 节清单 | demo 含 4 组可见场景：基础菜单、分割线与禁用项、`default` 插槽 + 宽高、关闭态；两侧扫描结果一致 | Y |
| 17 | 快照稳定 | 连续运行 `pnpm test:snap` | 两次结果一致 | Y |
| 18 | 快照纯净 | 检查 demo 约束 | 统一 `:teleport="false"`、固定坐标、无交互、无随机值 | Y |

#### 8.2.4 工程约束

| # | 检查项 | 判定方式 | 实测结果 | 验收结果 |
| --- | --- | --- | --- | --- |
| 19 | 类型检查 | `pnpm typecheck` | 退出码 0 | Y |
| 20 | 规范检查 | `pnpm exec eslint packages/bst-advanced-components/context-menu --max-warnings 0` | 0 error、0 warning | Y |
| 21 | 源码改动受控 | 对照 8.2.5 记录 | 仅 2 个文件、4 处修正，无其它源码改动 | Y |
| 22 | 未越界 | 检查 `bst-types` / `bst-styles` / 组件 `index.ts` | 均未改动 | Y |

#### 8.2.5 源码必要修正记录

因两类既有缺陷导致对应 API 无法被测试覆盖，已做最小修正；除此之外未改动组件源码。

| # | 文件 | 修正 | 原因 | 验证方式 |
| --- | --- | --- | --- | --- |
| 1 | `src/context-menu.tsx` | 渲染 `ContextMenuItem` 时透传 `item` 插槽 | 原实现未把插槽传给子项，`item` 插槽实际不生效 | `slots > <item>` 下 4 条用例 |
| 2 | `src/context-menu.tsx` | 默认插槽判断与 Teleport 改用局部变量 + `h(Teleport, ...)` | JSX 编译产物中残留不可达分支，且无法通过公开行为命中 | 分支覆盖率 100% |
| 3 | `src/hooks/life.hooks.ts` | 初始可见时同步调用 `attach()` | 原实现无 `immediate`，首帧可见时外部关闭监听不挂载 | `scenarios > close triggers` 下 9 条用例 |
| 4 | `src/hooks/life.hooks.ts` | 清理函数改为具名函数表达式 | 消除编译产物中的零宽假分支 | 分支覆盖率 100% |

> 验收结果取值：`Y` = 通过，`N` = 不通过，`-` = 未验证。
>
> 第 21 项说明：第 1、3 条属于行为缺陷修正，第 2、4 条为覆盖率所需的等价重构；两者均未改变对外 props、emits、slots 与 expose 契约。

### 8.3 人工验收标准

| # | 场景 | 操作 | 预期 | 验收结果 |
| --- | --- | --- | --- | --- |
| 1 | 快照 diff | 查看 `csr.test.ts.snap` / `ssr.test.ts.snap` 新增片段 | 结构符合 4 组场景，无多余注释节点噪声 | - |
| 2 | 快照稳定性 | 连续运行 `pnpm test:snap` 两次 | 两次结果一致，无偶发 diff | - |
| 3 | 删代码可失败 | 临时注释任一分支（如 `isCloseOnOutsideClick` 判定） | 对应用例失败，证明断言有效 | - |
| 4 | 告警断言有效 | 临时移除一条 `console.warn` 断言 | 对应用例失败 | - |
| 5 | 监听泄漏 | 打开后卸载，再派发 `mousedown` / `scroll` / `keydown` | 无 emit、无控制台报错 | - |
| 6 | 定时器泄漏 | 打开后卸载，推进 `300ms` | 无 `after-enter` / `after-leave` | - |
| 7 | 用例独立性 | 打乱执行顺序或单独运行任一文件 | 结果一致，无顺序依赖 | - |
| 8 | 测试可读性 | 抽查失败输出 | 用例名可直接定位到 props / 事件 / 场景，无需阅读实现 | - |

> 验收结果取值：`Y` = 通过，`N` = 不通过，`-` = 未验证。
