# 组件开发代码规范

> 所有类型定义全部定义在 `packages/bst-types/src/{basic/advanced/ai}-{component}.types.ts` 当中，
> 并通过 `import type { ... } from '@binarysovereign/bst-types'` 引入。


## 整体目录结构

```
{components‑template}
├── __test__/                 # 组件单元测试
├── _example/                 # 快照测试用例
├── src/                      # 组件核心源码
│   ├── hooks/                # 组合式钩子（仅高级、AI 组件）
│   ├── elements/             # 子元素（仅高级、AI 组件）
│   ├── utils.ts              # 组件公用工具函数（仅高级、AI 组件）
│   ├── types.ts              # 组件内部类型（仅高级、AI 组件，按需）
│   ├── constants.ts          # 组件常量（仅高级、AI 组件）
│   ├── props.ts              # Props 运行期声明（基础组件）
│   └── {component}.tsx       # 根组件
└── index.ts                  # 组件包对外导出入口
```

---

## 外层目录说明

### `__test__/`

- **作用**：组件单元测试文件
- **文件后缀**：`{component}.test.tsx`、`{component}.test.ts`
- 详细请阅读 `packages/bst-vue-next/test/README.md`

### `_example/`

- **作用**：存放组件快照测试示例，用于快照测试使用。
- **约束**：
  1. 使用 Vue3 语法编写对应示例。
  2. 所有快照测试用例编写在 `_test_snap_example.vue` 当中，并用注释区分开每一个用例。
  3. 快照测试用例不要编写交互操作的方法。

### `{components‑template}/index.ts`

- **作用**：组件包对外入口，统一导出组件、类型。外部引入组件的出口。

---

## src 源码目录规范

### src/hooks（按需）

> 一般用于高级组件、AI 组件，基础组件本身就简单，可省略。

| 文件 | 命名 | 职责 | 约束 |
| --- | --- | --- | --- |
| `controller.hooks.ts` | 固定命名 | 组合函数调度中枢，统筹编排调度所有其他 hooks；接收 props / emit，分发给各个钩子，聚合状态与方法返回给视图 | 只组装，不写具体业务逻辑 |
| `prop.hooks.ts` | 固定命名 | Props 运行期类型校验、参数是否合法、归一化、数据清洗等 | 只处理入参检查，不修改业务状态 |
| `life.hooks.ts` | 固定命名 | 组件全部生命周期：`onMounted` / `onUnmounted` / `watch` / `watchEffect` 等所有生命周期作用 | 禁止生命周期钩子散落在其他 hooks 当中 |
| `{component}.hooks.ts` | `component` 替换组件或者子元素名 | 单一职责，只负责该组件或子元素的整体能力，作为装配层组合下游能力 hook | 被拆出的能力 hook 不得反向引用本文件 |
| `{component}-{capability}.hooks.ts` | `capability` 为能力名，如 `phase` / `position` / `keyboard` / `outside` / `view` | 从 `{component}.hooks.ts` 中按能力拆出的专职 hook；一个文件只维护一类状态与行为 | 仅供同组件内部使用，不进入 `index.ts` 导出 |
| `index.ts` | 固定命名 | 仅需要导出 `controller.hooks.ts` 的组合式函数 | - |

> 何时拆出 `{component}-{capability}.hooks.ts`：当一个 hook 同时维护 2 类以上互不相关的状态（如显隐阶段 + 坐标 + 键盘高亮），或单文件超过约 300 行时，按能力拆文件；否则不拆，避免为抽象而抽象。


### constants 常量文件（按需）

> 一般用于高级组件、AI 组件，基础组件本身就简单，可省略。

1. `constants.ts` 组件常量
  - 所有常量名称前缀为 `BST_{COMPONENT}_CONSTANT_`。
  - 必包含：`BST_{COMPONENT}_CONSTANT_COMPONENT_NAMES`（组件标识对象）、`BST_{COMPONENT}_CONSTANT_ERROR_MESSAGES`（错误提示对象）
  - 只存放组件多个文件共用的常量，如果单独一个文件使用的常量请放到对应文件当中。


### src/elements（按需）

> 一般用于高级组件、AI 组件，基础组件本身就简单，可省略。

- 文件命名：`{element-name}.tsx`。
- **作用**：子元素代码
- **约束**：
  1. 尽量剥离复杂业务逻辑，逻辑交给 composables。
  2. 按需创建，没有子元素请删除目录。

### utils.ts 工具文件

1. `utils.ts` 组件通用的工具函数
  - 存放组件内多个文件共用的纯函数（无副作用、不持有状态）。
  - 包含两类：与组件无关的通用纯函数；依附于组件数据语义的纯判定函数（如 `is{Component}ItemActionable`）。
  - 同一个判定在 2 处以上出现才抽取；只在一处使用的逻辑留在原地。

### types.ts 内部类型（按需）

1. `types.ts` 组件内部类型
  - 只放组件内部使用、不从 `index.ts` 导出的类型（如阶段联合类型、内部事件签名）。
  - 需要拆分的多个 hook 共用同一类型时放在此处，避免 hook 之间互相引用形成循环依赖。
  - **跨包共享的类型仍必须放在 `packages/bst-types`**，本文件不得替代它。

### src/{component}.tsx

- **作用**：根组件TSX入口文件。
- **约束**：
  1. 只调用`use‑controller`获取全部状态、方法。
  2. 文件只编写视图TSX，禁止写业务逻辑、生命周期、数据处理。

---

## 强制约束清单

1. 根组件 TSX 不直接使用 hooks，只通过 controller.hooks.ts 获取全部能力。
2. 除基础组件外，生命周期钩子全部收拢在 `life.hooks.ts`，禁止散落在其他逻辑文件。
3. 除基础组件外，Props 相关操作全部放在 `prop.hooks.ts`。
4. 除基础组件外，业务逻辑按组件拆分多个 `{component}.hooks.ts`，单一职责。
5. `hooks/index.ts` 只导出 `controller.hooks.ts`；`{component}-{capability}.hooks.ts` 与 `types.ts` 一律不对外导出。
6. 私有函数名以 `_` 开头，集中在文件前部；公共方法集中在后部并按调用顺序排列。

## 什么时候新增文件

1. 新增子元素 → 新增 `elements/yyy.tsx`、对应`yyy.hooks.ts`业务hook。
2. 单个 hook 承担 2 类以上互不相关的状态，或单文件超过约 300 行 → 拆出 `{component}-{capability}.hooks.ts`。
3. 多个 hook 需要共用同一内部类型 → 新增 `src/types.ts`。
4. 不要创建空文件，没有子元素就不创建子元素 hooks 文件、子元素文件。
