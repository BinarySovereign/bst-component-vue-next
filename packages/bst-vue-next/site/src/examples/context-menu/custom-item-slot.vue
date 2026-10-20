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
  { key: 'star', leftText: '收藏', rightText: '待办' },
  { key: 'pin', leftText: '置顶', rightText: '已完成' },
  { key: 'share', leftText: '分享', isDisabled: true },
];

function handleContextMenu(event: MouseEvent): void {
  position.value = { x: event.clientX, y: event.clientY };
  isVisible.value = true;
}

function handleItemSelect(context: BstContextMenuItemSelectContext): void {
  selectedText.value = context.item.leftText ?? '未知项';
}
</script>

<template>
  <div class="bst-demo-fill" @contextmenu.prevent="handleContextMenu">
    <div>在此区域点击鼠标右键，菜单项会渲染成序号 + 文本 + 状态胶囊</div>
    <div>最近一次选择：{{ selectedText }}</div>
  </div>

  <bst-context-menu
    v-model:is-visible="isVisible"
    v-model:position="position"
    :items="items"
    @item-select="handleItemSelect"
  >
    <template #item="{ item, index }">
      <span class="bst-demo-tag bst-demo-tag-muted">{{ index + 1 }}</span>
      <span class="bst-context-menu-item-left-text">{{ item.leftText }}</span>
      <span v-if="item.rightText" class="bst-demo-tag">{{ item.rightText }}</span>
    </template>
  </bst-context-menu>
</template>
