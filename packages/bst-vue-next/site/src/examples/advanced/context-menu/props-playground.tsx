import { defineComponent, ref } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components';
import type { BstContextMenuItem, BstContextMenuPosition } from '@binarysovereign/bst-advanced-components';

const ITEMS: BstContextMenuItem[] = [
  { key: 'copy', leftText: '复制', rightText: 'Ctrl+C' },
  { key: 'paste', leftText: '粘贴', rightText: 'Ctrl+V' },
  { key: 'divider', type: 'divider' },
  { key: 'delete', leftText: '删除', rightText: 'Delete', isDisabled: true },
];

export default defineComponent({
  name: 'ContextMenuTsxExample',

  setup() {
    const isVisible = ref(false);
    const position = ref<BstContextMenuPosition>({ x: 0, y: 0 });
    const selectedText = ref('（尚未选择）');

    const handleContextMenu = (event: MouseEvent): void => {
      position.value = { x: event.clientX, y: event.clientY };
      isVisible.value = true;
    };

    return () => (
      <div class="bst-demo-fill" onContextmenu={handleContextMenu}>
        <div>在此区域点击鼠标右键唤出菜单</div>
        <div>最近一次选择：{selectedText.value}</div>

        <BstContextMenu
          isVisible={isVisible.value}
          position={position.value}
          items={ITEMS}
          maxHeight={200}
          teleport
          {...{
            'onUpdate:isVisible': (visible: boolean) => {
              isVisible.value = visible;
            },
            'onUpdate:position': (next: BstContextMenuPosition) => {
              position.value = next;
            },
          }}
          onItemSelect={(context) => {
            selectedText.value = context.item.leftText ?? '';
          }}
        />
      </div>
    );
  },
});
