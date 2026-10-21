---
description: "为指定组件补充或整理单元测试，按五类分组编写用例并运行 Vitest 验证覆盖率"
argument-hint: "组件名与要补充的能力（如：context-menu 的 slots 分组；留空则先盘点现有覆盖）"
agent: "agent"
---

为指定组件补充单元测试。

## 前置

1. 读 `packages/bst-vue-next/test/README.md` 与 `docs/rules/unit-test-review.md`，以其中的规范为唯一事实来源。
2. 读目标组件的 props、emits、slots、expose 与现有 `__tests__/`，先盘点覆盖缺口，不凭组件名猜行为。

## 落点与命名

- 目录：`packages/bst-{basic|advanced|ai}-components/<组件>/__tests__/`，新代码不使用 `__test__`。
- 文件：组件 `<组件名>.test.tsx`；hooks `<组件名>.hooks.test.tsx`；utils `<组件名>.utils.test.tsx`；子组件单独成文件。
- 共用挂载逻辑放 `mount.tsx`，只放 mount factory、测试数据、查询方法与清理逻辑，不写用例。
- 组件用例禁止 `toMatchSnapshot()`，快照走批量脚本。

## 用例组织

顶层 `describe('<组件名>')` 下按需使用五个直接子分组：

- `props`：单一 Prop 的渲染或行为结果，命名 `Props {prop}: {value}`。
- `events`：触发时机、次数、参数，命名 `Events.{eventName}`。
- `slots`：默认、具名、作用域插槽，命名 `<{slotName}>`。
- `instanceFunctions`：ref 暴露的方法。
- `scenarios`：多 API 联动、完整流程、边界情况，按具体能力继续分组。

规则：不建空分组；根 `describe` 下不直接放 `it`；每个公开 API 至少一条直接用例；同一 API 的基础类型与 Slot / Function 形态分别覆盖；Prop 与 Slot 提供同一能力时分别验证输入通道，优先级与回退放 `scenarios`。

## Mock 策略

- 事件回调用 `vi.fn()`，断言 `toHaveBeenCalled*` 系列。
- 时间用 `MockDate.set('2020-12-28')` 固定。
- 第三方依赖与全局插件只在 `packages/bst-vue-next/test/src/setup.ts` 统一 mock，不逐文件重复。
- 只 mock 边界（网络、时间、随机、浏览器 API），不 mock 被测组件自身逻辑。

## 验证

```bash
pnpm test:unit-dev <组件>          # watch 模式确认红绿
pnpm -C packages/bst-vue-next/test test:unit <组件>
pnpm test:unit-coverage <组件>     # 覆盖率需四项 100%
```

## 硬性约束

- 不为让用例通过而修改实现或放宽断言；发现实现缺陷时先报告，不顺手改业务逻辑。
- 不使用 `v8 ignore`、不跳过用例、不弱化断言。
- 只改本次任务涉及的测试，不批量迁移无关存量用例。
- 修复 Issue 的回归用例写在对应 `it` 紧邻上方 `// Issue: <完整 URL>`。

## 交付格式

输出：盘点的覆盖缺口、新增用例清单（分组 + 用例名）、测试与覆盖率结果、仍未覆盖的项及原因。
