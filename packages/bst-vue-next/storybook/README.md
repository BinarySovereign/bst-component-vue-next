# Storybook 预览环境

> 面向 `packages/bst-vue-next/storybook` 的包级说明：定位、目录约定、启动方式与已知边界。
> 该包 `private`，不进入任何发布链路，产物 `storybook-static/` 已被 `.gitignore` 忽略。

---

## 定位

- **内部工装，不是对外文档**。对外文档由 `packages/bst-vue-next/site`（VitePress）承担，两者分工如下：

| 维度 | Storybook | VitePress |
| --- | --- | --- |
| 使用者 | 组件开发者、设计、产品 | 组件库使用方 |
| 内容 | 单组件隔离预览、状态矩阵、Controls 调参、a11y 检查 | 安装、引入、主题定制、示例 |
| 是否发布 | 否 | 是 |

- **只覆盖有视觉或交互状态的组件**。纯逻辑工具与已有单测覆盖的边界分支不必为覆盖率硬凑 story。
- **不替代单测**。`packages/bst-vue-next/test` 下的 Vitest 用例仍是回归主力。

## 启动

Storybook 的样式来自 `@binarysovereign/styles` 的**构建产物**（`exports` 指向 `build/web/*.css`），
而样式包自身不含构建脚本，因此必须先在仓库根产出样式：

```sh
pnpm build:style           # 首次或样式源码变更后
pnpm dev:storybook         # 等价的组合命令：build:style + 子包 dev
```

根目录脚本：

| 脚本 | 行为 |
| --- | --- |
| `pnpm dev:storybook` | `build:style` 后启动开发服务器（端口 6006） |
| `pnpm build:storybook` | `build:style` 后产出静态站点到 `storybook-static/` |

子包内也可单独执行：

```sh
pnpm -C packages/bst-vue-next/storybook dev
pnpm -C packages/bst-vue-next/storybook build
pnpm -C packages/bst-vue-next/storybook typecheck
```

> 注意：单独执行子包 `dev` / `build` 前需确认 `packages/bst-styles/build` 已存在，否则样式导入会报无法解析。

## 目录约定

```plaintext
packages/bst-vue-next/storybook/
├─ .storybook/
│  ├─ main.ts            stories 匹配、framework、addons、viteFinal
│  └─ preview.ts         全局样式、主题装饰器、公共 parameters
├─ src/stories/
│  ├─ basic/             对应 packages/bst-basic-components
│  └─ advanced/          对应 packages/bst-advanced-components
├─ package.json
└─ tsconfig.json
```

- **story 集中存放在 `src/stories`**，与 `site/src/examples` 的约定对称；组件源码包保持「只有源码」，删除或迁移 Storybook 时无需回源码包清理。
- **分层目录与源码包一一对应**：`basic/`、`advanced/`、`ai/` 分别对应三个组件源码包。
- **组件从工作区源码包导入**，不从 `@binarysovereign/vue-next` 主包导入：主包的 `exports` 指向 `build/` 产物，从它导入会让每次改组件都要先跑 `build:private`。

## Story 覆盖矩阵

`src/stories/advanced/context-menu.stories.tsx` 的 28 个 story 覆盖组件的全部对外能力：

| 能力 | 覆盖的 story |
| --- | --- |
| `items` / `leftText` / `rightText` / `divider` | 默认、仅左文本、长文本与溢出 |
| `isDisabled` | 含禁用项、菜单项插槽 |
| `action` | 单项 action 回调 |
| `key`（重复 / 非法 / 空项） | 数据校验 |
| `width`（数字 / 字符串） | 固定宽度（数字）、固定宽度（字符串） |
| `maxHeight` | 限制最大高度 |
| `position` | 默认（指针坐标）、固定坐标（受控） |
| `isVisible` | 固定坐标（受控） |
| `teleport`（默认 / false / 选择器） | 默认、原地渲染、Teleport 到指定容器 |
| `isCloseOnOutsideClick` / `Scroll` / `EscKeyDown` | 关闭行为可配置 |
| `onItemSelect` / `ClickOutside` / `ScrollOutside` / `EscKeyDown` / `AfterEnter` / `AfterLeave` | 事件追踪（画布 + Actions 面板） |
| `default` 插槽 | 默认插槽（完全自定义） |
| `item` 插槽 | 菜单项插槽（自定义单项） |
| `show()` / `hide()` | 实例方法 show / hide |
| 空数据 | 空数据 |
| 主题令牌 | 顶部工具栏切换浅色 / 深色 |

> 工具栏按钮统一放在演示区**上方**：菜单在演示区内按指针位置弹出，放在下方会被面板遮挡。

## 三处必须保持的配置

| 配置 | 位置 | 原因 |
| --- | --- | --- |
| `framework.options.docgen = 'vue-component-meta'` | `.storybook/main.ts` | 默认引擎 `vue-docgen-api` 只处理 `.vue`，本仓库组件全是 `.tsx`，不切换则 Autodocs 属性表为空 |
| `plugins: [vue(), vueJsx()]` | `.storybook/main.ts` 的 `viteFinal` | 框架包只注入模板编译别名，不含 SFC 与 JSX 转换能力 |
| `import '@binarysovereign/styles/web'` | `.storybook/preview.ts` | 组件源码不含任何样式，缺此项所有组件无样式 |

## 主题切换

`preview.ts` 通过工具栏把主题写到 `<html>` 上，同时写入两个等价开关：

- `class="bst-theme-dark"`
- `theme-mode="light"` / `theme-mode="dark"`

样式包中 `:root.bst-theme-dark` 与 `:root[theme-mode='dark']` 均被支持，故预览与真实使用行为一致。

## 界面汉化

### 为什么需要补丁

Storybook 官方**没有界面语言开关**：manager（侧边栏、标签页、工具栏）与 Docs 页（属性表表头、代码块按钮）的文案都硬编码在编译后的 React 产物里，也没有可配置的 locale。

因此本包用两个注入文件做运行时文案替换：

| 文件 | 作用范围 | 负责内容 |
| --- | --- | --- |
| `.storybook/manager-head.html` | manager 文档 | 侧边栏、标签页、工具栏、Controls 面板、无障碍面板框架文案 |
| `.storybook/preview-head.html` | 预览 iframe 的 `#storybook-docs` | Docs 页的属性表表头、分组标题、代码块按钮 |

实现要点：

- 精确整串匹配，不做子串替换，避免误伤 story 名称与组件内容；
- `Name` / `Default` / `Control` 等易撞词只放在作用域限定的 `TABLE_DICT` 里，仅在 `.docblock-argstable` 内替换；
- `MutationObserver` 持续补齐 React 重渲染写回的英文，替换本身幂等，不会死循环。

### 覆盖边界

| 已汉化 | 保持英文 |
| --- | --- |
| 侧边栏、搜索框、工具栏、面板标签、参数表表头与分组、Docs 代码块按钮、无障碍面板分类与等级 | `Storybook` 品牌名、组件名与 story 导出名、axe 规则名与规则描述、控制台报错、Mac/Windows 快捷键名 |

### 维护提醒

1. 这是**对 Storybook 内部 DOM 的补丁**，升级 Storybook 后若文案变化，表现为「该项退回英文」而不会报错。
2. 新增词条直接改两个 head 文件里的字典；确认失效的条目可以直接删掉。
3. **修改 head 文件后需要重启 `dev` 服务**：manager 的 head 内容在启动时打包，热更新不生效（Vite 只提示 page reload，实际仍是旧内容）。
4. 整套汉化可以整块删除，删掉后 Storybook 恢复正常英文界面，不影响任何功能。

## 已知边界

1. **样式无热更新**。产物路线下改 `.less` 必须重跑 `pnpm build:style`；若要样式热更新，需把 `@binarysovereign/styles/web` 别名到 `packages/bst-styles/web/_index.less`，属于后续优化项。
2. **Autodocs 的属性提取质量待验证**。`vue-component-meta` 对 `defineComponent` + TSX 的 props / events / slots 提取能力弱于 SFC，若属性表不完整，属性文档继续由 VitePress 承担。
3. **交互回归尚未接入**。`play` 函数需要 `@storybook/addon-vitest` 与 `@vitest/browser` + provider；视觉回归需要 `chromatic`（其 `engines.node >= 22`，与仓库 `>=22.13.0` 下限一致，接入时主要评估的是依赖体积与外部服务成本）。
4. **非 Teleport 到 body 的 story 在 Docs 页必须用 iframe 渲染**。Storybook Docs 的每个 story 外层带
   `transform: matrix(1, 0, 0, 1, 0, 0)`，而**带 transform 的祖先会成为 `position: fixed` 的包含块**。
   组件已在首帧测量中补偿了这一偏移（对比期望坐标与实际 `getBoundingClientRect()`），位置不再跑偏；
   但该祖先同时带 `overflow: hidden` / `auto`，面板逸出边界时仍会被裁切，因此 `teleport: false`
   与「Teleport 到 story 内容器」两个 story 仍需 `parameters.docs.story.inline = false`。
