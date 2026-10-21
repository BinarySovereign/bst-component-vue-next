<script setup lang="ts">
import { reactive } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components';
import type { BstContextMenuItem, BstContextMenuPosition } from '@binarysovereign/bst-advanced-components';

interface RowState {
  key: number;
  name: string;
  isVisible: boolean;
  position: BstContextMenuPosition;
  lastAction: string;
  items: BstContextMenuItem[];
}

function createRow(key: number, name: string): RowState {
  const row: RowState = {
    key,
    name,
    isVisible: false,
    position: { x: 0, y: 0 },
    lastAction: '（尚未操作）',
    items: [],
  };

  row.items = [
    {
      key: `${String(key)}-open`,
      leftText: '打开',
      action: (): void => {
        row.lastAction = '打开';
      },
    },
    {
      key: `${String(key)}-rename`,
      leftText: '重命名',
      action: (): void => {
        row.lastAction = '重命名';
      },
    },
    { key: `${String(key)}-divider`, type: 'divider' },
    {
      key: `${String(key)}-delete`,
      leftText: '删除',
      action: (): void => {
        row.lastAction = '删除';
      },
    },
  ];

  return row;
}

const rows = reactive<RowState[]>([createRow(1, '项目 A'), createRow(2, '项目 B'), createRow(3, '项目 C')]);

function handleContextMenu(row: RowState, event: MouseEvent): void {
  row.position = { x: event.clientX, y: event.clientY };
  row.isVisible = true;
}
</script>

<template>
  <div class="bst-demo-fill">
    <div>每一行都有自己的菜单实例：在某行右键，其他行的菜单状态不受影响。</div>
    <div v-for="row in rows" :key="row.key" class="bst-demo-row" @contextmenu.prevent="handleContextMenu(row, $event)">
      <span>{{ row.name }}</span>
      <span class="bst-demo-tag bst-demo-tag-muted">最近：{{ row.lastAction }}</span>
    </div>

    <bst-context-menu
      v-for="row in rows"
      :key="`menu-${row.key}`"
      v-model:is-visible="row.isVisible"
      v-model:position="row.position"
      :items="row.items"
    />
  </div>
</template>
