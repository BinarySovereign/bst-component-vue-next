# 工作区依赖说明

## 分组说明

| 分组 | 项数 | 已被引用 | 职责 |
| --- | --- | --- | --- |
| `build` | 30 | 30 | 构建编译依赖组：打包、转译、样式编译、构建脚本工具与测试侧的 Vite 插件 |
| `lint` | 12 | 12 | 代码规范依赖组：ESLint 系、Prettier、Stylelint 系 |
| `runtime` | 12 | 3 | 运行时依赖组：组件库运行时实际引用的第三方库 |
| `test` | 7 | 7 | 单元测试依赖组：Vitest 基建、DOM 环境与测试工具 |
| `types` | 8 | 3 | 类型声明依赖组：TypeScript 工具链与 `@types/*` 声明 |
| `docs` | 5 | 5 | 文档站点与组件预览依赖组：VitePress（供 `packages/bst-vue-next/site`）与 Storybook（供 `packages/bst-vue-next/storybook`），两者均已接入 |

### 引用拓扑

当前工作区共 12 个包：根包、共享类型包、三个源码包、三个主包、`styles`、`test`、`docs`、`storybook`。

| 包 | `dependencies` | `peerDependencies` | `devDependencies` |
| --- | --- | --- | --- |
| 根 `package.json` | — | — | `build` / `lint` / `types` 组主体 |
| `@binarysovereign/bst-types` | — | — | — |
| `@binarysovereign/bst-{basic,advanced,ai}-components` | `@binarysovereign/bst-types`（`workspace:*`） | `vue` | — |
| `@binarysovereign/vue-next{,-pro,-pro-ai}` | — | `vue` | — |
| `@binarysovereign/styles` | — | — | `less`、`postcss`、`postcss-less` |
| `@binarysovereign/test` | — | — | `@binarysovereign/bst-types`（`workspace:*`）、`vue`、`vue-router`、`lodash-es`、`vitest` 组 7 项、`vite`、`@vitejs/plugin-vue` / `-vue-jsx`、`cross-env`、`glob` |
| `@binarysovereign/docs` | `@binarysovereign/styles`（`workspace:*`）、`vue` | — | `vitepress`、`@types/node`、`postcss`、`vue-tsc` |
| `@binarysovereign/storybook` | 三个组件源码包、`bst-types`、`@binarysovereign/styles`（均 `workspace:*`）、`vue` | — | `docs` 组的 Storybook 4 项、`vite`、`@vitejs/plugin-vue` / `-vue-jsx`、`@types/node`、`typescript` |

## `build` 组

| 包名 | 下载量 | 使用用途 | 选择理由 |
| --- | --- | --- | --- |
| `rollup` | 126,085,013 | 组件库打包器，按 `es` / `lib` / `umd` 三形态产出，三个源码包均已产出这三类产物 | `AGENTS.md` 明确构建方式为 `Rollup + Babel`。取 `^4.64.6`，`engines.node` 为 `>=18.0.0`，满足仓库 `>=22.13.0` 下限 |
| `@rollup/plugin-babel` | 11,650,940 | 在 Rollup 流程中调用 Babel 完成语法降级 | 取 `^7.1.0`。其 peer 为 `@babel/core: ^7.0.0`，**不接受 Babel 8**，是锁定 Babel 7 线的决定性约束 |
| `@rollup/plugin-node-resolve` | 20,059,419 | 解析 `node_modules` 中的模块路径 | 取 `^16.0.3`，peer `rollup: ^2.78.0 \|\| ^3.0.0 \|\| ^4.0.0` 覆盖已选的 rollup 4 |
| `@rollup/plugin-commonjs` | 24,102,211 | 将 CommonJS 依赖转换为 ES 模块 | 取 `^29.0.3`，peer 含 `^4.0.0`，与 rollup 4 一致 |
| `@rollup/plugin-json` | 9,712,472 | 允许直接 `import` JSON 文件 | 取 `^6.1.0`，用于读取 `package.json` 元信息注入产物 |
| `@rollup/plugin-replace` | 15,114,863 | 构建期字符串替换 | 取 `^6.0.3`，实际用于把 `PKG_VERSION` 占位符替换为包版本号 |
| `@rollup/plugin-typescript` | 3,381,018 | 在 Rollup 中编译 TypeScript（**当前未进入管线**） | 取 `^12.3.0`。peer 为 `rollup` / `tslib` / `typescript`，其中 **`rollup` 与 `tslib` 均为 optional**，`tslib` 仅在开启 `importHelpers` 时才需要。实际构建改用 `rollup-plugin-esbuild` 剥离类型、`tsc` 单独产声明，故本插件暂无调用点 |
| `@rollup/plugin-url` | 369,575 | 将小体积资源内联为 data URI 或输出为独立文件（**当前无静态资源引用**） | 取 `^8.0.2`，对应产物中的图片等静态资源处理。其下载量为同族插件中最低者，属长期维护观察项 |
| `@babel/core` | 188,588,197 | Babel 编译核心 | **必须取 7 线 `^7.29.7`**。`latest` 已是 `8.0.7`，但其 `engines.node` 为 `^22.18.0 \|\| >=24.11.0`，下限高于仓库 `>=22.13.0`；且 `@rollup/plugin-babel@7.1.0` 的 peer 只接受 `^7` |
| `@babel/preset-env` | 42,883,934 | 依据 `browserslist` 自动降级语法 | 取 `^7.29.7`。仓库已在根 `package.json` 声明 `browserslist`，本包是消费该声明的执行者 |
| `@babel/plugin-transform-runtime` | 31,686,844 | 复用 Babel helper，避免内联污染全局（**当前仅在 `umd` 环境启用**） | 取 `^7.29.7`。注意其 peer 已**不再包含** `@babel/runtime`，需与 `runtime` 组的 `@babel/runtime` 手动保持同线。组件构建取 `babelHelpers: 'bundled'`，本插件实际未生效（详见「构建产物与依赖的对应关系」） |
| `@babel/plugin-transform-modules-commonjs` | 71,339,498 | 将 ES 模块转换为 CommonJS（**当前未直接使用**） | 取 `^7.29.7`。`babel.config.cjs` 的 `lib` 环境实际使用 `@babel/preset-env` 的 `modules: 'commonjs'` 达成同一目的，本插件暂无引用点，可评估移出依赖 |
| `@babel/plugin-transform-object-assign` | 537,681 | 将 `Object.assign` 转换为兼容写法 | 取 `^7.29.7`，为老浏览器兜底 |
| `@babel/helper-module-imports` | 180,688,895 | 生成规范的 import 语句 | 取 `^7.29.7`，被 `@vue/babel-plugin-jsx` 与 `@babel/plugin-transform-runtime` 依赖 |
| `@vue/babel-plugin-jsx` | 4,304,803 | 将 TSX 编译为 Vue render 函数 | **必须取 2 线 `^2.0.1`**。`latest` 为 `3.0.0`，其 peer 是 `@babel/core: ^8.0.0`；`2.0.1` 的 peer 才是 `^7.0.0-0`。本仓库组件源码为 `.tsx`，本包为核心必需项 |
| `esbuild` | 303,541,978 | 极速转译与压缩：组件构建中仅剥离 TS 类型并保留 JSX（交给 Babel），样式构建中用 `transform` 压缩 CSS | 取 `^0.28.2`。`engines.node` 为 `>=18`，且是 `rollup-plugin-esbuild` 的 peer 前置 |
| `rollup-plugin-esbuild` | 1,663,070 | 在 Rollup 中改用 esbuild 执行转译 | 取 `^6.2.1`，peer `esbuild: >=0.18.0`、`rollup: ^1.20.0 \|\| ^2 \|\| ^3 \|\| ^4`，两项均满足 |
| `tsx` | 97,967,694 | 直接运行 TypeScript 脚本（**当前未使用**） | 取 `^4.23.15`。为 `scripts/*.js` 后续迁移为 TS 预留，无需预编译即可执行；现脚本均为 `.js`，暂无调用点 |
| `execa` | 175,667,763 | 在脚本中调用子进程 | **取 9 线 `^9.6.1`**（`engines.node` 为 `^18.19.0 \|\| >=20.5.0`）。`latest` 的 `10.1.1` 要求 `engines.node >= 22`，与仓库 `>=22.13.0` 并不冲突，但升级需单独验证 |
| `fs-extra` | 229,712,029 | 增强的文件拷贝与目录操作 | 取 `^11.4.1`。服务 `build:vue:next*` 的产物聚合与 `move:main:dist` 的归拢清理（`copy` / `remove` / `mkdirp`） |
| `glob` | 400,842,242 | 按通配符匹配文件 | 取 `^13.0.6`，`engines.node` 为 `18 \|\| 20 \|\| >=22`。注意 13 线导出为命名导出且返回 Promise，写法不同于旧版 |
| `rimraf` | 162,777,700 | 递归删除目录（**当前未使用**） | 取 `^6.1.3`，`engines.node` 为 `20 \|\| >=22`。原计划的 `clean:dist` 脚本已不存在，产物清理由 `scripts/build/dist.js` 内的 `fs-extra` 承担 |
| `cross-env` | 26,711,501 | 跨平台设置环境变量 | 取 `^10.1.0`，`engines.node >= 20`。测试包脚本已在使用（如 `test:snap` 的 `cross-env TEST_TARGET=snap`） |
| `less` | 11,230,518 | 编译 `packages/bst-styles/web` 下的 `.less` 样式源码；文档站示例样式也用它复用样式包 mixin | 取 `^4.9.1`。仓库 `.vscode/settings.json` 含 `[less]` 格式化配置、`docs/rules/stylelint-rules.md` 全篇围绕 `.less`，样式语言确定为 Less。实际调用点为 `scripts/build/styles.js` 的 `less.render`，以及 `packages/bst-vue-next/site` 经 Vite 内建 less 支持编译示例样式 |
| `postcss` | 308,191,800 | CSS 后处理管道，承托 `autoprefixer` | 取 `^8.5.30`，是 `autoprefixer` 与 `rollup-plugin-postcss` 的 peer 前置。实际调用点为 `scripts/build/styles.js` 的 `postcss([autoprefixer]).process(...)` |
| `autoprefixer` | 61,877,458 | 依据 `browserslist` 自动补全厂商前缀 | 取 `^10.6.1`，peer `postcss: ^8.1.0` 满足。与仓库已声明的 `browserslist` 配套。当前目标集为纯 Blink（`chrome` / `edge` `>= 152`、`Electron >= 42`），实测对现有样式产物**新增 0 条前缀**——产物中的 `-webkit-` 全部来自样式源码手写，`-moz-` / `-ms-` 已无来源 |
| `rollup-plugin-postcss` | 1,334,818 | 在 Rollup 中编译样式并抽取为独立 CSS（**当前未进入管线**） | 取 `^4.0.2`。peer 仅约束 `postcss: 8.x`，**不约束 rollup 版本**；组件源码不含任何样式（样式统一由 `@binarysovereign/styles` 提供），且样式包不经 Rollup，故本插件暂无调用点。竞品 `rollup-plugin-styles@4.0.0` 的 peer 为 `rollup: ^2.63.0`，与 rollup 4 不兼容，且其周下载量仅 53,547 落在灰区，故排除 |
| `vite` | 195,261,248 | **仅**作为 Vitest 的运行底座（`packages/bst-vue-next/test` 引用） | **取 7 线 `^7.3.7`**。组件产物走 Rollup、样式产物走 `less` + `postcss`，**vite 均不参与**。版本上限由 `vitest@3.2.7` 的 `dependencies` 决定（范围 `^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0-0`），故 `latest` 的 `8.3.4`（`engines.node` 为 `^20.19.0 \|\| >=22.12.0`）不可用 |
| `@vitejs/plugin-vue` | 10,244,342 | 在 Vitest 中转换 `.vue` 单文件组件 | 取 `^6.0.10`。快照用例按规范统一命名为 `_test_snap_example.vue`，需该插件编译。peer 为 `vue: ^3.2.25 \|\| ^3.6.0-rc.10`、`vite: ^5 \|\| ^6 \|\| ^7 \|\| ^8`，均满足 |
| `@vitejs/plugin-vue-jsx` | 2,930,975 | 在 Vitest 中转换 `.tsx` 组件用例 | 取 `^5.1.6`。组件单元用例为 `.tsx`，Vue JSX 的转换只在此生效（构建产物仍由 `@vue/babel-plugin-jsx` 处理）。peer 为 `vite: ^5 \|\| ^6 \|\| ^7 \|\| ^8`、`vue: ^3.0.0`，均满足 |

## `lint` 组

| 包名 | 下载量 | 使用用途 | 选择理由 |
| --- | --- | --- | --- |
| `eslint` | 158,743,826 | 代码规范校验核心 | 取 `^10.12.0`。其 `engines.node` 为 `^20.19.0 \|\| ^22.13.0 \|\| >=24`，覆盖仓库 `>=22.13.0` 下限。仓库 `eslint.config.js` 为扁平配置，需 ESLint 9+ |
| `@eslint/js` | 139,276,251 | 提供 ESLint 官方推荐规则集 | 取 `^10.0.1`，peer `eslint: ^10.0.0` 与已选的 eslint 10 严丝合缝。`eslint.config.js` 首行即 import 该包 |
| `@typescript-eslint/eslint-plugin` | 135,692,736 | TypeScript 专属 lint 规则 | 取 `^8.71.2`。peer `eslint: ^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` 覆盖 eslint 10；**其 peer `typescript: >=4.8.4 <6.1.0` 是 `types` 组 TypeScript 版本上限的由来** |
| `@typescript-eslint/parser` | 140,849,774 | TypeScript 语法解析器 | 取 `^8.71.2`，与 eslint-plugin 同版本。仓库启用了 `parserOptions.projectService`（需类型信息的规则），属强依赖 |
| `eslint-plugin-vue` | 6,693,042 | Vue 单文件组件与模板规则 | 取 `^10.11.1`，peer 含 `eslint: ^10.0.0`。仓库使用 `vuePlugin.configs['flat/recommended']` 扁平预设 |
| `vue-eslint-parser` | 8,204,569 | 解析 `.vue` 文件语法 | 取 `^10.4.1`。它是 `eslint-plugin-vue@10.11.1` 的**必需 peer**（`peerDependenciesMeta` 未将其标为 optional），且不在该插件的 `dependencies` 中，必须显式安装 |
| `eslint-config-prettier` | 57,320,926 | 关闭与 Prettier 冲突的格式类规则 | 取 `^10.1.8`，peer `eslint: >=7.0.0`。仓库采用「ESLint 管逻辑、Prettier 管格式」的分离方案 |
| `prettier` | 139,055,087 | 代码统一格式化 | 取 `^3.9.10`。仓库已有 `.prettierrc.js` 与 `.prettierignore`，且 `.vscode/settings.json` 将各类文件默认格式化器指向 Prettier |
| `stylelint` | 10,917,750 | 样式规范校验核心 | 取 `^17.16.0`，`engines.node >= 20.19.0`。根脚本 `lint:style` 调用 `packages/bst-styles` 的 style 检查，此包为必需项 |
| `stylelint-config-standard` | 6,385,006 | 提供样式标准规则基座 | 取 `^40.0.0`，peer `stylelint: ^17.0.0` 与已选版本匹配。`docs/rules/stylelint-rules.md` 明确基座为本配置 |
| `postcss-less` | 1,473,817 | 为 stylelint 提供 Less 语法解析 | 取 `^6.0.0`。stylelint 原生不识别 `.less`，须经 `stylelint.config.js` 的 `overrides[].customSyntax` 指定本包；peer `postcss: ^8.3.5` 满足。不装则所有 `.less` 直接报 `Cannot resolve custom syntax module` |
| `@vue/tsconfig` | 1,744,059 | Vue 官方 tsconfig 基座 | 取 `^0.9.1`，peer `typescript: >= 5.8`、`vue: ^3.4.0` 满足。根 `tsconfig.json` 以 `@vue/tsconfig/tsconfig.dom.json` 为基座，并覆盖 `types` 以纳入 `node` 与 `vitest/globals` |

## `runtime` 组

| 包名 | 下载量 | 使用用途 | 选择理由 |
| --- | --- | --- | --- |
| `vue` | 17,643,787 | 组件库运行时核心框架 | 取 `^3.5.44`，与 `test` 组的 `@vue/server-renderer` **必须同版本**（该包的 `dependencies` 锁定 `@vue/compiler-dom` 等均为 `3.5.44`）。此约束也是 `@vue/test-utils` 的 `vue: 3.x` peer 得以满足的前提 |
| `@babel/runtime` | 199,797,192 | `@babel/plugin-transform-runtime` 注入的 helper 运行时（**当前未被任何 `package.json` 引用**） | **取 7 线 `^7.29.7`**。`latest` 为 `8.0.7`，与 `build` 组的 `plugin-transform-runtime@^7.29.7` 不同线。该插件已不再把本包列为 peer，pnpm 不会报冲突，但缺失或错线在运行期才会暴露。组件构建现取 `babelHelpers: 'bundled'`，helper 由 Rollup 内联去重，故声明后也无实际 `import`；接入它的前提是把 `babelHelpers` 切到 `'runtime'` |
| `lodash-es` | 51,797,581 | 通用工具函数，可摇树的 ES 模块版本（当前仅 `packages/bst-vue-next/test` 引用） | 取 `^4.18.1`。仓库 `eslint.config.js` 的 `no-restricted-imports` **明确禁用 `lodash`**（理由：无法摇树），故只取 `lodash-es` |
| `@popperjs/core` | 23,842,773 | 弹层定位引擎（tooltip、popover、下拉等） | 取 `^2.11.8`。本包无 `types` 字段但由自身提供类型（Registry 上 `@types/popperjs__core` 为 404，说明 DefinitelyTyped 未单独发布该声明）。最后发布于 2024-06，属长期维护观察项 |
| `dayjs` | 76,185,338 | 轻量日期时间处理 | 取 `^1.11.23`（tdesign 参考值为 `^1.11.10`，同期上抬）。自带类型声明，体积远小于 moment |
| `mitt` | 33,428,473 | 极简事件总线，用于全局事件通信 | 取 `^3.0.1`。自带类型声明。最后发布于 2023-07，属长期维护观察项 |
| `validator` | 25,731,212 | 字符串校验与清洗 | 取 `^13.15.35`。无自带类型，已由 `types` 组的 `@types/validator` 配套 |
| `sortablejs` | 4,112,012 | 拖拽排序 | 取 `^1.15.7`。无自带类型，已由 `@types/sortablejs` 配套 |
| `tinycolor2` | 14,011,912 | 颜色解析与计算 | 取 `^1.6.0`。无自带类型，已由 `@types/tinycolor2` 配套。最后发布于 2023-07，属长期维护观察项 |
| `clipboard` | 2,112,866 | 复制内容到剪贴板 | 取 `^2.0.11`。自带类型声明（`src/clipboard.d.ts`） |
| `raf` | 21,499,130 | `requestAnimationFrame` 的 polyfill | 取 `^3.4.1`。无自带类型，已由 `@types/raf` 配套 |
| `vue-router` | 8,966,032 | 路由，供测试基建提供 `$route` / `$router` | **取 4 线 `^4.6.4`**。`latest` 的 `5.4.0` peer 含 `vite: ^7.3.0 \|\| ^8.0.0`、`pinia`、`@pinia/colada`、`@vue/compiler-sfc`，属重型依赖链且与仓库构建栈不符；`4.6.4` 的 peer 仅为 `vue: ^3.5.0`。`packages/bst-vue-next/test/README.md` 要求第三方依赖（路由、全局插件）统一注册，`src/setup.ts` 与 `src/ssr-setup.ts` 为此引用本包 |

## `test` 组

| 包名 | 下载量 | 使用用途 | 选择理由 |
| --- | --- | --- | --- |
| `vitest` | 125,253,587 | 单元测试与快照测试框架 | **取 3 线 `^3.2.7`**。`latest` 的 `5.0.4` peer 要求 `@types/node: ^22 \|\| >=24`，与仓库当前 `@types/node ^20.19.43` 冲突；3 线为 `^18 \|\| ^20 \|\| >=22`，且 `vite` 是其**直接依赖**，无需额外声明 |
| `@vitest/ui` | 16,191,404 | 测试可视化界面 | 取 `^3.2.7`。其 peer 为**精确版本** `vitest: 3.2.7`，与 vitest 构成联动簇，必须同进同退。服务根脚本 `test:unit-gui` |
| `@vitest/coverage-v8` | 42,296,460 | 覆盖率统计 | 取 `^3.2.7`，peer 同为精确版本 `vitest: 3.2.7`。`packages/bst-vue-next/test/README.md` 记载覆盖率工具为 C8，但 Vitest 3+ 已移除 C8 provider，实际对应物为本包 |
| `@vue/test-utils` | 5,116,360 | 组件挂载与交互测试 | 取 `^2.5.1`，peer `vue: 3.x` / `@vue/compiler-dom: 3.x` / `@vue/server-renderer: 3.x` 均由 `runtime` 组的 `vue@3.5.44` 传递满足 |
| `@vue/server-renderer` | 16,134,072 | SSR 快照渲染 | 取 `^3.5.44`，**必须与 `vue` 同版本**。`packages/bst-vue-next/test/README.md` 记载快照测试需在 SSR 环境经 `createSSRApp` 输出静态 HTML |
| `jsdom` | 114,228,743 | 单元测试的浏览器 DOM 环境 | 取 `^29.1.1`。其 `engines.node` 为 `^20.19.0 \|\| ^22.13.0 \|\| >=24.0.0`，覆盖仓库 `>=22.13.0` 下限；`latest` 的 `30.1.2` 要求 `^22.22.2` 以上，不覆盖 22.13~22.21。其 `canvas` peer 为 optional，无需安装 |
| `mockdate` | 2,690,495 | 固定测试中的系统时间 | 取 `^3.0.5`。`packages/bst-vue-next/test/README.md` 明确要求用 `MockDate.set()` 固定时间以避免快照随日期漂移 |

## `types` 组

| 包名 | 下载量 | 使用用途 | 选择理由 |
| --- | --- | --- | --- |
| `typescript` | 307,015,402 | TypeScript 编译器 | **取 `^6.0.3`**（受 peer 上限所限）。`@typescript-eslint` 的 peer 为 `typescript: >=4.8.4 <6.1.0`，且该包**无 9 线**，故 `latest` 的 TS 7 不可用。已确认 6.x 线当前**仅有 `6.0.3`**，无 6.1.x 发布，因此 caret 暂不越界；若 6.1.0 未来发布需改回 `~6.0.3` |
| `vue-tsc` | 6,613,258 | Vue 项目类型检查 | 取 `^3.3.13`，peer `typescript: >=5.0.0` 满足。根脚本 `typecheck` 使用 `tsc --noEmit`，SFC 场景需本包 |
| `@types/node` | 461,488,865 | Node 内置模块类型声明 | 当前 catalog 取 `^20.19.43`，**低于仓库最低运行时 `22.13.0`**，属待对齐项。实际开发环境为 Node 24，如需对齐本机可改 `^24.19.2`；`latest` 的 `26.6.5` 超出仓库支持的运行时线 |
| `@types/lodash-es` | 7,828,630 | `lodash-es` 类型声明（**当前未被任何 `package.json` 引用**） | 取 `^4.17.12`。`lodash-es` 无自带类型。仓库 TS 配置开启 `no-explicit-any` 与 `explicit-module-boundary-types`，缺类型声明会直接报 TS7016 |
| `@types/validator` | 17,634,862 | `validator` 类型声明（**当前未被任何 `package.json` 引用**） | 取 `^13.15.10`。DefinitelyTyped 与本体版本号不同步属正常现象 |
| `@types/raf` | 14,782,792 | `raf` 类型声明（**当前未被任何 `package.json` 引用**） | 取 `^3.4.3` |
| `@types/tinycolor2` | 3,607,869 | `tinycolor2` 类型声明（**当前未被任何 `package.json` 引用**） | 取 `^1.4.6` |
| `@types/sortablejs` | 1,457,787 | `sortablejs` 类型声明（**当前未被任何 `package.json` 引用**） | 取 `^1.15.9` |

## `docs` 组

| 包名 | 下载量 | 使用用途 | 选择理由 |
| --- | --- | --- | --- |
| `@storybook/addon-a11y` | 7,127,955 | 组件无障碍检查面板（Storybook 预览侧） | 取 `^10.6.2`。peer 仅 `storybook: ^10.6.2`，无额外联动依赖 |
| `@storybook/addon-docs` | 10,437,008 | 从 TS 类型与 JSDoc 自动生成组件属性表与示例文档 | 取 `^10.6.2`。peer 为 `storybook: ^10.6.2`，`@types/react` 为 **optional peer**，未装 React 类型不会报错 |
| `@storybook/vue3-vite` | 530,796 | Storybook 的 Vue 3 + Vite 框架包 | 取 `^10.6.2`。peer `vite: ^5 \|\| ^6 \|\| ^7 \|\| ^8` 覆盖仓库实际解析的 `vite@7.3.7`；`storybook: ^10.6.2` 必须与其余三包完全一致；`typescript: >= 4.9.x` 为 optional peer，仓库 `6.0.3` 满足 |
| `storybook` | 13,624,402 | 组件开发与演示环境核心（Controls、Docs、交互测试驱动） | 取 `latest` 的 `^10.6.2`（历史线标签为 `v9: 9.1.21`、`v8: 8.6.19`；`next` 的 `11.0.0-alpha.6` 属预发布，已剔除）。该版本**未声明 `engines`**，与仓库 `>=22.13.0` 下限不冲突；可选 peer 为 `prettier: ^2 \|\| ^3`（仓库 `3.9.10` 满足）、`vite-plus`、`@types/react` |
| `vitepress` | 1,369,027 | 文档站点静态站点生成器（已接入 `packages/bst-vue-next/site`） | 取 `^1.6.4`。2.x 仅有 `2.0.0-alpha.20`，属预发布，按规则剔除。其 `dependencies` 已自带 `vite`、`vue`、`shiki`、`minisearch`、`@vueuse/core`；`frontmatter`、Shiki 代码高亮、本地全文搜索均为内置能力，且 markdown 中可直接使用 Vue 组件，故无需另配 `prismjs` / `gray-matter` / 搜索类依赖。接入后另确认了两点：**其内置的 `createMarkdownRenderer` 为公开导出**，示例源码高亮直接复用它（不再额外声明 `shiki`）；其内嵌的 `vite@5` 与仓库根的 `vite@7` 不同线，故站点**不声明** `vite` / `@vitejs/plugin-vue`，以免配置侧拿到与运行时不同的实例 |
