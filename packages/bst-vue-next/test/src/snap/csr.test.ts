// CSR 批量快照：扫描全部组件的 `_example/_test_snap_example.vue`，逐个挂载后采集 DOM 快照
// 用例由脚本批量生成，开发者无需编写具体用例，更新统一走 `pnpm test:update`
import { flushPromises, mount } from '@vue/test-utils';
import { globSync } from 'glob';
import MockDate from 'mockdate';
import { relative } from 'node:path';
import { describe, expect, inject, it, vi } from 'vitest';

// 仓库根目录由 `vitest.config.ts` 注入，相对通配符以此为准
const rootDir = inject('repoRoot');

// 排除模板目录，其中不包含真实组件的示例
const demoFiles = globSync('packages/bst-{basic,advanced,ai}-components/**/_example/_test_snap_example.vue', {
  absolute: true,
  cwd: rootDir,
  ignore: ['**/node_modules/**', '**/dist/**', 'packages/bst-basic-components/template/**'],
});

// 固定系统时间，避免快照随「当前时间」漂移
MockDate.set('2020-12-28 00:00:00');

describe('csr snapshot test', () => {
  // jsdom 未实现 canvas 绘制能力，置为替身以免组件内部调用时报错
  HTMLCanvasElement.prototype.getContext = vi.fn();

  for (const file of demoFiles) {
    // 快照键不得包含绝对路径，否则同一仓库在 Windows 与 Linux 上会得到不同键名
    const demoName = relative(rootDir, file).replaceAll('\\', '/');

    it(`csr test ${demoName}`, async () => {
      // demo 路径在构建期不可静态分析，需显式跳过 vite 的依赖扫描
      const demo = await import(/* @vite-ignore */ file);
      const demoComponent = demo.default ?? demo;
      demoComponent.name = `test-csr-${demoComponent.name}`;

      const wrapper = mount(demoComponent);
      // 等待异步渲染收敛后再采集，避免快照落后于实际 DOM
      await flushPromises();

      expect(wrapper.element).toMatchSnapshot();
    });
  }
});
