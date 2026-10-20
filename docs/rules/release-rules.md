# 发布规范

> 正式版本通过 **Git tag + GitHub Release** 发布：推送符合约定的 tag 即触发 `.github/workflows/release.yml`，由工作流重新构建产物、打包 `.tgz` 并创建 Release。
>
> 版本号的事实来源是该包自己的 `package.json`；tag 只负责「宣布发布」，不参与版本计算。

---

## 发布渠道与约束

| 项 | 规定 |
| --- | --- |
| 发布渠道 | GitHub Release（tag 触发自动发布） |
| 不入库 | 根 `dist/`、`release/`、`release-notes.md` 均被 `.gitignore` 忽略，按需重建 |
| 发布物 | 每个发布单元一个 `.tgz`（自包含产物目录），作为 Release 附件；命名固定为 `bst-<单元>-<版本>.tgz` |
| npm registry | **不使用**。仓库无 `.npmrc`、无 `publish` 脚本，`@binarysovereign/*` 不走 npm 分发 |
| 触发方式 | 推送 tag，或手动运行 `Release` 工作流并填入 tag |
| 权限 | 工作流声明 `contents: write`，使用内置 `GITHUB_TOKEN` 创建 Release |

---

## 发布单元与 tag 命名

tag 固定为 `<发布单元>@<SemVer>`，与发布单元一一对应：

| 发布单元 | tag 示例 | 源码目录 | 聚合的源码包 |
| --- | --- | --- | --- |
| `vue-next` | `vue-next@1.1.0` | `packages/bst-vue-next` | `bst-basic-components` |
| `vue-next-pro` | `vue-next-pro@1.1.0` | `packages/bst-vue-next-pro` | `bst-advanced-components` |
| `vue-next-pro-ai` | `vue-next-pro-ai@1.1.0` | `packages/bst-vue-next-pro-ai` | `bst-ai-components` |
| `styles` | `styles@1.1.0` | `packages/bst-styles` | `bst-styles` 自身 |

- 单元名与目录名严格一致，不加 `@binarysovereign/` 前缀，避免 tag 以 `@` 开头。
- 一个 tag 只发布一个单元；同批次发布多个包时，逐个打 tag 并各自推送。
- 版本号必须与「包归属对照表」中该包自己的 `package.json` 完全一致，否则打包步骤失败。
- 含 `-alpha` / `-beta` / `-rc` 后缀的版本会被自动标记为 **prerelease**。
- 版本号遵循 SemVer；本次没有对外可见改动的包**不打 tag**。

---

## 发布前置条件

四项全部满足才能打 tag：

1. 该包 `package.json` 的 `version` 已改为目标版本。
2. 该包的 `CHANGELOG.md` 与 `CHANGELOG-ZH.md` 中已存在 `## [<版本号>] - <发布日>` 段落，且两份逐条对应。
3. `pnpm ci:local --profile full` 全绿（与 CI 门禁一致）。
4. 改动已合入 `develop`，工作区干净、无未提交文件。

---

## 发布流程

1. 按「变更日志编写规范」把 `## [未发布]` 改为 `## [<版本号>] - <YYYY-MM-DD>`，并在最上方重新插入空的 `## [未发布]`；中英两份同步修改。
2. 修改该包 `package.json` 的 `version` 为同一版本号。
3. 运行 `pnpm ci:local --profile full`，确认全部门禁通过。
4. 提交版本号与变更日志，提交信息用 `build:` 或 `docs:` 类型，并按提交信息规范存入 `docs/commit-msg/`。
5. 推送到 `develop`：`git push origin develop`。
6. 打并推送 tag：

   ```sh
   git tag vue-next-pro@1.1.0
   git push origin vue-next-pro@1.1.0
   ```

7. 等待 `Release` 工作流完成，在 GitHub Releases 页面确认正文与附件。

- tag 必须先推送到远端，工作流的 `gh release create --verify-tag` 依赖远端已存在该 tag。
- 禁止在本地产出 `dist/` 后手工上传附件：附件必须由 CI 从同一次提交重新构建，避免产物与源码脱节。

---

## 完整发布示例

以 `vue-next-pro@1.1.0` 为例，展示从改文件到 Release 落地的最终形态。

### 1. 发布前该包的两个文件

`packages/bst-vue-next-pro/package.json`：

```json
{
  "name": "@binarysovereign/vue-next-pro",
  "version": "1.1.0"
}
```

`packages/bst-vue-next-pro/CHANGELOG-ZH.md`：

```plaintext
# 变更日志

本文件记录 `@binarysovereign/vue-next-pro` 的对外可见变更，聚合 `packages/bst-advanced-components` 的组件改动。

## [未发布]

## [1.1.0] - 2026-10-20

### ✨ 新增

- `BstContextMenu` 新增 `submenu` 属性，支持多层嵌套子菜单（#142）

### 🐛 修复

- 修复 `BstContextMenu` 在 `phase=idle` 状态下渲染报错的问题（#138）
```

### 2. 执行的三条命令

```sh
git add packages/bst-vue-next-pro
git commit -F docs/commit-msg/commit-msg-12.md
git push origin develop
```

```sh
git tag vue-next-pro@1.1.0
git push origin vue-next-pro@1.1.0
```

### 3. 释放后 GitHub 上的实际结果

Release 列表出现一条：

```plaintext
vue-next-pro v1.1.0                                          Latest
Tag: vue-next-pro@1.1.0
Assets: bst-vue-next-pro-1.1.0.tgz (24.1 KB)
```

Release 正文由 `notes.js` 自动生成，内容等于 CHANGELOG 中 `## [1.1.0]` 段落，外加包名标题与英文折叠块：

```plaintext
## @binarysovereign/vue-next-pro v1.1.0

### ✨ 新增

- `BstContextMenu` 新增 `submenu` 属性，支持多层嵌套子菜单（#142）

### 🐛 修复

- 修复 `BstContextMenu` 在 `phase=idle` 状态下渲染报错的问题（#138）

<details>
<summary>English</summary>

### ✨ Added

- `BstContextMenu` adds a `submenu` prop for multi-level nested menus (#142)

### 🐛 Fixed

- fix `BstContextMenu` throwing on render while `phase=idle` (#138)

</details>
```

### 4. 消费方安装

```sh
# 直接用 Release 附件 URL
pnpm add https://github.com/<owner>/<repo>/releases/download/vue-next-pro%401.1.0/bst-vue-next-pro-1.1.0.tgz
```

```sh
# 或先下载再按本地路径安装
pnpm add ./bst-vue-next-pro-1.1.0.tgz
```

- URL 中 tag 的 `@` 需写成 `%40`，否则部分 npm / pnpm 版本会截断路径。
- 附件是自包含产物，安装后无需再装 `@binarysovereign/bst-types`。
- 样式需另外安装 `@binarysovereign/styles` 的对应 Release 附件。

### 5. 同一批次发布多个包

组件与样式通常同批发布，此时各打各的 tag，互不依赖：

```sh
git tag vue-next-pro@1.1.0
git tag styles@1.1.0
git push origin vue-next-pro@1.1.0 styles@1.1.0
```

- 两次工作流并行执行，各自产出 `bst-vue-next-pro-1.1.0.tgz` 与 `bst-styles-1.1.0.tgz`。
- 没有对外改动的包（如本次的 `vue-next`、`vue-next-pro-ai`）**不打 tag**，Release 列表里不会出现它们的 `1.1.0`。

---

## 工作流职责

`.github/workflows/release.yml` 按顺序执行：

| 步骤 | 命令 / 动作 | 作用 |
| --- | --- | --- |
| 检出 | `actions/checkout` | 手动触发时按输入 tag 检出，保证产物与标签同源 |
| 解析标签 | 拆分 `UNIT` 与 `VERSION` | 校验单元名在允许列表内，并写入 `GITHUB_ENV` |
| 构建链 | `build:private` → `build:style` → `build:vue:next*` → `move:main:dist` | 与 `ci.yml` 相同，禁止复用缓存产物 |
| 生成说明 | `node scripts/release/notes.js` | 从 `CHANGELOG-ZH.md` 抽取版本段落，附英文折叠段落 |
| 打包 | `node scripts/release/pack.js --only <单元> --expect-version <版本>` | 校验版本一致后 `pnpm pack` 生成 `.tgz` |
| 创建 Release | `gh release create <tag> <tgz>` | 标题为 `<单元> v<版本>`，正文取上一步输出 |

### 本地预演

发布前可用同样的脚本在本地产出，用于核对附件与正文：

```sh
node scripts/release/pack.js --dry-run
```

```sh
node scripts/release/notes.js --package vue-next-pro --version 1.1.0
```

```sh
node scripts/release/pack.js --only vue-next-pro --expect-version 1.1.0
```

- `--dry-run` 只做校验与打印，不执行 `pnpm pack`。
- 本地预演生成的 `release/` 与 `release-notes.md` 已被忽略，不提交。

### 打包校验项

`scripts/release/pack.js` 在打包前强制检查，任一失败即退出：

| 校验 | 失败含义 |
| --- | --- |
| `dist/<单元>/package.json` 存在 | 尚未执行 `pnpm move:main:dist` |
| 清单 `version` 与源码包一致 | `dist/` 是旧产物，需重新构建 |
| 清单 `name` 与发布单元一致 | 单元目录与包名错配 |
| `--expect-version` 与源码包一致 | tag 版本与 `package.json` 漂移 |

---

## 发布后与回滚

- 已发布版本的历史段落**只增不改**：发现文案错误时，通过下一次 patch 发布修正，禁止重写旧版本条目。
- 需要撤回时，删除 GitHub Release 与对应远端 tag，再删本地 tag：

  ```sh
  git push origin --delete vue-next-pro@1.1.0
  git tag -d vue-next-pro@1.1.0
  ```

- 撤回后重新发布必须升版本号（如 `1.1.1`），不得复用已撤回的版本号。
- 产物内容有误但版本号已被消费时，同样只能升 patch，不得覆盖同名附件。

---

## 禁止事项

- 禁止用 `npm publish` / `pnpm publish` 发布到 npm registry。
- 禁止手工上传 `dist/` 目录或本地已存在的 `.tgz`。
- 禁止在 tag 推送后修改该 tag 指向的提交；需要修正时删 tag 后重新打。
- 禁止为同一版本创建第二个 Release。
- 禁止跳过 `pnpm ci:local --profile full` 直接打 tag。
