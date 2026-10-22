---
description: "为组件新增文档站示例与文档页，使用真实组件和 DemoBlock，不写任何样式"
argument-hint: "组件名与要演示的场景（如：advanced <组件名> 的基础用法与自定义插槽）"
agent: "agent"
---

为指定组件补充文档站示例与文档页内容。

> 组件开发链路第 7 步，完整顺序见 `/03-component-source` 的「全流程顺序」。

## 前置

1. 先运行 `pnpm build:style`，否则文档站会因样式包产物缺失而解析失败。
2. 读 `packages/bst-vue-next/site/README.md` 与 `packages/bst-vue-next/site/src/examples/README.md`。
3. 先读该组件源码包中的类型与 props，确认能力边界，不要凭组件名猜 API。

## 示例文件

- 路径：`packages/bst-vue-next/site/src/examples/<组件名>/<场景名>.vue`，一个示例一个文件。
- 文件名必须多词（如 `basic-usage.vue`、`keyboard-interaction.vue`），避免 `vue/multi-word-component-names` 报错。
- 组件与类型从源码包导入，例如 `@binarysovereign/bst-advanced-components`，不要从主包 `@binarysovereign/vue-next-pro` 导入。
- 示例内不写样式：类名一律使用样式包已有契约；需要预览区铺满时给根节点加 `bst-demo-fill`。
- 示例只做展示与必要交互，不引入测试专用代码。

## 文档页

- 路径：`packages/bst-vue-next/site/src/components/<basic|advanced|ai>/<组件名>.md`。
- 用例引用格式：

```md
<DemoBlock
  demo="<组件名>/<场景名>"
  title="场景标题"
  description="一句话说明这个示例演示什么。"
/>
```

- `demo` 取相对 `site/src/examples` 且去掉 `.vue` 的路径。
- 新增页面需要出现在导航时，先读 `packages/bst-vue-next/site/.vitepress/config.ts` 的现有 sidebar 结构，按同样顺序登记，不重排已有条目。

## 验收

1. `pnpm -C packages/bst-vue-next/site typecheck` 通过。
2. `pnpm build:docs` 通过。
3. 输出新增与修改的文件列表，以及每个示例演示的能力。
