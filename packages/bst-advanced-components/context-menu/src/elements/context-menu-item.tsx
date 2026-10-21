import { defineComponent, toRef } from 'vue';
import type { PropType, VNode } from 'vue';
import type { BstContextMenuItem } from '@binarysovereign/bst-types';

import {
  BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES,
  BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES,
  BST_CONTEXT_MENU_CONSTANT_ITEM_INDEX_ATTRIBUTE,
} from '../constants';
import type { ContextMenuSelectEvent } from '../types';
import { useContextMenuItem } from '../hooks/context-menu-item.hooks';

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
  onSelect: {
    type: Function as PropType<(item: BstContextMenuItem, index: number, nativeEvent: ContextMenuSelectEvent) => void>,
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
    const { isDivider, itemClass, itemAttrs, itemContent, handleClick, handleMouseenter } = useContextMenuItem({
      item: props.item,
      index: props.index,
      isActive: toRef(props, 'isActive'),
      onSelect: props.onSelect,
      onHover: props.onHover,
    });

    function renderContent(): VNode[] | undefined {
      if (isDivider.value) return undefined;

      if (slots.item) return slots.item({ item: props.item, index: props.index });

      const content = itemContent.value;

      if (!content) return undefined;

      const children: VNode[] = [];

      if (content.leftText) {
        children.push(<span class={BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_LEFT_TEXT}>{content.leftText}</span>);
      }

      if (content.rightText) {
        children.push(<span class={BST_CONTEXT_MENU_CONSTANT_CLASS_NAMES.ITEM_RIGHT_TEXT}>{content.rightText}</span>);
      }

      return children;
    }

    return () => (
      <div
        class={itemClass.value}
        {...itemAttrs.value}
        {...{ [BST_CONTEXT_MENU_CONSTANT_ITEM_INDEX_ATTRIBUTE]: props.index }}
        onClick={handleClick}
        onMouseenter={handleMouseenter}
      >
        {renderContent()}
      </div>
    );
  },
});
