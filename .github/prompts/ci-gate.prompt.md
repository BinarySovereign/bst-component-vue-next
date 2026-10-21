---
description: "运行本地门禁并按失败项做最小修复，直到 typecheck、lint、测试、构建全部通过"
argument-hint: "档位或改动范围（如：full；只改了样式；只改了 context-menu）"
agent: "agent"
---

运行仓库门禁并修复失败项。未给参数时按改动范围自行选择档位，无法判断时用 `full`。

## 档位选择

| 改动范围 | 档位 |
| --- | --- |
| 仅文档、注释、格式 | `quick` |
| 组件逻辑、类型、hooks | `test` |
| 构建脚本、样式产物链路 | `build` |
| 准备提交或发布 | `full` |

## 执行步骤

1. 运行 `pnpm ci:local --profile <档位>`，记录第一个失败步骤的完整报错。
2. 读 `scripts/ci/steps.js` 确认该步骤的真实命令与覆盖范围，不要凭猜测复现。
3. 定位根因并做最小修复。修完只重跑该步骤，通过后再跑一次完整档位。
4. 全绿后汇总结果。

## 硬性约束

- 不通过修改断言、放宽 ESLint / Stylelint 规则、加 `v8 ignore` 或删除用例来让检查变绿。
- 不手改 `dist/`、`build/`、`storybook-static/`、`coverage/`，它们由脚本生成。
- 不自动提交、不推送、不创建 tag。
- 文档与代码冲突时以代码为准，并顺手修正文档；不要另立规则。

## 常见失败的处理方向

- 类型报错：跨包类型是否漏了 `bst-types` 的导出（`export type * from './xxx.types'` 不带 `.ts`）。
- 样式解析失败：先跑 `pnpm build:style`，再跑文档站或 Storybook 相关命令。
- 快照失败：先确认是有意变更，再决定是否更新快照；无 demo 报 `No test found in suite` 属预期，不要改配置。
- 提交信息校验失败：按 [commit-msg-rules.md](../../docs/rules/commit-msg-rules.md) 修文件，不改校验脚本。

## 交付格式

输出一张表：步骤、结果、根因、修改文件；最后给出整体结论与仍未解决的问题。
