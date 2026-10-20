<script setup lang="ts">
import type { BstContextMenuItem } from '@binarysovereign/bst-types';

import { BstContextMenu } from '../index';

defineOptions({ components: { BstContextMenu } });

const basicItems: BstContextMenuItem[] = [
  { key: 'open', leftText: '打开', rightText: 'Ctrl+O' },
  { key: 'rename', leftText: '重命名', rightText: 'F2' },
];

const stateItems: BstContextMenuItem[] = [
  { key: 'copy', leftText: '复制' },
  { key: 'divider', type: 'divider' },
  { key: 'delete', leftText: '删除', isDisabled: true },
];
</script>

<template>
  <div class="context-menu-demo">
    <bst-context-menu :is-visible="true" :teleport="false" :position="{ x: 100, y: 100 }" :items="basicItems" />
    <bst-context-menu :is-visible="true" :teleport="false" :position="{ x: 100, y: 240 }" :items="stateItems" />
    <bst-context-menu
      :is-visible="true"
      :teleport="false"
      :position="{ x: 100, y: 380 }"
      :items="basicItems"
      :width="360"
      max-height="320px"
    >
      <div class="context-menu-demo-custom">自定义内容</div>
    </bst-context-menu>
    <bst-context-menu :is-visible="false" :teleport="false" :position="{ x: 100, y: 520 }" :items="basicItems" />
  </div>
</template>
