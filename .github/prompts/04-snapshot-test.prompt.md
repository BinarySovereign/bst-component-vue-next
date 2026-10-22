---
description: "维护组件的 _test_snap_example.vue 并更新 CSR / SSR 批量快照，逐条审查快照 diff"
argument-hint: "组件名与要加入快照的形态（如：advanced <组件名> 的默认态与插槽态）"
agent: "agent"
---

维护指定组件的快照 demo 并更新快照。

> 组件开发链路第 4 步，完整顺序见 `/03-component-source` 的「全流程顺序」。

## 前置

1. 读 `packages/bst-vue-next/test/README.md` 的「快照测试」一节。
2. 确认快照用例由脚本批量生成：`packages/bst-vue-next/test/src/snap/{csr,ssr}.test.ts` 扫描 `packages/bst-{basic,advanced,ai}-components/**/_example/_test_snap_example.vue`，不要手写快照用例。

## demo 编写

- 路径固定为 `packages/bst-{layer}-components/<组件>/_example/_test_snap_example.vue`，一个组件一份。
- 只渲染、不写交互：不加点击、hover、键盘等操作，状态直接由 props 给定。
- 会 Teleport 的组件必须在此显式关闭：Teleport 内容不进 CSR `wrapper.element`，也不进 SSR 主 HTML，否则快照里看不到它。
- 初始渲染为空或按阶段渲染的组件，必须显式传入能产出内容的可见状态，否则快照为空。
- 多个形态放在同一文件中，用注释分隔；形态从该组件自己的 props / slots / 状态中选取，覆盖默认态、状态修饰（禁用、选中、空数据等）、插槽形态、尺寸与隐藏态。
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
