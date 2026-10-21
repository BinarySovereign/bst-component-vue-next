<script setup lang="ts">
import { ref } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components';
import type {
  BstContextMenuItem,
  BstContextMenuItemSelectContext,
  BstContextMenuPosition,
} from '@binarysovereign/bst-advanced-components';

const isVisible = ref(false);
const clickedPosition = ref<BstContextMenuPosition>({ x: 0, y: 0 });
const position = ref<BstContextMenuPosition>({ x: 0, y: 0 });
const selectedText = ref('（尚未选择）');

const items: BstContextMenuItem[] = [
  { key: 'open', leftText: '打开' },
  { key: 'rename', leftText: '重命名' },
  { key: 'divider-1', type: 'divider' },
  { key: 'delete', leftText: '删除' },
];

function handleContextMenu(event: MouseEvent): void {
  clickedPosition.value = { x: event.clientX, y: event.clientY };
  position.value = { x: event.clientX, y: event.clientY };
  isVisible.value = true;
}

function handleItemSelect(context: BstContextMenuItemSelectContext): void {
  selectedText.value = context.item.leftText ?? '';
}
</script>

<template>
  <div class="bst-demo-fill" @contextmenu.prevent="handleContextMenu">
    <div>在预览区右键；越靠近窗口右下角，越能看出点击坐标与实际坐标的差值。</div>
    <div>点击坐标：{{ clickedPosition.x }}, {{ clickedPosition.y }}</div>
    <div>实际坐标：{{ position.x }}, {{ position.y }}</div>
    <div>最近一次选择：{{ selectedText }}</div>
  </div>

  <bst-context-menu
    v-model:is-visible="isVisible"
    v-model:position="position"
    :items="items"
    @item-select="handleItemSelect"
  />
</template>
