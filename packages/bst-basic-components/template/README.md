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
| `{component}.hooks.ts` | `component` 替换组件或者子元素名，根组件至少存在1个，子元素按需新增 | 单一职责，一个文件只负责一个组件或者子元素，便于单元测试 |
| `index.ts` | 固定命名 | 仅需要导出 `controller.hooks.ts` 的组合式函数 | - |


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
  - 只存放和组件业务逻辑无耦合的工具函数。

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

## 什么时候新增文件

1. 新增子元素 → 新增 `elements/yyy.tsx`、对应`yyy.hooks.ts`业务hook。
2. 不要创建空文件，没有子元素就不创建子元素 hooks 文件、子元素文件。
