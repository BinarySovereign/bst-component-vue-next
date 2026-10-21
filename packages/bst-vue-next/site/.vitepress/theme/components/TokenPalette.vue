<script setup lang="ts">
// 设计令牌总览表：清单来自 virtual:bst-tokens，色块用 var(--bst-*) 随主题实时着色。
import { computed, onMounted, ref, watch } from 'vue';

interface PaletteToken {
  name: string;
  note: string;
  light: string;
  dark: string;
  alias: string;
  isColor: boolean;
}

interface PaletteGroup {
  title: string;
  description: string;
  items: PaletteToken[];
}

const groups = ref<PaletteGroup[]>([]);
const keyword = ref('');
const onlyThemeable = ref(false);
const isLoaded = ref(false);
const openGroups = ref<string[]>([]);

onMounted(async () => {
  groups.value = (await import('virtual:bst-tokens')).default;
  isLoaded.value = true;
});

const totalCount = computed(() => groups.value.reduce((sum, group) => sum + group.items.length, 0));

const themeableCount = computed(() =>
  groups.value.reduce((sum, group) => sum + group.items.filter((item) => item.light !== item.dark).length, 0),
);

const isFiltering = computed(() => keyword.value.trim() !== '' || onlyThemeable.value);

const filteredGroups = computed(() => {
  const query = keyword.value.trim().toLowerCase();

  return groups.value
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (onlyThemeable.value && item.light === item.dark) {
          return false;
        }

        return query === '' || item.name.toLowerCase().includes(query) || item.note.toLowerCase().includes(query);
      }),
    }))
    .filter((group) => group.items.length > 0);
});

const visibleCount = computed(() => filteredGroups.value.reduce((sum, group) => sum + group.items.length, 0));

watch([keyword, onlyThemeable], () => {
  openGroups.value = isFiltering.value ? filteredGroups.value.map((group) => group.title) : [];
});

function onGroupToggle(title: string, event: Event): void {
  const { open } = event.target as HTMLDetailsElement;

  openGroups.value = open
    ? [...new Set([...openGroups.value, title])]
    : openGroups.value.filter((item) => item !== title);
}

function toggleAll(open: boolean): void {
  openGroups.value = open ? filteredGroups.value.map((group) => group.title) : [];
}

function swatchStyle(item: PaletteToken): Record<string, string> {
  const reference = `var(${item.name})`;

  return item.light.includes('gradient(') ? { backgroundImage: reference } : { backgroundColor: reference };
}
</script>

<template>
  <div class="bst-token-palette">
    <div class="bst-token-toolbar">
      <label class="bst-token-field">
        <span class="bst-token-field-label">筛选</span>
        <input v-model="keyword" type="search" placeholder="按名称或说明过滤，如 brand、radius、尺寸" />
      </label>

      <label class="bst-token-field bst-token-field-check">
        <input v-model="onlyThemeable" type="checkbox" />
        <span>只看随主题变化的令牌</span>
      </label>

      <span class="bst-token-actions">
        <button type="button" class="bst-token-button" @click="toggleAll(true)">全部展开</button>
        <button type="button" class="bst-token-button" @click="toggleAll(false)">全部折叠</button>
      </span>

      <p class="bst-token-summary">
        共 {{ totalCount }} 个令牌，其中 {{ themeableCount }} 个随主题变化；当前命中 {{ visibleCount }} 个。
        <template v-if="!isFiltering">分组默认折叠，可展开查看。</template>
      </p>
    </div>

    <p v-if="!isLoaded" class="bst-token-hint">正在载入令牌清单…</p>
    <p v-else-if="filteredGroups.length === 0" class="bst-token-hint">没有匹配的令牌。</p>

    <details
      v-for="group in filteredGroups"
      :key="group.title"
      class="bst-token-group"
      :open="openGroups.includes(group.title)"
      @toggle="onGroupToggle(group.title, $event)"
    >
      <summary class="bst-token-group-summary">
        <span class="bst-token-group-title">{{ group.title }}</span>
        <span class="bst-token-group-count">{{ group.items.length }} 项</span>
      </summary>
      <p class="bst-token-group-description">{{ group.description }}</p>

      <table class="bst-token-table">
        <thead>
          <tr>
            <th>令牌</th>
            <th>取值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in group.items" :key="item.name">
            <td class="bst-token-cell-name">
              <code>{{ item.name }}</code>
            </td>
            <td class="bst-token-cell-value">
              <span v-if="item.isColor" class="bst-token-swatch" :style="swatchStyle(item)" />
              <span v-if="item.light === item.dark" class="bst-token-value">{{ item.light }}</span>
              <template v-else>
                <span class="bst-token-value"><em>亮</em> {{ item.light }}</span>
                <span class="bst-token-value"><em>暗</em> {{ item.dark }}</span>
              </template>
              <span v-if="item.alias" class="bst-token-alias">← {{ item.alias }}</span>
            </td>
            <td class="bst-token-cell-note">{{ item.note }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>
