// SSR 快照专用工厂：以 `@vue/server-renderer` 输出静态 HTML，与同批 demo 的 CSR 结果对照
// 由 `src/snap/ssr.test.ts` 引用，不参与单元用例
import { renderToString } from '@vue/server-renderer';
import { createSSRApp as createVueSSRApp, defineComponent } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import type { Component } from 'vue';

// 兜底路由：demo 不参与具体路由匹配，仅为消除「无匹配路由」告警并让 $route 有值
const FALLBACK_ROUTE = {
  path: '/:pathMatch(.*)*',
  component: defineComponent({ render: () => null }),
};

/**
 * 渲染单个组件为静态 HTML 字符串
 *
 * @param component 待渲染的 demo 组件
 * @returns 组件对应的 HTML 字符串
 */
export async function createSSRApp(component: Component): Promise<string> {
  const app = createVueSSRApp(component);

  // 服务端渲染无浏览器地址栏，使用内存路由提供 $route / $router
  app.use(createRouter({ history: createMemoryHistory(), routes: [FALLBACK_ROUTE] }));

  return renderToString(app);
}
