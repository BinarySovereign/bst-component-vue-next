<script setup lang="ts">
// 示例容器：按 demo id 渲染实时示例，并可展开查看构建期高亮后的源码。
import { computed, ref } from 'vue';

import { demoComponentMap, loadDemoHighlights } from '../demo-source';

interface DemoBlockProps {
  demo: string;
  title?: string;
  description?: string;
  sourceOpen?: boolean;
}

const props = defineProps<DemoBlockProps>();

const demoComponent = computed(() => demoComponentMap[props.demo]);

const isSourceOpen = ref(props.sourceOpen === true);

const sourceHtml = ref<string | undefined>();
const isLoading = ref(false);

async function toggleSource(): Promise<void> {
  isSourceOpen.value = !isSourceOpen.value;

  if (!isSourceOpen.value || sourceHtml.value !== undefined) {
    return;
  }

  isLoading.value = true;

  try {
    const highlights = await loadDemoHighlights();

    sourceHtml.value = highlights[props.demo];
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <section class="bst-demo-block">
    <header v-if="title || description" class="bst-demo-block-header">
      <p v-if="title" class="bst-demo-block-title">{{ title }}</p>
      <p v-if="description" class="bst-demo-block-description">{{ description }}</p>
    </header>

    <div class="bst-demo-block-preview">
      <slot>
        <component :is="demoComponent" v-if="demoComponent" />
        <p v-else class="bst-demo-block-missing">未找到示例：{{ demo }}</p>
      </slot>
    </div>

    <template v-if="demoComponent">
      <div class="bst-demo-block-actions">
        <button type="button" class="bst-demo-block-toggle" @click="toggleSource">
          {{ isSourceOpen ? '收起源码' : '查看源码' }}
        </button>
      </div>

      <div v-if="isSourceOpen" class="bst-demo-source">
        <p v-if="isLoading" class="bst-demo-source-hint">源码加载中…</p>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-else-if="sourceHtml" class="bst-demo-source-body" v-html="sourceHtml"></div>
        <p v-else class="bst-demo-source-hint">未找到该示例的源码。</p>
      </div>
    </template>
  </section>
</template>
