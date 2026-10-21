---
description: "按 Issue 或缺陷描述补充回归用例，先复现失败再修复，最后验证覆盖率"
argument-hint: "Issue 编号或缺陷复现描述"
agent: "agent"
---

为指定缺陷补一条能稳定复现的回归用例，并在必要时修复实现。

## 执行步骤

1. 读 `.agents/skills/unit-test/SKILL.md`、`packages/bst-vue-next/test/README.md` 与 `docs/rules/unit-test-review.md`，按其中的用例组织与审查标准执行。
2. 定位组件与现有测试目录 `packages/bst-{layer}-components/<组件>/__tests__/`，复用 `mount.tsx` 的挂载方式。
3. 先写回归用例，只覆盖该缺陷的可观察行为：
   - 放在 `scenarios` 分组（或最贴近的公开 API 分组），用例名写明 `Issue #<N>` 或缺陷特征。
   - 期望值必须来自 Issue 描述、组件文档、DOM / ARIA 或外部规范，不能复制实现里的常量或分支。
   - 不断言内部函数调用、私有状态或具体 CSS 属性。
4. 运行该组件的测试，确认新用例在修复前失败，并记录失败现象。
5. 做最小实现修复，再运行到通过。修复不改变无关行为。
6. 运行覆盖率，确认该组件四项仍为 100%。

## 硬性约束

- 不修改既有断言、不跳过用例、不使用 `v8 ignore`、不做快照断言。
- 一条用例只表达一个契约：`当 <前置> 时，<对象> 应该 <可观察结果>`。
- 不创建空分组，不在根 `describe` 下直接放 `it`。
- 只有从实现反推才能写出的用例，判为低价值，不提交。

## 验收

1. `pnpm test:unit-dev <组件>` 观察新用例由红转绿。
2. `pnpm test:unit-coverage <组件>` 覆盖率为 100%。
3. `pnpm typecheck` 通过。
4. 输出：复现条件、修复前失败输出、根因、修改文件、新增用例名。
