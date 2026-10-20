// 文档站配置（VitePress 1.x）
//
// 目录约定见 `site/README.md`：页面与公开资源全部位于 `src/`（= srcDir），
// 配置、主题、示例索引等工装位于 `.vitepress/`，两者分离以免构建产物与缓存落进页面目录。
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vitepress';

import { markdownOptions } from './markdown-options';
import { bstTokensPlugin } from './plugin/bst-tokens';
import { demoHighlightPlugin } from './plugin/demo-highlight';

// 部署到子路径时由 CI 注入（如 GitHub Pages 的项目页 /<仓库名>/），本地开发保持根路径
const base = process.env.DOCS_BASE ?? '/';

/**
 * VitePress 实际使用的 Vite 插件元素类型
 *
 * 从 `defineConfig` 的入参反推，避免额外引入 `vite`：站点不声明 vite（vitepress 内嵌 vite 5，
 * 仓库根是 vite 7），直接 `import type { PluginOption } from 'vite'` 会拿到不匹配的那一份。
 */
type VitePressPluginOption = NonNullable<
  NonNullable<NonNullable<Parameters<typeof defineConfig>[0]>['vite']>['plugins']
>[number];

export default defineConfig({
  // 站点语言，决定内置文案（搜索、上一页 / 下一页等）的语种
  lang: 'zh-CN',
  title: 'BstComponent',
  description: 'BstComponent 组件库：以 Vue 3 + TSX 编写，样式以设计令牌为基座统一由 @binarysovereign/styles 提供',
  // 站内链接与静态资源会随 base 加前缀；子路径部署见 .github/workflows/deploy-docs.yml
  base,
  // 页面与 public/ 的根目录
  srcDir: './src',
  // 排除 src 下的 README：它们是目录说明（如 src/examples/README.md），不是站点页面。
  // 不排除时 VitePress 会把它们当成页面，生成 /examples/README 这类未登记到导航的孤儿路由。
  srcExclude: ['**/README.md'],
  // 生成无 .html 后缀的链接
  cleanUrls: true,
  lastUpdated: true,
  // 保持死链阻断：新增页面后忘记登记到导航会立刻暴露，而不是静默 404
  ignoreDeadLinks: false,
  // head 里的绝对路径不会被 VitePress 自动加 base 前缀，需自行拼接
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }]],

  // 与示例高亮插件共用同一份：正文代码块与示例源码因此同主题、同语言集
  markdown: markdownOptions,

  // 示例源码在构建期高亮（虚拟模块 virtual:bst-demo-highlight），运行时不含 Shiki
  // 设计令牌清单同样在构建期解析（虚拟模块 virtual:bst-tokens），供样式预览页使用
  //
  // vueJsx 不可省：示例从源码包直接引入 `.tsx` 组件（如 `context-menu`），
  // 缺它时 Vite 会按 React 的 JSX 运行时转换，运行时报 `React is not defined`，菜单永远渲染不出来。
  // 与 Storybook 的 `.storybook/main.ts` 同理，两处需要保持一致。
  //
  // 类型断言的原因：`@vitejs/plugin-vue-jsx` 的 peer 解析到仓库根的 vite 7，其 `PluginOption`
  // 与 vitepress 内嵌 vite 5 的不互通；运行时插件对象只提供转换钩子，版本差异不影响执行。
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

    // 多侧栏：键为页面路径前缀。VitePress 按路径段数降序取首个命中项，
    // 故 `/components/basic/` 会优先于 `/components/`，两者可并存而不会互相抢页。
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
          items: [
            { text: '总览', link: '/styles/' },
            { text: '设计令牌', link: '/styles/#设计令牌' },
            { text: '环境检查清单', link: '/styles/#环境检查清单' },
          ],
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

    // 内置本地搜索（VitePress 自带 minisearch），无需接第三方搜索服务
    search: { provider: 'local' },

    socialLinks: [{ icon: 'github', link: 'https://github.com/BinarySovereign/bs-component-vue-next' }],

    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    lastUpdated: { text: '最后更新于' },
    footer: { message: '基于 MIT 许可发布', copyright: 'Copyright (c) BinarySovereign' },
  },
});
