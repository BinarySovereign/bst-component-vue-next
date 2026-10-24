# 文档站

> 包名 `@binarysovereign/docs`，VitePress 1.6 单站，承载组件文档与可交互示例。

## 命令

均可在**仓库根**执行（根 `package.json` 已配同名转发脚本）：

```bash
# 启动开发服务器
pnpm dev:docs
# 构建静态站点，产物在 .vitepress/dist
pnpm build:docs
# 本地预览构建产物
pnpm preview:docs
```

站点自身的类型检查不在根 `typecheck` 内（根 `tsc` 的 include 不进 `.vitepress` 这类点目录），需单独执行：

```bash
pnpm -C packages/bst-vue-next/site typecheck
```

::: warning 前置条件：先产出组件库样式
站点的组件样式走 `@binarysovereign/styles` 的**构建产物**（其 `exports` 指向 `build/web/*.css`），
而该包自身没有构建脚本，构建由根 `scripts/build-package.js` 驱动。因此首次启动、以及样式包改动后，需要先执行：

```bash
pnpm build:style
```

不产出时 Vite 会以「无法解析导入」直接报错，属预期行为而非静默降级。
:::

## 部署

站点由 `.github/workflows/deploy-docs.yml` 部署到 GitHub Pages：

| 项 | 值 |
| --- | --- |
| 触发 | 推送到 `develop` 且命中代码路径，或手动 `workflow_dispatch` |
| 前置 | 仓库 Settings → Pages → Source 必须选 **GitHub Actions** |
| `base` 来源 | `actions/configure-pages` 的 `base_path`，注入到 `DOCS_BASE`，无需改 `config.ts` |
| 产物路径 | `packages/bst-vue-next/site/.vitepress/dist`，不并入根 `dist/` |
| 门禁 | 仅跑 `build:style` + `build:docs`；lint / 类型 / 测试 / 死链由 `ci.yml` 负责 |

本地模拟子路径部署时，用同名变量验证即可：

```bash
DOCS_BASE=/bst-component-vue-next/ pnpm build:docs
```

## 目录结构

```plaintext
packages/bst-vue-next/site/
├─ .vitepress/
│  ├─ config.ts                  # 站点配置：srcDir / nav / sidebar / 搜索 / 插件挂载
│  ├─ markdown-options.ts        # markdown 配置，正文与示例高亮共用同一份
│  ├─ plugin/
│  │  ├─ demo-highlight.ts       # 构建期把示例渲染成高亮 HTML，经虚拟模块输出
│  │  └─ bst-tokens.ts           # 构建期解析样式包令牌源码，供样式预览页使用
│  ├─ theme/
│  │  ├─ index.ts                # 主题入口：引组件库样式、注册站点组件、明暗桥接
│  │  ├─ demo-source.ts          # 示例索引：懒加载组件 + 高亮数据载入器
│  │  ├─ styles/                 # 站点外壳样式，与组件库样式互不混写
│  │  │  ├─ demo/                # 示例样式：index.less 汇总 + block / shared / 各组件层分片
│  │  │  ├─ vars.less            # VitePress 品牌色与组件库令牌的接缝
│  │  │  └─ preview.less         # 样式预览页（设计令牌总览）
│  │  └─ components/             # DemoBlock（示例预览 + 高亮源码）、DemoConfigItem（配置区行）、DemoJsonEditor（JSON 输入）、TokenPalette（令牌总览）
│  ├─ icons/                     # DemoBlock 图标组件，一个文件一个图标
│  ├─ types/                     # 补声明：styles 按需入口无类型文件、虚拟模块
│  ├─ cache/                     # 运行期缓存（git 忽略）
│  └─ dist/                      # 构建产物（git 忽略）
├─ src/                          # = srcDir，全部页面与公开资源
│  ├─ index.md                   # 首页
│  ├─ guide/                     # 指南
│  ├─ components/                # 组件文档
│  ├─ styles/                    # 样式预览：设计令牌总览（无组件样式预览，见其页面说明）
│  ├─ examples/                  # 示例源码，按 basic/ advanced/ ai/ 分层，目录说明见其 README.md
│  └─ public/                    # 原样拷贝到产物根，如 logo.svg
├─ package.json
├─ tsconfig.json
└─ README.md
```

`srcDir` 与工装分离的原因：`public/` 与页面都相对 `srcDir` 解析，若页面直接躺在站点根，
`.vitepress` 会与页面同级混在一起，构建产物与缓存的边界也会变模糊。

`src/` 下的 `README.md` 由 `srcExclude` 排除在页面之外：它们是目录说明（如 `src/examples/README.md`），
不排除时 VitePress 会把它们当作页面，生成未登记到导航的孤儿路由。

## 示例的写法

> `src/examples/` 已开始沉淀真实示例（首个为 `advanced/context-menu/`）。示例一律以真实组件为准，
> 不预先造「用原生标签拼出样式效果」的演示。目录、索引与高亮链路均已就绪，
> 新增示例按下述约定放入即可，无需改动任何配置。
>
> 示例从 `@binarysovereign/bst-advanced-components` 这类源码包的包根入口引入，
> 因此不依赖主包构建产物；但 `.vitepress/theme/index.ts` 中需同步引入对应组件的按需样式。

示例遵循「一个示例一个文件、实时渲染与源码展示共用该文件」的约定：

1. 在 `src/examples/<层>/<组件名>/<场景名>.vue` 写示例（`<层>` 为 `basic` / `advanced` / `ai`），
   **不写样式**，只落地类名契约；
2. 在文档页用 `<DemoBlock>` 引用，`demo` 取相对于 `src/examples/` 且去掉 `.vue` 的路径（含层名）。

```md
<DemoBlock demo="<层>/<组件名>/<场景名>" title="场景标题" description="一句话说明。" />
```

三层路径一一对应：示例目录、组件文档页（`src/components/<层>/`）、样式分片
（`theme/styles/demo/<层>/<组件名>.less`）同名同层级，新增组件时三处一起建即可。

样式分层的收录规则：`block.less` 只放 DemoBlock 骨架；`shared.less` 只放被两个以上层用到的辅助类；
其余落在 `demo/<层>/<组件名>.less`，并在同层 `index.less` 里 `@import` 登记。
全量静态引入（`demo/index.less` 统一汇总），不做按层懒加载。

站点自有的样式**统一用 Less 编写**（`theme/styles/**` 下不存在 `.css` 源文件），内容仍是普通 CSS 语法即可，
这样所有分片都有资格引入样式包 mixin，也不会出现同一目录两种后缀。组件库样式仍然消费 `.css` 产物，与这里不冲突。

滚动条就靠这套机制统一：需要滚动的分片 `@import '@binarysovereign/styles/web/mixins/_scrollbar.less'`
后调用 `.scrollbar(8px, 2px)`，颜色随 `--bst-scrollbar-color` 令牌变化，不再手写 `::-webkit-scrollbar`。

`src/examples/README.md` 同样记录了一份约定，便于直接在该目录下工作的人就地看到。

::: warning 示例文件必须是多词名
站点同样受仓库根 ESLint 约束，其中 `vue/multi-word-component-names` 禁止单词组件名。
因此示例文件名取「场景描述」式的多词短横线命名（`basic-usage.vue`、`divider-and-disabled.vue`），
而不是 `basic.vue`、`size.vue` 这类单词。
:::

::: warning 站内的 `.vue` 之间不要互相引用
仓库 ESLint 要求模板内的组件名用短横线风格（`vue/component-name-in-template-casing`），
而 `@typescript-eslint/no-unused-vars` 不认短横线写法与 PascalCase 导入名的对应关系，
两者叠加会让「单文件组件互相引用」必报 import 未使用（该组合问题在本仓库尚未有 `.vue` 组件之前不会暴露）。
因此 `DemoBlock` 采用自包含写法，没有把源码区拆成子组件。
:::

`DemoBlock` 会按 `demo` 同时取到两样东西：

| 形态 | 来源 | 用途 |
| --- | --- | --- |
| 组件 | `import.meta.glob` 惰性加载 | 预览区实时渲染 |
| 高亮 HTML | 虚拟模块 `virtual:bst-demo-highlight`，展开时动态 `import` | 「查看源码」区展示 |

因此示例与源码不可能不一致——它们是同一个文件。若某个示例需要自定义容器，写默认插槽即可覆盖预览区内容。

`DemoBlock` 的结构按设计稿分为四块：

| 区域 | 内容 |
| --- | --- |
| 标题栏 | `title` / `description`，右上角「重置示例」按钮（重新挂载示例组件，清空其内部状态） |
| 演示区 | 固定 240px 高、内容超出时内部滚动；左上角「演示区」标签，右下角复制源码与查看源码两个图标按钮 |
| 配置区 | 仅当使用方提供 `config` 插槽时渲染，与演示区并排、同样固定 240px 高；无插槽时演示区占满整行 |
| 源码区 | 展开后横跨整行、最大 400px 高且内部滚动，内容来自构建期高亮 HTML；可用 `codeTabs` 开标签页 |

图标为 `.vitepress/icons/` 下的独立单文件组件（`IconCopy.vue`、`IconCode.vue`、`IconCheck.vue`），颜色统一走 `currentColor`。
复制按钮取同一份高亮 HTML 的文本内容写入剪贴板（用 `clipboard` 包的 `ClipboardJS.copy()`，它在不支持
`navigator.clipboard` 的环境下也能工作），因此不需要构建期为每份示例额外保存一份纯源码。
复制始终取 **Vue** 写法（`.vue` 就是被渲染的那个文件），与当前选中的标签页无关。
标题栏的「重置示例」会把配置区恢复成 `playground` 传入的初值，并重新挂载示例组件清空其内部状态。

配置区通过 `playground` 打通左右两侧：`DemoBlock` 用同名 prop 接收初值，放进一个 `reactive` 对象，
再以 `v-bind` 透传给示例组件、以插槽参数交给 `#config` 插槽，两边操作的是同一份数据：

```md
<DemoBlock demo="<层>/<组件名>/<场景名>" :playground="{ isDisabled: false }">
  <template #config="{ playground }">
    <label><input v-model="playground.isDisabled" type="checkbox" />禁用</label>
  </template>
</DemoBlock>
```

示例组件按需声明 `isDisabled` 等 props 并给默认值即可。`ContextMenu` 文档页就用这套机制把全部可配置属性
收进一个 `props-playground` 示例，不再为每个开关单独建示例。

初值里含 JSON 这类带引号的内容时，页面可用 `<script setup>` 声明一个对象再整体传给 `:playground`
（属性值内不能直接写双引号）；JSON 的解析与「解析失败时保留上一次有效值」都放在示例组件内，
配置区只负责 `v-model` 绑定。配置区每个属性占一行，统一用全局组件 `DemoConfigItem`（左为属性名、右为默认插槽），
行高固定 36px；配置区内容超出时在内部滚动（滚动条同样走样式包 mixin）。

需要编辑 JSON 时用全局组件 `DemoJsonEditor`：它把高亮的 `<pre>` 铺在透明文字的 `<textarea>` 下面，
光标与选区仍是原生行为，失焦时自动 `JSON.parse` + `JSON.stringify(…, null, 2)` 格式化一次。
分词是站点内的小正则（键 / 字符串 / 数字 / 字面量 / 标点），颜色取自主题令牌，明暗模式自动切换。

```md
<DemoConfigItem label="菜单数据">
  <DemoJsonEditor v-model="playground.itemsText" />
</DemoConfigItem>
```

### 源码的多语言标签

`codeTabs` 控制源码区的标签页，取值是语言后缀，默认 `['vue']`：

```md
<DemoBlock demo="advanced/context-menu/props-playground" :code-tabs="['vue', 'tsx']" />
```

每个标签对应示例目录下一个同名文件：`vue` 读 `<demo>.vue`（即真正被渲染的那个示例），
`tsx` 读 `<demo>.tsx`。`.tsx` 只作为代码样本参与高亮与类型检查，**不会被渲染**（
`demo-source.ts` 只 glob `.vue`），因此不会有第二套演示实例。

`DemoBlock` 按语言分别缓存高亮结果，首次切到某个标签时才请求；复制按钮复制的是 Vue 写法。

### 源码高亮是怎么做的

链路：**构建期高亮 → 虚拟模块 → 运行时 `v-html`**。

1. `.vitepress/plugin/demo-highlight.ts` 在构建期扫描 `src/examples/**` 下的 `.vue` 与 `.tsx`
   （目录不存在或尚无示例时返回空集，使「尚无示例」是合法状态而非构建错误），
   用 vitepress 公开导出的 `createMarkdownRenderer` 取得它内置的 Shiki 高亮函数，逐个渲染成高亮 HTML；
   `.vue` 以 `<demo id>` 为键，`.tsx` 以 `<demo id>.tsx` 为键；
2. 结果以一个 JSON 对象从虚拟模块 `virtual:bst-demo-highlight` 导出；
3. `demo-source.ts` 的 `loadDemoHighlights()` 动态 `import` 它，`DemoBlock` 在**首次展开**时才请求，
   因此高亮数据自成独立 chunk，未展开源码的页面不会为它付出体积。

几个关键取舍：

| 决策 | 原因 |
| --- | --- |
| 复用 vitepress 的渲染器，而非直引 `shiki` | 站点本就未声明 shiki；复用后示例的配色、主题切换行为与页面正文代码块完全一致 |
| 不复用默认主题的代码块样式，只复用它给的颜色规则 | 高亮 HTML 自带 `vp-code` 类，`.dark .vp-code span` 那条全局规则会自动命中；而代码块的盒模型样式作用域是 `.vp-doc` 下的 `language-*` 选择器，命中不了，需在 `theme/styles/demo/block.less` 自补 |
| 去掉输出中的 `v-pre` 属性 | 该属性是 markdown 渲染器为「参与 Vue 编译」而加的，而源码区经 `v-html` 输出、不经过模板编译 |
| 高亮主题设为 `{ light, dark }` 双套 | 颜色以内联 CSS 变量挂在每个 span 上，切换明暗无需重新渲染 |
| 不声明 `markdown.languages` | 默认语言集已覆盖本站所需（实测无回退警告）；且该字段类型为 shiki 的 `LanguageInput[]`（只接受语言注册对象），与其运行时接受语言 id 字符串不符，显式声明需加断言。详见 `markdown-options.ts` 注释 |

## 依赖取舍

| 依赖 | 归属 | 说明 |
| --- | --- | --- |
| `vitepress` | `devDependencies`（`catalog:docs`） | 站点生成器，自带 vite / shiki / minisearch / @vueuse/core |
| `vue` | `dependencies`（`catalog:runtime`） | 主题与示例的运行时 |
| `postcss` | `devDependencies`（`catalog:build`） | 满足 vitepress 的 optional peer |
| `less` | `devDependencies`（`catalog:build`） | 示例样式用 Less 编写，才能引入样式包的 `.scrollbar()` mixin |
| `@types/node` | `devDependencies`（`catalog:types`） | 构建期插件读写示例文件（`node:fs` / `node:path`） |
| `@vitejs/plugin-vue-jsx` | `devDependencies`（`catalog:build`） | 示例从源码包直接引入 `.tsx` 组件，需 Vue JSX 转换；缺它会退回 React JSX 运行时并报 `React is not defined`，组件渲染结果为空 |
| `vue-tsc` | `devDependencies`（`catalog:types`） | 站点自有 `typecheck` 脚本 |
| `clipboard` | `dependencies`（`catalog:runtime`） | 源码区复制按钮写剪贴板；`ClipboardJS.copy()` 走 `execCommand` 兜底，且在调用时直接返回选中的文本，不依赖 `navigator.clipboard` 的安全上下文前提 |
| `@binarysovereign/styles` | `dependencies`（`workspace:*`） | 组件样式来源，走其导出子路径 |

**刻意不声明**的项：

- `vite`、`@vitejs/plugin-vue`：vitepress 1.6.4 内嵌 vite 5 与 plugin-vue 5，而仓库根是 vite 7 与 plugin-vue 6。
  站点若自行声明会拿到与运行时不同的实例，配置中的 `vite` 字段类型也会与实际不符。
- `@vitejs/plugin-vue-jsx` 是例外：示例必须能编译 `.tsx`，且该插件不参与 vitepress 的内嵌链路，
  仅向 Vite 注册转换钩子，故显式声明（与 Storybook 的 `.storybook/main.ts` 保持一致）。
- `shiki`、`minisearch`、`@vueuse/core`：均为 vitepress 的直接依赖且已被间接使用（示例高亮正走 vitepress 的渲染器），不重复声明。
- 各类 VitePress 示例渲染插件：已在 `docs/rules/dependencies.md` 中被逐条排除（周下载量均低于 10,000），
  故示例、源码高亮由 `.vitepress/plugin/demo-highlight.ts` + `DemoBlock.vue` 自实现。

## 与仓库工装的关系

| 设施 | 与站点的关系 |
| --- | --- |
| 根 `tsconfig.json` | 不覆盖站点：其 `include` 的 `**` 通配不进入 `.vitepress` 这类点目录，且类型环境为 Node + Vitest；站点自带 `tsconfig.json` |
| 根 `eslint.config.js` | **站点在 lint 范围内**（ESLint 会扫到 `.vitepress` 与 `src/`），故站点代码必须满足其全部规则，包括模板内组件名短横线、组件名多词等 |
| `pnpm lint:style` | 仅作用于 `packages/bst-styles`，不含站点样式 |
| 根 `dist/` | 是**发布产物**目录（四个公开包，各自带 `package.json` 与 `LICENSE`，随仓库分发供 `github:…#path:` 安装），文档站产物不并入其中 |

## 已知待办

| 项 | 说明 |
| --- | --- |
| 组件 API | 组件页的 Props / Events / Slots / Expose 待 TSX 组件落地后补全 |
| 组件样式预览 | 组件样式不提供手工拼样式的预览（站内约定：预览与示例一律以真实组件为准），待 TSX 组件落地后随组件页一并补上 |
| 高亮的双主题样式依赖默认主题 | 源码区的字色来自 vitepress 默认主题的 `.dark .vp-code span` 规则（全局作用域）。若将来换成自定义主题，需把那条规则一并搬过去，否则源码会退化为单色 |
| 示例 id 归一化有两处实现 | 构建期插件（`toDemoId`）与运行时的组件索引（`demo-source.ts`）各有一份，必须得出相同结果。两份实现已互相注明 |
