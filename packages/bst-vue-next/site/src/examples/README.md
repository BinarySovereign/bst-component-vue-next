# 示例目录

## 约定

1. **路径即 demo id**：文件路径为 `<层>/<组件名>/<场景名>.vue`，`<层>` 取 `basic` / `advanced` / `ai`，与组件文档、样式分片一一对应，例如 `advanced/context-menu/props-playground.vue` 对应 `Advanced / ContextMenu` 文档页与 `theme/styles/demo/advanced/context-menu.less`；
2. **文件名必须多词**：仓库 ESLint 的 `vue/multi-word-component-names` 禁止单词组件名，故用 `basic-usage.vue`（而非 `basic.vue`）、`divider-and-disabled.vue`（而非 `divider.vue`）；
3. **示例内不写样式**：样式一律来自 `@binarysovereign/styles`，示例只落地类名契约与 DOM 层级；
   需要「整块预览区都能接事件」（如右键菜单）时，给根节点加站点自带的 `bst-demo-fill` 类，
   它会用负外边距抵消演示区留白，使根节点铺满整块预览区，示例本身仍不写任何样式；
   其余可用辅助类见 `theme/styles/demo/shared.less` 与各层分片；
4. **在文档页用 `DemoBlock` 引用**，`demo` 取相对本目录且去掉 `.vue` 的路径（含层名）：

   ```md
   <DemoBlock demo="<层>/<组件名>/<场景名>" title="场景标题" description="一句话说明。" />
   ```

5. **需要右侧配置区时**，示例声明同名字面量 props，文档页用 `playground` 传入初值、在 `#config`
   插槽里双向绑定同一个 `playground` 对象，示例的 props 会随配置实时更新：

   ```md
   <DemoBlock demo="<层>/<组件名>/<场景名>" :playground="{ isDisabled: false }">
     <template #config="{ playground }">
       <DemoConfigItem label="isDisabled">
         <input v-model="playground.isDisabled" type="checkbox" />
       </DemoConfigItem>
     </template>
   </DemoBlock>
   ```

   `DemoConfigItem` 是全局组件，左为属性名、右为默认插槽，每行固定 36px 高。

6. **需要 Vue / Tsx 双写法时**，在同目录再放一个同名 `.tsx`，文档页开 `code-tabs`：

   ```md
   <DemoBlock demo="<层>/<组件名>/<场景名>" :code-tabs="['vue', 'tsx']" />
   ```

   `.tsx` 只用于「查看源码」的 Tsx 标签，不会被渲染（站点只 glob `.vue`），
   因此它只需是一段能通过类型检查与 ESLint 的真实用法示例，不需要可独立运行。

## 机制

预览与源码共用同一个文件，因此不存在示例与代码不一致的问题：

| 形态 | 来源 |
| --- | --- |
| 预览组件 | `theme/demo-source.ts` 的 `import.meta.glob` 惰性加载，示例各自分包 |
| 高亮源码 | `.vitepress/plugin/demo-highlight.ts` 在构建期渲染（`.vue` 键为 demo id、`.tsx` 键为 `demo id + '.tsx'`），经虚拟模块 `virtual:bst-demo-highlight` 输出，展开时才载入 |

完整说明见 `packages/bst-vue-next/site/README.md`。

> 注：本文件按 `srcExclude` 配置被排除在站点页面之外，不会生成路由。
