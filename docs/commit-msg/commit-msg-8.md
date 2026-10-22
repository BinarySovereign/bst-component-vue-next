docs: 重构组件开发提示词为七步编号流水线

- 新增 01-component-style 至 07-docs-demo 七个编号提示词，按样式、共享类型、组件源码、快照、单测、Storybook、文档示例的顺序串起完整开发流程
- 删除 component-develop、types-entry、snapshot-test、unit-test、storybook-story、docs-demo 六个职责重叠的旧提示词
- 删除 .agents/skills/component-develop 技能，组件开发统一由提示词流水线承担
- 每个编号提示词补上前置条件、文件落点、硬性约束与验收命令，并标注上下游步骤与可并行关系
- ci-gate、commit-message、refactor-oop 的 argument-hint 去掉具体组件名，改为通用写法

---

docs: turn the component development prompts into a seven-step numbered pipeline

- add prompts 01-component-style through 07-docs-demo so one flow covers styles, shared types, component source, snapshots, unit tests, Storybook, and documentation demos in order
- remove the six overlapping prompts component-develop, types-entry, snapshot-test, unit-test, storybook-story, and docs-demo
- drop the .agents/skills/component-develop skill so component work goes through the prompt pipeline only
- give every numbered prompt its prerequisites, target files, hard constraints, and acceptance commands, and mark the upstream and downstream steps plus which can run in parallel
- make the argument hints of ci-gate, commit-message, and refactor-oop generic instead of naming a specific component

Copyright (c) 2026 Felix Tang(BinarySovereign). All rights reserved.
