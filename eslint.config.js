// ESLint 扁平配置：组合基础规则、TypeScript 规则、Vue 规则与 Prettier 兼容配置
// 规则说明与约定详见 docs/rules/eslint-rules.md
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import vuePlugin from 'eslint-plugin-vue';

// 需要类型信息才能生效的规则集，仅对 ts / tsx / vue 启用
const TYPED_RULES = {
  // 禁止悬空的 Promise
  '@typescript-eslint/no-floating-promises': 'error',
  // 禁止在无效位置误用 Promise
  '@typescript-eslint/no-misused-promises': 'error',
  // await 的目标必须是 thenable
  '@typescript-eslint/await-thenable': 'error',
  // switch 必须覆盖联合类型的全部分支
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  // 提示多余的条件判断
  '@typescript-eslint/no-unnecessary-condition': 'warn',
  // 只允许抛出 Error 实例
  '@typescript-eslint/only-throw-error': 'error',
  // 模板字符串只允许字符串类型插值
  '@typescript-eslint/restrict-template-expressions': 'error',
  // 类型导入必须写成 import type 且单独成行
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
  ],
  // 类型导出必须写成 export type
  '@typescript-eslint/consistent-type-exports': 'error',
  // 对象类型统一使用 interface
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  // 简单类型用 T[]，复杂类型用 Array<T>
  '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
  // 禁止非空断言
  '@typescript-eslint/no-non-null-assertion': 'error',
  // 禁止多余的类型断言
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  // 优先使用可选链
  '@typescript-eslint/prefer-optional-chain': 'error',
  // 优先使用空值合并运算符
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  // 导出的函数需显式声明返回类型
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  // 命名约定，按下列 selector 分组约束
  '@typescript-eslint/naming-convention': [
    'error',
    {
      // 默认要求小驼峰
      selector: 'default',
      format: ['camelCase'],
      // 允许前导下划线
      leadingUnderscore: 'allow',
      // 允许尾随下划线
      trailingUnderscore: 'allow',
    },
    {
      // 变量允许小驼峰、常量全大写与类名大驼峰
      selector: 'variable',
      format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
      leadingUnderscore: 'allow',
    },
    // 类型名要求大驼峰
    { selector: 'typeLike', format: ['PascalCase'] },
    // 枚举成员允许全大写或大驼峰
    { selector: 'enumMember', format: ['UPPER_CASE', 'PascalCase'] },
    // 导入名不做限制
    { selector: 'import', format: null },
    // 对象属性与类型属性不做限制
    { selector: ['objectLiteralProperty', 'typeProperty'], format: null },
    // 类型侧与对象字面量侧的方法成员放行两类事件名：
    // 1. update:xxx / onUpdate:xxx —— 由 v-model 参数规定，必须保留冒号，无法满足小驼峰；
    //    前者用于组件 emits 声明，后者用于 TSX 中以对象字面量透传 v-model 监听器
    // 2. kebab-case（如 item-select / after-enter）—— Vue 官方推荐的模板监听器写法，
    //    父组件以 @item-select 监听，声明侧保持同名才能被 emits 类型推导命中
    {
      selector: ['typeMethod', 'objectLiteralMethod'],
      filter: { regex: '^(update:|onUpdate:|[a-z][a-z0-9]*(-[a-z0-9]+)+$)', match: true },
      format: null,
    },
  ],
};

export default [
  // 全局忽略：依赖、产物、模板、文档站点与快照静态资源
  {
    ignores: [
      // 第三方依赖
      '**/node_modules/**',
      // 构建产物
      '**/dist/**',
      // 各包的中间产物目录：`build:private` / `build:style` 会在此生成 es / lib / umd 与 CSS
      '**/build/**',
      // VitePress 文档站的运行期缓存：Vite 依赖预打包后的第三方产物，非本站源码
      // （ESLint 不读取 .gitignore，忽略范围必须在此显式声明）
      '**/.vitepress/cache/**',
      // Storybook 静态站点产物（`build:storybook` 生成）
      '**/storybook-static/**',
      // 组件模板源码
      'packages/basic-components/template/**',
    ],
  },

  // 全语言基础规则
  {
    // 作用于脚本、TS 与单文件组件
    files: ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions: {
      // 使用最新 ECMAScript 语法
      ecmaVersion: 'latest',
      // 按 ES 模块解析
      sourceType: 'module',
      parserOptions: {
        // 允许 JSX 语法
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // 继承 ESLint 官方推荐规则
      ...js.configs.recommended.rules,
      // 强制三等号，仅与 null 比较时允许双等号
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      // 限制 console，仅允许 info / warn / error
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
      // 限制导入来源
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              // 禁止 lodash，改用可摇树的 lodash-es
              name: 'lodash',
              message: 'lodash 无法被摇树，请改用 lodash-es。',
            },
          ],
        },
      ],
    },
  },

  // 构建与提交检查脚本：由 Node 直接执行，需声明 Node 环境全局变量
  // 仅声明实际用到的两个，避免用宽松的 browser/node 预设掩盖真实的未定义引用
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },

  // TypeScript 文件规则
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      // 注册 TypeScript 插件
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // 使用 TypeScript 解析器
      parser: tsParser,
      parserOptions: {
        // 启用工程级类型信息
        projectService: true,
        // 以配置文件所在目录为项目根
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // 关闭与 TypeScript 冲突的官方规则
      ...(tsPlugin.configs['eslint-recommended'].overrides?.[0]?.rules ?? {}),
      // 继承 TypeScript 推荐规则
      ...tsPlugin.configs.recommended.rules,
    },
  },

  // Vue 官方推荐规则（扁平预设）
  ...vuePlugin.configs['flat/recommended'],

  // 单文件组件规则
  {
    files: ['**/*.vue'],
    plugins: {
      // 组件内同样启用 TypeScript 插件
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parserOptions: {
        // 模板内使用 TypeScript 解析器
        parser: tsParser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        // 额外解析 .vue 扩展名
        extraFileExtensions: ['.vue'],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...(tsPlugin.configs['eslint-recommended'].overrides?.[0]?.rules ?? {}),
      ...tsPlugin.configs.recommended.rules,

      // 模板中的组件名统一短横线风格
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],

      // 组合式宏需按固定顺序书写
      'vue/define-macros-order': [
        'error',
        {
          // 宏声明顺序
          order: ['defineOptions', 'defineProps', 'defineEmits', 'defineModel', 'defineSlots'],
          // defineExpose 固定放最后
          defineExposeLast: true,
        },
      ],

      // 未定义组件报错，Tang 前缀组件除外
      'vue/no-undef-components': ['error', { ignorePatterns: ['^Tang'] }],

      // 禁止声明未使用的 emit
      'vue/no-unused-emit-declarations': 'error',
    },
  },

  // 需要类型信息的规则，作用于 TS 与单文件组件
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: TYPED_RULES,
  },

  // 关闭与 Prettier 冲突的格式化规则，必须置于数组末尾
  {
    rules: prettierConfig.rules,
  },
];
