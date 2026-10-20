# 测试规范

> 配置与基建说明见「测试基建」章节；用例编写规范见「单元测试规范」及其后各章节。

---

## 概览

> 下列命令均可在**仓库根**直接执行：根 `package.json` 已为它们配置同名转发脚本（`pnpm -C packages/bst-vue-next/test <同名脚本>`）。

### 主要 script 命令

```bash
# 组件单元测试与组件快照测试
pnpm run test
# 快照更新
pnpm run test:update
```

### 组件单元测试 `unit`

```bash
# 运行全量单测
pnpm run test:unit
# 运行全量单测并 watch 更改
pnpm run test:unit-dev
# 指定组件进行单测，组件测试时推荐使用此方式
pnpm run test:unit-dev button
# 展示 UI 界面，可查看覆盖率
pnpm run test:unit-gui
# 展示 UI 界面-指定组件
pnpm run test:unit-gui button
# 生成覆盖率报告
pnpm run test:unit-coverage
```

### 组件快照测试 `snap`

组件 `_example` 目录下的示例快照测试集中维护在 `packages/bst-vue-next/test/src/snap/`，不适用组件单测的五类分组。

```bash
# 快照
pnpm run test:snap
# 更新快照
pnpm run test:snap-update
```

---

## 测试基建

### 配置文件

配置统一维护在**仓库根**的 `vitest.config.ts`，测试包内的脚本通过 `--config ../../../vitest.config.ts` 引用它。

> 未采用「根配置只用 `projects` 转发、各包分别维护配置」的多层结构：本仓库当前只有 `packages/bst-vue-next/test` 一个测试包，单层配置更直观。

### 关键配置

| 配置项 | 取值 | 说明 |
| --- | --- | --- |
| `root` | 仓库根目录 | 脚本的工作目录是测试包，不固定根目录会让 `include` 的相对通配符落到测试包内部 |
| `plugins` | `[vue(), vueJsx()]` | `@vitejs/plugin-vue` 转换 `.vue` 快照用例，`@vitejs/plugin-vue-jsx` 转换 `.tsx` 单元用例 |
| `environment` | `jsdom` | 组件渲染依赖浏览器 DOM |
| `globals` | `true` | `describe` / `it` / `expect` 等全局注入，用例内无需逐个引入 |
| `testTimeout` | `5000` | 单个用例的超时上限（毫秒） |
| `include` | 见「匹配范围」 | 按 `TEST_TARGET` 切换单元与快照两套范围 |
| `exclude` | `node_modules` / `dist` / `template` | 模板目录仅作示例存放，不参与测试 |
| `setupFiles` | `test/src/setup.ts` | 第三方依赖与全局 mock 的统一注册点 |
| `provide` | `{ repoRoot }` | 向用例注入仓库根路径，见「已知约束」 |
| `coverage` | v8 + 四项 100% 阈值 | 详见「覆盖率」章节 |

### 匹配范围

| 目标 | 环境变量 | `include` |
| --- | --- | --- |
| 组件单元测试 | 无需设置 | `packages/bst-{basic,advanced,ai}-components/**/{__test__,__tests__}/**/*.test.{ts,tsx}` |
| 组件快照测试 | `TEST_TARGET=snap` | `packages/bst-vue-next/test/src/snap/**/*.test.ts` |

> 单元用例的匹配同时覆盖 `__test__` 与 `__tests__` 两种目录名，两种写法均可用。

### 基建文件

```plaintext
packages/bst-vue-next/test/
├── package.json                    # 测试脚本，统一以 --config 引用根配置
├── README.md                       # 本文档
└── src/
    ├── setup.ts                    # 全局前置：注册第三方依赖与全局 mock
    ├── ssr-setup.ts                # SSR 渲染工厂：createSSRApp() 输出静态 HTML
    ├── vitest.d.ts                 # 补全 Vitest 注入值的类型声明
    └── snap/
        ├── csr.test.ts             # CSR 批量快照
        ├── ssr.test.ts             # SSR 批量快照
        └── __snapshots__/          # 快照产物，纳入版本管理
```

### 已知约束

以下三条是配置落地时确认过的约束，改动测试基建时需一并注意：

1. **仓库根路径必须经 `provide` 注入**。测试模块中的 `import.meta.url` 会被转换，不再是可交给 `fileURLToPath` 的 `file://` URL，直接转换会抛 `The URL must be of scheme file`。配置文件中的 `import.meta.dirname` 不受影响。用例内统一用 `inject('repoRoot')` 取值，类型声明见 `src/vitest.d.ts`。
2. **`app.use(router)` 之后不能再给 `$route` 赋值**。此时 `$route` 已是只读 getter，赋值会抛 `Cannot set property $route of #<Object> which has only a getter`；安装 router 本身即会自动提供 `$route` / `$router`。
3. **空 `routes` 会触发路由告警**。`ssr-setup.ts` 为此注册了一条 catch-all 兜底路由，用于消除 `No match found for location with path ""`。

### 空仓库的表现

组件尚未落地时，两项命令会以非零码退出，属预期行为：

| 命令 | 表现 | 原因 |
| --- | --- | --- |
| `pnpm test:unit` | `No test files found, exiting with code 1` | 尚无任何 `*.test.{ts,tsx}` |
| `pnpm test:snap` | `No test found in suite` | demo 数为 0 时 `describe` 内没有用例 |

> 后者刻意不做空数组豁免：若新增了组件却忘记补 `_test_snap_example.vue`，静默通过会掩盖问题。

---

## 单元测试规范

### 测试用例覆盖范围

- 组件的每个 API 都必须编写测试用例。
- 如果某个 API 同时支持基础数据类型（string/number/boolean）和复杂数据类型（Slot/Function），则需分别编写测试用例，覆盖不同类型的输入。
- 参考 context-menu 组件的测试用例，确保覆盖率达到或接近 100%。

### 测试内容范围

- 组件本身的功能和行为。
- 组件内部的 hooks（自定义 Hook）。
- 组件内部的 utils（工具函数）。

### 测试文件命名及存放规范

- 测试文件统一放置在对应组件目录下的 `__tests__` 文件夹中。
- 组件模板目录（`packages/bst-basic-components/template`）当前使用 `__test__`，测试配置对两种目录名均做匹配，因此两者都能被扫到；新建组件请统一使用 `__tests__`。
- 组件测试文件：`[组件名].test.tsx`，例如 `context-menu.test.tsx`。
- 多子组件场景：每个子组件单独编写测试文件，例如 `context-menu.test.tsx` 和 `context-menu-item.test.tsx`。
- 组件内部 hooks 测试文件：`[组件名].hooks.test.tsx`，例如 `context-menu.hooks.test.tsx`。
- 组件内部 utils 测试文件：`[组件名].utils.test.tsx`，例如 `context-menu.utils.test.tsx`。
- 多个测试文件共用的挂载逻辑可提取到 `mount.tsx`，用于存放 mount factory、测试数据、查询方法和清理逻辑；仅被单个测试文件使用的辅助逻辑应保留在原测试文件中。
- `mount.tsx` 是测试辅助文件，不直接编写测试用例，也不要求使用组件测试分组。

### 组件测试分组规范

组件测试使用 BDD 模式。顶层 `describe` 使用组件名，其直接子级按以下类别组织：

- `props`：验证不同 Props 对组件渲染和行为的影响。
- `events`：验证事件触发时机及回调参数。
- `slots`：验证默认插槽、具名插槽和作用域插槽。
- `instanceFunctions`：验证组件通过 ref 暴露的实例方法。
- `scenarios`：验证多 API 联动、完整交互流程、不同模式和边界情况。

遵循以下原则：

- 分组按需创建，不保留空的 `describe`。
- 组件根 `describe` 下不直接放置 `it` 或 `test`。
- 能明确归属于单一公开 API 类型的测试放入前四类；跨多个 API 或无法归属于单一 API 的完整行为放入 `scenarios`。
- `scenarios` 可继续按具体功能嵌套分组，例如 `keyboard interaction`、`range selection` 或 `edge cases`，避免使用 `others`、`misc` 等含义模糊的名称。
- 当 Prop 和 Slot 提供相同能力时，分别在 `props` 和 `slots` 中验证各自的输入通道；两者同时使用时的优先级、覆盖和回退规则放入 `scenarios`。
- 为修复 Issue 新增或补充的回归测试，应在对应的 `it` 或 `test` 紧邻上方以 `// Issue: <完整 Issue URL>` 标注来源，不只填写 Issue 编号。该规则适用于所有分组，不限于 `scenarios`。
- hooks、utils 等非组件测试不强制使用上述五类分组；子组件测试仍遵循组件测试分组规范。

---

## 测试示例

使用 BDD 模式进行开发，测试必须在流水线中通过。

```ts
describe('ComponentName', () => {
  // 组件属性测试：验证不同 Props 对渲染和行为的影响
  describe('props', () => {});

  // 组件事件测试：验证事件触发时机及回调参数
  describe('events', () => {});

  // 组件插槽测试：验证默认插槽、具名插槽和作用域插槽
  describe('slots', () => {});

  // 组件实例方法测试：验证通过 ref 暴露的方法
  describe('instanceFunctions', () => {});

  // 综合场景测试：验证多 API 联动、交互流程和边界情况
  describe('scenarios', () => {});
});
```

示例用于展示完整结构；实际测试中应删除没有对应测试用例的空分组。

2. 命令行查看测试用例

```bash
pnpm run test:unit-dev button
```

3. 通过 UI 查看更多细节

```bash
pnpm run test:unit-gui button
```

---

## Mock 策略

1. 事件回调统一用 `vi.fn()` 声明，断言 `toHaveBeenCalled` / `toHaveBeenCalledWith` / `toHaveBeenCalledTimes`。
2. 时间相关用 `mockdate` 的 `MockDate.set('2020-12-28')` 固定，避免快照随日期漂移。
3. 模块依赖用 `vi.mock()`；第三方依赖（路由、全局插件）在 `test/setup.ts` 统一注册，禁止逐文件重复 mock。
4. 只 mock 边界（网络、时间、随机、浏览器 API），**不 mock 被测组件自身的逻辑**。
5. 用例后按需 `vi.restoreAllMocks()` / `vi.clearAllMocks()`，防止用例间串扰。

---

## 快照测试

1. 快照为**批量集成测试**：在 **SSR 环境**与 **CSR 环境**下分别对所有 demo 生成。
2. 作用：代码改动过程中最快发现对组件结构的影响。
3. 时机：由脚本批量处理，**开发者无需编写用例代码**。
   - 两个用例共用同一套扫描规则：`packages/bst-{basic,advanced,ai}-components/**/_example/_test_snap_example.vue`，排除 `template` 模板目录。
   - **CSR**：`csr.test.ts` 逐个动态导入 demo，以 `mount` 渲染，`await flushPromises()` 后采集 DOM 快照。
   - **SSR**：`ssr.test.ts` 使用同一批 demo，经 `ssr-setup.ts` 的 `createSSRApp` 工厂以 `@vue/server-renderer` 输出静态 HTML，与 CSR 结果对照。
4. demo 的**约定命名**为组件自己 `_example/` 目录下的 `_test_snap_example.vue`，多个用例以注释分隔开、**不编写交互操作**，详见 `packages/bst-basic-components/template/_example/README.md`。
5. 两侧用例均以 `MockDate.set('2020-12-28 00:00:00')` 固定系统时间，避免快照随日期漂移。
6. 更新快照统一使用 `pnpm test:update`；**禁止在单组件用例中随手 `toMatchSnapshot()`**。
7. 快照文件纳入版本管理，评审时关注快照 diff 是否符合预期。

---

## 覆盖率

1. 工具：v8 provider（`@vitest/coverage-v8`），命令 `pnpm test:unit-coverage`。
2. 报告格式：`text` / `json` / `html`（`vitest.config.ts` 的 `coverage.reporter`）。
3. 统计范围：`packages/bst-{basic,advanced,ai}-components/**/src/**/*.{ts,tsx}`，测试文件、`_example` 示例与 `template` 模板目录均不计入。
4. 阈值：`lines` / `functions` / `branches` / `statements` **均要求 100%**。
5. 覆盖率不达标即视为测试未通过；禁止以 `/* v8 ignore */` 等注释绕过。确需忽略的不可达分支必须写明理由。
6. 新增组件时，其新增源码行必须被全覆盖，不允许靠历史均值稀释。

---

## 断言与最佳实践

1. 优先显式断言（`toContain` / `toEqual` / `toBe`），断言最小且具体。
2. 一个用例只验证一个行为。
3. 异步交互统一 `await` + `$nextTick()`，禁止依赖隐式计时。
4. 查询元素优先语义化类名 / 组件名（`findComponent(CloseIcon)`），避免脆弱层级选择器。
5. 测试代码与源码同等维护：命名清晰、无冗余、无 `console.log` 残留。

---

## 禁止事项

1. 禁止提交没有对应测试的组件 / composable 变更。
2. 禁止在组件用例中手写快照用例，快照统一走批量脚本。
3. 禁止提交 `it.only` / `describe.only` / `it.skip`（调试后必须移除）。
4. 禁止断言内部私有实现细节。
5. 禁止用 `setTimeout` 硬等待替代 `await` / `nextTick`。
6. 禁止为通过测试而修改断言而非修改实现。
