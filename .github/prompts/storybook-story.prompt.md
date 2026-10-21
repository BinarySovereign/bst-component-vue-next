---
description: "为组件新增或更新 Storybook story，覆盖 props、events、slots、实例方法与边界场景"
argument-hint: "组件名与要覆盖的能力（如：context-menu 的 teleport 三种取值）"
agent: "agent"
---

为指定组件补充 Storybook 预览。

## 前置

1. 先运行 `pnpm build:style`，样式来自样式包构建产物。
2. 读 `packages/bst-vue-next/storybook/README.md` 与 `.storybook/main.ts`。
3. 读组件源码的 props、emits、slots、expose 定义，确认要覆盖的能力。

## 落点

- story：`packages/bst-vue-next/storybook/src/stories/<basic|advanced|ai>/<组件名>.stories.tsx`。
- 示例实现：`packages/bst-vue-next/storybook/src/examples/<basic|advanced|ai>/<组件名>/<场景>.example.tsx`，一个场景一个文件。
- 组件与类型从工作区源码包导入，按需使用子路径，例如 `@binarysovereign/bst-advanced-components/context-menu`；禁止从 `@binarysovereign/vue-next*` 主包导入。
- 分层目录严格对应源码包：`basic` / `advanced` / `ai`。

## Story 约定

- meta 使用 `title: '<中文层名>/<组件名>'`、`tags: ['autodocs']`，并在 `docs.description.component` 写一句组件定位。
- `args` 提供可用的默认值，让 Controls 面板可直接调参；单个 story 只覆盖与默认值不同的部分。
- 覆盖顺序：Props 各取值 → Events → Slots → 实例方法 → 边界与异常场景。
- 回调类能力用 Actions 面板可见的方式呈现；需要展示事件结果的，在演示区显示状态文本。
- 演示区内的工具栏或控制按钮放在内容上方，避免被弹出的浮层遮挡。
- 不为纯逻辑工具或单测已覆盖的分支硬凑 story。

## 验收

1. `pnpm typecheck:storybook` 通过。
2. `pnpm build:storybook` 通过。
3. 输出新增与修改的文件列表，以及新增 story 覆盖的能力清单。
