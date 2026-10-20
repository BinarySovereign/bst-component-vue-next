// 站点 Markdown 配置
//
// 由 config.ts 的 `markdown` 字段与示例高亮插件共用同一份：
// 保证「页面正文的代码块」与「示例源码」走同一套主题与语言集，不会两处漂移。
import type { MarkdownOptions } from 'vitepress';

export const markdownOptions: MarkdownOptions = {
  // 明暗两套主题同时输出，颜色以内联 CSS 变量挂在每个 span 上，
  // 切换 .dark 时由 vitepress 默认主题的 `.vp-code span` 规则决定取哪一套，无需重新渲染。
  theme: { light: 'github-light', dark: 'github-dark' },
};
