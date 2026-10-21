<script setup lang="ts">
import { ref } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components';
import type {
  BstContextMenuExpose,
  BstContextMenuItem,
  BstContextMenuItemSelectContext,
  BstContextMenuPosition,
} from '@binarysovereign/bst-advanced-components';

const menuRef = ref<BstContextMenuExpose | null>(null);
const isVisible = ref(false);
const position = ref<BstContextMenuPosition>({ x: 0, y: 0 });
const selectedText = ref('（尚未选择）');

const items: BstContextMenuItem[] = [
  { key: 'copy', leftText: '复制' },
  { key: 'rename', leftText: '重命名' },
  { key: 'delete', leftText: '删除' },
];

function handleContextMenu(event: MouseEvent): void {
  position.value = { x: event.clientX, y: event.clientY };
  isVisible.value = true;
}

function handleCustomSelect(item: BstContextMenuItem): void {
  selectedText.value = item.leftText ?? String(item.key);
  menuRef.value?.hide();
}

function handleItemSelect(context: BstContextMenuItemSelectContext): void {
  selectedText.value = context.item.leftText ?? '';
}
</script>

<template>
  <div class="bst-demo-fill" @contextmenu.prevent="handleContextMenu">
    <div>在此区域右键：面板内容由 default 插槽完全接管，不再按 items 渲染。</div>
    <div>自定义内容里的按钮需要自行处理点击与关闭，键盘导航仍以 items 为准。</div>
    <div>因为插槽里没有使用组件的菜单项节点，方向键不会有视觉高亮。</div>
    <div>最近一次选择：{{ selectedText }}</div>
  </div>

  <bst-context-menu
    ref="menuRef"
    v-model:is-visible="isVisible"
    v-model:position="position"
    :items="items"
    @item-select="handleItemSelect"
  >
    <template #default>
      <div class="bst-demo-panel">
        <span class="bst-demo-tag">自定义面板</span>
        <div>下面三项由插槽手写，items 只用于键盘导航。</div>
        <button
          v-for="item in items"
          :key="item.key"
          type="button"
          class="bst-demo-button"
          @click="handleCustomSelect(item)"
        >
          {{ item.leftText }}
        </button>
      </div>
    </template>
  </bst-context-menu>
</template>
