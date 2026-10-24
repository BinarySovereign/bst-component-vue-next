// 写给维护者：
// 建议阅读源码顺序：
//   1. types.ts / constants.ts —— 先认识名词：阶段、事件签名、类名、几何参数
//   2. context-menu.tsx —— 本文件，视图边界：只调 controller
//   3. hooks/controller.hooks.ts —— 编排中枢：prop → menu → life 的接线顺序
//   4. hooks/prop.hooks.ts —— 入参校验、归一化与 teleport 解析
//   5. hooks/context-menu.hooks.ts —— 装配层：显隐状态机 show / hide / applyVisible
//   6. hooks/context-menu-phase.hooks.ts —— 开关阶段与动画兜底收尾
//   7. hooks/context-menu-position.hooks.ts —— 坐标夹取与包含块偏移补偿
//   8. hooks/context-menu-keyboard.hooks.ts —— 方向键高亮与确认键
//   9. hooks/context-menu-outside.hooks.ts —— 外部点击 / 滚动关闭
//  10. hooks/context-menu-view.hooks.ts —— 根节点类名与内联样式
//  11. hooks/life.hooks.ts —— 生命周期：监听器挂载与卸载清理
//  12. elements/context-menu-item.tsx + hooks/context-menu-item.hooks.ts —— 单项渲染

/**
 * Copyright (c) 2026 Felix Tang (BinarySovereign). Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */

import { defineComponent, h, Teleport } from 'vue';
import type { BstContextMenuItem } from '@binarysovereign/bst-types';

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
