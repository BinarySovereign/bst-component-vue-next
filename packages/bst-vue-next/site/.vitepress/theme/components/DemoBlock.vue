<script setup lang="ts">
// 站点示例容器：markdown 中直接使用，按 id 自动取到实时示例与对应的高亮源码
//
// 源码展示区未拆成独立子组件：仓库 ESLint 要求模板内组件名用短横线风格，
// 而 `@typescript-eslint/no-unused-vars` 不认短横线写法与 PascalCase 导入名对应，
// 拆分会导致 import 被判为未使用。自包含可绕开这一张力。
import { computed, ref } from 'vue';

import { demoComponentMap, loadDemoHighlights } from '../demo-source';

interface DemoBlockProps {
  /** 示例 id：`src/examples/` 下的相对路径去掉 `.vue`，如 `button/basic-usage` */
  demo: string;
  /** 示例标题 */
  title?: string;
  /** 示例说明 */
  description?: string;
  /** 初始是否展开源码 */
  sourceOpen?: boolean;
}

const props = defineProps<DemoBlockProps>();

const demoComponent = computed(() => demoComponentMap[props.demo]);

// 可选 prop 在类型上是 boolean（Vue 对 props 做了 LooseRequired 处理），但运行时仍可能是 undefined，
// 故用 `=== true` 显式归一为 boolean，既符合类型也符合运行期实际
const isSourceOpen = ref(props.sourceOpen === true);

// 高亮 HTML 在展开时才载入（独立 chunk），未展开源码的页面不会为它付出体积
const sourceHtml = ref<string | undefined>();
const isLoading = ref(false);

/**
 * 切换源码区的展开状态，首次展开时载入高亮 HTML
 *
 * @returns 无
 */
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
      <!-- 默认插槽优先：需要自定义容器时，在 markdown 里写子节点即可覆盖 -->
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
        <!-- eslint-disable-next-line vue/no-v-html -- 内容为构建期由本地示例文件经 Shiki 生成的静态 HTML，非用户输入 -->
        <div v-else-if="sourceHtml" class="bst-demo-source-body" v-html="sourceHtml"></div>
        <p v-else class="bst-demo-source-hint">未找到该示例的源码。</p>
      </div>
    </template>
  </section>
</template>
