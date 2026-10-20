// BstContextMenuItem 视图：只负责结构渲染，状态与判定全部来自 hook
import { defineComponent, toRef } from 'vue';
import type { PropType, VNode } from 'vue';
import type { BstContextMenuItem } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES, BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES } from '../constants';
import { useContextMenuItem } from '../hooks/context-menu-item.hooks';

/**
 * 菜单项子元素的运行时 props 声明。
 *
 * 四项均为必填：子元素只由根菜单创建，不接受外部单独使用。
 * 激活回调签名与 `ContextMenuSelectEvent` 等价，此处直接内联，避免与 hooks 互相引用。
 */
const contextMenuItemProps = {
  /** 菜单项数据 */
  item: {
    type: Object as PropType<BstContextMenuItem>,
    required: true,
  },
  /** 该项在列表中的索引 */
  index: {
    type: Number,
    required: true,
  },
  /** 是否为键盘导航当前高亮项 */
  isActive: {
    type: Boolean,
    required: true,
  },
  /** 激活回调，与根菜单共用同一入口 */
  onSelect: {
    type: Function as PropType<
      (item: BstContextMenuItem, index: number, nativeEvent: MouseEvent | KeyboardEvent) => void
    >,
    required: true,
  },
  /** 鼠标移入回调，用于把高亮同步到该项 */
  onHover: {
    type: Function as PropType<(index: number) => void>,
    required: true,
  },
} as const;

/**
 * 菜单项子元素。
 *
 * 外层类名、无障碍属性、点击与高亮行为均由 `useContextMenuItem` 决定；
 * `item` 插槽只替换项内部内容，不改变交互。
 */
export const ContextMenuItem = defineComponent({
  name: BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES.ITEM,
  props: contextMenuItemProps,
  /**
   * 组件初始化：取单项渲染数据与交互方法。
   *
   * @param props 菜单项数据、索引与激活回调
   * @param context 组件上下文，此处只使用 slots
   */
  setup(props, { slots }) {
    const { isDivider, itemClass, itemAttrs, handleClick, handleMouseenter } = useContextMenuItem({
      item: props.item,
      index: props.index,
      isActive: toRef(props, 'isActive'),
      onSelect: props.onSelect,
      onHover: props.onHover,
    });

    /**
     * 渲染项内部内容。
     *
     * 优先使用 `item` 插槽；否则按左右文本渲染，两者都没有时保持空节点。
     *
     * @returns 内部子节点，无内容时为 `undefined`
     */
    function renderContent(): VNode[] | undefined {
      if (slots.item) return slots.item({ item: props.item, index: props.index });

      const { leftText, rightText } = props.item;
      const children: VNode[] = [];

      if (leftText) {
        children.push(<span class={BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_LEFT_TEXT}>{leftText}</span>);
      }

      if (rightText) {
        children.push(<span class={BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_RIGHT_TEXT}>{rightText}</span>);
      }

      return children.length > 0 ? children : undefined;
    }

    return () => (
      <div
        class={itemClass.value}
        {...itemAttrs.value}
        data-index={props.index}
        onClick={handleClick}
        onMouseenter={handleMouseenter}
      >
        {/* 分割线由样式提供高度与底色，不承载任何内容 */}
        {isDivider.value ? null : renderContent()}
      </div>
    );
  },
});
