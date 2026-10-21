---
description: "把已完成的改动按变更日志规范提炼进指定发布包的 CHANGELOG-ZH.md 与 CHANGELOG.md"
argument-hint: "发布单元与版本（如：vue-next-pro 1.1.0；留空则只写未发布段）"
agent: "agent"
---

按仓库规范为一个发布包更新变更日志。参数为空时，从最近的提交与改动推断受影响的发布包，并写入 `## [未发布]` 段。

## 执行步骤

1. 读 [变更日志规范](../../docs/rules/changelog-rules.md)，重点看「定位与边界」「包归属与文件位置」「版本分组结构」「条目写法」「强制约束清单」。
2. 按包归属表确定目标包，只改该包的两个文件：
   - 中文：`packages/<包目录>/CHANGELOG-ZH.md`
   - 英文：`packages/<包目录>/CHANGELOG.md`
   - 对应关系：`bst-basic-components` → `bst-vue-next`；`bst-advanced-components` → `bst-vue-next-pro`；`bst-ai-components` → `bst-vue-next-pro-ai`；样式 → `bst-styles`。
3. 采集原料：`git log --oneline`、相关目录的 `git diff`，必要时读提交信息文件。只保留使用方能感知的能力、行为与迁移信息。
4. 写入对应版本段。给了版本号时把 `## [未发布]` 改为 `## [<版本>] - <YYYY-MM-DD>` 并在最上方补回空的 `## [未发布]`；没给版本号时只追加到现有 `## [未发布]` 段。
5. 按 emoji 分组归档，中英分组标题必须对应：

| 中文 | 英文 |
| --- | --- |
| `⚠️ 破坏性变更` | `⚠️ Breaking Changes` |
| `✨ 新增` | `✨ Added` |
| `🐛 修复` | `🐛 Fixed` |
| `♻️ 变更` | `♻️ Changed` |
| `⚡ 性能` | `⚡ Performance` |
| `📝 文档` | `📝 Docs` |
| `🔒 安全` | `🔒 Security` |

   空分组不保留，分组顺序按上表。

## 硬性约束

- 禁止粘贴 `git log` 或提交信息原文，必须改写成面向使用方的表述。
- 中英两份文件的版本标题、分组、条目顺序与条数逐条对应，只允许语言不同。
- `style`、`test`、内部重构不进入日志；`bst-types` 的改动按受影响的发布包各记一条。
- private 源码包、测试包、文档站、Storybook 不建日志。
- 不改 `package.json` 的 `version`，不提交、不打 tag。

## 交付前自检

1. 逐条比对两份文件的条目数与顺序。
2. 运行 `pnpm exec prettier --check <两个文件路径>`。
3. 输出：目标包、版本段、条目摘要、修改的两个文件路径。
