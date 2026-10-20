// Babel 构建配置：由 `@rollup/plugin-babel` 在 Rollup 构建过程中读取
//
// 扩展名使用 .cjs：根 package.json 已声明 "type": "module"，命名为 .js 会被按 ESM 解析；
// 而 Babel 的配置加载以 CommonJS 为主要路径，用 .cjs 可规避两种模块体系的加载差异
module.exports = {
  // 剥离源码中的全部注释：产物只保留 Rollup banner 提供的统一文件头，
  // 否则每个模块都会带着源码里的 JSDoc / 行内说明一起发布，徒增体积并泄露实现细节
  comments: false,
  presets: [
    [
      '@babel/preset-env',
      {
        // 不声明 targets：交由根 package.json 的 browserslist 决定，避免目标浏览器在两处维护
        // 默认产出 ES 模块，保留 Rollup 处理依赖图的能力
        modules: false,
      },
    ],
  ],
  // 组件源码统一为 TSX，全部产物形态都需要该插件
  plugins: ['@vue/babel-plugin-jsx'],
  env: {
    // BABEL_ENV=lib：产出 CommonJS 形态
    // 同标识的 preset 会覆盖顶层配置，因此 targets 仍取自 browserslist，仅 modules 被替换
    lib: {
      presets: [['@babel/preset-env', { modules: 'commonjs' }]],
    },
    // BABEL_ENV=umd：产出可独立引用的浏览器版本
    // transform-runtime 复用外部 helper，避免在每个组件中重复内联
    umd: {
      plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-transform-object-assign'],
    },
  },
};
