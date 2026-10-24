// 高级组件源码包根入口：供全量引入与 UMD 单文件产物使用
//
// 该文件同时承担三件事：
//   1. es / lib 产物生成 index.mjs / index.js，对应主包 package.json 的 "." 入口；
//   2. tsc 据此产出 index.d.ts，使全量引入有完整类型；
//   3. 存在包根 index.ts 时，UMD 形态才会产出（见 scripts/build/components.js）。
//
// 组件登记清单内聚在本文件，对外导出清单见 ./components.ts。

/**
 * Copyright (c) 2026 Felix Tang (BinarySovereign). Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */

import type { App, Plugin, Component } from 'vue';

import { BstContextMenu } from './context-menu';

// 全量注册的组件集合
export const components: Record<string, Component> = {
  BstContextMenu,
};

// 高级组件库插件
const BsVueNextPro: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component);
    }
  },
};

export default BsVueNextPro;

// 导出所有组件内容
export * from './components';
