<script setup lang="ts">
const playgroundInit = {
  itemsText: `[
  { "key": "copy", "leftText": "复制", "rightText": "Ctrl+C" },
  { "key": "paste", "leftText": "粘贴", "rightText": "Ctrl+V" },
  { "key": "divider", "type": "divider" },
  { "key": "delete", "leftText": "删除", "rightText": "Delete", "isDisabled": true }
]`,
  isCloseOnOutsideClick: true,
  isCloseOnOutsideScroll: true,
  isCloseOnEscKeyDown: true,
  maxHeightType: 'string',
  maxHeightValue: '',
  positionX: '',
  positionY: '',
  teleport: true,
};
</script>

# ContextMenu 上下文菜单

[点击查看源码](https://github.com/BinarySovereign/bst-component-vue-next/tree/develop/packages/bst-advanced-components/context-menu)

## 代码演示

<DemoBlock
  demo="advanced/context-menu/props-playground"
  title="基础用法"
  description="点击「打开菜单」按钮唤出菜单，右侧配置区实时调整组件入参。"
  :playground="playgroundInit"
  :code-tabs="['vue', 'tsx']"
>
  <template #config="{ playground }">
    <div class="bst-demo-panel">
      <DemoConfigItem label="菜单数据">
        <DemoJsonEditor v-model="playground.itemsText" placeholder="[ ]" />
      </DemoConfigItem>
      <DemoConfigItem label="最大高度">
        <span class="bst-demo-select">
          <select v-model="playground.maxHeightType">
            <option value="string">字符串</option>
            <option value="number">数字</option>
          </select>
        </span>
        <input v-model="playground.maxHeightValue" class="bst-demo-input" type="text" placeholder="不限制" />
      </DemoConfigItem>
      <DemoConfigItem label="位置">
        <input v-model="playground.positionX" class="bst-demo-input bst-demo-input-compact" type="number" placeholder="X" />
        <input v-model="playground.positionY" class="bst-demo-input bst-demo-input-compact" type="number" placeholder="Y" />
      </DemoConfigItem>
      <DemoConfigItem label="挂载到 body">
        <input v-model="playground.teleport" class="bst-demo-switch" type="checkbox" />
      </DemoConfigItem>
      <DemoConfigItem label="点击外部关闭">
        <input v-model="playground.isCloseOnOutsideClick" class="bst-demo-switch" type="checkbox" />
      </DemoConfigItem>
      <DemoConfigItem label="外部滚动关闭">
        <input v-model="playground.isCloseOnOutsideScroll" class="bst-demo-switch" type="checkbox" />
      </DemoConfigItem>
      <DemoConfigItem label="按 Esc 关闭">
        <input v-model="playground.isCloseOnEscKeyDown" class="bst-demo-switch" type="checkbox" />
      </DemoConfigItem>
    </div>
  </template>
</DemoBlock>

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
