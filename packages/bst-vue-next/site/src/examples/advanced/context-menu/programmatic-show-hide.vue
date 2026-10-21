<script setup lang="ts">
import { ref } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components';
import type {
  BstContextMenuExpose,
  BstContextMenuItem,
  BstContextMenuItemSelectContext,
} from '@binarysovereign/bst-advanced-components';

const areaRef = ref<HTMLElement | null>(null);
const menuRef = ref<BstContextMenuExpose | null>(null);
const selectedText = ref('（尚未选择）');
const logs = ref<string[]>([]);

const items: BstContextMenuItem[] = [
  { key: 'open', leftText: '打开' },
  { key: 'rename', leftText: '重命名' },
  { key: 'delete', leftText: '删除' },
];

function pushLog(text: string): void {
  logs.value = [...logs.value, text].slice(-5);
}

function handleShow(): void {
  const rect = areaRef.value?.getBoundingClientRect();

  menuRef.value?.show((rect?.left ?? 0) + 24, (rect?.top ?? 0) + 24);
}

function handleHide(): void {
  menuRef.value?.hide();
}

function handleItemSelect(context: BstContextMenuItemSelectContext): void {
  selectedText.value = context.item.leftText ?? '';
}

function handleAfterEnter(): void {
  pushLog('after-enter');
}

function handleAfterLeave(): void {
  pushLog('after-leave');
}
</script>

<template>
  <div ref="areaRef" class="bst-demo-fill">
    <div class="bst-demo-toolbar">
      <button type="button" class="bst-demo-button" @click="handleShow">show(x, y)</button>
      <button type="button" class="bst-demo-button" @click="handleHide">hide()</button>
    </div>
    <div>不依赖右键，由业务代码控制显隐；日志会记录入场与出场动画结束的时机。</div>
    <div>此处已关闭外部点击与外部滚动自动关闭，避免点按钮时被当成外部交互。</div>
    <div>最近一次选择：{{ selectedText }}</div>
    <ul class="bst-demo-log">
      <li v-if="logs.length === 0">（尚未操作）</li>
      <li v-for="(log, index) in logs" :key="index">{{ log }}</li>
    </ul>
  </div>

  <bst-context-menu
    ref="menuRef"
    :items="items"
    :is-close-on-outside-click="false"
    :is-close-on-outside-scroll="false"
    @item-select="handleItemSelect"
    @after-enter="handleAfterEnter"
    @after-leave="handleAfterLeave"
  />
</template>
