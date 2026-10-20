// BstContextMenu 示例对象的类型
//
// 各示例文件不直接引用 `context-menu.stories.tsx` 里的 `meta`（否则形成循环依赖），
// 统一用组件本身作为类型来源；两者推导出的 Args 都是 `BstContextMenuProps`。
import type { BstContextMenu } from '@binarysovereign/bst-advanced-components/context-menu';
import type { StoryObj } from '@storybook/vue3-vite';

/** 单个示例（story）的类型 */
export type ContextMenuStory = StoryObj<typeof BstContextMenu>;
