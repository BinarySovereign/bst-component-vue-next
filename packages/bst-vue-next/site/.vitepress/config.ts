// VitePress 站点配置：目录约定、导航侧栏、markdown、构建插件与主题行为。
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vitepress';

import { markdownOptions } from './markdown-options';
import { bstTokensPlugin } from './plugin/bst-tokens';
import { demoHighlightPlugin } from './plugin/demo-highlight';

const base = process.env.DOCS_BASE ?? '/';

type VitePressPluginOption = NonNullable<
  NonNullable<NonNullable<Parameters<typeof defineConfig>[0]>['vite']>['plugins']
>[number];

export default defineConfig({
  lang: 'zh-CN',
  title: 'BstComponent',
  description: 'BstComponent 组件库：以 Vue 3 + TSX 编写，样式以设计令牌为基座统一由 @binarysovereign/styles 提供',
  base,
  srcDir: './src',
  srcExclude: ['**/README.md'],
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: false,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }]],

  markdown: markdownOptions,

  vite: {
    plugins: [vueJsx() as unknown as VitePressPluginOption, demoHighlightPlugin(markdownOptions), bstTokensPlugin()],
  },

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: '组件总览', link: '/components/' },
      { text: '基础组件', link: '/components/basic/' },
      { text: '高级组件', link: '/components/advanced/' },
      { text: 'AI 组件', link: '/components/ai/' },
      { text: '主题定制', link: '/guide/theming' },
      { text: '样式预览', link: '/styles/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '安装与引入', link: '/guide/installation' },
            { text: '主题定制', link: '/guide/theming' },
          ],
        },
      ],

      '/components/': [
        {
          text: '组件',
          items: [
            { text: '总览', link: '/components/' },
            { text: '基础组件', link: '/components/basic/' },
            { text: '高级组件', link: '/components/advanced/' },
            { text: 'AI 组件', link: '/components/ai/' },
          ],
        },
      ],

      '/components/basic/': [
        {
          text: '基础组件',
          items: [{ text: '总览', link: '/components/basic/' }],
        },
        {
          text: '其他分层',
          items: [
            { text: '高级组件', link: '/components/advanced/' },
            { text: 'AI 组件', link: '/components/ai/' },
          ],
        },
      ],

      '/styles/': [
        {
          text: '样式预览',
          items: [{ text: '总览', link: '/styles/' }],
        },
        {
          text: '参考',
          items: [
            { text: '安装与引入', link: '/guide/installation' },
            { text: '主题定制', link: '/guide/theming' },
          ],
        },
      ],

      '/components/advanced/': [
        {
          text: '高级组件',
          items: [
            { text: '总览', link: '/components/advanced/' },
            { text: 'ContextMenu 上下文菜单', link: '/components/advanced/context-menu' },
          ],
        },
        {
          text: '其他分层',
          items: [
            { text: '基础组件', link: '/components/basic/' },
            { text: 'AI 组件', link: '/components/ai/' },
          ],
        },
      ],

      '/components/ai/': [
        {
          text: 'AI 组件',
          items: [{ text: '总览', link: '/components/ai/' }],
        },
        {
          text: '其他分层',
          items: [
            { text: '基础组件', link: '/components/basic/' },
            { text: '高级组件', link: '/components/advanced/' },
          ],
        },
      ],
    },

    search: { provider: 'local' },

    socialLinks: [{ icon: 'github', link: 'https://github.com/BinarySovereign/bst-component-vue-next' }],

    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    lastUpdated: { text: '最后更新于' },
    footer: {
      message: '基于 MIT 协议许可发布',
      copyright: 'Copyright (c) 2026 Felix Tang(BinarySovereign)',
    },
  },
});
