# 安装与引入

## 安装

组件与样式以 **GitHub Release 附件**的形式分发：每个发布单元一个 `.tgz`，不使用 npm registry。

先打开 [Releases](https://github.com/BinarySovereign/bst-component-vue-next/releases) 确认要安装的版本号，
下文以 `<版本号>` 表示（如 `1.1.0`），四个单元的版本可能不同，以各 Release 标题为准。

```bash
# 安装基础组件包
pnpm add https://github.com/BinarySovereign/bst-component-vue-next/releases/download/vue-next%40<版本号>/bst-vue-next-<版本号>.tgz

# 安装高级组件包
pnpm add https://github.com/BinarySovereign/bst-component-vue-next/releases/download/vue-next-pro%40<版本号>/bst-vue-next-pro-<版本号>.tgz

# 安装 AI 组件包
pnpm add https://github.com/BinarySovereign/bst-component-vue-next/releases/download/vue-next-pro-ai%40<版本号>/bst-vue-next-pro-ai-<版本号>.tgz

# 安装样式包
pnpm add https://github.com/BinarySovereign/bst-component-vue-next/releases/download/styles%40<版本号>/bst-styles-<版本号>.tgz
```

只安装实际用到的单元，无需四个全装。

::: warning 三条易错点

1. URL 中 tag 里的 `@` 必须写成 `%40`（如 `vue-next%40`），否则部分 pnpm 版本会截断路径。
2. 附件是自包含产物，`@binarysovereign/bst-types` 已内联，无需额外安装。
3. 组件包通过 `peerDependencies` 声明 `vue`，宿主项目需自行提供 Vue 3。

:::

也可以先下载附件，再按本地路径安装：

```bash
pnpm add ./bst-vue-next-<版本号>.tgz
pnpm add ./bst-styles-<版本号>.tgz
```

### 从源码安装（仅用于本地调试）

需要基于未发布的提交调试时，才走源码构建：

```bash
# 克隆仓库到本地
git clone https://github.com/BinarySovereign/bst-component-vue-next.git

# 切换到项目目录
cd bst-component-vue-next

pnpm install

# 依次构建 `基础组件源码包`、`高级组件源码包`、`AI相关组件源码包` 形成产物
pnpm build:private

# 构建样式包
pnpm build:style

# 将 `基础组件源码包` 产物聚合到 `基础组件主包`
pnpm build:vue:next

# 将 `高级组件源码包` 产物聚合到 `高级组件主包`
pnpm build:vue:next:pro

# 将 `AI组件源码包` 产物聚合到 `AI组件主包`
pnpm build:vue:next:pro:ai

# 将三个主包的产物移动并重新组织到根目录下的 `dist` 目录下，执行完成后其余所有 `build` 产物均会被移除
pnpm move:main:dist
```

构建完成后在本仓库内执行 `node scripts/release/pack.js`，可得到与 Release 附件一致的 `.tgz`。

## 全量引入（不推荐）

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';

// 引入主包
import BsVueNext from '@binarysovereign/vue-next';
import BsVueNextPro from '@binarysovereign/vue-next-pro';
import BsVueNextProAi from '@binarysovereign/vue-next-pro-ai';

// 引入全局样式
import '@binarysovereign/styles/web';

const app = createApp(App);

// 注册
app.use(BsVueNext);
app.use(BsVueNextPro);
app.use(BsVueNextProAi);

app.mount('#app');
```

全量引入会带来未使用组件的安装开销与整包样式体积，仅建议在原型验证阶段使用。

## 按需引入（推荐）

```vue
<template>
  <BsButton type="primary">提交</BsButton>
  <BsProTable :data="data" />
</template>

<script setup lang="ts">
// 按需引入组件逻辑
import { BsButton } from '@binarysovereign/vue-next/es/button';
import { BsProTable } from '@binarysovereign/vue-next-pro/es/table';

// 按需引入组件样式
import '@binarysovereign/styles/web/basic-components/button';
import '@binarysovereign/styles/web/advanced-components/table';
</script>
```

## 样式的分层引入

`@binarysovereign/styles` 的产物按层次组织，可按需只取其中几层：

| 入口 | 内容 | 何时需要 |
| --- | --- | --- |
| `@binarysovereign/styles/web/tokens.css` | 设计令牌（明暗两套 + 字号 / 圆角 / 尺寸阶梯） | 总是需要，组件样式的取值全部来自它 |
| `@binarysovereign/styles/web/base.css` | 归一化层 | 需要组件库接管基础样式时引入 |
| `@binarysovereign/styles/web/basic-components/<组件名>` | 基础组件的按需样式 | 引入哪个组件就引哪个 |
| `@binarysovereign/styles/web/advanced-components/<组件名>` | 高级组件的按需样式 | 引入哪个组件就引哪个 |
| `@binarysovereign/styles/web` | 上述全部的全量产物 | 仅全量引入时使用 |

::: warning 两条易错点
1. **按需入口不要带 `/index.css`**：`exports` 的 `./web/{basic,advanced}-components/*` 只匹配到组件名一层，
   写成 `.../button/index.css` 会被拼成 `.../index.css/index.css` 而报模块找不到。
2. **入口不要写成 `@binarysovereign/styles/index.css`**：全量入口的公开写法是 `@binarysovereign/styles/web`。
:::

### 压缩版产物

每个入口都另产出一份同名的 `.min.css`（全量样式约省 9%），引入时只多一段后缀：

```ts
import '@binarysovereign/styles/web/index.min.css';
import '@binarysovereign/styles/web/tokens.min.css';
```

> 压缩版的引入路径目前仅在**发布单元**下有效，从 Release 附件安装的样式包正是发布单元，可直接使用上述写法；
> 在仓库内开发（经 workspace 链接源包）时，产物位于源包的 `build/` 下，需写作 `@binarysovereign/styles/build/web/index.min.css`。

## 浏览器支持

```text
chrome >= 152
edge >= 152
Electron >= 42
```

> 即 Chromium 148 及以上（`Electron 42` 折算为 Chromium 148）。不支持 IE、Firefox 与 Safari。
