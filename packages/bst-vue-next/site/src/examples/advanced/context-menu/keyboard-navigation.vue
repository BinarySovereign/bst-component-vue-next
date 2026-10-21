<script setup lang="ts">
import { ref } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components';
import type {
  BstContextMenuItem,
  BstContextMenuItemSelectContext,
  BstContextMenuPosition,
} from '@binarysovereign/bst-advanced-components';

const areaRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);
const position = ref<BstContextMenuPosition>({ x: 0, y: 0 });
const selectedText = ref('（尚未选择）');

const items: BstContextMenuItem[] = [
  { key: 'open', leftText: '打开', rightText: 'Enter' },
  { key: 'rename', leftText: '重命名' },
  { key: 'archive', leftText: '归档', isDisabled: true },
  { key: 'divider-1', type: 'divider' },
  { key: 'delete', leftText: '删除', rightText: 'Delete' },
];

function handleContextMenu(event: MouseEvent): void {
  position.value = { x: event.clientX, y: event.clientY };
  isVisible.value = true;
}

function handleOpenByKeyboard(): void {
  const rect = areaRef.value?.getBoundingClientRect();

  position.value = { x: (rect?.left ?? 0) + 24, y: (rect?.top ?? 0) + 24 };
  isVisible.value = true;
}

function handleItemSelect(context: BstContextMenuItemSelectContext): void {
  selectedText.value = context.item.leftText ?? `第 ${context.index + 1} 项`;
}
</script>

<template>
  <div ref="areaRef" class="bst-demo-fill" @contextmenu.prevent="handleContextMenu">
    <div class="bst-demo-toolbar">
      <button type="button" class="bst-demo-button" @click="handleOpenByKeyboard">不用鼠标打开菜单</button>
    </div>
    <div>打开后按 ↓ / ↑ 切换高亮，Enter 或空格确认，Esc 关闭；禁用项与分割线会被自动跳过。</div>
    <div>最近一次选择：{{ selectedText }}</div>
  </div>

  <bst-context-menu
    v-model:is-visible="isVisible"
    v-model:position="position"
    :items="items"
    @item-select="handleItemSelect"
  />
</template>
