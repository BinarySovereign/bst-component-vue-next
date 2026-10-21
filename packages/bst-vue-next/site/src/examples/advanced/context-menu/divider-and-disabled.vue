<script setup lang="ts">
import { ref } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components';
import type {
  BstContextMenuItem,
  BstContextMenuItemSelectContext,
  BstContextMenuPosition,
} from '@binarysovereign/bst-advanced-components';

const isVisible = ref(false);
const position = ref<BstContextMenuPosition>({ x: 0, y: 0 });
const selectedText = ref('（尚未选择）');

const items: BstContextMenuItem[] = [
  { key: 'open', leftText: '打开' },
  { key: 'rename', leftText: '重命名', rightText: 'F2' },
  { key: 'divider-1', type: 'divider' },
  { key: 'archive', leftText: '归档', isDisabled: true },
  { key: 'delete', leftText: '删除', rightText: 'Delete' },
];

function handleContextMenu(event: MouseEvent): void {
  position.value = { x: event.clientX, y: event.clientY };
  isVisible.value = true;
}

function handleItemSelect(context: BstContextMenuItemSelectContext): void {
  selectedText.value = context.item.leftText ?? '分割线';
}
</script>

<template>
  <div class="bst-demo-fill" @contextmenu.prevent="handleContextMenu">
    <div>在此区域点击鼠标右键，可见分割线与灰显的禁用项</div>
    <div>最近一次选择：{{ selectedText }}</div>
  </div>

  <bst-context-menu
    v-model:is-visible="isVisible"
    v-model:position="position"
    :items="items"
    @item-select="handleItemSelect"
  />
</template>
