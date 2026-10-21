---
description: "维护组件的 _test_snap_example.vue 并更新 CSR / SSR 批量快照，逐条审查快照 diff"
argument-hint: "组件名与要加入快照的状态（如：context-menu 的禁用项与自定义内容）"
agent: "agent"
---

维护指定组件的快照 demo 并更新快照。

## 前置

1. 读 `packages/bst-vue-next/test/README.md` 的「快照测试」一节。
2. 确认快照用例由脚本批量生成：`packages/bst-vue-next/test/src/snap/{csr,ssr}.test.ts` 扫描 `packages/bst-{basic,advanced,ai}-components/**/_example/_test_snap_example.vue`，不要手写快照用例。

## demo 编写

- 路径固定为 `packages/bst-{layer}-components/<组件>/_example/_test_snap_example.vue`，一个组件一份。
- 只渲染、不写交互：不加点击、hover、键盘等操作，状态直接由 props 给定。
- `teleport` 必须显式传 `false`：Teleport 内容不进 CSR `wrapper.element`，也不进 SSR 主 HTML。
- 显隐状态必须显式传 `is-visible`：根组件在 `phase=idle` 时渲染 `null`，快照会变空。
- 多个形态放在同一文件中，用注释分隔，覆盖代表性组合（默认、禁用与分割线、自定义插槽、固定宽高、隐藏态等）。
- demo 内不写样式，类名只用样式包已有契约；需要区分区域时用语义明确的类名。
- 组件从同组件目录的 `../index` 导入，类型从 `@binarysovereign/bst-types` 导入。

## 更新流程

1. `pnpm test:snap` 先看失败信息与 diff，确认变化是否由本次改动引起。
2. 确认无误后 `pnpm test:update`（等价 `test:snap-update`）更新 `src/snap/__snapshots__/{csr,ssr}.test.ts.snap`。
3. 再跑一次 `pnpm test:snap`，必须全绿。
4. 复查 `.snap` diff：只包含本次预期变化，没有无关组件的快照漂移；CSR 与 SSR 两边的变化方向一致。

## 硬性约束

- 禁止手工编辑 `.snap` 文件，也不要在组件单元用例里调用 `toMatchSnapshot()`。
- 禁止为了让快照通过而删除 demo 或跳过用例。
- `No test found in suite` 是因为 demo 数为 0，属刻意设计，补 demo 即可，不改配置。
- 快照文件纳入版本管理，更新必须与源码改动放在同一次提交。

## 交付格式

输出：demo 文件路径与覆盖的状态、更新前后的快照条目数、diff 摘要、`pnpm test:snap` 结果、是否需要同步修改单元测试。
