// Stylelint 配置
// 作用目标：仓库全部样式文件（.less / .css）
// 基座规则：stylelint-config-standard
// 详细配置规则参考：docs/rules/stylelint-rules.md

export default {
  // 跳过构建产物、覆盖率报告与依赖目录
  // 注意：stylelint 不读取 .gitignore，忽略范围只能在此声明
  // `build/` 是各包先产出、再由 move:main:dist 归拢的中间产物目录（见 scripts/build/paths.js），
  // 其中的 CSS 由 Less 编译而来，含压缩产物，不应参与源码规范检查
  ignoreFiles: ['**/build/**', '**/dist/**', '**/coverage/**', '**/node_modules/**'],

  // 继承社区标准规则集
  extends: ['stylelint-config-standard'],

  // 自定义规则
  rules: {
    // 关闭重复选择器检查
    'no-duplicate-selectors': null,
    // 允许空规则块
    'block-no-empty': null,
    // 类名命名格式不做限制
    'selector-class-pattern': null,
    // 关闭属性值未知检查
    'declaration-property-value-no-unknown': null,
    // 注释前不强制空行
    'comment-empty-line-before': null,
    // 导入写法不做限制
    'import-notation': null,
    // 禁止可被简写替代的展开属性
    'declaration-block-no-redundant-longhand-properties': [
      true,
      {
        // flex 与 inset 相关简写不参与该检查
        ignoreShorthands: ['/flex/', '/inset/'],
      },
    ],
    // 自定义属性命名不做限制
    'custom-property-pattern': null,
    // 关键帧命名不做限制
    'keyframes-name-pattern': null,
    // 允许空样式文件
    'no-empty-source': null,
    // @ 规则前要求空行
    'at-rule-empty-line-before': [
      'always',
      {
        // 不设 except：连续 `@import` 之间保留空行是本仓库样式的既有风格。
        // 若按基座加入 `blockless-after-same-name-blockless`，该选项会【反转】主选项，
        // 变成「禁止 @import 之间空行」，与现有代码直接冲突。
        // 注释之后的行除外
        ignore: ['after-comment'],
      },
    ],
    // 关闭选择器特异性递减检查
    'no-descending-specificity': null,
    // 关闭未知类型选择器检查
    'selector-type-no-unknown': null,
    // 值关键字大小写不做限制
    'value-keyword-case': null,
    // 属性名必须已知
    'property-no-unknown': [
      true,
      {
        // 同时检查带浏览器前缀的属性
        checkPrefixed: true,
      },
    ],
  },

  // 按文件类型施加的差异化配置
  overrides: [
    {
      // Less 源文件
      files: ['**/*.less'],
      // 使用 Less 语法解析
      customSyntax: 'postcss-less',
      rules: {
        // Less 中的变量是编译期插值，媒体查询无法静态校验，故仅对 Less 关闭该检查
        'media-query-no-invalid': null,
      },
    },
    // 组件所有样式
    // 禁止使用 red 等颜色值
    {
      files: [
        'packages/bst-styles/web/basic-components/**/*.less',
        'packages/bst-styles/web/advanced-components/**/*.less',
        'packages/bst-styles/web/ai-components/**/*.less',
      ],
      rules: {
        // 颜色必须使用令牌或十六进制等写法
        'color-named': 'never',
      },
    },
  ],
};
