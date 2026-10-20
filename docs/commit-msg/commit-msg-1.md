feat: 初始化 BstComponent 组件库仓库

- 搭建 pnpm workspace 单仓结构，划分组件源码包、发布主包、样式包与共享类型包
- 实现 BstContextMenu 组件，支持数据驱动渲染、插槽自定义、键盘导航与三类关闭触发
- 补齐组件样式分片与设计令牌，样式统一由 @binarysovereign/styles 产出
- 接入 Vitest 单元测试与 SSR/CSR 快照，ContextMenu 覆盖率四项均为 100%
- 新增 VitePress 文档站与 Storybook 预览，已登记 ContextMenu 页面、示例与故事
- 补充提交信息、变更日志与发布规范，并接入 CI、tag 发布与文档站部署工作流

---

feat: initialize the BstComponent component library repository

- set up a pnpm workspace monorepo split into source packages, published main packages, the styles package and the shared types package
- implement the BstContextMenu component with data-driven rendering, slot customization, keyboard navigation and three close triggers
- add the component style slices and design tokens, with all styles produced by @binarysovereign/styles
- wire up Vitest unit tests and SSR/CSR snapshots, with 100% coverage across all four metrics for ContextMenu
- add a VitePress docs site and a Storybook preview, with the ContextMenu page, demos and stories already registered
- add commit message, changelog and release conventions, plus CI, tag-triggered release and docs deployment workflows

Copyright (c) 2026 Felix Tang(BinarySovereign). All rights reserved.
