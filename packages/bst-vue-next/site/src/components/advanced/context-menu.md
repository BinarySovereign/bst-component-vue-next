# ContextMenu 上下文菜单

[点击查看源码](https://github.com/BinarySovereign/bst-component-vue-next/tree/develop/packages/bst-advanced-components/context-menu)

## 代码演示

### 基础用法

<DemoBlock
  demo="advanced/context-menu/basic-usage"
  title="基础用法"
  description="在区域内右键唤出菜单，点击任意项后显示选中结果。"
/>

### 分割线与禁用项

<DemoBlock
  demo="advanced/context-menu/divider-and-disabled"
  title="分割线与禁用项"
  description="分割线用于分组，禁用项保持可见但不参与交互。"
/>

### 自定义项渲染

<DemoBlock
  demo="advanced/context-menu/custom-item-slot"
  title="自定义项渲染"
  description="通过 item 插槽渲染序号、文本与状态胶囊，点击与禁用逻辑仍由组件负责。"
/>

### 键盘操作

<DemoBlock
  demo="advanced/context-menu/keyboard-navigation"
  title="键盘操作"
  description="用按钮打开菜单后，靠方向键、回车与 Esc 完成整套操作，高亮会自动跳过禁用项与分割线。"
/>

### 业务回调

<DemoBlock
  demo="advanced/context-menu/item-action-callback"
  title="业务回调"
  description="items[].action 与 @item-select 并存，日志按触发顺序记录两者谁先执行。"
/>

### 关闭行为开关

<DemoBlock
  demo="advanced/context-menu/close-behavior-switches"
  title="关闭行为开关"
  description="三个布尔开关分别控制点击外部、外部滚动与 Esc 是否关闭，日志记录每次关闭的触发来源。"
/>

### 程序化控制

<DemoBlock
  demo="advanced/context-menu/programmatic-show-hide"
  title="程序化控制"
  description="通过实例暴露的 show(x, y) 与 hide() 由业务代码控制显隐，并观察 after-enter 与 after-leave 的时机。"
/>

### 视口边缘自适应

<DemoBlock
  demo="advanced/context-menu/viewport-edge-clamping"
  title="视口边缘自适应"
  description="在预览区右下角右键，坐标会被夹取到视口内，v-model:position 同步回夹取后的结果。"
/>

### 面板最大高度与滚动

<DemoBlock
  demo="advanced/context-menu/panel-size-and-scroll"
  title="面板最大高度与滚动"
  description="切换 maxHeight，长菜单在面板内部滚动而不撑破视口；面板宽度始终由菜单项内容自动决定。"
/>

### 完全自定义内容

<DemoBlock
  demo="advanced/context-menu/custom-panel-content"
  title="完全自定义内容"
  description="default 插槽接管面板内容，键盘导航仍以 items 为准。"
/>

### 动态菜单数据

<DemoBlock
  demo="advanced/context-menu/dynamic-items"
  title="动态菜单数据"
  description="切换只读与编辑模式后，同一个实例的菜单项随数据实时变化。"
/>

### 多实例

<DemoBlock
  demo="advanced/context-menu/multiple-instances"
  title="多实例"
  description="每行各持有一份菜单，在某行右键时其他行的菜单状态互不干扰。"
/>

## API

### Props

| 属性名 | 类型 | 默认值 | 说明 | 必填 |
| --- | --- | --- | --- | --- |
| `isVisible` | `boolean` | `false` | 是否显示菜单，支持 `v-model:is-visible` | N |
| `position` | `BstContextMenuPosition` | `{ x: 0, y: 0 }` | 菜单定位坐标，支持 `v-model:position` | N |
| `items` | `BstContextMenuItem[]` | `[]` | 菜单数据列表 | N |
| `isCloseOnOutsideClick` | `boolean` | `true` | 点击面板外部是否关闭 | N |
| `isCloseOnOutsideScroll` | `boolean` | `true` | 面板外部滚动是否关闭 | N |
| `isCloseOnEscKeyDown` | `boolean` | `true` | 按下 `Esc` 是否关闭 | N |
| `maxHeight` | `string \| number` | `undefined` | 面板最大高度，超出后内部滚动；未传时限制为视口高度减去上下安全间距 | N |
| `teleport` | `boolean \| string` | `true` | `true` → 挂到 `body`；`false` → 原地渲染；字符串 → 选择器 | N |
| `onItemSelect` | `(context: BstContextMenuItemSelectContext) => void` | — | 等价于 `@item-select` | N |
| `onClickOutside` | `(context: BstContextMenuClickOutsideContext) => void` | — | 等价于 `@click-outside` | N |
| `onScrollOutside` | `(context: BstContextMenuScrollOutsideContext) => void` | — | 等价于 `@scroll-outside` | N |
| `onEscKeyDown` | `(context: BstContextMenuEscKeyDownContext) => void` | — | 等价于 `@esc-key-down` | N |
| `onAfterEnter` | `() => void` | — | 展开动画结束，等价于 `@after-enter` | N |
| `onAfterLeave` | `() => void` | — | 关闭动画结束且节点已移除，等价于 `@after-leave` | N |

### Events

| 事件名 | 参数 | 触发时机 |
| --- | --- | --- |
| `update:isVisible` | `(visible: boolean) => void` | 显隐变化时触发，用于 `v-model:is-visible` |
| `update:position` | `(position: BstContextMenuPosition) => void` | 坐标被改写（含视口夹取）时触发 |
| `item-select` | `(context: BstContextMenuItemSelectContext) => void` | 点击或键盘选中菜单项；分割线与禁用项不触发 |
| `click-outside` | `(context: BstContextMenuClickOutsideContext) => void` | 点击面板外部 |
| `scroll-outside` | `(context: BstContextMenuScrollOutsideContext) => void` | 面板外部滚动 |
| `esc-key-down` | `(context: BstContextMenuEscKeyDownContext) => void` | 按下 `Escape` |
| `after-enter` | `() => void` | 展开动画结束 |
| `after-leave` | `() => void` | 关闭动画结束 |

事件参数统一封装在 `context` 对象中，便于后续扩展：

| 类型 | 结构 |
| --- | --- |
| `BstContextMenuItemSelectContext` | `{ item: BstContextMenuItem; index: number; nativeEvent: MouseEvent \| KeyboardEvent }` |
| `BstContextMenuClickOutsideContext` | `{ nativeEvent: MouseEvent }` |
| `BstContextMenuScrollOutsideContext` | `{ nativeEvent: Event }` |
| `BstContextMenuEscKeyDownContext` | `{ nativeEvent: KeyboardEvent }` |

### Slots

| 插槽名 | 参数 | 说明 |
| --- | --- | --- |
| `default` | — | 完全自定义菜单内容，**会覆盖 `items` 渲染**；键盘导航仍以 `items` 为准，自定义内容需自行提供交互 |
| `item` | `{ item: BstContextMenuItem; index: number }` | 只替换单个菜单项内部内容，交互逻辑保持不变 |

### Expose

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `show` | `(x?: number, y?: number) => void` | 在指定坐标打开菜单，省略坐标时沿用当前 `position` |
| `hide` | `() => void` | 关闭菜单，走完整的出场动画 |

### 菜单项数据结构

| 字段 | 类型 | 默认值 | 说明 | 必填 |
| --- | --- | --- | --- | --- |
| `key` | `string \| number` | — | **必填**，唯一标识；重复的 `key` 会被去重，非法 `key` 的项被忽略 | Y |
| `leftText` | `string` | — | 左侧文本，通常写操作名称 | N |
| `rightText` | `string` | — | 右侧文本，通常写快捷键或状态 | N |
| `type` | `'item' \| 'divider'` | `'item'` | `divider` 渲染为分割线 | N |
| `isDisabled` | `boolean` | `false` | 是否禁用 | N |
| `action` | `(context: BstContextMenuItemSelectContext) => void` | — | 该项点击时执行的业务逻辑，与 `item-select` 并存 | N |

## 键盘交互

| 按键 | 行为 |
| --- | --- |
| `ArrowDown` / `ArrowUp` | 在可操作项之间循环切换高亮，自动跳过分割线与禁用项 |
| `Enter` / `空格` | 选中当前高亮项并触发 `item-select`；无高亮项时不拦截默认行为 |
| `Escape` | 触发 `esc-key-down`，并按 `isCloseOnEscKeyDown` 决定是否关闭 |

## 类名与结构

| 类名 | 挂载位置 | 含义 |
| --- | --- | --- |
| `bst-context-menu` | 面板根节点 | 面板容器，承担滚动与视觉基线 |
| `bst-context-menu-is-open` | 面板根节点 | 入场动画进行中 |
| `bst-context-menu-is-closing` | 面板根节点 | 出场动画进行中，动画结束后移除节点 |
| `bst-context-menu-item` | 每个菜单项 | 菜单项容器 |
| `bst-context-menu-item-left-text` | 左侧文本 | 主文本 |
| `bst-context-menu-item-right-text` | 右侧文本 | 次要信息，贴右对齐 |
| `bst-context-menu-item-is-divider` | 菜单项 | 分割线 |
| `bst-context-menu-item-is-disabled` | 菜单项 | 禁用态 |
| `bst-context-menu-item-is-active` | 菜单项 | 键盘导航或悬浮命中项 |

## 引入方式

```ts
// 全量引入
import BsVueNextPro from '@binarysovereign/vue-next-pro';
import '@binarysovereign/styles/web';

// 按需引入：组件 + 对应样式，按需入口不要带 /index.css
import { BstContextMenu } from '@binarysovereign/vue-next-pro/es/context-menu';
import '@binarysovereign/styles/web/advanced-components/context-menu';
```
