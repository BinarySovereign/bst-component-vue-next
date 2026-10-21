// 站点 markdown 配置：正文代码块与示例源码共用同一套高亮主题。
import type { MarkdownOptions } from 'vitepress';

export const markdownOptions: MarkdownOptions = {
  theme: { light: 'github-light', dark: 'github-dark' },
};
