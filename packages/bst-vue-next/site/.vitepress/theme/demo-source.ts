// 示例索引：把 `src/examples/**/*.vue` 以「可渲染组件」形态暴露给文档页，
// 使文档页的实时示例与源码展示共用同一个文件，不存在两份代码漂移的可能。
//
// 源码侧的高亮 HTML 由 `.vitepress/plugin/demo-highlight.ts` 在构建期生成，
// 经虚拟模块 `virtual:bst-demo-highlight` 动态载入（见 `loadDemoHighlights`），
// 因此运行时不含 Shiki，高亮数据也自成独立 chunk。
//
// 之所以自己实现而不引示例插件：`pnpm-workspace.yaml` 的 docs 组只登记了 vitepress 一项，
// 各类 VitePress 示例渲染插件已在 `docs/rules/dependencies.md` 中被逐条排除。
import type { Component } from 'vue';
import { defineAsyncComponent } from 'vue';

/**
 * 把 import.meta.glob 的键归一化为示例 id
 *
 * 键形如 `../../src/examples/button/basic-usage.vue`，归一化后为 `button/basic-usage`。
 * !important：构建期插件里有一份等价的归一化（`toDemoId`），两处必须得出相同结果，否则取不到源码。
 *
 * @param path glob 键
 * @returns 示例 id
 */
function toDemoId(path: string): string {
  return path.replace(/^.*\/examples\//, '').replace(/\.vue$/, '');
}

// 组件索引：保持惰性，示例各自分包，避免主题入口把全部示例打进同一个 chunk。
// !important：实参必须是字面量，抽成常量会在构建期报 `Invalid glob import syntax: Could only use literals`。
const componentModules = import.meta.glob<{ default: Component }>('../../src/examples/**/*.vue');

/** 示例 id -> 示例组件（懒加载） */
export const demoComponentMap: Record<string, Component | undefined> = Object.fromEntries(
  Object.entries(componentModules).map(([path, load]) => [toDemoId(path), defineAsyncComponent(load)]),
);

/**
 * 载入全部示例的高亮 HTML
 *
 * 动态 import 的形式使高亮数据独立成 chunk：未展开任何源码的页面不会下载它。
 *
 * @returns 示例 id -> 高亮 HTML
 */
export async function loadDemoHighlights(): Promise<Record<string, string | undefined>> {
  return (await import('virtual:bst-demo-highlight')).default;
}
