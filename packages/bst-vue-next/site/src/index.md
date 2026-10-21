---
layout: home

hero:
  name: BstComponent
  text: Vue 3 + TSX 组件库
  tagline: 组件逻辑与样式彻底分离
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
    - theme: alt
      text: Github 仓库
      link: https://github.com/BinarySovereign/bst-component-vue-next

features:
  - title: 🧩 TSX 编写
    details: 组件源码统一采用 TypeScript + TSX 实现，具备完整的类型推导与组件组合能力，便于维护、调试和二次开发。

  - title: 🎨 样式独立
    details: 组件源码中不编写任何内联样式或样式文件，样式与逻辑彻底解耦，便于接入不同样式方案和主题体系。

  - title: 🎛️ 设计令牌
    details: 颜色、字号、圆角、间距、尺寸等设计变量统一收敛为 :root 自定义属性，通过 CSS 变量驱动组件视觉表现。

  - title: 📦 按需引入
    details: 主包同时产出 es、lib、umd 三种形态，支持按需加载与多种构建环境接入，降低产物体积和集成成本。

  - title: 🛡️ 类型完备
    details: 提供完整的 TypeScript 类型声明与组件 Props 类型约束，提升开发提示、参数校验和跨项目复用体验。

  - title: 🌗 主题可定制
    details: 基于设计令牌支持品牌色、暗色模式及局部主题覆盖，无需修改组件源码即可完成多主题适配。
---
