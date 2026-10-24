---
description: "为组件新增文档站示例与文档页：按分层路径落 .vue 示例，可选出配置区与 Vue/Tsx 双写法，并配站点 Less 分片"
argument-hint: "组件名与要演示的场景（如：advanced <组件名> 的基础用法与属性配置区）"
agent: "agent"
---

为指定组件补充文档站示例与文档页内容。

> 组件开发链路第 7 步，完整顺序见 `/03-component-source` 的「全流程顺序」。

## 前置

1. 先运行 `pnpm build:style`：站点样式走 `@binarysovereign/styles` 的构建产物，未产出时 Vite 直接报无法解析。
2. 读 `packages/bst-vue-next/site/README.md` 的「示例的写法」与 `packages/bst-vue-next/site/src/examples/README.md`，以后者为准。
3. 读该组件源码包的类型与 props，确认能力边界，不凭组件名猜 API。
4. 示例必须用真实组件，禁止用原生标签拼出样式效果。

## 三层同名约定

示例目录、组件文档页、站点样式分片三处按同一层级与名称创建：

| 用途 | 路径 |
| --- | --- |
| 示例 | `site/src/examples/<层>/<组件名>/<场景名>.vue` |
| 文档页 | `site/src/components/<层>/<组件名>.md` |
| 站点样式分片 | `site/.vitepress/theme/styles/demo/<层>/<组件名>.less` |

`<层>` 取 `basic` / `advanced` / `ai`，与源码包、样式包分层一一对应。

## 示例文件

- **一个示例一个文件**，路径即 demo id，例如 `advanced/context-menu/props-playground`。
- 文件名必须多词（`basic-usage.vue`、`keyboard-interaction.vue`），避免 `vue/multi-word-component-names` 报错。
- 组件与类型从对应源码包导入（`@binarysovereign/bst-<层>-components`），不从主包 `@binarysovereign/vue-next*` 导入。
- **示例内不写任何样式**：类名只用样式包已提供的契约与站点辅助类；整块预览区需要接事件时给根节点加 `bst-demo-fill`；其余辅助类见 `theme/styles/demo/shared.less` 与同层分片。
- 示例只做展示与必要交互，不引入测试专用代码。

### 需要右侧配置区时

示例声明字面量 props（类型接口 + `withDefaults`），文档页通过 `playground` 传初值，并在 `#config` 插槽里双向绑定同一个 `playground` 对象，示例 props 随配置实时更新。

```md
<DemoBlock demo="<层>/<组件名>/<场景名>" :playground="{ isDisabled: false }">
  <template #config="{ playground }">
    <DemoConfigItem label="isDisabled">
      <input v-model="playground.isDisabled" type="checkbox" />
    </DemoConfigItem>
  </template>
</DemoBlock>
```

- `DemoConfigItem` 与 `DemoJsonEditor` 是全局注册组件：前者左属性名、右默认插槽，行高固定 36px；后者用于 JSON 文本输入。
- 配置控件使用站点已有的 `bst-demo-*` 工具类（如 `bst-demo-panel` / `bst-demo-input` / `bst-demo-switch` / `bst-demo-select`），不新写样式。

### 需要 Vue / Tsx 双写法时

在同目录再放一个同名 `.tsx`，文档页开启 `code-tabs`：

```md
<DemoBlock demo="<层>/<组件名>/<场景名>" :code-tabs="['vue', 'tsx']" />
```

- `.tsx` 只用于「查看源码」的 Tsx 标签，**不会被渲染**（站点只 glob `.vue`），因此不必能独立运行，但必须是能通过 typecheck 与 ESLint 的真实用法。
- 高亮键：`.vue` 用 demo id，`.tsx` 用 `demo id + '.tsx'`，由 `demo-highlight.ts` 自动收集，无需改配置。

## 文档页

- 路径：`site/src/components/<层>/<组件名>.md`。
- 基础引用：

```md
<DemoBlock
  demo="<层>/<组件名>/<场景名>"
  title="场景标题"
  description="一句话说明这个示例演示什么。"
/>
```

- `demo` 取相对 `site/src/examples` 且去掉 `.vue` 的路径，**必须带层名**。
- 需要配置区初值时在页面 `<script setup>` 里声明 playground 初值对象，再传给 `:playground`。
- 需要出现在导航时，先读 `site/.vitepress/config.ts` 的现有 sidebar 结构，按同样顺序登记，不重排已有条目。

## 站点样式

- 站点自有样式统一用 **Less**（`theme/styles/**` 下不存在 `.css` 源文件），内容仍是普通 CSS 语法，便于引入样式包 mixin。
- 收录规则：`block.less` 只放 DemoBlock 骨架；`shared.less` 只放被两层以上共用的辅助类；其余落在 `demo/<层>/<组件名>.less`，并在同层 `index.less` 中 `@import` 登记。
- 全量静态引入（`demo/index.less` 统一汇总），不做按层懒加载。
- 组件库样式不在这里写：在 `site/.vitepress/theme/index.ts` 中补充该组件的按需样式引入，例如 `@binarysovereign/styles/web/advanced-components/<组件名>`。

## 验收

1. `pnpm build:style` 已执行。
2. `pnpm -C packages/bst-vue-next/site typecheck` 通过（`tsconfig` 已包含 `src/**/*.tsx`）。
3. `pnpm build:docs` 通过。
4. 启动 `pnpm dev:docs` 目视确认：预览正常、配置区可实时改参、源码标签能切换、明暗主题下无样式异常。

## 硬性约束

- 示例、文档页、站点样式分片一律不写内联样式与硬编码色值。
- 不在示例里导入主包产物，避免改组件后必须先 `build:private`。
- `.tsx` 示例只承担源码展示，不引入交互逻辑分支。
- 不手改 `.vitepress/dist`、`.vitepress/cache`。

## 交付格式

输出：新建 / 修改的示例文件、文档页、站点样式分片与 `index.less` 登记位置、`theme/index.ts` 的样式引入改动、导航登记情况、验收结果。
