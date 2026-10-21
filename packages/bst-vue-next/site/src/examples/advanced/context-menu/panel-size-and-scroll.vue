<script setup lang="ts">
import { ref } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components';
import type {
  BstContextMenuItem,
  BstContextMenuItemSelectContext,
  BstContextMenuPosition,
} from '@binarysovereign/bst-advanced-components';

interface SizePreset {
  label: string;
  value: number | string | undefined;
}

const isVisible = ref(false);
const position = ref<BstContextMenuPosition>({ x: 0, y: 0 });
const selectedText = ref('（尚未选择）');
const width = ref<number | string | undefined>(undefined);
const maxHeight = ref<number | string | undefined>(undefined);

const widthPresets: SizePreset[] = [
  { label: '默认 320px', value: undefined },
  { label: '240（数字）', value: 240 },
  { label: '480px（字符串）', value: '480px' },
];

const maxHeightPresets: SizePreset[] = [
  { label: '默认', value: undefined },
  { label: '120px', value: 120 },
  { label: '240px', value: 240 },
];

const items: BstContextMenuItem[] = Array.from({ length: 16 }, (_, index) => ({
  key: `action-${index + 1}`,
  leftText: `操作 ${String(index + 1)}`,
  rightText: index % 3 === 0 ? 'Ctrl+Shift' : undefined,
}));

function handleContextMenu(event: MouseEvent): void {
  position.value = { x: event.clientX, y: event.clientY };
  isVisible.value = true;
}

function handleItemSelect(context: BstContextMenuItemSelectContext): void {
  selectedText.value = context.item.leftText ?? '';
}
</script>

<template>
  <div class="bst-demo-fill" @contextmenu.prevent="handleContextMenu">
    <div class="bst-demo-fields">
      <span class="bst-demo-field">
        宽度：
        <button
          v-for="preset in widthPresets"
          :key="preset.label"
          type="button"
          class="bst-demo-button"
          :class="{ 'bst-demo-button-is-active': width === preset.value }"
          @click="width = preset.value"
        >
          {{ preset.label }}
        </button>
      </span>
      <span class="bst-demo-field">
        最大高度：
        <button
          v-for="preset in maxHeightPresets"
          :key="preset.label"
          type="button"
          class="bst-demo-button"
          :class="{ 'bst-demo-button-is-active': maxHeight === preset.value }"
          @click="maxHeight = preset.value"
        >
          {{ preset.label }}
        </button>
      </span>
    </div>

    <div>先选尺寸，再在区域内右键；缩小最大高度后，面板内部会出现滚动而不是继续撑开。</div>
    <div>最近一次选择：{{ selectedText }}</div>
  </div>

  <bst-context-menu
    v-model:is-visible="isVisible"
    v-model:position="position"
    :items="items"
    :width="width"
    :max-height="maxHeight"
    @item-select="handleItemSelect"
  />
</template>
