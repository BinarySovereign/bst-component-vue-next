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
const isCloseOnOutsideClick = ref(true);
const isCloseOnOutsideScroll = ref(true);
const isCloseOnEscKeyDown = ref(true);
const selectedText = ref('（尚未选择）');
const logs = ref<string[]>([]);

const items: BstContextMenuItem[] = [
  { key: 'copy', leftText: '复制' },
  { key: 'paste', leftText: '粘贴' },
  { key: 'delete', leftText: '删除' },
];

function pushLog(text: string): void {
  logs.value = [text, ...logs.value].slice(0, 5);
}

function handleOpen(): void {
  position.value = { x: 240, y: 200 };
  isVisible.value = true;
}

function handleItemSelect(context: BstContextMenuItemSelectContext): void {
  selectedText.value = context.item.leftText ?? '';
}
</script>

<template>
  <div class="bst-demo-fill">
    <div class="bst-demo-fields">
      <label class="bst-demo-field">
        <input v-model="isCloseOnOutsideClick" type="checkbox" />
        点击外部关闭
      </label>
      <label class="bst-demo-field">
        <input v-model="isCloseOnOutsideScroll" type="checkbox" />
        外部滚动关闭
      </label>
      <label class="bst-demo-field">
        <input v-model="isCloseOnEscKeyDown" type="checkbox" />
        Esc 关闭
      </label>
    </div>

    <div class="bst-demo-toolbar">
      <button type="button" class="bst-demo-button" @click="handleOpen">打开菜单</button>
    </div>

    <div>先设开关再打开菜单；菜单打开时点开关会被当成外部点击而关闭。</div>
    <div>打开后分别点击外部、滚动页面、按 Esc，观察日志与开关是否一致。</div>
    <div>最近一次选择：{{ selectedText }}</div>

    <ul class="bst-demo-log">
      <li v-if="logs.length === 0">（尚未操作）</li>
      <li v-for="(log, index) in logs" :key="index">{{ log }}</li>
    </ul>
  </div>

  <bst-context-menu
    v-model:is-visible="isVisible"
    v-model:position="position"
    :items="items"
    :is-close-on-outside-click="isCloseOnOutsideClick"
    :is-close-on-outside-scroll="isCloseOnOutsideScroll"
    :is-close-on-esc-key-down="isCloseOnEscKeyDown"
    @item-select="handleItemSelect"
    @click-outside="pushLog('click-outside')"
    @scroll-outside="pushLog('scroll-outside')"
    @esc-key-down="pushLog('esc-key-down')"
  />
</template>
