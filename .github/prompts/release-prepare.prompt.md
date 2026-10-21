---
description: "准备一次包发布：核对版本号、把未发布段改为版本段、跑 full 门禁，并给出提交与 tag 命令"
argument-hint: "发布单元与版本（如：vue-next-pro 1.1.0）"
agent: "agent"
---

准备一次发布。参数必须包含发布单元与目标版本；缺失时先询问，不要猜测版本号。

## 发布单元对照

| 单元 | 目录 | 源码包 |
| --- | --- | --- |
| `vue-next` | `packages/bst-vue-next` | `bst-basic-components` |
| `vue-next-pro` | `packages/bst-vue-next-pro` | `bst-advanced-components` |
| `vue-next-pro-ai` | `packages/bst-vue-next-pro-ai` | `bst-ai-components` |
| `styles` | `packages/bst-styles` | 自身 |

## 执行步骤

1. 读 [发布规范](../../docs/rules/release-rules.md) 与 [变更日志规范](../../docs/rules/changelog-rules.md)。
2. 修改该包 `package.json` 的 `version` 为目标版本。
3. 按变更日志规范把该包的 `CHANGELOG-ZH.md` 与 `CHANGELOG.md` 中的 `## [未发布]` 改为 `## [<版本>] - <YYYY-MM-DD>`，并在最上方补回空的 `## [未发布]`；中英逐条对应。
4. 运行 `pnpm ci:local --profile full`，直到全部通过。失败时按最小改动修复，不放宽规则。
5. 输出后续命令，不自动执行：

```sh
git add -A
git commit -F docs/commit-msg/commit-msg-<N>.md
git push origin develop
git tag <单元>@<版本>
git push origin <单元>@<版本>
```

## 硬性约束

- tag 固定为 `<单元>@<版本>`，单元名不加 `@binarysovereign/` 前缀，版本号与 `package.json` 完全一致。
- 日志版本标题、`package.json` 版本、tag 版本三者必须相同。
- 没有对外可见改动的包不打 tag。
- 不手改 `dist/`、`release/`，发布附件由 Release 工作流重新构建。
- 默认只准备文件与校验，不推送、不打 tag；用户明确要求时才执行推送。
- 需要提交信息时，按 [commit-message 提示词](./commit-message.prompt.md) 生成，不直接内联。

## 交付格式

先给发布前检查表（版本号、两份日志、门禁、工作区是否干净），再给命令清单，最后列出尚未完成的事项。
