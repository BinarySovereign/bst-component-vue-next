// 多实例：同一页面两个菜单互不干扰
import type { BstContextMenuItem, BstContextMenuItemSelectContext } from '@binarysovereign/bst-types';
import { defineComponent, h, ref } from 'vue';
import type { BstContextMenuExpose } from '@binarysovereign/bst-types';
import type { CSSProperties } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components/context-menu';

import type { ContextMenuStory } from './types';

/** 文件树左面板菜单 */
const FILE_ITEMS: BstContextMenuItem[] = [
  { key: 'open', leftText: '打开', rightText: 'Enter' },
  { key: 'rename', leftText: '重命名', rightText: 'F2' },
  { key: 'divider', type: 'divider' },
  { key: 'delete', leftText: '删除', rightText: 'Del' },
];

/** 表格右面板菜单：与左侧内容完全不同，便于确认两侧没有串数据 */
const SORT_ITEMS: BstContextMenuItem[] = [
  { key: 'by-name', leftText: '按名称排序' },
  { key: 'by-date', leftText: '按修改时间排序' },
  { key: 'by-size', leftText: '按大小排序' },
];

/** 单侧面板样式：取值全部来自样式包令牌，主题切换时随之变化 */
const PANE_STYLE: CSSProperties = {
  flex: '1 1 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  minHeight: '220px',
  border: '1px dashed var(--bst-component-border)',
  borderRadius: '8px',
  background: 'var(--bst-bg-color-container)',
  color: 'var(--bst-text-color-secondary)',
  fontSize: '14px',
  userSelect: 'none',
};

/**
 * 左右双面板演示组件
 *
 * 两个 `BstContextMenu` 互不干扰：打开一侧时另一侧自动关闭，
 * 任一侧只能看到自己的菜单项，验证实例级状态没有共享。
 *
 * 返回类型由 `defineComponent` 推导；显式标注成宽泛的 `Component`
 * 会让 Storybook 的 `render` 报类型不兼容（它要求 `StoryFnVueReturnType`）。
 *
 * @returns 左右双面板演示组件
 */
const createMultiMenuDemo = () =>
  defineComponent({
    name: 'BstContextMenuMultipleStoryDemo',
    setup() {
      const fileMenuRef = ref<BstContextMenuExpose | null>(null);
      const sortMenuRef = ref<BstContextMenuExpose | null>(null);
      const lastAction = ref('尚未选择');

      /**
       * 在指定坐标打开一侧菜单，并关闭另一侧。
       *
       * @param menu 目标菜单引用
       * @param other 另一侧菜单引用
       * @param event 原生右键事件
       */
      const openOne = (
        menu: BstContextMenuExpose | null,
        other: BstContextMenuExpose | null,
        event: MouseEvent,
      ): void => {
        event.preventDefault();
        other?.hide();
        menu?.show(event.clientX, event.clientY);
      };

      const handleSelect = (context: BstContextMenuItemSelectContext): void => {
        lastAction.value = context.item.leftText ?? String(context.item.key);
      };

      return () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--bst-text-color-secondary)' }}>
            最近选择：{lastAction.value}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div
              class="bst-story-context-menu-demo"
              style={PANE_STYLE}
              onContextmenu={(event: MouseEvent) => openOne(fileMenuRef.value, sortMenuRef.value, event)}
            >
              <p style={{ margin: 0 }}>文件列表（右键打开文件菜单）</p>
              {h(BstContextMenu, {
                ref: fileMenuRef,
                items: FILE_ITEMS,
                onItemSelect: handleSelect,
              })}
            </div>
            <div
              class="bst-story-context-menu-demo"
              style={PANE_STYLE}
              onContextmenu={(event: MouseEvent) => openOne(sortMenuRef.value, fileMenuRef.value, event)}
            >
              <p style={{ margin: 0 }}>数据表格（右键打开排序菜单）</p>
              {h(BstContextMenu, {
                ref: sortMenuRef,
                items: SORT_ITEMS,
                onItemSelect: handleSelect,
              })}
            </div>
          </div>
        </div>
      );
    },
  });

/**
 * 多实例：同一页面两个菜单互不干扰
 *
 * 打开一侧会自动关闭另一侧（这只是演示层约定，组件本身不感知其它实例）；
 * 两侧菜单项完全不同，验证实例级状态没有被共享。
 */
export const multipleMenusExample: ContextMenuStory = {
  render: () => createMultiMenuDemo(),
};
