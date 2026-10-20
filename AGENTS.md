# 项目说明

> Vue 3 组件库 monorepo：`TS + TSX` 开发，`Rollup + Babel` 构建，`Less + PostCSS` 产出样式，`Vitest` 负责单测与 SSR / CSR 快照。
>
> 本文件只写「代理需要、且无法从代码直接看出」的信息；细则一律以「规范来源」中的文档为准。

## 快速命令

> 环境：Node `>=22.13.0`（`.nvmrc` 为 `24.21.0`）、pnpm `11.7.0`。只用 pnpm；依赖版本经 `catalog:` 统一管理。

| 目的 | 命令 |
| --- | --- |
| 安装依赖 | `pnpm install` |
| 类型检查 | `pnpm typecheck` |
| ESLint | `pnpm lint`（只扫 `packages/`，全量见 `pnpm ci:local --profile quick`） |
| Stylelint | `pnpm lint:style` |
| 全部单测 / 快照 | `pnpm test:unit` / `pnpm test:snap` |
| 单组件单测 | `pnpm test:unit-dev <component>`（watch） |
| 覆盖率 | `pnpm test:unit-coverage <component>` |
| 源码包构建 | `pnpm build:private` |
| 样式构建 | `pnpm build:style` |
| 文档站 / Storybook | `pnpm dev:docs` / `pnpm dev:storybook` |
| 推送前全量门禁 | `pnpm ci:local`（档位：`--profile quick\|test\|build\|full`） |

## 规范来源

| 主题 | 文档 |
| --- | --- |
| 组件源码目录、hooks 职责、强制约束 | [packages/bst-basic-components/template/README.md](packages/bst-basic-components/template/README.md) |
| 共享类型命名与写法 | [packages/bst-types/README.md](packages/bst-types/README.md) |
| 样式分层、令牌、类名契约 | [packages/bst-styles/README.md](packages/bst-styles/README.md)、[组件样式骨架](packages/bst-styles/web/basic-components/template/README.md) |
| 单测 / 快照 / 覆盖率 | [packages/bst-vue-next/test/README.md](packages/bst-vue-next/test/README.md) |
| 用例审查标准 | [docs/rules/unit-test-review.md](docs/rules/unit-test-review.md) |
| ESLint / Stylelint / 依赖 / 提交信息 / 变更日志 | [docs/rules/](docs/rules/) 下对应文件 |
| 发布（tag 命名、Release 流程） | [docs/rules/release-rules.md](docs/rules/release-rules.md) |
| 构建产物与消费方引入 | [README-ZH.md](README-ZH.md) |
| 文档站 / Storybook | [site/README.md](packages/bst-vue-next/site/README.md)、[storybook/README.md](packages/bst-vue-next/storybook/README.md) |

> 文档与代码冲突时，以文档为准并顺手修正代码或文档；不要另起一套规则。

## 包依赖方向

```plaintext
bst-basic-components ──┐
bst-advanced-components ─┼─→ 对应主包（聚合 build/）─→ 根 dist/
bst-ai-components ─────┘
bst-types ──（仅声明，构建期内联进各发布单元，不进 dist）

advanced 可依赖 basic 类型；ai 可依赖 basic / advanced；禁止反向依赖与循环引用。
```

- **不要手改 `dist/`、`build/`、`storybook-static/`、`coverage/`**：全部由脚本生成，且已被 `.gitignore` 忽略。
- 发布链路是两步：源码包先产出到 `packages/<包>/build/`，再由 `pnpm move:main:dist` 归拢到根 `dist/` 并删除中间产物。

## 硬性约定

1. **组件源码不放任何样式**：类名契约对齐样式包，样式只写在 `packages/bst-styles`。
2. **跨包类型只放 `packages/bst-types/src/{basic|advanced|ai}-{component}.types.ts`**；`src/index.ts` 用 `export type * from './xxx.types'` 导出，**不写 `.ts` 扩展名**（否则消费方报 TS5097）。
3. **命名**：组件 `Bst{Component}`，类型 `Bst{Component}Props/Emits/Slots/Expose`，常量 `BST_{COMPONENT}_CONSTANT_*`。
4. **根组件 TSX 只调用 `use{Component}Controller()`**；生命周期全部在 `life.hooks.ts`；Props 归一化全部在 `prop.hooks.ts`。
5. **新增组件测试目录用 `__tests__`**（配置兼容 `__test__`，新代码统一用 `__tests__`），文件名 `<component>.test.tsx`；快照 demo 固定为 `_example/_test_snap_example.vue`。
6. **覆盖率四项必须 100%**，不得用 `v8 ignore` 绕过。
7. **第三方依赖必须在该源码包的 `dependencies` 中以 `catalog:` 声明**。未声明时 Rollup 要么报 TS2307，要么把依赖当源码静默打进产物。
8. **依赖版本只写 `catalog:` / `workspace:*`**，不写死版本号；新增依赖先改 `pnpm-workspace.yaml` 的 catalog，并同步 `docs/rules/dependencies.md`。
9. **只面向 Chromium**（Chrome / Edge / Electron），不支持 Firefox、Safari、IE。
10. 代码格式由 Prettier 决定：LF、120 列、单引号、尾逗号；提交前必须通过 `prettier --check`。

## 项目命名约定

| 项 | 包名 | 对应目录 |
| --- | --- | --- |
| 基础组件主包 | `@binarysovereign/vue-next` | `packages/bst-vue-next` |
| 高级组件主包 | `@binarysovereign/vue-next-pro` | `packages/bst-vue-next-pro` |
| AI组件主包 | `@binarysovereign/vue-next-pro-ai` | `packages/bst-vue-next-pro-ai` |
| 通用样式包 | `@binarysovereign/styles` | `packages/bst-styles` |
| 基础组件源码包（private） | `@binarysovereign/bst-basic-components` | `packages/bst-basic-components` |
| 高级组件源码包（private） | `@binarysovereign/bst-advanced-components` | `packages/bst-advanced-components` |
| AI相关组件源码包（private） | `@binarysovereign/bst-ai-components` | `packages/bst-ai-components` |
| 共享类型包（private） | `@binarysovereign/bst-types` | `packages/bst-types` |
| 组件单元测试包（private） | `@binarysovereign/test` | `packages/bst-vue-next/test` |

> !important：组件源码当中不放任何样式，全部样式均由 `@binarysovereign/styles` 包提供
>
> !important：所有跨包共享的类型全部定义在 `@binarysovereign/bst-types`，构建期会内联进各发布单元，消费方无需额外安装

## 构建流程

### 两步构建

```sh
pnpm install

# 1. 源码包 → packages/<包>/build/
pnpm build:private
pnpm build:style

# 2. 源码包产物聚合到对应主包
pnpm build:vue:next
pnpm build:vue:next:pro
pnpm build:vue:next:pro:ai

# 3. 归拢到根 dist/，并删除全部 build/
pnpm move:main:dist
```

- 文档站与 Storybook 都依赖样式包的 `build/` 产物，**必须排在 `move:main:dist` 之前**。
- 单独开发文档站 / Storybook 前先执行一次 `pnpm build:style`，否则会报样式无法解析。
- `build:private` 只处理有源码的包；源码包为空时整包跳过，属正常表现。

## 构建产物结构

#### 各包中间产物结构

组件包（源码包与主包一致）按 `es` 、 `lib` 、`umd` 分目录进行组织：

```plaintext
packages/<包名>/build/
├─ es/
├─ lib/
└─ umd/
```

样式包按层级组织，与 `package.json` 的 `exports` 对应：

```plaintext
packages/bst-styles/build/
└─ web/
   ├─ index.css          # 全量样式
   ├─ base.css           # 归一化层
   ├─ tokens.css         # 设计令牌层
   ├─ theme-light.css
   ├─ theme-dark.css
   ├─ basic-components/<组件名>/index.css
   ├─ ai-components/<组件名>/index.css
   └─ advanced-components/<组件名>/index.css
```

#### 根 `dist`产物结构

```plaintext
dist/
├─ vue-next/
│  ├─ package.json
│  ├─ LICENSE
│  └─ es/ lib/ umd/
├─ vue-next-pro/       （结构同 vue-next）
├─ vue-next-pro-ai/    （结构同 vue-next）
└─ styles/
   ├─ package.json
   ├─ LICENSE
   └─ web/
```

### 消费方引入（发布契约）

- 全量：`import BsVueNext from '@binarysovereign/vue-next'` + `import '@binarysovereign/styles/web'`。
- 按需：`import { BstContextMenu } from '@binarysovereign/vue-next-pro/es/context-menu'` + `import '@binarysovereign/styles/web/advanced-components/context-menu'`。
- **按需样式入口不要带 `/index.css`**：`./web/basic-components/*` 的 `*` 会吞掉整段，拼成 `.../button/index.css/index.css` 导致解析失败。
- 完整示例与产物说明见 [README-ZH.md](README-ZH.md)。

## 提交与 CI

```sh
# 提交前跑本地门禁（默认 full，与 CI 对齐；提交信息校验只在本地执行）
pnpm ci:local

git add -A
git commit -F docs/commit-msg/commit-msg-<N>.md
git push          # 推送到 develop
```

- 仓库只保留 `develop` 一个分支，CI 仅由 `develop` 的 push / PR 触发。
- 门禁清单的唯一事实来源是 `scripts/ci/steps.js`；`pnpm ci:local --check-sync` 会与 `.github/workflows/ci.yml` 逐条比对，改一侧必须同步另一侧。
- 提交信息格式见 [docs/rules/commit-msg-rules.md](docs/rules/commit-msg-rules.md)，示例文件在 `docs/commit-msg/`。

## packages 结构

```plaintext
packages/
├─ bst-vue-next/            # 基础主包（发布）
│  ├─ site/                 # VitePress 文档站（private）
│  ├─ storybook/            # Storybook 预览（private）
│  └─ test/                 # Vitest 测试包（private）
├─ bst-vue-next-pro/        # 高级主包（发布）
├─ bst-vue-next-pro-ai/     # AI 主包（发布）
├─ bst-styles/              # 样式源码与产物
├─ bst-basic-components/    # 基础组件源码（private）
├─ bst-advanced-components/ # 高级组件源码（private）
├─ bst-ai-components/       # AI 组件源码（private）
└─ bst-types/               # 共享类型（private，无构建）
```

## 适配浏览器

> 注意：组件库不支持 IE 浏览器，仅面向 Chromium 内核的现代浏览器（不支持 Firefox 与 Safari）

目标浏览器由根 `package.json` 的 `browserslist` 单点声明，`@babel/preset-env` 与 `autoprefixer` 均消费该声明：

```
'chrome >= 152',
'edge >= 152',
'Electron >= 42'
```

> `Electron 42` 折算出 Chromium 148，是全部目标中的实际下限；Chrome / Edge / Electron 同属 Blink，故验证矩阵只有这一个引擎家族。

## 新增 / 修改组件的落点

1. **类型**：`packages/bst-types/src/{basic|advanced|ai}-{component}.types.ts`，并在 `src/index.ts` 追加 `export type * from './...'`（不带 `.ts`）。
2. **源码**：`packages/bst-{layer}-components/{component}/src/` 下按 `hooks/`（`controller` / `prop` / `life` / `{component}`）、`elements/`、`constants.ts`、`utils.ts`、`{component}.tsx` 组织；根组件只调用 controller。规范见 [template/README.md](packages/bst-basic-components/template/README.md)。
3. **登记**：在 `packages/bst-{layer}-components/index.ts` 的 `components` 对象中注册；对外导出统一写在同包的 `components.ts`。
4. **测试**：`{component}/__tests__/` 下按 `props` / `events` / `slots` / `instanceFunctions` / `scenarios` 分组；快照 demo 只放一个 `_example/_test_snap_example.vue`。
5. **样式**：在 `packages/bst-styles/web/{basic|advanced|ai}-components/{component}/` 新建分片，并在同级 `_index.less` 登记。组件源码里不写任何样式。
6. **文档**（可选）：文档站页面放 `packages/bst-vue-next/site/src/components/`，示例放 `src/examples/`，且示例必须使用真实组件。

## 已知坑（已验证）

- **`pnpm lint` 只扫 `packages/`**：CI 会额外扫 `scripts/` 与根配置；全量静态检查用 `pnpm ci:local --profile quick`。
- **jsdom 不做布局**：`offsetWidth` / `offsetHeight` 恒为 0，动画需手动 `trigger('animationend')` 或用假定时器推进。
- **快照中的 Teleport**：Teleport 内容不进 CSR `wrapper.element`，也不进 SSR 主 HTML → demo 用 `:teleport="false"`；根组件 `phase=idle` 渲染 `null` 时，demo 需显式 `is-visible`。
- **Prettier 强制 LF**：Windows 下检出为 CRLF 会导致 `prettier --check .` 失败，仓库已用 `.gitattributes` 兜底，不要改成 CRLF。
- **ESLint ignores 存量笔误**：`eslint.config.js` 写的是 `packages/basic-components/template/**`，缺 `bst-` 前缀，模板目录实际仍会被扫描；改动该文件时顺手修正。
- **`pnpm test:snap` 无 demo 时会直接失败**（`No test found in suite`），这是刻意设计，不是配置错误。

## 代理协作

- 本仓库已提供 skills：`.agents/skills/component-develop`（写组件）、`unit-test`（补测试）、`dependency-selection`（选依赖版本）、`iconify-search`（搜图标）、`user-prompt-generation`（写提示词）。对应任务优先按 skill 执行。
- 修改后至少跑：`pnpm typecheck`；涉及测试跑 `pnpm test:unit`；涉及样式跑 `pnpm lint:style`；准备交付时跑 `pnpm ci:local`。
- 不要为了让检查通过而修改断言、放宽规则或使用 `v8 ignore`；规范冲突时先看「规范来源」。
