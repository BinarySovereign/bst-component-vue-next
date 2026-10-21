<script setup lang="ts">
import { computed, ref } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components';
import type {
  BstContextMenuItem,
  BstContextMenuItemSelectContext,
  BstContextMenuPosition,
} from '@binarysovereign/bst-advanced-components';

type MenuMode = 'readonly' | 'editable';

const mode = ref<MenuMode>('readonly');
const isVisible = ref(false);
const position = ref<BstContextMenuPosition>({ x: 0, y: 0 });
const selectedText = ref('（尚未选择）');

const READONLY_ITEMS: BstContextMenuItem[] = [
  { key: 'open', leftText: '打开' },
  { key: 'copy-link', leftText: '复制链接' },
  { key: 'export', leftText: '导出' },
];

const EDITABLE_ITEMS: BstContextMenuItem[] = [
  { key: 'open', leftText: '打开' },
  { key: 'rename', leftText: '重命名', rightText: 'F2' },
  { key: 'divider-1', type: 'divider' },
  { key: 'copy-link', leftText: '复制链接' },
  { key: 'archive', leftText: '归档' },
  { key: 'delete', leftText: '删除', rightText: 'Delete' },
];

const items = computed((): BstContextMenuItem[] => (mode.value === 'readonly' ? READONLY_ITEMS : EDITABLE_ITEMS));

function handleContextMenu(event: MouseEvent): void {
  position.value = { x: event.clientX, y: event.clientY };
  isVisible.value = true;
}

function handleModeChange(next: MenuMode): void {
  mode.value = next;
}

function handleItemSelect(context: BstContextMenuItemSelectContext): void {
  selectedText.value = context.item.leftText ?? '';
}
</script>

<template>
  <div class="bst-demo-fill" @contextmenu.prevent="handleContextMenu">
    <div class="bst-demo-toolbar">
      <button
        type="button"
        class="bst-demo-button"
        :class="{ 'bst-demo-button-is-active': mode === 'readonly' }"
        @click="handleModeChange('readonly')"
      >
        只读模式
      </button>
      <button
        type="button"
        class="bst-demo-button"
        :class="{ 'bst-demo-button-is-active': mode === 'editable' }"
        @click="handleModeChange('editable')"
      >
        编辑模式
      </button>
    </div>

    <div>当前模式：{{ mode === 'readonly' ? '只读' : '编辑' }}，菜单共 {{ items.length }} 项。</div>
    <div>切换模式后在区域内右键，菜单项随数据实时变化。</div>
    <div>最近一次选择：{{ selectedText }}</div>
  </div>

  <bst-context-menu
    v-model:is-visible="isVisible"
    v-model:position="position"
    :items="items"
    @item-select="handleItemSelect"
  />
</template>
