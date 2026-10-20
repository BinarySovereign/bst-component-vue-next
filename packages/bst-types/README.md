# 共享类型包规范

> 详细可参考 `packages/bst-types/src/index.ts`。
>
> 所有类型定义全部定义在 `packages/bst-types/src/{basic/advanced/ai}-{component}.types.ts` 当中。

## 整体目录结构

```plaintext
bst-types/
├─ src/                                   # 类型声明源码（唯一的类型落点）
│  ├─ basic-{component}.types.ts          # 基础组件共享类型
│  ├─ advanced-{component}.types.ts       # 高级组件共享类型
│  ├─ ai-{component}.types.ts             # AI 组件共享类型
│  └─ index.ts                            # 类型统一导出入口
├─ package.json                           # 包元数据，types 字段指向 src/index.ts
└─ README.md                              # 本文档
```

> `{component}` 取组件目录名，使用 kebab-case；一个组件及其全部子元素共用一个类型文件。

---

## 包定位

| 项 | 值 |
| --- | --- |
| 包名 | `@binarysovereign/bst-types` |
| 目录 | `packages/bst-types` |
| 可见性 | `private: true`，不单独发布 |
| 运行时产物 | 无，本包不参与 `build:private` 的 Rollup 构建 |
| 声明产物 | 随各组件包的类型产出内联进发布单元，见「构建与分发」 |

### 为什么单独成包

1. **单一来源**：三个组件源码包共用同一份类型声明，避免各包各写一份后漂移。
2. **真实包边界**：按包名 `@binarysovereign/bst-types` 引用，`tsc` / ESLint / 测试都走 Node 解析，不再依赖 `tsconfig.json` 的 `paths` 别名。
3. **别名不再需要**：`paths` 只对 `tsc` 生效，Rollup 与 Vitest 仍需各自配置别名；成包后一次解析、三处通用。

### 约束

1. 只存放类型声明，不存放组件、运行时代码、样式、静态资源或测试。
2. 不声明 `dependencies` / `peerDependencies`；类型文件只允许 `import type { ... } from 'vue'`。
3. 组件源码包内不得重复定义已在本包声明的类型。
4. 样式统一由 `@binarysovereign/styles` 提供，不得放入本包。
5. 本包是 private 包，**不得**被 `dist` 收录，也不得出现在任何发布清单的依赖里。

---

## src 目录规范

### 文件命名

1. 文件名格式固定为 `{basic/advanced/ai}-{component}.types.ts`，层级前缀必须与组件所属源码包一致。
2. `{component}` 必须与组件目录名完全一致，使用 kebab-case，例如：
   - `packages/bst-basic-components/button` → `packages/bst-types/src/basic-button.types.ts`
   - `packages/bst-advanced-components/table` → `packages/bst-types/src/advanced-table.types.ts`
   - `packages/bst-ai-components/chat` → `packages/bst-types/src/ai-chat.types.ts`
3. 一个组件只能有一个类型文件；子元素、子组件、内部数据结构与业务子类型（含字符串字面量联合）全部并入所属组件的类型文件，不得按子元素拆成多个文件。
4. 统一使用 `.types.ts` 后缀，禁止使用 `.d.ts` 或 `types.ts`。
5. 组件源码目录不再新增 `types.ts`，模板中的空 `src/types.ts` 不再作为类型落点。

### `src/index.ts`

- **作用**：共享类型的唯一对外入口，组件源码与组件包入口均从这里引入类型。
- **约束**：
  1. 只允许使用 `export type * from './{basic/advanced/ai}-{component}.types'` 转出类型。
  2. **导出语句不写 `.ts` 扩展名**。本包声明会被内联进发布单元，带扩展名的相对引用会让关闭 `allowImportingTsExtensions` 的消费方直接报 TS5097。
  3. 禁止默认导出，禁止导出变量、函数、类、枚举等运行期实体。
  4. 新增或删除类型文件时，必须同步新增或删除对应导出行。
  5. 导出顺序固定为 `basic` → `advanced` → `ai`，同一层内按文件名字母序排列。

### 类型命名

| 类型类别 | 命名 | 职责 | 约束 |
| --- | --- | --- | --- |
| Props | `Bst{Component}Props` | 组件全部 Props 的声明 | 必须导出 |
| Emits | `Bst{Component}Emits` | 组件事件签名 | 必须导出，使用调用签名 |
| Slots | `Bst{Component}Slots` | 默认插槽、具名插槽、作用域插槽 | 按需导出，插槽值为函数 |
| Expose | `Bst{Component}Expose` | `defineExpose` 暴露的实例方法 | 按需导出，方法签名与实现一致 |
| 业务类型 | `Bst{Component}{Name}` | 尺寸、状态、选项、数据项等业务子类型 | 按需导出，禁止使用匿名内联对象代替复用类型 |

- `{Component}` 取组件对外导出名去掉 `Bst` 前缀后的部分，例如 `BstButton` → `Button`、`BstProTable` → `ProTable`。
- 类型名统一使用 PascalCase，不使用 `I` / `T` 前缀，不使用下划线。
- 同一类型文件内的类型名必须唯一；跨组件出现同名类型时，必须带上组件名前缀区分。

### 类型声明写法

1. 对象类型统一使用 `interface`；联合类型、交叉类型、条件类型、映射类型等使用 `type`。
2. Props 中带默认值的字段必须声明为可选属性（`?`），类型文件只描述类型，不写入默认值。
3. Emits 统一使用函数接口调用签名；Slots 的插槽成员必须是返回 `VNode[]` 或具名返回值的函数；Expose 只声明可被外部调用的方法。
4. 只允许使用 `import type` 引入外部类型，禁止引入任何运行期实现。
5. 允许引用 `vue` 的类型；禁止运行期导入组件源码、`.vue`、`.tsx`、样式文件或其他模块。
6. 禁止使用 `any`、`@ts-ignore`、`@ts-expect-error`；无法确定类型时使用泛型或 `unknown` 并在使用侧收窄。
7. 禁止声明 `enum`、`const`、`let`、`function`、`class`、`namespace` 等运行期实体；字符串联合类型对应的常量值应放在组件 `constants.ts`。
8. 所有对外类型必须带中文 JSDoc 注释；字段与事件签名同样需要说明用途。
9. 类型依赖方向必须与组件分层一致：`advanced` 只能依赖 `basic`，`ai` 可以依赖 `basic` 与 `advanced`；禁止反向依赖与循环引用。

### 类型文件示例

```ts
import type { VNode } from 'vue';

/** 按钮尺寸 */
export type BstButtonSize = 'small' | 'medium' | 'large';

/** 按钮 Props */
export interface BstButtonProps {
  /** 按钮尺寸，默认 medium */
  size?: BstButtonSize;
  /** 是否禁用 */
  disabled?: boolean;
}

/** 按钮事件 */
export interface BstButtonEmits {
  /** 点击按钮时触发 */
  (event: 'click', mouseEvent: MouseEvent): void;
}

/** 按钮插槽 */
export interface BstButtonSlots {
  /** 默认插槽 */
  default?: () => VNode[];
}

/** 按钮实例方法 */
export interface BstButtonExpose {
  /** 让按钮获得焦点 */
  focus: () => void;
}
```

### `src/index.ts` 导出示例

```ts
// 基础组件
export type * from './basic-button.types';

// 高级组件
export type * from './advanced-table.types';

// AI 组件
export type * from './ai-chat.types';
```

### 组件内引用规范

```ts
import type { BstButtonEmits, BstButtonProps } from '@binarysovereign/bst-types';
```

- 组件源码统一从包名引入，禁止跨包使用相对路径（如 `../../../bst-types/src/...`）。
- 组件包根目录的 `index.ts` 可以转出对外类型，但不得重新声明同名类型。
- 组件源码内不得复制共享类型，也不得使用结构相同的本地类型替代。
- 只允许 `import type`。一旦写成值导入，运行时产物会引用一个不存在的模块，构建阶段即应视为错误。

---

## 构建与分发

> 本节对应 `scripts/build/components.js` 的 `buildTypes()` 与 `inlineSharedTypes()`。

1. **声明由 `tsc` 统一产出**：`tsconfig.build.json` 的 `include` 显式覆盖 `packages/bst-types/**/*.ts`，因此每个组件包执行 `buildTypes` 时都会顺带产出本包的 `.d.ts`。
2. **声明在构建期内联**：`buildTypes` 把本包的 `src/*.d.ts` 复制到组件产物的 `<es|lib>/_types/` 下。
3. **包名引用被改写**：产物内所有 `.d.ts` 中指向 `@binarysovereign/bst-types` 的引用，会按文件位置改写为指向 `_types/` 的相对路径。
4. **发布单元保持自包含**：`dist/vue-next{,-pro,-pro-ai}` 各自包含所需的 `_types/` 声明，消费方无需额外安装类型包，`github:...#path:/dist/<包名>` 的安装方式不受影响。
5. **源包声明依赖但不发布**：三个组件源码包以 `workspace:*` 声明本包为依赖，仅用于仓库内解析；源码包本身 `private` 且不进入 `dist`，故该依赖不会出现在任何发布清单中。

> 不要为本包新增 `build` 目标，也不要把它加入 `DIST_UNITS`：它没有运行时代码，唯一的产物是随组件包内联的 `.d.ts`。

---

## 强制约束清单

1. 所有跨包共享的类型只能定义在 `packages/bst-types/src`，组件源码包内不得出现第二份定义。
2. 类型文件命名必须为 `{basic/advanced/ai}-{component}.types.ts`，层级前缀与归属包一致。
3. `src/index.ts` 只允许 `export type *` 转出，禁止任何运行期导出。
4. 类型文件内只允许类型声明与 `import type`，禁止运行期代码。
5. 类型名统一使用 `Bst{Component}...` 的 PascalCase 形式，并保证跨文件唯一。
6. 类型依赖方向必须遵循 `basic` ← `advanced` ← `ai`，禁止反向依赖与循环依赖。
7. 修改共享类型视为公开 API 变更，必须同步检查三个源码包、组件入口与测试。
8. 新增、删除或重命名类型文件时，必须同步更新 `src/index.ts`。
9. 本包保持 `private: true` 且不声明任何依赖，禁止加入 `DIST_UNITS` 或发布清单。

## 什么时候新增文件

1. 新增基础组件 → 新增 `src/basic-{component}.types.ts`，并在 `src/index.ts` 的 `basic` 分组追加导出行。
2. 新增高级组件 → 新增 `src/advanced-{component}.types.ts`，并在 `src/index.ts` 的 `advanced` 分组追加导出行。
3. 新增 AI 组件 → 新增 `src/ai-{component}.types.ts`，并在 `src/index.ts` 的 `ai` 分组追加导出行。
4. 组件新增子元素或子组件 → 类型并入所属组件的已有类型文件，不新增独立类型文件。
5. 没有新增对外类型或跨包共享类型时，不创建空类型文件。
6. 删除组件或类型 → 删除对应类型文件及 `src/index.ts` 导出行，并清理全部引用。

## 变更与校验

1. 修改共享类型后，必须确认三个源码包的引用方均已同步，避免类型漂移。
2. 新增或修改类型必须在对应组件测试中覆盖类型相关行为，必要时补充回归用例。
3. 提交前在仓库根执行 `pnpm typecheck` 与 `pnpm lint`，确保类型检查与代码规范均通过。
4. 改动内联逻辑（`inlineSharedTypes`）后，需实际跑一次 `pnpm build:private` 并检查产物 `es/_types/` 与改写后的引用路径。
5. 仅修改注释或 JSDoc 时也应执行一次 `pnpm typecheck`，确认没有破坏类型导出。
