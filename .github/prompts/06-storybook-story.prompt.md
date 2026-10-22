---
description: "为组件新增或更新 Storybook story，覆盖 props、events、slots、实例方法与边界场景"
argument-hint: "组件名与要覆盖的能力（如：advanced <组件名> 的某个 Prop 取值矩阵）"
agent: "agent"
---

为指定组件补充 Storybook 预览。

> 组件开发链路第 6 步，完整顺序见 `/03-component-source` 的「全流程顺序」。

## 前置

1. 先运行 `pnpm build:style`，样式来自样式包构建产物。
2. 读 `packages/bst-vue-next/storybook/README.md` 与 `.storybook/main.ts`。
3. 读组件源码的 props、emits、slots、expose 定义，确认要覆盖的能力。

## 落点

- story：`packages/bst-vue-next/storybook/src/stories/<basic|advanced|ai>/<组件名>.stories.tsx`。
- 示例实现：`packages/bst-vue-next/storybook/src/examples/<basic|advanced|ai>/<组件名>/<场景>.example.tsx`，一个场景一个文件。
- 组件与类型从工作区源码包导入，按需使用子路径（`@binarysovereign/bst-<层>-components/<组件>`）；禁止从 `@binarysovereign/vue-next*` 主包导入。
- 分层目录严格对应源码包：`basic` / `advanced` / `ai`。

## Story 约定

- meta 使用 `title: '<中文层名>/<组件名>'`、`tags: ['autodocs']`，并在 `docs.description.component` 写一句组件定位。
- `args` 提供可用的默认值，让 Controls 面板可直接调参；单个 story 只覆盖与默认值不同的部分。
- 覆盖顺序：Props 各取值 → Events → Slots → 实例方法 → 边界与异常场景。
- 回调类能力用 Actions 面板可见的方式呈现；需要展示事件结果的，在演示区显示状态文本。
- 控制按钮不要放在会被组件自身浮层或弹出内容遮挡的位置。
- 不为纯逻辑工具或单测已覆盖的分支硬凑 story。

## 验收

1. `pnpm typecheck:storybook` 通过。
2. `pnpm build:storybook` 通过。
3. 输出新增与修改的文件列表，以及新增 story 覆盖的能力清单。
