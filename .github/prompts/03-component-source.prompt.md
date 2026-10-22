---
description: "按仓库规范开发组件源码：判定 basic / advanced / ai 层级后落地目录结构、hooks、elements、常量、导出与注册"
argument-hint: "组件层级与名称及目标（如：advanced 新建 <组件名>；basic 新增 <组件名>）"
agent: "agent"
---

按规范开发组件源码。样式与类型是前置环节，分别由 `/01-component-style` 与 `/02-types-entry` 完成；本提示词只负责 `packages/bst-*-components` 下的源码，不重复它们的步骤。

## 三层区分

未给出层级时，先判断属于哪一层，判断不了就先询问。

| 维度 | basic（基础） | advanced（高级） | ai（AI） |
| --- | --- | --- | --- |
| 定位 | 单一展示、形态简单 | 多子元素、复杂交互与状态机 | 具备 AI 交互能力（流式输出、会话、推理态） |
| 源码目录 | `packages/bst-basic-components/<组件>` | `packages/bst-advanced-components/<组件>` | `packages/bst-ai-components/<组件>` |
| 类型文件 | `bst-types/src/basic-<组件>.types.ts` | `advanced-<组件>.types.ts` | `ai-<组件>.types.ts` |
| hooks | 可省略 | 必须：`controller` / `prop` / `life` / `{component}` | 同 advanced |
| 能力拆分 hook | — | 按需：`{component}-{capability}.hooks.ts` | 同 advanced |
| 内部类型 | — | 按需：`src/types.ts` | 同 advanced |
| `constants.ts` / `utils.ts` / `elements/` | 按需，简单组件可省略 | 按需，子元素必须配套 | 同 advanced |
| Props 运行期声明 | `src/props.ts` | `src/hooks/prop.hooks.ts` | `src/hooks/prop.hooks.ts` |
| 依赖方向 | 不依赖 advanced / ai | 可引用 basic 的类型 | 可引用 basic / advanced 的类型 |
| 发布主包 | `@binarysovereign/vue-next` | `@binarysovereign/vue-next-pro` | `@binarysovereign/vue-next-pro-ai` |

## 前置

1. 读 `packages/bst-basic-components/template/README.md` 与目标层已有组件的源码，确认现有结构与命名。
2. 样式已按 `/01-component-style` 落地：类名契约以 `packages/bst-styles` 为准，源码只用常量引用。
3. 类型已按 `/02-types-entry` 落地：源码只引用 `@binarysovereign/bst-types`，不在源码包内重复定义。

任一前置缺失时，先完成前置再写源码，否则会出现「类名无处对齐」或「类型无处引用」。

## advanced / ai 的源码结构

```plaintext
<组件>/
├─ src/
│  ├─ hooks/
│  │  ├─ controller.hooks.ts
│  │  ├─ prop.hooks.ts
│  │  ├─ life.hooks.ts
│  │  ├─ {component}.hooks.ts
│  │  ├─ {component}-{capability}.hooks.ts   # 按需
│  │  └─ index.ts
│  ├─ elements/{element-name}.tsx            # 按需
│  ├─ constants.ts                           # 按需
│  ├─ utils.ts                               # 按需
│  ├─ types.ts                               # 按需
│  └─ {component}.tsx
└─ index.ts
```

| 文件 | 职责 | 约束 |
| --- | --- | --- |
| `hooks/controller.hooks.ts` | `use{Component}Controller()` 聚合全部能力 | 只做接线与转发，不写业务判断 |
| `hooks/prop.hooks.ts` | Props 运行期声明、校验、归一化、默认值 | 只处理入参，不持显隐等业务状态 |
| `hooks/life.hooks.ts` | 全部 `onMounted` / `onUnmounted` / `watch` / `watchEffect` | 生命周期不得散落到其他文件 |
| `hooks/{component}.hooks.ts` | 组件或子元素的装配层，组合下游能力 hook | 一个组件至少一个；子元素配套 `{element}.hooks.ts` |
| `hooks/{component}-{capability}.hooks.ts` | 按能力拆出的专职 hook | `capability` 用 `phase` / `position` / `keyboard` / `outside` / `view` 这类明确名字；不得反向引用装配层 |
| `hooks/index.ts` | 只导出 `controller.hooks.ts` | 能力 hook 与 `types.ts` 不在此导出 |
| `constants.ts` | 多文件共用的常量 | 前缀 `BST_{COMPONENT}_CONSTANT_`；必含 `..._COMPONENT_NAMES` 与 `..._ERROR_MESSAGES`；类名集中在此 |
| `utils.ts` | 被 2 处以上使用的纯函数 | 无副作用、不持状态；只用一次的逻辑留在原地 |
| `types.ts` | 组件内部类型（阶段联合、内部事件签名） | 多个 hook 共用时放此处以避免循环依赖；跨包类型仍归 `bst-types` |
| `elements/{element-name}.tsx` | 子元素渲染 | 只接收处理好的数据，不碰原始 props |
| `{component}.tsx` | 根组件 | 只调用 `use{Component}Controller()` 并写 TSX |

## basic 的源码结构

- `src/props.ts` 声明运行期 Props，`src/{component}.tsx` 写视图与轻量逻辑。
- 出现复用子结构时再引入 `elements/`。
- 确实产生生命周期与状态编排时，再按 advanced 结构补 hooks，不提前铺骨架。

## 导出与登记

1. 组件目录 `index.ts`：导出组件，并 `export type * from '@binarysovereign/bst-types';`。
2. `packages/bst-<层>-components/components.ts`：追加 `export * from './<组件>';`。
3. `packages/bst-<层>-components/index.ts`：在 `components` 对象中登记 `Bst{Component}`，键名与组件 `name` 一致。

## 新增文件的时机

| 触发条件 | 新增文件 |
| --- | --- |
| 新增子元素 | `elements/{element-name}.tsx` + 对应 `{element}.hooks.ts` |
| 单个 hook 维护 2 类以上互不相关的状态（如显隐阶段 + 坐标 + 键盘高亮） | `{component}-{capability}.hooks.ts` |
| 单个 hook 超过约 300 行 | 同上，按能力拆分 |
| 多个 hook 共用同一内部类型 | `src/types.ts` |
| 同一纯函数或判定出现 2 处以上 | 收进 `utils.ts` |

达不到条件就不拆：没有子元素不建 `elements/`，单一职责的 hook 不预先分片。

## 硬性约束

- 组件源码内不写任何样式；类名以 `constants.ts` 中的常量表达，取值对齐 `@binarysovereign/styles`。
- 跨包类型只放 `bst-types`，组件源码包内不重复定义。
- 禁止反向依赖（basic → advanced / ai）与循环引用。
- 依赖版本只写 `catalog:` / `workspace:*`，新依赖先改 `pnpm-workspace.yaml` 的 catalog 并同步 `docs/rules/dependencies.md`。
- 私有函数名以 `_` 开头并集中在文件前部，公共方法在后部按调用顺序排列。
- 单测目录统一为 `__tests__`，不使用 `__test__`。
- 只面向 Chromium，不写兼容 Firefox / Safari / IE 的降级分支。

## 全流程顺序

一个组件的完整开发顺序固定如下，本提示词只负责第 3 步：

| 顺序 | 环节 | 提示词 |
| --- | --- | --- |
| 1 | 样式分片 | `/01-component-style` |
| 2 | 共享类型 | `/02-types-entry` |
| 3 | 组件源码 | 本提示词 |
| 4 | 快照 demo | `/04-snapshot-test` |
| 5 | 单元测试 | `/05-unit-test` |
| 6 | Storybook story | `/06-storybook-story` |
| 7 | 组件文档与示例 | `/07-docs-demo` |

- 1、2 是本提示词的前置；4～7 必须在源码落地后执行，因为测试与示例要引用真实组件与类型。
- 4 与 5 都依赖源码，可并行推进；6 依赖样式产物（`pnpm build:style`）；7 依赖示例能力已稳定。

## 验收

1. `pnpm typecheck`
2. `pnpm test:unit`（已补测试时）
3. 涉及新组件时 `pnpm test:unit-coverage <组件>`，四项 100%。

## 交付格式

先说明判定为哪一层及依据，再给文件清单（新增 / 修改）、结构树、注册位置、验证结果与未完成项。
