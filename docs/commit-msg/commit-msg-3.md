docs: 对齐文档描述与仓库实际状态

- README 中英文版把产物形态由 es / lib 补全为 es / lib / umd，并补上根 dist 的 umd 目录
- 文档站与 README 的按需引入示例换成真实组件 BstContextMenu，替换不存在的 BsButton 与 BsProTable
- dependencies.md 把 Node 下限表述统一改为 >=22.13.0，并把 @types/node 标注为低于运行时的待对齐项
- Storybook 说明与 context-menu 测试计划同步为当前实际状态
- 删除 user-prompt-generation skill，改由 .github/prompts 下的提示词文件承接，AGENTS.md 的 skill 清单同步
- 修正 ESLint 忽略路径漏写 bst- 前缀的问题，模板目录恢复为忽略状态
- .vscode 设置里的 prettier 版本注释更新为 3.9.10

---

docs: align documentation with the actual repository state

- complete the artifact forms in both README files from es / lib to es / lib / umd, and add the umd directory to the root dist layout
- replace the on-demand import samples in the docs site and README with the real BstContextMenu component instead of the non-existent BsButton and BsProTable
- state the Node floor as >=22.13.0 throughout dependencies.md and mark @types/node as below the runtime baseline
- sync the Storybook notes and the context-menu test plan with the current state
- drop the user-prompt-generation skill in favor of the prompt files under .github/prompts and update the skill list in AGENTS.md
- fix the ESLint ignore path that missed the bst- prefix so the template directory is ignored again
- bump the prettier version note in the .vscode settings to 3.9.10

Copyright (c) 2026 Felix Tang(BinarySovereign). All rights reserved.
