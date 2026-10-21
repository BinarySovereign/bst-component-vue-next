# 示例目录

## 约定

1. **路径即 demo id**：文件路径为 `<层>/<组件名>/<场景名>.vue`，`<层>` 取 `basic` / `advanced` / `ai`，
   与组件文档、样式分片一一对应，例如 `advanced/context-menu/basic-usage.vue` 对应
   `Advanced / ContextMenu` 文档页与 `theme/styles/demo/advanced/context-menu.css`；
2. **文件名必须多词**：仓库 ESLint 的 `vue/multi-word-component-names` 禁止单词组件名，
   故用 `basic-usage.vue`（而非 `basic.vue`）、`divider-and-disabled.vue`（而非 `divider.vue`）；
3. **示例内不写样式**：样式一律来自 `@binarysovereign/styles`，示例只落地类名契约与 DOM 层级；
   需要「整块预览区都能接事件」（如右键菜单）时，给根节点加站点自带的 `bst-demo-fill` 类，
   它会用负外边距抵消预览区留白，使根节点铺满整块预览区，示例本身仍不写任何样式；
   其余可用辅助类见 `theme/styles/demo/shared.css` 与各层分片；
4. **在文档页用 `DemoBlock` 引用**，`demo` 取相对本目录且去掉 `.vue` 的路径（含层名）：

   ```md
   <DemoBlock demo="<层>/<组件名>/<场景名>" title="场景标题" description="一句话说明。" />
   ```

## 机制

预览与源码共用同一个文件，因此不存在示例与代码不一致的问题：

| 形态 | 来源 |
| --- | --- |
| 预览组件 | `theme/demo-source.ts` 的 `import.meta.glob` 惰性加载，示例各自分包 |
| 高亮源码 | `.vitepress/plugin/demo-highlight.ts` 在构建期渲染，经虚拟模块 `virtual:bst-demo-highlight` 输出，展开时才载入 |

完整说明见 `packages/bst-vue-next/site/README.md`。

> 注：本文件按 `srcExclude` 配置被排除在站点页面之外，不会生成路由。
