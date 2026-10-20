# 变更日志编写规范

> 变更日志面向组件库的**使用方**，按**发布版本**聚合多次提交的结果；提交信息面向**维护者**，按**单次提交**记录改动过程。
>
> 两者不是同一份文件的两种写法：提交信息是原料，变更日志是从原料中提炼出的成品，禁止把提交信息原文粘贴进变更日志。
>
> 本仓库的变更日志**按发布包拆分**（一个包一对中英文件），分组标题统一带固定 emoji，便于在发布页与仓库浏览时快速定位变更类型。

---

## 目录

| 序号 | 章节 | 说明 |
| --- | --- | --- |
| 1 | [定位与边界](#定位与边界) | 变更日志与提交信息的差异、哪些 `type` 进入日志及归档分组 |
| 2 | [包归属与文件位置](#包归属与文件位置) | 每个发布包对应哪份日志、汇聚哪些源码包、版本号取自哪里、文件编码与同步要求 |
| 3 | [版本分组结构](#版本分组结构) | 版本标题写法、排序规则、版本号独立规则、emoji 分组映射表 |
| 4 | [条目写法](#条目写法) | 内容要求、格式要求，以及破坏性变更的三项必写内容 |
| 5 | [完整示例](#完整示例) | 单个包的中英日志对照示例、跨包改动示例 |
| 6 | [发布流程](#发布流程) | 发布时的 7 步操作顺序 |
| 7 | [反例](#反例) | 常见错误写法及对应问题 |
| 8 | [强制约束清单](#强制约束清单) | 10 条不可协商的硬性规则 |
| 9 | [发布前自检](#发布前自检) | 9 条交付前逐项核对项 |

- 手动查阅时优先看第 1～4 节确认口径，落地生成时按第 6 节执行，最后用第 8、9 节收口。

## 定位与边界

| 维度 | 提交信息（commit message） | 变更日志（changelog） |
| --- | --- | --- |
| 粒度 | 一次提交 | 一个发布版本，聚合多次提交 |
| 受众 | 维护者、评审者 | 使用这个库的外部开发者 |
| 内容范围 | 改了什么、为什么改、内部实现细节 | 只保留使用方可感知的能力、行为与迁移信息 |
| 语言 | 中文块 + 英文块 + 署名行 | 与 README 一致，每个包一对中英文件 |
| 归属 | 整次提交 | 按**发布包**拆分，一个包一份 |
| 存续 | 随代码永久留存 | 随版本发布维护，历史条目只增不改 |
| 规范来源 | [commit-msg-rules.md](commit-msg-rules.md) | 本文件 |

### 进入与不进入日志的改动

| `type` | 是否进入变更日志 | 归档位置 |
| --- | --- | --- |
| `feat` | 必须进入 | `✨ 新增` |
| `fix` | 必须进入 | `🐛 修复` |
| `perf` | 使用方可感知时进入 | `⚡ 性能` |
| `refactor` | 仅在对外行为、产物结构、导出路径发生变化时进入 | `♻️ 变更` |
| `revert` | 回滚了已发布能力时进入 | `♻️ 变更`，并在 `⚠️ 破坏性变更` 中说明 |
| `style` | 不进入 | — |
| `docs` | 不进入（仅文档站内容受影响时可并入 `📝 文档`） | `📝 文档` |
| `test` | 不进入 | — |
| `build` / `ci` / `chore` | 不进入（影响使用方安装或构建时并入 `♻️ 变更`） | `♻️ 变更` |

- `fix` 属于安全漏洞修复时改归 `🔒 安全`，不得同时记入 `🐛 修复`。
- 没有独立的 `security` 提交类型，安全条目一律来自 `fix` 或 `refactor` 的实际影响。

- 同一个提交最多对应一条日志条目，多个提交对应用户可感知的同一件事时合并为一条。
- 只改动内部实现、命名、类型收窄但对外等价的重构，不写进日志。
- 判定标准是「使用方是否需要改代码或改用法」，不是「改了多少文件」。
- 一次提交只影响一个包时只记入该包；同时影响多个发布包时，按包分别各记一条，文案可近似但不得互相引用。

---

## 包归属与文件位置

变更日志**按发布包拆分**：有对外发布单元的包各维护一份，private 源码包不单独维护，其改动归入对应的发布包。

| 发布包 | 日志目录 | 汇聚的源码包 | 版本号来源 |
| --- | --- | --- | --- |
| `@binarysovereign/vue-next` | `packages/bst-vue-next/` | `bst-basic-components` | `packages/bst-vue-next/package.json` |
| `@binarysovereign/vue-next-pro` | `packages/bst-vue-next-pro/` | `bst-advanced-components` | `packages/bst-vue-next-pro/package.json` |
| `@binarysovereign/vue-next-pro-ai` | `packages/bst-vue-next-pro-ai/` | `bst-ai-components` | `packages/bst-vue-next-pro-ai/package.json` |
| `@binarysovereign/styles` | `packages/bst-styles/` | `bst-styles` 自身 | `packages/bst-styles/package.json` |

- `bst-types` 没有独立发布单元，其改动内联进各发布包：**受影响的每个发布包都要各记一条**，文案写明受影响的类型或组件。
- `bst-vue-next/test`、`bst-vue-next/site`、`bst-vue-next/storybook` 属内部基建，**不建日志**。
- 组件源码包的改动归属判定：`bst-basic-components` → `vue-next`，`bst-advanced-components` → `vue-next-pro`，`bst-ai-components` → `vue-next-pro-ai`。

### 文件位置与格式

| 项 | 规定 |
| --- | --- |
| 中文文件 | `packages/<包目录>/CHANGELOG-ZH.md` |
| 英文文件 | `packages/<包目录>/CHANGELOG.md` |
| 命名来源 | 与仓库根 `README.md`（英文）/ `README-ZH.md`（中文）保持一致 |
| 编码 | UTF-8 无 BOM，行尾 LF（与 `.gitattributes` 对齐） |
| 同步要求 | 同包的两份文件版本标题、emoji 分组、条目顺序、条数必须逐条对应，只允许语言不同 |
| 生成方式 | 由维护者在发布时手工整理；**禁止**直接输出 `git log` 或提交信息原文 |

- 仓库根目录**不再**维护汇总日志；如需索引，只能放指向各包日志的链接列表，且不承载版本内容。
- 日志文件与对应 `package.json` 同级。当前各发布包的 `files` 只有 `es` / `lib` / `umd`，**日志默认只作为仓库内文档，不进 npm 包**。
- 日志同时是 GitHub Release 的正文来源：发布工作流会按版本段落抽取，抽取规则见 [release-rules.md](release-rules.md)。
- 若要让日志随包发布，必须同时改两处，缺一不可：该包 `package.json` 的 `files` 增加 `CHANGELOG*.md`，以及 `scripts/build/dist.js` 的 `moveUnit` 增加对应的复制步骤（现在只复制 `LICENSE`）。
- `dist/`、`build/`、`storybook-static/` 等构建产物中不包含变更日志。
- 日志随发布提交一起入库，同一版本不允许出现两次「发布」提交。

---

## 版本分组结构

`````plaintext
# 变更日志

本文件记录 `@binarysovereign/vue-next-pro` 的对外可见变更，聚合 `packages/bst-advanced-components` 的组件改动。

## [未发布]

## [1.2.0] - 2026-10-20

### ⚠️ 破坏性变更

- 移除 `BstContextMenu` 的 `teleportTarget` 属性，改用 `teleport` 布尔属性

  ```diff
  - <BstContextMenu :teleport-target="'body'" />
  + <BstContextMenu :teleport="true" />
  ```

### ✨ 新增

- 新增 `BstContextMenu` 组件，支持右键菜单与分组渲染

### 🐛 修复

- 修复 `BstContextMenu` 在 `phase=idle` 时挂载报错的问题（#128）

### ⚡ 性能

- 减少 `BstContextMenu` 首次挂载时的一次多余重渲染
`````

### 标题行

- 顶层标题固定为 `# 变更日志`（英文文件为 `# Changelog`），不写其他名称。
- 标题下紧跟一行包说明，必须写明**包名**与**汇聚的源码包**，如 `本文件记录 \`@binarysovereign/vue-next\` 的对外可见变更，聚合 \`packages/bst-basic-components\` 的组件改动。`
- 版本标题固定为 `## [<版本号>] - <YYYY-MM-DD>`，日期为**实际发布日**，不是提交日期。
- 版本标题**不带 emoji**，emoji 只用于分组标题，避免与条目、版本号混在一起影响检索。
- 未发布内容统一放在文件最上方的 `## [未发布]` 中，发布时改为正式版本标题。
- 版本按**倒序**排列，最新版本在最上方，禁止按 `git log` 正序追加到文件末尾。
- 版本号遵循 SemVer：`MAJOR.MINOR.PATCH`；`0.x` 阶段 `MINOR` 递增即视为破坏性变更。
- 每个包**独立**记录版本：该包本次没有对外可见改动时不升版本、不新增段落，不得为对齐其他包而写空版本。
- 同一发布批次下，有改动的包默认使用同一版本号；确实需要单独发版时，在包说明行下方补一行「本包版本独立于同批次」的说明。
- 所有版本标题使用同一层级 `##`，分组标题统一使用 `###`，不得混用 `#` / `####`。

### 分组标题

- 固定取值、emoji 与书写顺序（缺失的分组直接省略，不写空标题）：

| 顺序 | emoji | 中文标题 | 英文标题 | 内容 |
| --- | --- | --- | --- | --- |
| 1 | ⚠️ | `破坏性变更` | `Breaking Changes` | 使用方必须改代码的变更，含迁移方式 |
| 2 | ✨ | `新增` | `Added` | 新增组件、属性、事件、插槽、实例方法 |
| 3 | 🐛 | `修复` | `Fixed` | 已发布能力的缺陷修复 |
| 4 | ♻️ | `变更` | `Changed` | 行为调整、默认值变化、导出路径变化 |
| 5 | ⚡ | `性能` | `Performance` | 可感知的性能优化 |
| 6 | 📝 | `文档` | `Docs` | 仅文档站、示例、类型示例的调整 |
| 7 | 🗑️ | `废弃` | `Deprecated` | 已标记废弃但尚未移除的 API |
| 8 | 🔒 | `安全` | `Security` | 修复安全漏洞，或收紧了权限与校验 |

- 分组标题固定为 `### <emoji> <标题>`：emoji 在前、与标题之间一个半角空格，emoji 与文字不得拆行。
- 每个 emoji **只绑定一个分组**，禁止同一 emoji 复用到其他分组，也禁止替换为近似 emoji（如用 🎉 代替 ✨、用 🔧 代替 ♻️）。
- emoji 统一使用上表码位，含变体选择符（`U+FE0F`）的 `⚠️` / `♻️` / `🗑️` 不得写成无变体形式；中英两份文件的 emoji 必须完全一致。
- 条目正文内**禁止**使用 emoji：emoji 是分组标识，不是装饰，条目里出现会破坏按行检索与 diff 可读性。
- 禁止自造分组（如 `优化`、`其他`、`杂项`），无法归类的改动说明它不该进日志。
- 一个分组下没有条目时必须整段删除，保留空标题（含只有 emoji 的空标题）视为格式错误。

---

## 条目写法

### 内容要求

1. 一条只写一件使用方可感知的事，按重要性降序排列。
2. 必须写**可观察的结果**，不写实现过程：写「支持嵌套子菜单」，不写「重构 renderMenu 函数」。
3. 涉及组件时在条目开头用反引号标注组件名，如 `` `BstContextMenu` 支持 ... ``。
4. 涉及属性、事件、插槽、实例方法时保留英文原名并用反引号包裹。
5. 有关联 Issue 或 PR 时在条目末尾标注 `（#123）`（英文文件为 `(#123)`）。
6. 禁止出现内部文件名、内部函数名、分支名、`TODO`、`WIP`。

### 格式要求

- 每条以 `- ` 开头、独占一行，末尾不加标点。
- 条目不换行、不嵌套子列表；需要补充说明时改写为一条独立条目。
- 中文条目使用中文陈述句，英文条目为中文条目的地道翻译，**条数与顺序一一对应**。
- 同一分组内条目之间不空行；分组之间空一行。

### 破坏性变更的特殊要求

破坏性变更必须同时写清三件事，缺一不可：

1. **影响范围**：哪个组件、哪个 API、哪类用法受影响；影响其它发布包时逐个列出包名。
2. **旧写法与新写法**：用 `diff` 代码块给出迁移对照。
3. **版本提示**：在包说明行下方补一行升级提示，如 `升级到 1.2.0 前请先阅读「破坏性变更」`。

- 破坏性变更不得只写在其中一条普通条目里，必须在 `⚠️ 破坏性变更` 分组单独成条。
- 被废弃但尚未移除的 API 不进 `⚠️ 破坏性变更`，放 `🗑️ 废弃` 分组并写明计划移除的版本。

---

## 完整示例

以下为 `packages/bst-vue-next-pro/` 下的一对日志文件，两者除语言以外结构完全一致，emoji 必须一模一样。

### 中文文件 `packages/bst-vue-next-pro/CHANGELOG-ZH.md`

```plaintext
# 变更日志

本文件记录 `@binarysovereign/vue-next-pro` 的对外可见变更，聚合 `packages/bst-advanced-components` 的组件改动。

## [1.1.0] - 2026-10-20

### ✨ 新增

- `BstContextMenu` 新增 `submenu` 属性，支持多层嵌套子菜单（#142）
- `BstContextMenu` 新增 `disabled` 属性，禁用后不响应右键与键盘操作

### 🐛 修复

- 修复 `BstContextMenu` 在 `phase=idle` 状态下渲染报错的问题（#138）
- 修复 `BstContextMenu` 快速连续右键时残留上一个菜单的问题

### ♻️ 变更

- `BstContextMenu` 的 `teleport` 默认值由 `false` 改为 `true`

## [1.0.0] - 2026-09-30

### ✨ 新增

- 新增 `BstContextMenu` 组件，支持右键菜单与分组渲染
```

### 英文文件 `packages/bst-vue-next-pro/CHANGELOG.md`

```plaintext
# Changelog

This file records user-facing changes in `@binarysovereign/vue-next-pro`, aggregating component changes from `packages/bst-advanced-components`.

## [1.1.0] - 2026-10-20

### ✨ Added

- `BstContextMenu` adds a `submenu` prop for multi-level nested menus (#142)
- `BstContextMenu` adds a `disabled` prop that blocks right-click and keyboard interaction

### 🐛 Fixed

- fix `BstContextMenu` throwing on render while `phase=idle` (#138)
- fix the previous menu lingering when right-clicking twice in quick succession

### ♻️ Changed

- the `teleport` prop of `BstContextMenu` now defaults to `true` instead of `false`

## [1.0.0] - 2026-09-30

### ✨ Added

- add the `BstContextMenu` component with right-click menus and grouped rendering
```

### 跨包改动示例

同一次提交同时修改了 `bst-types` 与两个组件包时，三个相关发布包各记一条，且文案不互相引用：

```plaintext
# packages/bst-vue-next/CHANGELOG-ZH.md
### ♻️ 变更

- `BstButton` 的 `size` 类型改用 `bst-types` 新建的 `BstSize`，已废弃的 `'mini'` 取值不再被接受

# packages/bst-vue-next-pro/CHANGELOG-ZH.md
### ♻️ 变更

- `BstContextMenu` 的 `size` 类型改用 `bst-types` 新建的 `BstSize`，行为与取值不变

# packages/bst-styles/CHANGELOG-ZH.md
### ✨ 新增

- 新增与 `BstSize` 对应的 `@size-mini` 令牌，供基础层组件样式引用
```

---

## 发布流程

1. 按「包归属对照表」逐个发布包确认本次是否有对外可见改动，只处理有改动的包。
2. 把每个包的 `## [未发布]` 条目按 emoji 分组整理完成，确认没有只写内部实现的条目。
3. 从**该包自己的** `package.json` 确定新版本号，按 SemVer 判断该升 `MAJOR` / `MINOR` / `PATCH`。
4. 把 `## [未发布]` 改为 `## [<版本号>] - <发布日>`，并在最上方重新插入空的 `## [未发布]`。
5. 同步更新同包的 `CHANGELOG.md`，确保 emoji、分组、条目顺序与中文文件逐条对应。
6. 与版本号变更同一次提交入库，提交信息使用 `docs:` 或 `build:` 类型。
7. 打 tag 前再核对一次每个包的版本号、日期与分组顺序。

---

## 反例

| 反例 | 问题 |
| --- | --- |
| 把 `git log --oneline` 结果直接贴进 `CHANGELOG.md` | 混入 `chore`、`test` 等使用方不关心的条目 |
| 在仓库根目录再维护一份汇总日志 | 日志按发布包拆分，根目录只允许放索引链接 |
| 把 `bst-basic-components` 的改动写进 `packages/bst-vue-next-pro` | 源码包只能归入对应的发布包 |
| `- refactor: 重构 context-menu 的 render 逻辑` | 记录了实现过程，使用方无法感知 |
| `- 优化了一些细节` | 无信息量，无法判断是否影响自己 |
| 新版本追加在文件末尾 | 版本必须倒序，最新在最上方 |
| `## [Unreleased]` 与 `## [未发布]` 混用 | 同一文件内版本标记必须统一 |
| 破坏性变更只写在 `♻️ 变更` 分组里 | 必须在 `⚠️ 破坏性变更` 分组单独成条并给出迁移写法 |
| 中文文件有 3 条、英文文件有 2 条 | 两份文件条目必须逐条对应 |
| 一个版本重复出现两次标题 | 同一版本只允许一个版本标题 |
| 修改历史版本条目内容 | 历史条目只增不改，修正用新条目说明 |
| 空分组标题 `### 🐛 修复` 下没有任何条目 | 空分组必须整段删除 |
| `### 新增 ✨` / `### 修复🐛` | emoji 必须在标题前，且与文字之间恰好一个空格 |
| `### 🎉 新增`、`### 🔧 变更` | 不得替换或自造 emoji，必须使用固定映射表 |
| `- 🐛 修复 xxx 报错` | 条目正文不允许出现 emoji |
| 中文文件用 `⚠️`、英文文件用 `⚠` | 同一分组的 emoji 在两份文件里必须完全一致 |
| 为对齐其他包而补一个空版本标题 | 无对外改动的包不升版本、不新增段落 |

---

## 强制约束清单

1. 日志按发布包拆分，只允许四个目录：`packages/bst-vue-next/`、`packages/bst-vue-next-pro/`、`packages/bst-vue-next-pro-ai/`、`packages/bst-styles/`，每个包一对中英文件。
2. private 源码包的改动归入对应发布包；`bst-types` 改动逐包记录；内部基建包不建日志；根目录不维护汇总日志。
3. 版本标题固定为 `## [<版本号>] - <YYYY-MM-DD>`，不带 emoji，版本按倒序排列，未发布内容统一放在 `## [未发布]`。
4. 分组标题固定为 `### <emoji> <标题>`，emoji 只允许使用固定映射表中的八个，且按规定顺序排列。
5. 同一 emoji 只能绑定一个分组；中英两份文件、所有包的日志必须使用同一套 emoji 码位。
6. 条目正文禁止使用 emoji，`- ` 开头、末尾不加标点，禁止出现内部文件名与函数名。
7. 条目只写使用方可感知的结果，一条一件事；`style`、`test`、`chore` 类改动默认不进入日志；`refactor` 仅在对外行为变化时进入。
8. 破坏性变更必须单独成组，写明影响范围、旧写法与新写法，并给出迁移方式。
9. 禁止把提交信息原文或 `git log` 输出直接作为日志内容。
10. 历史版本条目只增不改，已发布版本不得删除或重写。

---

## 发布前自检

1. 本次改动是否只写进了它对应的发布包，有没有漏记受影响的其它发布包（如 `bst-types` 改动）。
2. 各包版本标题的版本号是否与**该包自己的** `package.json` 一致，日期是否为实际发布日。
3. 是否存在 `## [未发布]`，发布后是否已重新插入空段。
4. 每个分组标题是否为 `### <emoji> <标题>`，emoji 是否来自固定映射表、是否存在同 emoji 复用。
5. 是否存在空分组或自造分组，条目正文里是否误用了 emoji。
6. 每条是否写清「哪个组件 / 哪个 API / 发生了什么变化」，是否能被使用方直接理解。
7. 是否存在从提交信息原样粘贴、包含内部实现细节的条目。
8. 破坏性变更是否给出了旧写法与新写法的对照。
9. 同包的 `CHANGELOG.md` 与 `CHANGELOG-ZH.md` 的版本、emoji、分组、条目顺序与条数是否完全对应。
