<script setup lang="ts">
import { ref } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components';
import type {
  BstContextMenuItem,
  BstContextMenuItemSelectContext,
  BstContextMenuPosition,
} from '@binarysovereign/bst-advanced-components';

interface LogEntry {
  id: number;
  text: string;
}

const isVisible = ref(false);
const position = ref<BstContextMenuPosition>({ x: 0, y: 0 });
const logs = ref<LogEntry[]>([]);

let logId = 0;

function pushLog(text: string): void {
  logId += 1;
  logs.value.push({ id: logId, text });
}

const items: BstContextMenuItem[] = [
  {
    key: 'copy',
    leftText: '复制',
    rightText: 'Ctrl+C',
    action: (context): void => pushLog(`action 执行：${context.item.leftText ?? ''}`),
  },
  {
    key: 'rename',
    leftText: '重命名',
    rightText: 'F2',
    action: (context): void => pushLog(`action 执行：${context.item.leftText ?? ''}`),
  },
  { key: 'divider-1', type: 'divider' },
  {
    key: 'delete',
    leftText: '删除',
    rightText: 'Delete',
    action: (context): void => pushLog(`action 执行：${context.item.leftText ?? ''}`),
  },
];

function handleContextMenu(event: MouseEvent): void {
  position.value = { x: event.clientX, y: event.clientY };
  isVisible.value = true;
}

function handleItemSelect(context: BstContextMenuItemSelectContext): void {
  pushLog(`item-select 触发：${context.item.leftText ?? ''}`);
}
</script>

<template>
  <div class="bst-demo-fill" @contextmenu.prevent="handleContextMenu">
    <div>在此区域右键，点击任意项后日志会显示 item-select 与 action 的先后顺序。</div>
    <ul class="bst-demo-log">
      <li v-if="logs.length === 0">（尚未操作）</li>
      <li v-for="log in logs" :key="log.id">{{ log.text }}</li>
    </ul>
  </div>

  <bst-context-menu
    v-model:is-visible="isVisible"
    v-model:position="position"
    :items="items"
    @item-select="handleItemSelect"
  />
</template>
