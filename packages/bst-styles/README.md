# 样式包规范

> 面向 `packages/bst-styles` 的包级规范：定位、分层职责、令牌体系、产物与引入路径、构建校验、扩展流程与已知保留项。
> 新增**单个组件**样式的骨架与分片写法见 `web/basic-components/template/README.md`，本文不重复。

---

## 定位与硬约束

- 本包是组件库**唯一的样式来源**。组件源码（`packages/bst-*-components`）中不写任何样式，两者以**类名契约**对齐。
- 样式语言为 Less，产物为纯 CSS；组件构建（Rollup）不参与样式。
- 类名前缀统一由 `web/tokens/_variables.less` 的 `@prefix: bst` 提供，分片不写死 `bst-` 字面量。
- 主题切换由**属性**驱动，两个等价开关：`:root[theme-mode='dark']` 与 `:root.bst-theme-dark`。

## 目录结构

```plaintext
packages/bst-styles/
├─ package.json
└─ web/
   ├─ _index.less                全量入口：令牌 → 混合器 → 归一化 → 工具类 → 组件
   ├─ tokens/                    设计令牌（三层，见下）
   │  ├─ _index.less
   │  ├─ _font.less              结构层：字体族、字号、行高
   │  ├─ _radius.less            结构层：圆角
   │  ├─ _size.less              结构层：尺寸阶梯、组件高度、各类边距与间距
   │  ├─ _theme-light.less       色彩层：亮色令牌
   │  ├─ _theme-dark.less        色彩层：暗色令牌
   │  └─ _variables.less         映射层：`--bst-*` → `@` 变量；另含断点 / 缓动 / 层级常量
   ├─ mixins/                    不产出 CSS 的混合器，供分片调用
   ├─ base/_reset.less           归一化层，单独产出 `base.css`
   ├─ utilities/                 全局工具类（float、关键帧）
   ├─ basic-components/
   │  ├─ _index.less             基础组件样式登记入口
   │  ├─ template/               新增组件的纯骨架 + 分片规范
   │  └─ <组件名>/               一个组件一个目录
   └─ advanced-components/
      ├─ _index.less             高级组件样式登记入口
      └─ <组件名>/               一个组件一个目录
```

### 图层顺序（固定，不得调换）

```plaintext
tokens → mixins → base → utilities → basic-components → advanced-components
```

`mixins` 不产出任何 CSS，仅为后续分片提供可调用的混合器；`utilities` 置于 `base` 之后，保证全局工具类能覆盖归一化层，同时又能被随后的组件样式覆盖。

## 令牌体系（三层）

| 层 | 文件 | 内容 | 随主题变化 |
| --- | --- | --- | --- |
| 结构层 | `_font` / `_radius` / `_size` | 字体族、字号、行高、圆角、尺寸阶梯、边距与间距 | 否 |
| 色彩层 | `_theme-light` / `_theme-dark` | 色板、文字色、背景色、分割线与边框、投影、滚动条色 | 是 |
| 映射层 | `_variables` | 把前两层映射为 `@` 变量供分片消费 | —（只转发） |

约束：

1. **`@import` 顺序固定**：结构层 → 色彩层 → 映射层。声明必须先于引用，否则 `var()` 悬空。
2. 明暗两套主题必须**变量名集合完全对齐**，只允许取值不同；否则会出现某一主题下的取值缺口。
3. 映射层**只做映射**，不产生新值。唯一的例外是少量与主题无关的纯 Less 常量：基线单位 `@font-size`、响应式断点 `@screen-*`、缓动与时长 `@anim-*`、层级 `@z-index-*`。
4. 分片**不得**直接书写 `var(--bst-*)` 或全局 `@` 令牌，一律经组件的 `_token.less` 映射为 `@<组件名>-*` 后引用。
5. 分片中**不得**出现硬编码色值。设计稿标注（如「稿面 `#FFFFFF`」）只写在注释里，用于溯源。

## 产物与引入路径

产物落位于包根 `build/` 下，与 `package.json` 的 `exports` 对应；每份 `.css` 另产出一份同名 `.min.css`。

| 引入写法 | 内容 | 源包（`packages/bst-styles`） | 发布单元（`dist/styles`） |
| --- | --- | --- | --- |
| `@binarysovereign/styles/web` | 全量样式 | `build/web/index.css` | `web/index.css` |
| `@binarysovereign/styles/web/tokens.css` | 设计令牌层 | `build/web/tokens.css` | `web/tokens.css` |
| `@binarysovereign/styles/web/base.css` | 归一化层 | `build/web/base.css` | `web/base.css` |
| `@binarysovereign/styles/web/theme-light.css` | 亮色主题令牌 | `build/web/theme-light.css` | `web/theme-light.css` |
| `@binarysovereign/styles/web/theme-dark.css` | 暗色主题令牌 | `build/web/theme-dark.css` | `web/theme-dark.css` |
| `@binarysovereign/styles/web/basic-components/<组件名>` | 基础组件的按需样式 | `build/web/basic-components/<组件名>/index.css` | 同左（相对单元根） |
| `@binarysovereign/styles/web/advanced-components/<组件名>` | 高级组件的按需样式 | `build/web/advanced-components/<组件名>/index.css` | 同左（相对单元根） |

两条易错点：

1. **按需入口不要带 `/index.css`**：`exports` 的 `./web/{basic,advanced}-components/*` 会把 `*` 整段吃掉，`.../advanced-components/context-menu/index.css` 会被拼成 `.../context-menu/index.css/index.css` 而解析失败。
2. **全量入口不要写成 `@binarysovereign/styles/index.css`**：公开写法是 `@binarysovereign/styles/web`。

## 构建与校验

命令均在**仓库根**执行（样式包自身不含构建脚本，构建由根 `scripts/build-package.js` 驱动）：

```bash
# Less → PostCSS(autoprefixer) → esbuild 压缩，产出到 packages/bst-styles/build
pnpm build:style
# 样式规范校验
pnpm lint:style
# 校验并自动修复
pnpm lint:style:fix
```

构建链路的三个要点：

1. **目标浏览器取自根 `package.json` 的 `browserslist`**，autoprefixer 不另设目标，避免两处维护。
2. 按需组件入口会在编译前**自动前置注入** `tokens/_index.less` 与 `mixins/_index.less`，故组件分片可直接引用令牌与混合器，无需自行引入这两层。
3. 归一化层**不进**前置注入：它属宿主页面语义，注入 N 份既重复又会污染宿主，统一由 `base.css` 单独产出。

## 可用混合器（`web/mixins/`）

混合器不产出 CSS，仅向分片提供可调用的规则集。分片的引入方式分两类：

| 文件 | 导出 | 提供的混合器 | 引入方式 |
| --- | --- | --- | --- |
| `_clearfix.less` | 是 | `.clearfix()` | 自动 |
| `_text.less` | 是 | `.text-ellipsis()`、`.text-ellipsis-multi-line(@line)` | 自动 |
| `_scrollbar.less` | 是 | `.scrollbar(@size, @borderSize)`、`.hideScrollbar()` | 自动 |
| `_layout.less` | 是 | `.horizontal-vertical-center-with-flex()`、`.fill-with-position-absolute()`、`.list-style-none()`、`.input-visually-hidden()` | 自动 |
| `_reset.less` | 否 | `.reset-base()`、`.reset()` | 显式 `@import` |
| `_focus.less` | 否 | `.tab-focus-style-rect()` | 显式 `@import` |

> 「导出」指是否被 `mixins/_index.less` 聚合。按需组件入口会自动前置注入 `mixins/_index.less`，故「导出」的混合器在分片中可直接调用；未导出的两个需在分片内显式 `@import`，写法见 `web/basic-components/template/README.md`。

## 新增一个组件的样式

1. 确认组件所属分层，复制 `web/basic-components/template/` 到对应层级的 `<分层目录>/<组件名>/`，如 `web/advanced-components/context-menu/`。
2. 删除用不到的分片，按 `template/README.md` 的填写清单逐片实现。
3. 在对应分层的 `_index.less` 中登记入口：`@import './<组件名>/_index.less';`。
4. 执行 `pnpm build:style` 与 `pnpm lint:style`。
5. 若组件专有量需要运行时覆盖，同步在组件文档页记录 `--bst-<组件名>-*` 变量表。

## 已知保留项与待办

| 项 | 状态说明 |
| --- | --- |
| `--bst-mask-gradient`、`--bst-text-color-watermark`、`--bst-table-shadow-color` | 明暗两套均已定义且对齐，但映射层尚未映射——保留给后续的蒙层 / 水印 / 表格组件 |
| 响应式断点 `@screen-*` | 常量已定义，当前无组件消费（全包除 `context-menu` 的 `prefers-reduced-motion` 外无媒体查询） |
| `mixins/_focus.less` | 未由 `mixins/_index.less` 导出，当前无消费方；分片如需 `.tab-focus-style-rect()` 须显式 `@import '../mixins/_focus.less'` |
| `mixins/_reset.less` | 同上，分片须显式 `@import`（`template/README.md` 已记录该写法） |
| `.min.css` | 已产出并随包发布，但 `exports` 未暴露稳定入口，源包需经 `build/web/` 取得，与发布单元路径不一致 |
| 字体产物 | 本包**不产出**字体文件与字体 CSS；字体族目前为系统字体栈 |
