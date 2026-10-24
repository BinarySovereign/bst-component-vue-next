<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

interface DemoJsonEditorProps {
  modelValue: string;
  placeholder?: string;
}

const props = defineProps<DemoJsonEditorProps>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const TOKEN_PATTERN = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}[\],])/g;

const highlightRef = ref<HTMLPreElement>();

const inputRef = ref<HTMLTextAreaElement>();

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wrapToken(className: string, text: string): string {
  return `<span class="${className}">${escapeHtml(text)}</span>`;
}

function highlightJson(text: string): string {
  const parts: string[] = [];

  let cursor = 0;

  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const groups = match as unknown as Array<string | undefined>;
    const raw = match[0];
    const index = match.index;
    const stringToken = groups[1];
    const colon = groups[2];
    const number = groups[3];
    const literal = groups[4];
    const punctuation = groups[5];

    parts.push(escapeHtml(text.slice(cursor, index)));

    if (stringToken !== undefined) {
      parts.push(wrapToken(colon === undefined ? 'bst-json-editor-string' : 'bst-json-editor-key', stringToken));

      if (colon !== undefined) {
        parts.push(escapeHtml(colon));
      }
    } else if (number !== undefined) {
      parts.push(wrapToken('bst-json-editor-number', number));
    } else if (literal !== undefined) {
      parts.push(wrapToken('bst-json-editor-literal', literal));
    } else if (punctuation !== undefined) {
      parts.push(wrapToken('bst-json-editor-punctuation', punctuation));
    } else {
      parts.push(escapeHtml(raw));
    }

    cursor = index + raw.length;
  }

  parts.push(escapeHtml(text.slice(cursor)));

  return parts.join('');
}

const highlightedHtml = computed(() => `${highlightJson(props.modelValue)}\n`);

function syncScroll(): void {
  const input = inputRef.value;
  const highlight = highlightRef.value;

  if (input === undefined || highlight === undefined) {
    return;
  }

  highlight.scrollTop = input.scrollTop;
  highlight.scrollLeft = input.scrollLeft;
}

function handleInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
}

function formatJson(): void {
  const formatted = JSON.stringify(JSON.parse(props.modelValue) as unknown, null, 2);

  if (formatted !== props.modelValue) {
    emit('update:modelValue', formatted);
  }
}

function handleBlur(): void {
  try {
    formatJson();
  } catch {
    return;
  }
}

onMounted(() => {
  syncScroll();
});
</script>

<template>
  <div class="bst-json-editor">
    <!-- eslint-disable vue/no-v-html -->
    <pre
      ref="highlightRef"
      class="bst-json-editor-highlight"
      aria-hidden="true"
    ><code v-html="highlightedHtml"></code></pre>
    <!-- eslint-enable vue/no-v-html -->

    <textarea
      ref="inputRef"
      class="bst-json-editor-input"
      :value="modelValue"
      :placeholder="placeholder"
      spellcheck="false"
      @input="handleInput"
      @scroll="syncScroll"
      @blur="handleBlur"
    ></textarea>
  </div>
</template>
