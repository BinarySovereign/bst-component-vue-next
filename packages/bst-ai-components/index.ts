// AI 组件源码包根入口：供全量引入与 UMD 单文件产物使用
//
// 该文件同时承担三件事：
//   1. es / lib 产物生成 index.mjs / index.js，对应主包 package.json 的 "." 入口；
//   2. tsc 据此产出 index.d.ts，使全量引入有完整类型；
//   3. 存在包根 index.ts 时，UMD 形态才会产出（见 scripts/build/components.js）。
//
// 组件登记清单与对外导出均在 ./components.ts，本文件只负责插件安装。
import type { App, Plugin, Component } from 'vue';

/**
 * 全量注册的组件集合
 *
 * 键名即全局注册时的组件名，须与组件 `name` 保持一致。
 */

export const components: Record<string, Component> = {};

/**
 * AI 组件库插件
 *
 * 支持 `app.use(BsVueNextProAi)` 全量注册；按需引入请直接从组件目录导入。
 */

const BsVueNextProAi: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component);
    }
  },
};

export default BsVueNextProAi;

// 具名导出与类型导出统一由 ./components.ts 转发，避免在此重复维护
// 后续去掉 type
export type * from './components';
