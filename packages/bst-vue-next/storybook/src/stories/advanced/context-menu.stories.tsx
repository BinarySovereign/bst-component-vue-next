// BstContextMenu story：只保留 meta 与示例组合
//
// 组件直接取自工作区源码包（`packages/bst-advanced-components`），改 `.tsx` 即时热更新，
// 不需要先跑 `build:private`；样式则来自样式包的构建产物，改 `.less` 后需重跑 `build:style`。
//
// 每个示例的实现都在 `src/examples/advanced/context-menu/*.example.tsx`，一个示例一个文件；
// 本文件只负责把它们挂到 CSF 的具名导出上，因此改动某个示例时无需在长文件里定位。
//
// 覆盖矩阵：
// - Props：isVisible / items / position / 三个关闭开关 / width / maxHeight / teleport / 六个回调
// - Events：update:isVisible、update:position、item-select、click-outside、scroll-outside、
//   esc-key-down、after-enter、after-leave
// - Slots：default（完全接管内容）、item（只替换单项内容）
// - Expose：show / hide
// - 菜单项字段：key（字符串与数字）/ leftText / rightText / type=divider / isDisabled / action
// - 场景：视口边缘夹取、打开中增删项、键盘操作、CSS 变量覆盖、多实例、Teleport 回落
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components/context-menu';

import { closeBehaviorExample } from '../../examples/advanced/context-menu/close-behavior.example';
import { controlledPositionExample } from '../../examples/advanced/context-menu/controlled-position.example';
import { defaultExample } from '../../examples/advanced/context-menu/default.example';
import { defaultSlotExample } from '../../examples/advanced/context-menu/default-slot.example';
import { disabledItemsExample } from '../../examples/advanced/context-menu/disabled-items.example';
import { dividerEdgesExample } from '../../examples/advanced/context-menu/divider-edges.example';
import { dynamicItemsExample } from '../../examples/advanced/context-menu/dynamic-items.example';
import { edgeClampExample } from '../../examples/advanced/context-menu/edge-clamp.example';
import { emptyItemsExample } from '../../examples/advanced/context-menu/empty-items.example';
import { eventsExample } from '../../examples/advanced/context-menu/events.example';
import { exposeMethodsExample } from '../../examples/advanced/context-menu/expose-methods.example';
import { inlineRenderingExample } from '../../examples/advanced/context-menu/inline-rendering.example';
import { invalidDataExample } from '../../examples/advanced/context-menu/invalid-data.example';
import { itemActionExample } from '../../examples/advanced/context-menu/item-action.example';
import { itemSlotExample } from '../../examples/advanced/context-menu/item-slot.example';
import { keyboardInteractionExample } from '../../examples/advanced/context-menu/keyboard-interaction.example';
import { longTextExample } from '../../examples/advanced/context-menu/long-text.example';
import { maxHeightExample } from '../../examples/advanced/context-menu/max-height.example';
import { maxHeightStringExample } from '../../examples/advanced/context-menu/max-height-string.example';
import { multipleMenusExample } from '../../examples/advanced/context-menu/multiple-menus.example';
import { numericKeyExample } from '../../examples/advanced/context-menu/numeric-key.example';
import { numericWidthExample } from '../../examples/advanced/context-menu/numeric-width.example';
import { DEFAULT_ITEMS, TELEPORT_ARG_BODY, TELEPORT_ARG_OPTIONS } from '../../examples/advanced/context-menu/shared';
import { stringWidthExample } from '../../examples/advanced/context-menu/string-width.example';
import { teleportMissingSelectorExample } from '../../examples/advanced/context-menu/teleport-missing-selector.example';
import { teleportToContainerExample } from '../../examples/advanced/context-menu/teleport-to-container.example';
import { textOnlyExample } from '../../examples/advanced/context-menu/text-only.example';
import { widthByCssVariableExample } from '../../examples/advanced/context-menu/width-by-css-variable.example';

const meta = {
  title: '高级组件/ContextMenu',
  component: BstContextMenu,
  // 开启 Autodocs：属性表由 vue-component-meta 从 TSX 源码提取
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '上下文菜单：数据驱动渲染 `items`，或由 `default` 插槽完全自定义内容；显隐、位置与三类关闭触发均通过 Props / 事件对外暴露。',
      },
    },
  },
  // 默认入参：Controls 面板据此提供实时调参，各示例只覆盖差异项
  args: {
    items: DEFAULT_ITEMS,
    // 控件值是选项文案，由 `toTeleportArg` 在示例层转回真实 Props 值
    teleport: TELEPORT_ARG_BODY,
    isCloseOnOutsideClick: true,
    isCloseOnOutsideScroll: true,
    isCloseOnEscKeyDown: true,
  },
  // 六个回调接到 Actions 面板；三个联合类型入参显式声明控件
  argTypes: {
    // `number | string` 会被推断成 object 控件（只有一个 JSON 输入框），
    // 显式声明 text 后可直输 `240` 或 `22rem`
    width: {
      control: { type: 'text' },
      description: '面板宽度：纯数字由组件补 `px`，也可直接写 CSS 长度（如 `22rem`）',
      table: {
        type: { summary: 'number | string' },
        defaultValue: { summary: '--bst-context-menu-width（320px）' },
      },
    },
    maxHeight: {
      control: { type: 'text' },
      description: '面板最大高度：纯数字由组件补 `px`，超出后内部滚动',
      table: {
        type: { summary: 'number | string' },
        defaultValue: { summary: 'calc(100vh - 16px)' },
      },
    },
    // 布尔与字符串的联合类型同样退化为 object 控件，用单选组还原语义。
    // 选项文案在示例层由 `toTeleportArg` 转回真实取值，因此不能用 `mapping`
    teleport: {
      control: { type: 'inline-radio' },
      options: TELEPORT_ARG_OPTIONS,
      description: 'Teleport 目标；选「指定容器」需在「Teleport 到指定容器」示例中使用',
      table: {
        type: { summary: 'boolean | string' },
        defaultValue: { summary: 'true' },
      },
    },
    // 六个回调不可能手填：函数无法序列化，控件只会退化成 JSON 输入框（填了也无效）。
    // `control: false` 关掉编辑器，`action` 保留——触发时载荷仍会打到「动作」面板
    onItemSelect: { action: 'item-select', control: false },
    onClickOutside: { action: 'click-outside', control: false },
    onScrollOutside: { action: 'scroll-outside', control: false },
    onEscKeyDown: { action: 'esc-key-down', control: false },
    onAfterEnter: { action: 'after-enter', control: false },
    onAfterLeave: { action: 'after-leave', control: false },
  },
} satisfies Meta<typeof BstContextMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

// 显示名必须写成字面量放在本文件：Storybook 的侧边栏靠静态分析读取 `name`，
// 从外部模块整体导入的对象（`= defaultExample`）解析不出版本号与显示名，
// 会退化成英文导出名，因此统一采用 `{ name: '…', ...example }` 的写法。

/** 默认形态：左右文本、分割线与禁用项 */
export const Default: Story = { name: '默认', ...defaultExample };

/** 仅左文本：无右侧快捷键时的布局 */
export const TextOnly: Story = { name: '仅左文本', ...textOnlyExample };

/** 空数据：面板仍然渲染，但没有任何菜单项 */
export const EmptyItems: Story = { name: '空数据', ...emptyItemsExample };

/** 长文本：左侧单行省略，右侧快捷键不折行 */
export const LongText: Story = { name: '长文本与溢出', ...longTextExample };

/** 禁用项：`isDisabled` 的项不响应点击，也不触发 `item-select` */
export const WithDisabledItems: Story = { name: '含禁用项', ...disabledItemsExample };

/** 超出 `maxHeight` 时在面板内部滚动 */
export const WithMaxHeight: Story = { name: '限制最大高度', ...maxHeightExample };

/** `width` 传数字：内部补 `px` */
export const NumericWidth: Story = { name: '固定宽度（数字）', ...numericWidthExample };

/** `width` 传字符串：原样作为 CSS 长度 */
export const StringWidth: Story = { name: '固定宽度（字符串）', ...stringWidthExample };

/** `default` 插槽：完全接管菜单内容，`items` 被忽略 */
export const DefaultSlot: Story = { name: '默认插槽（完全自定义）', ...defaultSlotExample };

/** `item` 插槽：只替换单项内部内容，外层类名与交互保持不变 */
export const ItemSlot: Story = { name: '菜单项插槽（自定义单项）', ...itemSlotExample };

/** 固定坐标（受控）：不使用 `show()`，仅改 Props */
export const ControlledPosition: Story = { name: '固定坐标（受控）', ...controlledPositionExample };

/** `teleport=false`：面板留在组件所在位置，但定位仍为 `position: fixed` */
export const InlineRendering: Story = { name: '原地渲染（teleport=false）', ...inlineRenderingExample };

/** `teleport` 传选择器：渲染到指定容器 */
export const TeleportToContainer: Story = { name: 'Teleport 到指定容器', ...teleportToContainerExample };

/** 关闭行为可配置：三个开关全部关闭 */
export const CloseBehavior: Story = { name: '关闭行为可配置', ...closeBehaviorExample };

/** 事件追踪：8 个事件全部记录在画布上，同时写入 Actions 面板 */
export const Events: Story = { name: '事件追踪', ...eventsExample };

/** 实例方法：通过组件 `ref` 调用 `show()` / `hide()` */
export const ExposeMethods: Story = { name: '实例方法 show / hide', ...exposeMethodsExample };

/** 数据校验：重复 key、非法 key、空项与带文本的分割线 */
export const InvalidData: Story = { name: '数据校验（重复与非法 key）', ...invalidDataExample };

/** 单项 `action`：`item-select` 之后执行该项自带的业务逻辑，随后自动关闭 */
export const ItemAction: Story = { name: '单项 action 回调', ...itemActionExample };

/** 视口边缘自动翻转：越界坐标被夹取回视口内 */
export const EdgeClamp: Story = { name: '视口边缘自动翻转', ...edgeClampExample };

/** 打开状态下增删菜单项：尺寸变化会触发重新夹取 */
export const DynamicItems: Story = { name: '打开时增删菜单项', ...dynamicItemsExample };

/** 键盘操作：上下方向键切换菜单项，Enter / 空格选中，Esc 关闭 */
export const KeyboardInteraction: Story = { name: '键盘操作', ...keyboardInteractionExample };

/** 数字 key：`key` 支持有限数字，且可与字符串 key 混用 */
export const NumericKey: Story = { name: '数字 key', ...numericKeyExample };

/** 分割线边界：开头、连续两条、结尾 */
export const DividerEdges: Story = { name: '分割线边界', ...dividerEdgesExample };

/** 用 CSS 变量覆盖宽度：`--bst-context-menu-width` */
export const WidthByCssVariable: Story = { name: 'CSS 变量覆盖宽度', ...widthByCssVariableExample };

/** `maxHeight` 传字符串：接受任意 CSS 长度，超出后内部滚动 */
export const MaxHeightString: Story = { name: '最大高度（字符串）', ...maxHeightStringExample };

/** `teleport` 选择器不存在：回落到 `body` */
export const TeleportMissingSelector: Story = { name: '选择器不存在时回落 body', ...teleportMissingSelectorExample };

/** 多实例：同一页面两个菜单互不干扰 */
export const MultipleMenus: Story = { name: '同一页面多个实例', ...multipleMenusExample };
