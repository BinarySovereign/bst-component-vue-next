<script setup lang="ts">
interface DemoConfigItemProps {
  label: string;
}

defineProps<DemoConfigItemProps>();
</script>

<template>
  <div class="bst-demo-config-item">
    <span class="bst-demo-config-item-label">{{ label }}</span>

    <div class="bst-demo-config-item-control">
      <slot />
    </div>
  </div>
</template>
