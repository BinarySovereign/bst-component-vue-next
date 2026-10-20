// 测试统一配置：供 `packages/bst-vue-next/test` 下的脚本以 `--config ../../../vitest.config.ts` 引用
// 详细规范见 `packages/bst-vue-next/test/README.md`
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vitest/config';

// 组件源码包根目录，单元用例与覆盖率的匹配范围均在其下
const COMPONENT_DIRS = [
  'packages/bst-basic-components',
  'packages/bst-advanced-components',
  'packages/bst-ai-components',
];

// 测试基建目录，相对仓库根，供 include 与 setupFiles 复用
const TEST_DIR = 'packages/bst-vue-next/test/src';

// 仅作为模板存放，不参与测试与覆盖率统计
const TEMPLATE_DIR = 'packages/bst-basic-components/template';

// 配置文件位于仓库根，include / setupFiles 均以该目录为基准解析
const rootDir = import.meta.dirname;

// `TEST_TARGET=snap` 时只跑批量快照用例，其余情况跑组件单元用例
const isSnap = process.env.TEST_TARGET === 'snap';

export default defineConfig({
  // 固定根目录：脚本工作目录为测试包，不固定会让相对通配符落到测试包内部
  root: rootDir,
  // `.vue` 用于组件 `_example` 快照用例，`vueJsx` 用于 `.tsx` 组件用例
  plugins: [vue(), vueJsx()],
  test: {
    // 断言 API 全局注入，用例内无需逐个从 vitest 引入 describe / it / expect
    globals: true,
    // 组件渲染依赖浏览器 DOM，统一使用 jsdom
    environment: 'jsdom',
    testTimeout: 5000,
    include: isSnap
      ? [`${TEST_DIR}/snap/**/*.test.ts`]
      : COMPONENT_DIRS.map((dir) => `${dir}/**/{__test__,__tests__}/**/*.test.{ts,tsx}`),
    exclude: ['**/node_modules/**', '**/dist/**', `${TEMPLATE_DIR}/**`],
    // 第三方依赖（路由、全局插件）与全局 mock 在此统一注册，禁止逐文件重复 mock
    setupFiles: [`${TEST_DIR}/setup.ts`],
    // 测试模块中 import.meta.url 已被转换，仓库根只能由配置注入后经 inject() 取用
    provide: { repoRoot: rootDir },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // 只统计组件源码，测试文件、示例与模板不计入
      include: COMPONENT_DIRS.map((dir) => `${dir}/**/src/**/*.{ts,tsx}`),
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/__test__/**',
        '**/__tests__/**',
        '**/_example/**',
        '**/*.d.ts',
        `${TEMPLATE_DIR}/**`,
      ],
      // 覆盖率门槛：四项指标均要求 100%，不达标即视为测试未通过
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
