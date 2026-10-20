// 为 @binarysovereign/styles 的按需入口补类型声明。
//
// 该包只产出 CSS，不含任何类型声明文件；而其 exports 把
// `./web/{basic,advanced}-components/*` 映射到 `<组件名>/index.css`，
// 于是「正确的引入写法」（见 .vitepress/theme/index.ts 的说明）是一个不带 .css 后缀的说明符，
// TS 无法据扩展名放行，会报 TS2882：Cannot find module or type declarations for side-effect import。
//
// 这里按包级通配声明「该包的任意子路径都可作为副作用引入」，与它纯 CSS 产物的性质一致。
declare module '@binarysovereign/styles/*';
