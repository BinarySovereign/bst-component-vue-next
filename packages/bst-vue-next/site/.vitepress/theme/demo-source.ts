// 示例索引：按 demo id 懒加载示例组件，并载入构建期生成的高亮 HTML。
import type { Component } from 'vue';
import { defineAsyncComponent } from 'vue';

function toDemoId(path: string): string {
  return path.replace(/^.*\/examples\//, '').replace(/\.vue$/, '');
}

const componentModules = import.meta.glob<{ default: Component }>('../../src/examples/**/*.vue');

export const demoComponentMap: Record<string, Component | undefined> = Object.fromEntries(
  Object.entries(componentModules).map(([path, load]) => [toDemoId(path), defineAsyncComponent(load)]),
);

export async function loadDemoHighlights(): Promise<Record<string, string | undefined>> {
  return (await import('virtual:bst-demo-highlight')).default;
}
