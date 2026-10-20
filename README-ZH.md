<div align="center">

# bst-component-vue-next

**Vue 3 组件库 · 基础 / 高级 / AI 三层组件**

一个组件一个目录 · 源码包与主包分离 · Rollup + Babel 产出 `es` / `lib` 双形态

![Use: Personal Only](https://img.shields.io/badge/use-personal%20only-red)

[![Node](https://img.shields.io/badge/node-%3E%3D22.13.0-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D11-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)

[![Vue](https://img.shields.io/badge/vue-%5E3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-%5E6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Chromium](https://img.shields.io/badge/chromium-%3E%3D148-4285F4?logo=googlechrome&logoColor=white)](https://www.chromium.org)

[![Ardot](https://img.shields.io/badge/Ardot-Bst--Components-0052D9)](https://ardot.tencent.com/file/737709471769043)

[English](./README.md) · **简体中文**

</div>

> [!IMPORTANT]
> 本项目仅供 **个人学习使用，请勿用于商业用途**。请勿对外分发、公开转载或用于外部交付；如需对外发布，请先联系项目维护者。

> 整体设计参考 [tdesign-vue-next](https://github.com/Tencent/tdesign-vue-next)。

---

## 技术栈

| 项 | 选型 |
| --- | --- |
| 开发语言 | TypeScript + TSX |
| 框架 | Vue 3 |
| 构建 | Rollup + Babel，样式由 Less + PostCSS 产出 |
| 测试 | Vitest（单元测试 + SSR / CSR 快照测试） |
| 包管理 | pnpm workspace + catalog |

## 包命名约定

| 项 | 包名 | 对应目录 |
| --- | --- | --- |
| 基础组件主包 | `@binarysovereign/vue-next` | `packages/bst-vue-next` |
| 高级组件主包 | `@binarysovereign/vue-next-pro` | `packages/bst-vue-next-pro` |
| AI 组件主包 | `@binarysovereign/vue-next-pro-ai` | `packages/bst-vue-next-pro-ai` |
| 通用样式包 | `@binarysovereign/styles` | `packages/bst-styles` |
| 基础组件源码包（private） | `@binarysovereign/bst-basic-components` | `packages/bst-basic-components` |
| 高级组件源码包（private） | `@binarysovereign/bst-advanced-components` | `packages/bst-advanced-components` |
| AI 组件源码包（private） | `@binarysovereign/bst-ai-components` | `packages/bst-ai-components` |
| 共享类型包（private） | `@binarysovereign/bst-types` | `packages/bst-types` |
| 组件单元测试包（private） | `@binarysovereign/test` | `packages/bst-vue-next/test` |

> 组件源码中不写任何样式，全部样式由 `@binarysovereign/styles` 提供。
>
> 所有跨包共享的类型定义在 `@binarysovereign/bst-types`，构建期会内联进各发布单元，消费方无需额外安装。

## 仓库结构

```plaintext
├─ packages/
│  ├─ bst-vue-next/                 # 基础组件主包
│  ├─ bst-vue-next-pro/             # 高级组件主包
│  ├─ bst-vue-next-pro-ai/          # AI 组件主包
│  ├─ bst-styles/                   # 样式包（Less → CSS）
│  ├─ bst-basic-components/         # 基础组件源码包（private）
│  ├─ bst-advanced-components/      # 高级组件源码包（private）
│  ├─ bst-ai-components/            # AI 组件源码包（private）
│  └─ bst-types/                    # 共享类型包（private）
├─ scripts/                         # 构建脚本
├─ docs/                            # 规则与说明文档
└─ dist/                            # 归拢后的发布产物（随仓库分发）
```

## 构建流程

> 需要 Node `>=22.13.0`，开发环境固定为 `24.21.0`，见 `.nvmrc` 与 `.node-version`。

```sh
# 1. 安装依赖
pnpm install

# 2. 构建三个组件源码包，产出 es / lib 两种形态（当前无包根入口，不产出 umd）
pnpm build:private

# 3. 构建样式包
pnpm build:style

# 4. 把源码包产物聚合到对应主包
pnpm build:vue:next
pnpm build:vue:next:pro
pnpm build:vue:next:pro:ai

# 5. 归拢全部产物到根 dist，并清理各包的 build/
pnpm move:main:dist
```

> 构建分两步：各包先产出到自身的 `build/`，再由 `move:main:dist` 归拢到根 `dist/`。
> `build/` 是可随时重建的中间产物，归拢完成后会被移除，不纳入版本管理。

## 构建产物结构示例

以下以 `button`、`context-menu` 两个假想组件为例，展示从源码包产物到最终发布产物的完整结构。

### 一、源码包中间产物（`pnpm build:private` 后）

```plaintext
packages/bst-basic-components/
└─ build/
   ├─ es/                                     # ES 模块，按需引入入口
   │  ├─ index.mjs                            # 聚合入口，需包根 index.ts
   │  ├─ index.d.ts
   │  ├─ button/
   │  │  ├─ button.mjs
   │  │  ├─ button.mjs.map
   │  │  ├─ button.d.ts
   │  │  ├─ constants.mjs
   │  │  ├─ constants.d.ts
   │  │  ├─ utils.mjs
   │  │  ├─ utils.d.ts
   │  │  ├─ hooks/
   │  │  │  ├─ controller.hooks.mjs
   │  │  │  ├─ controller.hooks.d.ts
   │  │  │  ├─ prop.hooks.mjs
   │  │  │  ├─ prop.hooks.d.ts
   │  │  │  ├─ life.hooks.mjs
   │  │  │  ├─ life.hooks.d.ts
   │  │  │  ├─ button.hooks.mjs
   │  │  │  └─ button.hooks.d.ts
   │  │  └─ elements/
   │  │     ├─ button-icon.mjs
   │  │     └─ button-icon.d.ts
   │  ├─ context-menu/
   │  │  ├─ context-menu.mjs
   │  │  ├─ context-menu.d.ts
   │  │  └─ elements/
   │  └─ _types/                              # 共享类型内联目录，构建期自动生成
   │     ├─ index.d.ts                        # 来自 packages/bst-types/src/index.ts
   │     ├─ basic-button.types.d.ts
   │     └─ basic-context-menu.types.d.ts
   ├─ lib/                                    # CommonJS，结构与 es 完全对应
   │  ├─ button/
   │  │  ├─ button.js
   │  │  └─ button.d.ts
   │  └─ _types/                              # 与 es/_types 内容一致
   └─ umd/
      └─ bst-basic-components.js              # 需包根 index.ts；无入口时该目录不产出
```

> `es/button/button.d.ts` 中对共享类型的引用已被改写为相对路径，发布单元因此自包含：

```ts
import type { BstButtonProps } from '../_types/index';
```

### 二、主包聚合产物（`pnpm build:vue:next` 后）

```plaintext
packages/bst-vue-next/
└─ build/
   ├─ es/          # 从 packages/bst-basic-components/build/es 整体复制
   ├─ lib/         # 从 packages/bst-basic-components/build/lib 整体复制
   └─ umd/         # 源包未产出 UMD 时该目录不存在
```

### 三、根 `dist` 发布产物（`pnpm move:main:dist` 后）

```plaintext
dist/
├─ vue-next/                                  # 自包含发布根，可 #path:/dist/vue-next 安装
│  ├─ package.json                            # 归一化清单（已剔除 type / scripts / devDependencies 等）
│  ├─ LICENSE
│  ├─ es/
│  │  ├─ index.mjs
│  │  ├─ index.d.ts
│  │  ├─ button/
│  │  │  ├─ button.mjs
│  │  │  ├─ button.mjs.map
│  │  │  ├─ button.d.ts
│  │  │  ├─ hooks/
│  │  │  └─ elements/
│  │  ├─ context-menu/
│  │  └─ _types/                              # 随单元下发，消费方无需安装 bst-types
│  │     ├─ index.d.ts
│  │     ├─ basic-button.types.d.ts
│  │     └─ basic-context-menu.types.d.ts
│  └─ lib/
│     ├─ button/
│     └─ _types/
├─ vue-next-pro/                              # 结构同 vue-next，内容来自高级组件源码包
│  ├─ package.json
│  ├─ LICENSE
│  └─ es/ lib/ umd/
├─ vue-next-pro-ai/                           # 结构同 vue-next，内容来自 AI 组件源码包
│  ├─ package.json
│  ├─ LICENSE
│  └─ es/ lib/ umd/
└─ styles/
   ├─ package.json
   ├─ LICENSE
   └─ web/
      ├─ index.css
      ├─ index.min.css
      ├─ base.css
      ├─ base.min.css
      ├─ tokens.css
      ├─ tokens.min.css
      ├─ theme-light.css
      ├─ theme-light.min.css
      ├─ theme-dark.css
      ├─ theme-dark.min.css
      └─ basic-components/
         ├─ button/
         │  ├─ index.css
         │  └─ index.min.css
         └─ context-menu/
            ├─ index.css
            └─ index.min.css
```

## 引入示例

### 全量引入

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';

import BsVueNext from '@binarysovereign/vue-next';
import BsVueNextPro from '@binarysovereign/vue-next-pro';
import BsVueNextProAi from '@binarysovereign/vue-next-pro-ai';
import '@binarysovereign/styles/web';

const app = createApp(App);

app.use(BsVueNext);
app.use(BsVueNextPro);
app.use(BsVueNextProAi);

app.mount('#app');
```

### 按需引入（推荐）

```vue
<template>
  <BsButton type="primary">提交</BsButton>
</template>

<script setup lang="ts">
import { BsButton } from '@binarysovereign/vue-next/es/button';
import '@binarysovereign/styles/web/basic-components/button';
</script>
```

> 按需引入样式时**不要**带 `/index.css`：`./web/basic-components/*` 的 `*` 会整段吃掉，`.../button/index.css` 会被拼成 `.../button/index.css/index.css` 而解析失败。

## 适配浏览器

仅面向 Chromium 内核的现代浏览器（不支持 Firefox 与 Safari，也不支持 IE）：

```plaintext
chrome >= 152
edge >= 152
Electron >= 42
```

> 目标浏览器由根 `package.json` 的 `browserslist` 单点声明，Babel 与 autoprefixer 均消费该声明。

## 文档

| 文件 | 内容 |
| --- | --- |
| `AGENTS.md` | 项目说明、命名约定、构建流程与产物结构 |
| `packages/bst-basic-components/template/README.md` | 组件开发代码规范 |
| `packages/bst-types/README.md` | 共享类型包规范 |
| `packages/bst-styles/README.md` | 样式包规范 |
| `packages/bst-vue-next/test/README.md` | 测试规范 |
| `docs/rules/eslint-rules.md` | ESLint 规则清单 |
| `docs/rules/stylelint-rules.md` | Stylelint 规则清单 |
| `docs/rules/changelog-rules.md` | 变更日志编写规范 |
| `docs/rules/release-rules.md` | 发布规范（tag 命名与 GitHub Release 流程） |
| `docs/rules/dependencies.md` | 工作区依赖说明 |
