---
description: "在 bst-styles 中为组件编写样式分片：复制模板、映射令牌、按分层落位并在入口登记"
argument-hint: "组件层级与名称（如：advanced <组件名>；basic 新增 <组件名>）"
agent: "agent"
---

为指定组件编写样式。样式只存在于 `packages/bst-styles`，组件源码里不写任何样式。

> 组件开发链路第 1 步，完整顺序见 `/03-component-source` 的「全流程顺序」。

## 前置

1. 读 `packages/bst-styles/README.md` 与 `packages/bst-styles/web/basic-components/template/README.md`，后者是分片写法的唯一依据。
2. 从组件名与交互需求推导类名：根类、子结构类、状态类，命名规则见下方「写法约束」，不凭源码里的临时类名反推样式。
3. 读同层已有组件的样式目录，确认实际写法与令牌命名。

## 落点与结构

```plaintext
packages/bst-styles/web/<层>-components/<组件名>/
├─ _index.less      聚合入口，只 @import，不承载选择器
├─ _variables.less  组件专有量：:root 内声明 --bst-<组件名>-<语义>
├─ _token.less      唯一令牌出口：映射为 @<组件名>-*
├─ _root.less       根容器与排版基线
├─ _<子结构>.less   一个文件一个子结构
├─ _state.less      跨子结构共享的状态
├─ _size.less       尺寸变体
└─ _animation.less  过渡与关键帧
```

- `_index.less` 的 `@import` 顺序固定：**组件变量 → 令牌映射 → 根容器 → 子结构 → 状态 → 尺寸 → 动画**。
- 用不到的分片直接删除，不保留空文件。
- 子结构文件按实际名称命名（`_item.less` / `_list.less` / `_mask.less`），不使用 `_element.less`。

## 写法约束

1. **令牌两层隔离**：分片只能引用 `_token.less` 输出的 `@<组件名>-*`；分片内不得出现全局令牌名、`var(--bst-*)` 与硬编码色值。
2. **`_token.less` 只做映射**：来源 1 直接引用全局令牌（如 `@bg-color-container`）；来源 2 用 `var(--bst-<组件名>-<语义>)` 保留运行时覆盖能力；每项独占一行并注释来源与语义。
3. **`_variables.less` 只声明需要运行时覆盖的专有量**，全局令牌已覆盖的颜色、圆角、投影、字体不重复定义；无人引用时不建该文件。
4. **类名**：根类 `.@{prefix}-<组件名>`，子结构 `.@{prefix}-<组件名>-<元素>`，状态 `.@{prefix}-<组件名>[-<元素>]-is-<状态>`；分隔符用单连字符，禁用 `__` 与 `--`。
5. **盒模型基线**优先调用 `.reset-base()`，不手写 `box-sizing` / `color` / `font`。
6. **嵌套不超过 3 层**；仅作用于单一子结构的悬浮、聚焦用 `&:hover` 就近表达，共享状态才进 `_state.less`。
7. **截断**用 `.text-ellipsis()` / `.text-ellipsis-multi-line(<行数>)`；column 容器内的恒高子项补 `flex: none`。
8. **动画**集中在 `_animation.less`，关键帧命名 `bst-<组件名>-<语义>`，并在 `@media (prefers-reduced-motion: reduce)` 内把 `transition` 与 `animation` 置为 `none`。
9. 暗色主题靠令牌切换实现，不写主题分支与色值判断。
10. 混合器 `.reset-base()` / `.reset()` / `.tab-focus-style-rect()` 未由 `mixins/_index.less` 导出，使用时须在分片内显式 `@import`。

## 登记

在对应分层的登记文件追加一行：

```less
@import './<组件名>/_index.less';
```

- basic → `web/basic-components/_index.less`
- advanced → `web/advanced-components/_index.less`
- ai → 首次落地时的 `ai-components/_index.less`，并同步 `web/_index.less` 的图层顺序。

## 验收

1. `pnpm build:style` 通过，产物出现在 `packages/bst-styles/build/web/<层>-components/<组件名>/index.css`。
2. `pnpm lint:style` 通过；需要自动修复时先 `pnpm lint:style:fix`，再复查改动。
3. 文档站与 Storybook 用样式前必须先跑 `build:style`。

## 硬性约束

- 不在组件源码包内写样式；本环节先定下类名契约，源码阶段写入 `constants.ts` 并严格沿用。
- 不手改 `packages/bst-styles/build/`，它由脚本生成。
- 不新增全局令牌；确实缺令牌时先改 `tokens/` 三层并在两份主题中同步变量名。
- 样式包不产出字体文件，字体族沿用系统字体栈。

## 交付格式

输出：分层与组件名、新建 / 修改的分片清单、`_token.less` 映射来源统计（全局令牌 / 组件专有量）、需要的 `--bst-<组件名>-*` 变量表、构建与 lint 结果。
