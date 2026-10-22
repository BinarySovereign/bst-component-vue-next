---
description: "新增或迁移跨包类型到 bst-types，并按规范在 index.ts 导出、让组件源码改为引用共享类型"
argument-hint: "组件层级与名称（如：advanced <组件名>；留空则从当前改动推断）"
agent: "agent"
---

按仓库规范处理跨包共享类型。

> 组件开发链路第 2 步，完整顺序见 `/03-component-source` 的「全流程顺序」。

## 执行步骤

1. 读 `packages/bst-types/README.md`，确认文件命名、命名约定与导出顺序。
2. 确定落点：`packages/bst-types/src/<basic|advanced|ai>-<组件目录名>.types.ts`。一个组件只有一个类型文件，子元素与业务子类型全部并入同一文件。
3. 读组件源码现有类型，抽取需要跨包共享的部分：
   - `Bst{Component}Props`
   - `Bst{Component}Emits`（使用调用签名）
   - `Bst{Component}Slots`（按需）
   - `Bst{Component}Expose`（按需）
4. 在 `packages/bst-types/src/index.ts` 追加导出：

```ts
export type * from './<层>-<组件目录名>.types';
```

   - 不写 `.ts` 扩展名。
   - 顺序为 `basic` → `advanced` → `ai`，同层按文件名字母序。
5. 组件源码与组件包入口改为 `import type { ... } from '@binarysovereign/bst-types'`，删除源码内重复的类型定义，不保留两份。

## 硬性约束

- `bst-types` 只放类型声明，不放组件、运行时代码、样式、资源或测试。
- 类型文件除 Vue 类型外不引入任何依赖，不声明 `dependencies`。
- 禁止默认导出，禁止导出变量、函数、类、枚举等运行期实体。
- 不使用 `.d.ts` 或 `types.ts` 后缀。
- 构建期类型会内联进发布单元，`bst-types` 自身不进入 `dist`。

## 验收

1. `pnpm typecheck` 通过。
2. 全局搜索确认组件源码包内没有重复定义的同一类型。
3. 若类型改动影响行为，运行 `pnpm test:unit`。
4. 输出：类型文件路径、导出语句、被替换的源码引用位置。
