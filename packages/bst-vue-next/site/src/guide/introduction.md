# 介绍

BstComponent 是一套基于 **Vue 3 + TypeScript + TSX** 的组件库，采用 monorepo 组织。

## 包结构

| 分层 | 包名 | 目录 | 说明 |
| --- | --- | --- | --- |
| 基础组件主包 | `@binarysovereign/vue-next` | `packages/bst-vue-next` | 聚合基础组件源码包产物后对外发布 |
| 高级组件主包 | `@binarysovereign/vue-next-pro` | `packages/bst-vue-next-pro` | 聚合高级组件源码包产物后对外发布 |
| AI 组件主包 | `@binarysovereign/vue-next-pro-ai` | `packages/bst-vue-next-pro-ai` | 聚合 AI 组件源码包产物后对外发布 |
| 通用样式包 | `@binarysovereign/styles` | `packages/bst-styles` | 唯一的样式来源 |

## 技术栈

| 项 | 取值 | 用途 |
| --- | --- | --- |
| Vue | 3.5 | 组件运行时 |
| TypeScript | 6 | 组件与工具的类型基础 |
| TSX | `@vue/babel-plugin-jsx` | 组件源码形态 |
| Less + PostCSS | Less、Autoprefixer | 样式编写与产出 |
| Rollup + Babel | — | 组件包打包 |
| VitePress | 1.6 | 本文档站 |

## 环境要求

| 项 | 要求 |
| --- | --- |
| Node.js | `>= 22.13.0` |
| 包管理器 | pnpm |
| 浏览器 | Chrome / Edge 152 及以上、Electron 42 及以上，不支持 IE / Firefox / Safari |

## 下一步

- [安装与引入](/guide/installation)：把组件库接进你的项目
- [主题定制](/guide/theming)：用设计令牌改主题、切暗色
- [组件总览](/components/)：查看已落地与规划中的组件
