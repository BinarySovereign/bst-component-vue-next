feat: 文档站新增可配置示例演示区

- 重做 `DemoBlock`：演示区固定 240px 高、内容超出时内部滚动，新增「重置示例」按钮
- 新增 `playground` 机制，演示区与 `#config` 插槽共享同一份 props 对象，改动配置即时反映到示例
- 新增全局组件 `DemoConfigItem`（左属性名、右控件）与 `DemoJsonEditor`（高亮文本层叠在透明 textarea 下，失焦时格式化 JSON）
- 演示区右下角新增复制源码与查看源码两个图标按钮，图标拆到 `.vitepress/icons/`，复制改用 `clipboard` 包的 `ClipboardJS.copy()` 兼容无 `navigator.clipboard` 的环境
- 源码区支持 `codeTabs` 多标签，高亮插件额外收集 `.tsx` 并以 `demo id + .tsx` 为键，`.tsx` 只参与展示与类型检查、不参与渲染
- context-menu 文档页把 12 个静态示例合并为一个 `props-playground`，删除原示例文件，配置区可调菜单数据、最大高度、位置、Teleport 与三个关闭开关
- 站点自有样式由 `.css` 全部改为 `.less`，滚动条统一引用样式包的 `.scrollbar()` 混合宏
- 新增 `less` 与 `clipboard` 依赖并同步 `docs/rules/dependencies.md`，`tsconfig` 的 include 补上 `src/**/*.tsx`
- `07-docs-demo` 提示词与站点两份 README 同步新的示例、配置区与样式约定

---

feat: add a configurable demo playground to the docs site

- rework `DemoBlock` with a fixed 240px preview area that scrolls internally and add a reset button
- add a `playground` mechanism where the preview and the `#config` slot share one props object, so config changes apply to the demo immediately
- add the global `DemoConfigItem` (label on the left, control on the right) and `DemoJsonEditor` (highlighted text layer under a transparent textarea that formats the JSON on blur)
- add copy-source and view-source icon buttons to the preview corner, move icons into `.vitepress/icons/`, and switch copying to `ClipboardJS.copy()` from the `clipboard` package for environments without `navigator.clipboard`
- support multiple source tabs via `codeTabs`, have the highlight plugin also collect `.tsx` under a `demo id + .tsx` key, and keep `.tsx` for display and type checking only, never for rendering
- merge the 12 static examples on the context-menu page into one `props-playground` and delete the old files, with config controls for items, max height, position, teleport, and the three close switches
- migrate all site-owned styles from `.css` to `.less` and use the styles package `.scrollbar()` mixin for scrollbars
- add the `less` and `clipboard` dependencies, update `docs/rules/dependencies.md`, and include `src/**/*.tsx` in the `tsconfig`
- document the new example, config area, and style conventions in the `07-docs-demo` prompt and both site README files

Copyright (c) 2026 Felix Tang(BinarySovereign). All rights reserved.
