---
description: "按仓库规范开发组件，先判定 basic / advanced / ai 三种类型，再按各自目录结构落地类型、源码、样式、测试与导出"
argument-hint: "组件层级与名称及目标（如：advanced 新建 context-menu；basic 新增 Button）"
agent: "agent"
---

按规范开发组件。未给出层级时，先读参数与需求判断属于哪一层，判断依据见下方「三层区分」，判断不了就先询问。

## 三层区分

| 维度 | basic（基础） | advanced（高级） | ai（AI） |
| --- | --- | --- | --- |
| 定位 | 单一展示、形态简单 | 多子元素、复杂交互与状态机 | 具备 AI 交互能力（流式输出、会话、推理态） |
| 源码目录 | `packages/bst-basic-components/<组件>` | `packages/bst-advanced-components/<组件>` | `packages/bst-ai-components/<组件>` |
| 类型文件 | `packages/bst-types/src/basic-<组件>.types.ts` | `advanced-<组件>.types.ts` | `ai-<组件>.types.ts` |
| hooks | 可省略 | 必须：`controller` / `prop` / `life` / `{component}` | 同 advanced |
| `constants.ts` / `utils.ts` / `elements/` | 按需，简单组件可省略 | 按需，子元素必须配套 | 同 advanced |
| Props 运行期声明 | `src/props.ts` | `src/hooks/prop.hooks.ts` | `src/hooks/prop.hooks.ts` |
| 依赖方向 | 不依赖 advanced / ai | 可引用 basic 的类型 | 可引用 basic / advanced 的类型 |
| 发布主包 | `@binarysovereign/vue-next` | `@binarysovereign/vue-next-pro` | `@binarysovereign/vue-next-pro-ai` |
| 站点文档目录 | `site/src/components/basic/` | `site/src/components/advanced/` | `site/src/components/ai/` |
| Storybook 目录 | `storybook/src/stories/basic/` | `storybook/src/stories/advanced/` | `storybook/src/stories/ai/` |

## 执行顺序

1. 读 `packages/bst-basic-components/template/README.md` 与目标层已有组件，确认目录结构与命名，再动手。
2. 类型：写 `packages/bst-types/src/<层>-<组件>.types.ts`，命名 `Bst{Component}Props` / `Emits` / `Slots` / `Expose`；随后在 `packages/bst-types/src/index.ts` 追加 `export type * from './<层>-<组件>.types';`（不带 `.ts`），顺序 `basic` → `advanced` → `ai`，同层按字母序。
3. advanced / ai 的源码结构：
   - `src/constants.ts`：常量前缀 `BST_{COMPONENT}_CONSTANT_`，必含 `..._COMPONENT_NAMES` 与 `..._ERROR_MESSAGES`。
   - `src/utils.ts`：只放与业务无耦合的纯工具。
   - `src/hooks/prop.hooks.ts`：Props 接收、归一化、校验、默认值。
   - `src/hooks/life.hooks.ts`：全部 `onMounted` / `onUnmounted` / `watch` / `watchEffect`，不散落。
   - `src/hooks/{component}.hooks.ts`：按组件或子元素拆分，单一职责；子元素配套 `{element}.hooks.ts`。
   - `src/hooks/controller.hooks.ts`：`use{Component}Controller()` 只做胶水组装。
   - `src/hooks/index.ts`：只导出 controller。
   - `src/elements/{element-name}.tsx`：只渲染已处理的数据，不碰原始 props。
   - `src/{component}.tsx`：只调用 `use{Component}Controller()` 并写 TSX。
4. basic 的源码结构：`src/props.ts` 声明运行期 Props，`src/{component}.tsx` 直接写视图与轻量逻辑；确实出现复用子结构时再引入 `elements/`，确实产生生命周期与状态编排时再按 advanced 结构补 hooks。
5. 导出与登记：
   - 组件目录 `index.ts`：导出组件与类型。
   - `packages/bst-<层>-components/components.ts`：追加 `export * from './<组件>';`。
   - `packages/bst-<层>-components/index.ts`：在 `components` 对象中注册 `Bst{Component}`。
6. 样式：在 `packages/bst-styles/web/<层>-components/<组件>/` 建分片，并按依赖方向写 `_index.less`；在同级 `_index.less` 登记 `@import './<组件>/_index.less';`。
7. 测试与示例：`<组件>/__tests__/` 放单测（五类分组），`<组件>/_example/_test_snap_example.vue` 放唯一快照 demo。
8. 可选：文档站示例与文档页、Storybook story，分别按 `/docs-demo` 与 `/storybook-story` 提示词处理。

## 硬性约束

- 组件源码内不写任何样式，类名契约对齐 `@binarysovereign/styles`。
- 跨包类型只放 `bst-types`，组件源码包内不重复定义。
- 禁止反向依赖（basic → advanced / ai）与循环引用。
- 依赖版本只写 `catalog:` / `workspace:*`，新依赖先改 `pnpm-workspace.yaml` 的 catalog 并同步 `docs/rules/dependencies.md`。
- 不创建空文件或空目录：没有子元素就不建 `elements/` 与对应 hooks。
- 单测目录用 `__tests__`，不用 `__test__`。
- 只面向 Chromium，不写兼容 Firefox / Safari / IE 的降级分支。

## 验收

1. `pnpm typecheck`
2. `pnpm lint` 与 `pnpm lint:style`
3. `pnpm test:unit` 与 `pnpm test:snap`
4. 覆盖率四项 100%（涉及新组件时）

## 交付格式

先说明判定为哪一层及依据，再给文件清单（新增 / 修改）、结构树、登记位置、验证结果与未完成项。
