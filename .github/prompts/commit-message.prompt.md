---
description: "根据当前代码改动生成符合仓库规范的提交信息文件 docs/commit-msg/commit-msg-<N>.md，并校验通过"
argument-hint: "本次提交的范围说明（可选，如：只提交某个组件的边界修复）"
agent: "agent"
---

按仓库规范生成本次提交的信息文件。参数为空时，以当前工作区全部未提交改动为准。

## 执行步骤

1. 读 [提交信息规范](../../docs/rules/commit-msg-rules.md)，重点看「整体结构」「逐段落说明」「强制约束清单」「提交前自检」四节。
2. 采集改动：
   - `git status --short`
   - 有暂存内容用 `git diff --staged`，否则用 `git diff`
   - 需要背景时再看 `git log -1 --stat`
3. 判断提交类型与主题。若改动包含两件及以上互不相关的事，先列出拆分建议并停止，不要硬塞进一份提交信息。
4. 取编号：列出 `docs/commit-msg/` 下现有 `commit-msg-*.md`，取最大序号加一，得到新文件名 `docs/commit-msg/commit-msg-<N>.md`。
5. 写入文件，结构固定为：

```text
<type>: <中文标题>

- <中文正文条目>

---

<type>: <English title>

- <English bullet>

Copyright (c) <当前年份> Felix Tang(BinarySovereign). All rights reserved.
```

## 硬性约束

- 标题与正文条目末尾不加句号、逗号、冒号、分号、感叹号、问号。
- 中文标题不超过 30 字；两个语言块的 `type`、条目数、条目顺序完全一致。
- 只写本次改动的事实与原因，不写后续计划、`TODO`、`WIP`，不用 emoji，不用 Markdown 标题层级。
- 文件编码 UTF-8 无 BOM，行尾 LF。
- 只创建或修改这一份提交信息文件，不改动业务代码、配置与文档。

## 交付前自检

1. 运行 `node scripts/ci/check-commit-msg.js --msg <N>`，必须退出码为 0。
2. 输出新文件路径、校验结果，以及建议的提交命令 `git commit -F docs/commit-msg/commit-msg-<N>.md`。
