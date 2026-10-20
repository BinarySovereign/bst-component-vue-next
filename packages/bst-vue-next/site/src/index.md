---
layout: home

hero:
  name: BstComponent
  text: Vue 3 + TSX 组件库
  tagline: 组件逻辑与样式彻底分离：源码只写行为，全部样式由设计令牌统一供给
  image:
    src: /logo.svg
    alt: BstComponent
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/introduction
    - theme: alt
      text: 组件总览
      link: /components/

features:
  - title: TSX 编写
    details: 组件源码以 TypeScript + TSX 落地，逻辑收敛在 hooks，视图只负责渲染，类型与实现同源。
  - title: 样式独立
    details: 组件源码中不写任何样式，全部样式由 @binarysovereign/styles 以 Less + 设计令牌产出。
  - title: 设计令牌
    details: 颜色、字号、圆角、尺寸均为 :root 自定义属性，切换 theme-mode 即可整体换成暗色。
  - title: 按需引入
    details: 主包按 es / lib 双形态产出，样式与逻辑都可按组件粒度引入，不引入整包。
---
