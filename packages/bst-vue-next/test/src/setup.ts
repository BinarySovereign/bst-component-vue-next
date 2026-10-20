// 全局测试前置：在 `vitest.config.ts` 的 setupFiles 中注册，对所有用例生效
// 约定：第三方依赖（路由、全局插件）与全局 mock 只在此处注册，禁止逐文件重复 mock
import { config } from '@vue/test-utils';
import { vi } from 'vitest';

// 组件模板中可能直接访问 $route / $router，用固定的替身避免渲染期报错
const routeMock = { params: {}, path: '/', query: {} };
const routerMock = { push: vi.fn(), replace: vi.fn() };

// 挂载期全局注入：合并而非覆盖，避免抹掉后续在此处追加的全局配置
config.global.mocks = {
  ...config.global.mocks,
  $route: routeMock,
  $router: routerMock,
};
