refactor: 移除 context-menu 的 width 属性

- 移除 `width` 属性、`--bst-context-menu-width` CSS 变量与 `_variables.less` 分片，面板宽度改由菜单项内容撑开
- 样式侧以 `min-width: 320px` 与 `max-width: calc(100% - 视口间距 * 2)` 兜底，避免内容过窄或超出视口
- 破坏性变更：原先通过 `width` 或该 CSS 变量固定宽度的调用方，需改为在业务样式里覆盖 `.bst-context-menu` 的 `width` 或 `min-width`
- 右侧文本由等分剩余空间改为不收缩，左右同时超长时左侧截断、右侧快捷键保持完整并贴近右缘
- 面板可滚动时改用带内边距的细滚动条，替代原先隐藏滚动条的写法
- 清理 `widthStyle` 计算、`WIDTH_INVALID` 告警文案与对应 prop 校验，归一化后只剩 `maxHeight` 走 `toCssLength`
- 单测与快照删除宽度相关用例，Storybook 移除数字宽度、字符串宽度与 CSS 变量覆盖宽度三个 story，新增左右文本都很长的 story
- 组件 README 计划文档与文档站示例同步删除宽度描述，示例只保留最大高度调节

---

refactor: drop the context-menu width prop and let content size the panel

- remove the `width` prop, the `--bst-context-menu-width` CSS variable, and the `_variables.less` shard so menu items size the panel
- fall back on `min-width: 320px` and `max-width: calc(100% - viewport gap * 2)` in the styles so the panel is neither too narrow nor too wide
- breaking change: callers that fixed the width via the prop or the CSS variable must override `width` or `min-width` on `.bst-context-menu` in their own styles
- stop the right text from splitting the remaining space, so long left text truncates while the shortcut stays intact against the right edge
- show a thin padded scrollbar when the panel scrolls instead of hiding it
- delete the `widthStyle` computed, the `WIDTH_INVALID` warning, and the matching prop validator, leaving `maxHeight` as the only value that goes through `toCssLength`
- drop the width cases from the tests and snapshots, remove the numeric width, string width, and CSS variable width stories, and add a story where both sides are long
- remove the width notes from the component README plans and the docs site example, which now only adjusts the max height

Copyright (c) 2026 Felix Tang(BinarySovereign). All rights reserved.
