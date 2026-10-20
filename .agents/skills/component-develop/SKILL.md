---
name: component-develop
description: 按 bs-component-vue-next 组件开发规范新建、扩展或重构组件代码，产出 types、constants、hooks、elements、根组件 TSX 与对外导出。凡是用户要求新增组件、给组件增加业务能力或子元素、调整组件源码结构，或按规范整理组件目录，都应使用本 skill。
---

# Component Develop

## 规范来源

开始前阅读 `packages/bst-basic-components/template/README.md`、`docs/rules/stylelint-rules.md`、`docs/rules/eslint-rules.md`，以其中的组件开发代码规范为唯一规范来源。Skill 只负责执行规范与串联开发顺序，不另行定义冲突规则。

## 工作流程

1. 先读目标组件的现有源码、类型、常量和相邻组件，确认当前结构与命名，不凭文件名猜测。
2. 定义类型：在 `packages/bst-types/src` 编写 `{basic/advanced/ai}-{component}.types.ts`。
3. 统一在 `packages/bst-types/src/index.ts` 使用 `export type * from './{basic/advanced/ai}-{component}.types'` 导出所有类型（不写 `.ts` 扩展名）。
4. 定义常量：在 `src` 创建 `constants.ts`。
5. 定义工具函数：在 `src` 创建 `utils.ts`。
6. 编写逻辑：在 `src/hooks` 依次落地 `prop.hooks.ts`、`life.hooks.ts`、按组件拆分的 `{component}.hooks.ts`，最后由 `controller.hooks.ts` 聚合调度。
7. 编写视图：`src/{component}.tsx` 只调用 `use{Component}Controller()` 并编写 TSX；子元素放入 `src/elements/{element-name}.tsx`。
8. 本地调试：在 `_example/` 编写唯一的 `_test_snap_example.vue`（用注释分隔多个用例，不写交互），再运行 `pnpm test:snap` 验证结构。
9. 导出与登记：在组件根目录 `index.ts` 导出组件与类型；在同包 `components.ts` 追加转发，在同包 `index.ts` 的 `components` 对象中注册。

## 强制约束

- 根组件 TSX 不直接使用其他 composable，只通过 `use{Component}Controller()` 获取全部状态与方法。
- 生命周期钩子全部收拢在 `life.hooks.ts`，不散落到其他逻辑文件。
- Props 的接收、格式化、校验、默认值填充全部在 `prop.hooks.ts`。
- 业务逻辑按组件拆成多个 `{component}.hooks.ts`，单一职责；`use{Component}Controller()` 只做胶水组装，不写具体业务逻辑。
- `_example/` 只允许编写一个文件 `_test_snap_example.vue`，负责组件的快照测试用例。
- 组件测试目录使用 `__tests__/`（五类分组），不要新增 `__test__/`。
- `elements/` 只做 UI 渲染，只接收处理完成的数据、不直接操作原始 props，复杂业务逻辑下沉到 hooks。

## 新增文件的时机

- 新增子元素：同时新增 `elements/{element-name}.tsx`，以及对应的 `{element}.hooks.ts` 业务 hook。
- 没有子元素就不要创建子元素相关的 elements 文件。

完成后对照「强制约束」与「新增文件的时机」逐条自检，并说明本次改动的文件清单与未验证项。
