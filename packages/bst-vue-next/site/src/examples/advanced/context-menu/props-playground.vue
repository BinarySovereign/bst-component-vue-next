<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components';
import type {
  BstContextMenuItem,
  BstContextMenuItemSelectContext,
  BstContextMenuPosition,
} from '@binarysovereign/bst-advanced-components';

interface PropsPlaygroundProps {
  itemsText?: string;
  isCloseOnOutsideClick?: boolean;
  isCloseOnOutsideScroll?: boolean;
  isCloseOnEscKeyDown?: boolean;
  maxHeightType?: 'string' | 'number';
  maxHeightValue?: string;
  positionX?: string | number;
  positionY?: string | number;
  teleport?: boolean;
}

const props = withDefaults(defineProps<PropsPlaygroundProps>(), {
  itemsText: '[]',
  isCloseOnOutsideClick: true,
  isCloseOnOutsideScroll: true,
  isCloseOnEscKeyDown: true,
  maxHeightType: 'string',
  maxHeightValue: '',
  positionX: '',
  positionY: '',
  teleport: true,
});

const isVisible = ref(false);

const position = ref<BstContextMenuPosition>({ x: 0, y: 0 });

const triggerRef = ref<HTMLButtonElement>();

const items = ref<BstContextMenuItem[]>([]);

function handleItemSelect(context: BstContextMenuItemSelectContext): void {
  window.alert(`已选择：${context.item.leftText ?? String(context.item.key)}`);
}

function attachAction(item: BstContextMenuItem): BstContextMenuItem {
  if (item.type === 'divider' || item.isDisabled === true) {
    return item;
  }

  return { ...item, action: handleItemSelect };
}

function parseItems(text: string): BstContextMenuItem[] | undefined {
  try {
    const parsed: unknown = JSON.parse(text);

    return Array.isArray(parsed) ? (parsed as BstContextMenuItem[]).map(attachAction) : undefined;
  } catch {
    return undefined;
  }
}

const maxHeight = computed<number | string | undefined>(() => {
  const raw = props.maxHeightValue.trim();

  if (raw === '') {
    return undefined;
  }

  if (props.maxHeightType === 'number') {
    const value = Number(raw);

    return Number.isNaN(value) ? undefined : value;
  }

  return raw;
});

const configuredPosition = computed<BstContextMenuPosition | undefined>(() => {
  const rawX = String(props.positionX).trim();
  const rawY = String(props.positionY).trim();

  if (rawX === '' || rawY === '') {
    return undefined;
  }

  const x = Number(rawX);
  const y = Number(rawY);

  if (Number.isNaN(x) || Number.isNaN(y)) {
    return undefined;
  }

  return { x, y };
});

watch(configuredPosition, (next) => {
  if (next !== undefined && isVisible.value) {
    position.value = next;
  }
});

watch(
  () => props.itemsText,
  (text) => {
    const next = parseItems(text);

    if (next !== undefined) {
      items.value = next;
    }
  },
  { immediate: true },
);

function resolveOrigin(): BstContextMenuPosition {
  const container = triggerRef.value?.parentElement;

  if (props.teleport || !container) {
    return { x: 0, y: 0 };
  }

  const rect = container.getBoundingClientRect();

  return { x: rect.left, y: rect.top };
}

function handleOpen(): void {
  const configured = configuredPosition.value;

  if (configured !== undefined) {
    position.value = configured;
    isVisible.value = true;

    return;
  }

  const rect = triggerRef.value?.getBoundingClientRect();

  if (rect === undefined) {
    return;
  }

  const origin = resolveOrigin();

  position.value = {
    x: rect.left - origin.x + rect.width / 2,
    y: rect.bottom - origin.y + 8,
  };
  isVisible.value = true;
}
</script>

<template>
  <button ref="triggerRef" type="button" class="bst-demo-button" @click="handleOpen">打开菜单</button>

  <bst-context-menu
    v-model:is-visible="isVisible"
    v-model:position="position"
    :items="items"
    :is-close-on-outside-click="props.isCloseOnOutsideClick"
    :is-close-on-outside-scroll="props.isCloseOnOutsideScroll"
    :is-close-on-esc-key-down="props.isCloseOnEscKeyDown"
    :max-height="maxHeight"
    :teleport="props.teleport"
  />
</template>
