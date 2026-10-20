<div align="center">

# bst-component-vue-next

**A Vue 3 component library · basic / advanced / AI layers**

One directory per component · source packages separated from published packages · Rollup + Babel emitting both `es` and `lib`

![Use: Personal Only](https://img.shields.io/badge/use-personal%20only-red)

[![Node](https://img.shields.io/badge/node-%3E%3D22.13.0-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D11-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)

[![Vue](https://img.shields.io/badge/vue-%5E3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-%5E6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Chromium](https://img.shields.io/badge/chromium-%3E%3D148-4285F4?logo=googlechrome&logoColor=white)](https://www.chromium.org)

[![Ardot](https://img.shields.io/badge/Ardot-Bst--Components-0052D9)](https://ardot.tencent.com/file/737709471769043)

**English** · [简体中文](./README-ZH.md)

</div>

> [!IMPORTANT]
> This project is intended **for personal learning only and must not be used commercially**.
> Please do not distribute, publicly repost, or use it for external delivery. Contact the maintainer first if you need to publish it.

> The overall design is inspired by [tdesign-vue-next](https://github.com/Tencent/tdesign-vue-next).

---

## Tech stack

| Item | Choice |
| --- | --- |
| Language | TypeScript + TSX |
| Framework | Vue 3 |
| Build | Rollup + Babel; styles are compiled by Less + PostCSS |
| Testing | Vitest (unit tests + SSR / CSR snapshot tests) |
| Package management | pnpm workspace + catalog |

## Package naming

| Package | Name | Directory |
| --- | --- | --- |
| Basic components (published) | `@binarysovereign/vue-next` | `packages/bst-vue-next` |
| Advanced components (published) | `@binarysovereign/vue-next-pro` | `packages/bst-vue-next-pro` |
| AI components (published) | `@binarysovereign/vue-next-pro-ai` | `packages/bst-vue-next-pro-ai` |
| Shared styles | `@binarysovereign/styles` | `packages/bst-styles` |
| Basic components source (private) | `@binarysovereign/bst-basic-components` | `packages/bst-basic-components` |
| Advanced components source (private) | `@binarysovereign/bst-advanced-components` | `packages/bst-advanced-components` |
| AI components source (private) | `@binarysovereign/bst-ai-components` | `packages/bst-ai-components` |
| Shared types (private) | `@binarysovereign/bst-types` | `packages/bst-types` |
| Unit test package (private) | `@binarysovereign/test` | `packages/bst-vue-next/test` |

> Component sources contain no styles at all; every style comes from `@binarysovereign/styles`.
>
> All cross-package types live in `@binarysovereign/bst-types`. They are inlined into each publish unit at build time, so consumers never install that package.

## Repository layout

```plaintext
├─ packages/
│  ├─ bst-vue-next/                 # basic components (published)
│  ├─ bst-vue-next-pro/             # advanced components (published)
│  ├─ bst-vue-next-pro-ai/          # AI components (published)
│  ├─ bst-styles/                   # styles package (Less → CSS)
│  ├─ bst-basic-components/         # basic components source (private)
│  ├─ bst-advanced-components/      # advanced components source (private)
│  ├─ bst-ai-components/            # AI components source (private)
│  └─ bst-types/                    # shared types (private)
├─ scripts/                         # build scripts
├─ docs/                            # rules and reference documents
└─ dist/                            # aggregated publish artifacts (shipped with the repo)
```

## Build pipeline

> Requires Node `>=22.13.0`; the pinned development version is `24.21.0`, see `.nvmrc` and `.node-version`.

```sh
# 1. Install dependencies
pnpm install

# 2. Build the three component source packages as es / lib (no umd yet: no package-level entry exists)
pnpm build:private

# 3. Build the styles package
pnpm build:style

# 4. Aggregate each source package's artifacts into its published package
pnpm build:vue:next
pnpm build:vue:next:pro
pnpm build:vue:next:pro:ai

# 5. Aggregate everything into the root dist/ and clean up each package's build/
pnpm move:main:dist
```

> The build runs in two stages: every package first emits into its own `build/`, then `move:main:dist`
> aggregates into the root `dist/`. `build/` is a disposable intermediate directory that is removed after
> the aggregation step and is therefore not version-controlled.

## Artifact layout example

The structure below assumes two hypothetical components, `button` and `context-menu`, and shows the full
path from source-package artifacts to the final publish artifacts.

### 1. Source package intermediates (after `pnpm build:private`)

```plaintext
packages/bst-basic-components/
└─ build/
   ├─ es/                                     # ES modules, entry points for on-demand imports
   │  ├─ index.mjs                            # aggregate entry, requires a package-level index.ts
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
   │  └─ _types/                              # inlined shared types, generated at build time
   │     ├─ index.d.ts                        # from packages/bst-types/src/index.ts
   │     ├─ basic-button.types.d.ts
   │     └─ basic-context-menu.types.d.ts
   ├─ lib/                                    # CommonJS, mirrors the es/ structure exactly
   │  ├─ button/
   │  │  ├─ button.js
   │  │  └─ button.d.ts
   │  └─ _types/                              # same content as es/_types
   └─ umd/
      └─ bst-basic-components.js              # requires a package-level index.ts; omitted otherwise
```

> References to shared types inside `es/button/button.d.ts` are rewritten to relative paths so that each
> publish unit stays self-contained:

```ts
import type { BstButtonProps } from '../_types/index';
```

### 2. Aggregated published-package artifacts (after `pnpm build:vue:next`)

```plaintext
packages/bst-vue-next/
└─ build/
   ├─ es/          # copied from packages/bst-basic-components/build/es
   ├─ lib/         # copied from packages/bst-basic-components/build/lib
   └─ umd/         # absent when the source package produced no UMD bundle
```

### 3. Root `dist/` publish artifacts (after `pnpm move:main:dist`)

```plaintext
dist/
├─ vue-next/                                  # self-contained publish root, installable via #path:/dist/vue-next
│  ├─ package.json                            # normalized manifest (type / scripts / devDependencies removed)
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
│  │  └─ _types/                              # shipped with the unit; consumers need not install bst-types
│  │     ├─ index.d.ts
│  │     ├─ basic-button.types.d.ts
│  │     └─ basic-context-menu.types.d.ts
│  └─ lib/
│     ├─ button/
│     └─ _types/
├─ vue-next-pro/                              # same layout as vue-next, built from the advanced source package
│  ├─ package.json
│  ├─ LICENSE
│  └─ es/ lib/ umd/
├─ vue-next-pro-ai/                           # same layout as vue-next, built from the AI source package
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

## Usage

### Full import

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

### On-demand import (recommended)

```vue
<template>
  <BsButton type="primary">Submit</BsButton>
</template>

<script setup lang="ts">
import { BsButton } from '@binarysovereign/vue-next/es/button';
import '@binarysovereign/styles/web/basic-components/button';
</script>
```

> Do **not** append `/index.css` to on-demand style entries: the `*` in `./web/basic-components/*`
> swallows the whole segment, so `.../button/index.css` becomes `.../button/index.css/index.css` and fails to resolve.

## Browser support

Chromium-based browsers only (no Firefox, no Safari, no IE):

```plaintext
chrome >= 152
edge >= 152
Electron >= 42
```

> Targets are declared once in the root `package.json` under `browserslist`; both Babel and autoprefixer consume it.

## Documents

| File | Contents |
| --- | --- |
| `AGENTS.md` | Project overview, naming conventions, build pipeline and artifact layout |
| `packages/bst-basic-components/template/README.md` | Component development code conventions |
| `packages/bst-types/README.md` | Shared types package conventions |
| `packages/bst-styles/README.md` | Styles package conventions |
| `packages/bst-vue-next/test/README.md` | Testing conventions |
| `docs/rules/eslint-rules.md` | ESLint rule reference |
| `docs/rules/stylelint-rules.md` | Stylelint rule reference |
| `docs/rules/changelog-rules.md` | Changelog writing conventions |
| `docs/rules/release-rules.md` | Release conventions (tag naming and GitHub Release flow) |
| `docs/rules/dependencies.md` | Workspace dependency reference |
