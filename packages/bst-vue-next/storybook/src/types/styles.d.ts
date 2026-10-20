// 样式包入口的模块声明
//
// `@binarysovereign/styles` 的 exports 指向纯 CSS 文件，TypeScript 无法自行解析，
// 副作用导入会报 TS2882；此处补上声明，仅用于 Storybook 侧的预览配置。

declare module '@binarysovereign/styles/web';
declare module '@binarysovereign/styles/web/*';
