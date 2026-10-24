# BstContextMenu 类型定义

## 数据结构

### BstContextMenuItem (菜单数据项)

| 属性名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `key` | `string \| number` | 是 | - | 唯一标识，Key 重复会自动去重 |
| `leftText` | `string` | 否 | - | 菜单项左侧显示的文本 |
| `rightText` | `string` | 否 | - | 菜单项右侧显示的文本 |
| `type` | `'item' \| 'divider'` | 否 | `'item'` | 菜单项类型，`divider` 表示分割线 |
| `isDisabled` | `boolean` | 否 | `false` | 是否禁用该菜单项 |
| `action` | `(context: BstContextMenuItemSelectContext) => void` | 否 | - | 点击该项时执行的业务逻辑函数 |

### BstContextMenuPosition (位置坐标)

| 属性名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `x` | `number` | 是 | - | 相对视口或容器的 X 轴坐标 |
| `y` | `number` | 是 | - | 相对视口或容器的 Y 轴坐标 |

## 组件 Props

| 属性名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `isVisible` | `boolean` | 否 | `false` | 是否显示菜单，支持 `v-model:is-visible` |
| `position` | `BstContextMenuPosition` | 否 | - | 菜单弹出的位置，支持 `v-model:position` |
| `items` | `BstContextMenuItem[]` | 否 | `[]` | 菜单的数据列表 |
| `isCloseOnOutsideClick` | `boolean` | 否 | `true` | 点击菜单外部是否自动关闭 |
| `isCloseOnOutsideScroll` | `boolean` | 否 | `true` | 菜单外部滚动是否自动关闭 |
| `isCloseOnEscKeyDown` | `boolean` | 否 | `true` | 键盘按下 Esc 是否自动关闭 |
| `maxHeight` | `string \| number` | 否 | - | 菜单最大高度，超出显示滚动条 |
| `teleport` | `boolean \| string` | 否 | `true` | 是否使用 Teleport 渲染到 body 下 |
| `onItemSelect` | `(context: BstContextMenuItemSelectContext) => void` | 否 | - | 点击菜单项时的回调（等价于 `@item-select`） |
| `onClickOutside` | `(context: BstContextMenuClickOutsideContext) => void` | 否 | - | 点击菜单外部时的回调（等价于 `@click-outside`） |
| `onScrollOutside` | `(context: BstContextMenuScrollOutsideContext) => void` | 否 | - | 菜单外部滚动时的回调（等价于 `@scroll-outside`） |
| `onEscKeyDown` | `(context: BstContextMenuEscKeyDownContext) => void` | 否 | - | 按下 Esc 键时的回调（等价于 `@esc-key-down`） |
| `onAfterEnter` | `() => void` | 否 | - | 菜单完全展开后的回调（等价于 `@after-enter`） |
| `onAfterLeave` | `() => void` | 否 | - | 菜单完全关闭后的回调（等价于 `@after-leave`） |

## 组件事件 (Emits)

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| `update:isVisible` | `(visible: boolean) => void` | 菜单显示状态改变时触发，用于 `v-model:is-visible` |
| `update:position` | `(position: BstContextMenuPosition) => void` | 菜单位置更新时触发，用于 `v-model:position` |
| `item-select` | `(context: BstContextMenuItemSelectContext) => void` | 点击菜单项时触发（分割线和禁用项不触发） |
| `click-outside` | `(context: BstContextMenuClickOutsideContext) => void` | 点击菜单外部时触发 |
| `scroll-outside` | `(context: BstContextMenuScrollOutsideContext) => void` | 菜单外部滚动时触发 |
| `esc-key-down` | `(context: BstContextMenuEscKeyDownContext) => void` | 按下 Esc 键时触发 |
| `after-enter` | `() => void` | 菜单完全展开后的回调（动画结束） |
| `after-leave` | `() => void` | 菜单完全关闭后的回调（动画结束） |

## 组件插槽 (Slots)

| 属性名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `default` | `() => VNode[]` | 否 | - | 默认插槽，完全自定义菜单内容，会覆盖 `items` 渲染 |
| `item` | `(props: { item: BstContextMenuItem, index: number }) => VNode[]` | 否 | - | 自定义菜单项渲染插槽，保留组件内部交互逻辑 |

## 键盘交互

| 按键 | 行为 |
| --- | --- |
| `ArrowDown` / `ArrowUp` | 在可操作项之间循环切换高亮，自动跳过分割线与禁用项 |
| `Enter` / 空格 | 选中当前高亮项并触发 `item-select`；没有高亮项时不拦截默认行为 |
| `Escape` | 触发 `esc-key-down` 并关闭菜单（`isCloseOnEscKeyDown=false` 时忽略） |

> 菜单项不进入 Tab 序列，`Tab` 不会聚焦菜单项。
> 使用 `default` 插槽完全自定义内容时，方向键高亮仍以 `items` 为准，自定义内容需自行提供交互。

## 鼠标交互

| 操作 | 行为 |
| --- | --- |
| 在菜单项上左键 | 选中该项，触发 `item-select` 并执行其 `action` |
| 在菜单项上悬浮 | 同步键盘高亮到该项，禁用项与分割线不参与 |
| 在面板上右键 | 阻止浏览器原生右键菜单，且不向父级冒泡 |
| 在面板外按下鼠标 | 按 `isCloseOnOutsideClick` 决定是否关闭 |

## 组件实例方法 (Expose)

父组件可通过 `ref` 获取组件实例并调用以下方法：

| 属性名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `show` | `(x?: number, y?: number) => void` | - | - | 在指定坐标打开菜单 |
| `hide` | `() => void` | - | - | 关闭菜单 |

## 事件回调参数 (Context Types)

所有事件和回调函数的参数均封装在 `context` 对象中，以保证未来扩展时的向后兼容性。

| 属性名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `BstContextMenuItemSelectContext` | `{ item: BstContextMenuItem; index: number; nativeEvent: MouseEvent }` | - | - | 菜单项点击事件的参数 |
| `BstContextMenuClickOutsideContext` | `{ nativeEvent: MouseEvent }` | - | - | 外部点击事件的参数 |
| `BstContextMenuScrollOutsideContext` | `{ nativeEvent: Event }` | - | - | 外部滚动事件的参数 |
| `BstContextMenuEscKeyDownContext` | `{ nativeEvent: KeyboardEvent }` | - | - | Esc 键按下事件的参数 |
