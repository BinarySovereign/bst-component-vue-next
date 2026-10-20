// BstContextMenu 根组件：只调用 controller 并编写视图
import { defineComponent, h, Teleport } from 'vue';
import type { BstContextMenuItem } from '@binarysovereign/bst-types';

import { BST_CONTEXT_MENU_CONSTANT_COMPONENT_NAMES } from './constants';
import { ContextMenuItem } from './elements/context-menu-item';
import { useContextMenuController } from './hooks';
import { contextMenuProps } from './hooks/prop.hooks';

/**
 * 上下文菜单。
 *
 * 数据驱动渲染 `items`，或由 `default` 插槽完全自定义内容；
 * 显隐、位置与三类关闭触发均通过 Props / 事件对外暴露。
 */
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
  /**
   * 组件初始化：取 controller 全部能力，并只对外暴露 `show` / `hide`。
   *
   * @param props 组件入参
   * @param context 组件上下文，使用 emit、slots 与 expose
   */
  setup(props, { emit, slots, expose }) {
    const controller = useContextMenuController(props, emit, slots);

    expose({ show: controller.show, hide: controller.hide });

    return () => {
      if (!controller.isActive.value) return null;

      const defaultSlot = slots.default;
      const itemSlot = slots.item;

      const renderItem = (item: BstContextMenuItem, index: number) => {
        const itemProps = {
          key: item.key,
          item,
          index,
          isActive: index === controller.activeIndex.value,
          onSelect: controller.handleItemSelect,
          onHover: controller.handleItemHover,
        };

        if (itemSlot) return h(ContextMenuItem, itemProps, { item: itemSlot });

        return h(ContextMenuItem, itemProps);
      };

      const content = defaultSlot ? defaultSlot() : controller.normalizedItems.value.map(renderItem);

      const panel = (
        <div
          ref={controller.rootRef}
          class={controller.rootClass.value}
          style={controller.rootStyle.value}
          role="menu"
          onAnimationend={controller.handleAnimationEnd}
          onContextmenu={controller.handleRootContextMenu}
        >
          {content}
        </div>
      );

      const teleportTarget = controller.teleportTarget.value;

      return teleportTarget === false ? panel : h(Teleport, { to: teleportTarget }, () => [panel]);
    };
  },
});
