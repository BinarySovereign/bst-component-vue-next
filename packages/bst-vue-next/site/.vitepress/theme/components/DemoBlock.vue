<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, useSlots } from 'vue';

import ClipboardJS from 'clipboard';

import { demoComponentMap, loadDemoHighlights } from '../demo-source';
import IconCheck from '../../icons/IconCheck.vue';
import IconCode from '../../icons/IconCode.vue';
import IconCopy from '../../icons/IconCopy.vue';

type DemoCodeTab = 'vue' | 'tsx';

interface DemoBlockProps {
  demo: string;
  title?: string;
  description?: string;
  sourceOpen?: boolean;
  playground?: Record<string, unknown>;
  codeTabs?: DemoCodeTab[];
}

const props = defineProps<DemoBlockProps>();

const CODE_TAB_LABELS: Record<DemoCodeTab, string> = { vue: 'Vue', tsx: 'Tsx' };

const slots = useSlots();

/** 演示区与配置区共享的可调属性，键名与示例组件声明的 props 一致 */
const playgroundState = reactive<Record<string, unknown>>({ ...props.playground });

/** 初值快照，供「重置示例」恢复 */
const initialPlayground: Record<string, unknown> = { ...props.playground };

const demoComponent = computed(() => demoComponentMap[props.demo]);

const resetKey = ref(0);

const isSourceOpen = ref(props.sourceOpen === true);

const codeTabs = computed<DemoCodeTab[]>(() => props.codeTabs ?? ['vue']);

const activeTab = ref<DemoCodeTab>(props.codeTabs?.[0] ?? 'vue');

const sourceHtmlMap = ref<Partial<Record<DemoCodeTab, string>>>({});

const sourceHtml = computed(() => sourceHtmlMap.value[activeTab.value]);

const isLoading = ref(false);

const isCopied = ref(false);

let copyTimer: ReturnType<typeof setTimeout> | undefined;

function toHighlightKey(tab: DemoCodeTab): string {
  return tab === 'vue' ? props.demo : `${props.demo}.${tab}`;
}

function resetDemo(): void {
  for (const key of Object.keys(playgroundState)) {
    delete playgroundState[key];
  }

  Object.assign(playgroundState, initialPlayground);

  resetKey.value += 1;
}

async function ensureSourceHtml(tab: DemoCodeTab): Promise<string | undefined> {
  const cached = sourceHtmlMap.value[tab];

  if (cached !== undefined) {
    return cached;
  }

  const highlights = await loadDemoHighlights();

  const html = highlights[toHighlightKey(tab)];

  if (html !== undefined) {
    sourceHtmlMap.value[tab] = html;
  }

  return html;
}

async function loadTab(tab: DemoCodeTab): Promise<void> {
  if (sourceHtmlMap.value[tab] !== undefined) {
    return;
  }

  isLoading.value = true;

  try {
    await ensureSourceHtml(tab);
  } finally {
    isLoading.value = false;
  }
}

async function toggleSource(): Promise<void> {
  isSourceOpen.value = !isSourceOpen.value;

  if (isSourceOpen.value) {
    await loadTab(activeTab.value);
  }
}

async function selectTab(tab: DemoCodeTab): Promise<void> {
  if (tab === activeTab.value) {
    return;
  }

  activeTab.value = tab;

  if (isSourceOpen.value) {
    await loadTab(tab);
  }
}

function toPlainSource(html: string): string {
  const parsed = new DOMParser().parseFromString(html, 'text/html');

  return (parsed.body.querySelector('pre')?.textContent ?? '').replace(/\r\n/g, '\n');
}

function stopCopyFeedback(): void {
  if (copyTimer !== undefined) {
    clearTimeout(copyTimer);

    copyTimer = undefined;
  }

  isCopied.value = false;
}

function writeClipboard(text: string): boolean {
  try {
    return ClipboardJS.copy(text) === text;
  } catch {
    return false;
  }
}

async function copySource(): Promise<void> {
  const html = await ensureSourceHtml('vue');

  if (html === undefined || !writeClipboard(toPlainSource(html))) {
    stopCopyFeedback();

    return;
  }

  isCopied.value = true;

  if (copyTimer !== undefined) {
    clearTimeout(copyTimer);
  }

  copyTimer = setTimeout(stopCopyFeedback, 1500);
}

onBeforeUnmount(stopCopyFeedback);
</script>

<template>
  <section class="bst-demo-block" :class="{ 'bst-demo-block-source-open': isSourceOpen }">
    <header class="bst-demo-block-header">
      <p v-if="title" class="bst-demo-block-title">{{ title }}</p>
      <p v-if="description" class="bst-demo-block-description">{{ description }}</p>
      <button v-if="demoComponent" type="button" class="bst-demo-block-reset" @click="resetDemo">重置示例</button>
    </header>

    <div class="bst-demo-block-content">
      <div class="bst-demo-block-display">
        <span class="bst-demo-block-panel-label">演示区</span>

        <div class="bst-demo-block-display-content">
          <slot>
            <component :is="demoComponent" v-if="demoComponent" :key="resetKey" v-bind="playgroundState" />
            <p v-else class="bst-demo-block-missing">未找到示例：{{ demo }}</p>
          </slot>
        </div>

        <div v-if="demoComponent" class="bst-demo-block-actions">
          <button
            type="button"
            class="bst-demo-block-action"
            :title="isCopied ? '已复制' : '复制源码'"
            :aria-label="isCopied ? '已复制' : '复制源码'"
            @click="copySource"
          >
            <component :is="isCopied ? IconCheck : IconCopy" />
          </button>

          <button
            type="button"
            class="bst-demo-block-action"
            :class="{ 'bst-demo-block-action-active': isSourceOpen }"
            :title="isSourceOpen ? '收起源码' : '查看源码'"
            :aria-label="isSourceOpen ? '收起源码' : '查看源码'"
            @click="toggleSource"
          >
            <component :is="IconCode" />
          </button>
        </div>
      </div>

      <div v-if="slots.config" class="bst-demo-block-config">
        <span class="bst-demo-block-panel-label">配置区</span>

        <div class="bst-demo-block-config-content">
          <slot name="config" :playground="playgroundState" />
        </div>
      </div>
    </div>

    <div v-if="isSourceOpen" class="bst-demo-source">
      <div v-if="codeTabs.length > 1" class="bst-demo-source-tabs">
        <button
          v-for="tab in codeTabs"
          :key="tab"
          type="button"
          class="bst-demo-source-tab"
          :class="{ 'bst-demo-source-tab-active': activeTab === tab }"
          @click="selectTab(tab)"
        >
          {{ CODE_TAB_LABELS[tab] }}
        </button>
      </div>

      <p v-if="isLoading" class="bst-demo-source-hint">源码加载中…</p>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-else-if="sourceHtml" class="bst-demo-source-body" v-html="sourceHtml"></div>
      <p v-else class="bst-demo-source-hint">未找到该示例的源码。</p>
    </div>
  </section>
</template>
