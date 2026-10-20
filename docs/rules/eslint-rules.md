# ESLint 规则清单

> 统计范围：`eslint`（核心规则）、`@typescript-eslint/eslint-plugin`、`eslint-plugin-vue` 三个依赖提供的全部规则，共 680 条，开关状态取自本项目 `eslint.config.js` 的解析结果：已开启 217 条、未开启 463 条。
>
> 「开启」表示规则在本项目中生效（含 `error` 与 `warn` 两级，因 `lint` 脚本带 `--max-warnings 0`，`warn` 同样会中断校验）；「关闭」表示未被任何配置启用（含被 `eslint-config-prettier` 关闭的格式类规则）；「开启（仅 …）」表示该规则只对列出的文件类型生效。标注「已废弃」的规则可能在后续版本中被移除。

| 规则名称 | 规则是否开启 | 规则详细描述 |
| --- | --- | --- |
| `constructor-super` | 开启（仅 JS） | 要求构造函数中调用 super() |
| `eqeqeq` | 开启 | 要求使用 === 和 !== |
| `for-direction` | 开启 | 强制 for 循环的计数器朝正确方向更新 |
| `getter-return` | 开启（仅 JS） | 强制 getter 中有 return 语句 |
| `no-async-promise-executor` | 开启 | 禁止将 async 函数用作 Promise 执行器 |
| `no-case-declarations` | 开启 | 禁止在 case 分支中声明词法变量 |
| `no-class-assign` | 开启（仅 JS） | 禁止修改类声明的成员 |
| `no-compare-neg-zero` | 开启 | 禁止与 -0 进行比较 |
| `no-cond-assign` | 开启 | 禁止条件表达式中出现赋值操作 |
| `no-console` | 开启 | 禁止使用 console |
| `no-const-assign` | 开启（仅 JS） | 禁止修改 const 声明的变量 |
| `no-constant-binary-expression` | 开启 | 禁止运算结果不影响取值的表达式 |
| `no-constant-condition` | 开启 | 禁止条件中出现常量表达式 |
| `no-control-regex` | 开启 | 禁止正则表达式中出现控制字符 |
| `no-debugger` | 开启 | 禁止使用 debugger |
| `no-delete-var` | 开启 | 禁止删除变量 |
| `no-dupe-args` | 开启（仅 JS） | 禁止函数定义中出现重复参数 |
| `no-dupe-class-members` | 开启（仅 JS） | 禁止类成员重复定义 |
| `no-dupe-else-if` | 开启 | 禁止 if-else-if 链中出现重复条件 |
| `no-dupe-keys` | 开启（仅 JS） | 禁止对象字面量中出现重复键 |
| `no-duplicate-case` | 开启 | 禁止 case 标签重复 |
| `no-empty` | 开启 | 禁止空语句块 |
| `no-empty-character-class` | 开启 | 禁止正则中出现空字符类 |
| `no-empty-pattern` | 开启 | 禁止空的解构模式 |
| `no-empty-static-block` | 开启 | 禁止空的静态代码块 |
| `no-ex-assign` | 开启 | 禁止对 catch 子句的异常参数重新赋值 |
| `no-extra-boolean-cast` | 开启 | 禁止不必要的布尔类型转换 |
| `no-fallthrough` | 开启 | 禁止 case 语句落空穿透 |
| `no-func-assign` | 开启（仅 JS） | 禁止修改 function 声明 |
| `no-global-assign` | 开启 | 禁止对原生对象或只读全局变量赋值 |
| `no-import-assign` | 开启（仅 JS） | 禁止对导入的绑定赋值 |
| `no-invalid-regexp` | 开启 | 禁止 RegExp 构造函数中出现无效正则 |
| `no-irregular-whitespace` | 开启 | 禁止使用不规则的空白字符 |
| `no-loss-of-precision` | 开启 | 禁止会丢失精度的数字字面量 |
| `no-misleading-character-class` | 开启 | 禁止在字符类中使用由多码点组成的字符 |
| `no-new-native-nonconstructor` | 开启（仅 JS） | 禁止对全局非构造函数使用 new |
| `no-nonoctal-decimal-escape` | 开启 | 禁止字符串中使用 \8 和 \9 转义序列 |
| `no-obj-calls` | 开启（仅 JS） | 禁止将全局对象的属性当函数调用 |
| `no-octal` | 开启 | 禁止八进制字面量 |
| `no-prototype-builtins` | 开启 | 禁止直接在对象上调用 Object.prototype 的方法 |
| `no-redeclare` | 开启（仅 JS） | 禁止变量重复声明 |
| `no-regex-spaces` | 开启 | 禁止正则中使用多个连续空格 |
| `no-restricted-imports` | 开启 | 禁止导入指定模块 |
| `no-self-assign` | 开启 | 禁止自我赋值 |
| `no-setter-return` | 开启（仅 JS） | 禁止 setter 返回值 |
| `no-shadow-restricted-names` | 开启 | 禁止标识符遮蔽受限名称 |
| `no-sparse-arrays` | 开启 | 禁止使用稀疏数组 |
| `no-this-before-super` | 开启（仅 JS） | 禁止在调用 super() 之前使用 this 或 super |
| `no-unassigned-vars` | 开启 | 禁止声明后从未被赋值却被读取的 let 或 var 变量 |
| `no-undef` | 开启（仅 JS） | 禁止使用未声明的变量 |
| `no-unreachable` | 开启（仅 JS） | 禁止 return、throw、continue、break 之后的不可达代码 |
| `no-unsafe-finally` | 开启 | 禁止在 finally 块中使用控制流语句 |
| `no-unsafe-negation` | 开启（仅 JS） | 禁止对关系运算符的左操作数使用否定运算 |
| `no-unsafe-optional-chaining` | 开启 | 禁止在不允许 undefined 的场景使用可选链 |
| `no-unused-labels` | 开启 | 禁止未使用的标签 |
| `no-unused-private-class-members` | 开启 | 禁止未使用的私有类成员 |
| `no-unused-vars` | 开启（仅 JS） | 禁止未使用的变量 |
| `no-useless-assignment` | 开启 | 禁止赋值后从未被使用的多余赋值 |
| `no-useless-backreference` | 开启 | 禁止正则中无用的反向引用 |
| `no-useless-catch` | 开启 | 禁止不必要的 catch 子句 |
| `no-useless-escape` | 开启 | 禁止不必要的转义字符 |
| `no-var` | 开启（仅 TS/TSX/Vue） | 要求使用 let 或 const 而不是 var |
| `no-with` | 开启（仅 JS） | 禁止使用 with 语句 |
| `prefer-const` | 开启（仅 TS/TSX/Vue） | 要求声明后从未重新赋值的变量使用 const |
| `prefer-rest-params` | 开启（仅 TS/TSX/Vue） | 要求使用剩余参数而不是 arguments |
| `prefer-spread` | 开启（仅 TS/TSX/Vue） | 要求使用扩展运算符而不是 .apply() |
| `preserve-caught-error` | 开启 | 禁止在重新抛出错误时丢失原始错误信息 |
| `require-yield` | 开启 | 要求生成器函数中包含 yield |
| `use-isnan` | 开启 | 要求检查 NaN 时使用 isNaN() |
| `valid-typeof` | 开启 | 强制 typeof 表达式与有效字符串比较 |
| `@typescript-eslint/array-type` | 开启（仅 TS/TSX/Vue） | 要求一致地使用 T[] 或 Array&lt;T&gt; 表示数组类型 |
| `@typescript-eslint/await-thenable` | 开启（仅 TS/TSX/Vue） | 禁止对非 Thenable 的值使用 await |
| `@typescript-eslint/ban-ts-comment` | 开启（仅 TS/TSX/Vue） | 禁止使用 @ts- 指令注释，或要求指令后添加说明 |
| `@typescript-eslint/consistent-type-definitions` | 开启（仅 TS/TSX/Vue） | 强制类型定义统一使用 interface 或 type |
| `@typescript-eslint/consistent-type-exports` | 开启（仅 TS/TSX/Vue） | 强制导出类型时使用一致的写法 |
| `@typescript-eslint/consistent-type-imports` | 开启（仅 TS/TSX/Vue） | 强制导入类型时使用一致的写法 |
| `@typescript-eslint/explicit-module-boundary-types` | 开启（仅 TS/TSX/Vue） | 要求导出的函数及类的公有方法显式声明参数与返回类型 |
| `@typescript-eslint/naming-convention` | 开启（仅 TS/TSX/Vue） | 强制整个代码库的命名规范 |
| `@typescript-eslint/no-array-constructor` | 开启（仅 TS/TSX/Vue） | 禁止使用泛型 Array 构造函数 |
| `@typescript-eslint/no-duplicate-enum-values` | 开启（仅 TS/TSX/Vue） | 禁止枚举成员的值重复 |
| `@typescript-eslint/no-empty-object-type` | 开启（仅 TS/TSX/Vue） | 禁止无意中使用空对象类型 |
| `@typescript-eslint/no-explicit-any` | 开启（仅 TS/TSX/Vue） | 禁止使用 any 类型 |
| `@typescript-eslint/no-extra-non-null-assertion` | 开启（仅 TS/TSX/Vue） | 禁止多余的非空断言 |
| `@typescript-eslint/no-floating-promises` | 开启（仅 TS/TSX/Vue） | 要求正确处理返回 Promise 的语句 |
| `@typescript-eslint/no-misused-new` | 开启（仅 TS/TSX/Vue） | 强制正确书写 new 和 constructor |
| `@typescript-eslint/no-misused-promises` | 开启（仅 TS/TSX/Vue） | 禁止在不处理 Promise 的位置使用 Promise |
| `@typescript-eslint/no-namespace` | 开启（仅 TS/TSX/Vue） | 禁止使用 TypeScript 命名空间 |
| `@typescript-eslint/no-non-null-asserted-optional-chain` | 开启（仅 TS/TSX/Vue） | 禁止在可选链表达式之后使用非空断言 |
| `@typescript-eslint/no-non-null-assertion` | 开启（仅 TS/TSX/Vue） | 禁止使用叹号后缀运算符进行非空断言 |
| `@typescript-eslint/no-require-imports` | 开启（仅 TS/TSX/Vue） | 禁止调用 require() |
| `@typescript-eslint/no-this-alias` | 开启（仅 TS/TSX/Vue） | 禁止给 this 起别名 |
| `@typescript-eslint/no-unnecessary-condition` | 开启（仅 TS/TSX/Vue） | 禁止类型恒为真或恒为假的条件判断 |
| `@typescript-eslint/no-unnecessary-type-assertion` | 开启（仅 TS/TSX/Vue） | 禁止不改变表达式类型的类型断言 |
| `@typescript-eslint/no-unnecessary-type-constraint` | 开启（仅 TS/TSX/Vue） | 禁止在泛型上添加不必要的约束 |
| `@typescript-eslint/no-unsafe-declaration-merging` | 开启（仅 TS/TSX/Vue） | 禁止不安全的声明合并 |
| `@typescript-eslint/no-unsafe-function-type` | 开启（仅 TS/TSX/Vue） | 禁止使用不安全的 Function 内置类型 |
| `@typescript-eslint/no-unused-expressions` | 开启（仅 TS/TSX/Vue） | 禁止无用的表达式 |
| `@typescript-eslint/no-unused-vars` | 开启（仅 TS/TSX/Vue） | 禁止未使用的变量 |
| `@typescript-eslint/no-wrapper-object-types` | 开启（仅 TS/TSX/Vue） | 禁止使用易混淆的内置原始类型包装对象 |
| `@typescript-eslint/only-throw-error` | 开启（仅 TS/TSX/Vue） | 禁止抛出非 Error 的值作为异常 |
| `@typescript-eslint/prefer-as-const` | 开启（仅 TS/TSX/Vue） | 要求使用 as const 而不是字面量类型 |
| `@typescript-eslint/prefer-namespace-keyword` | 开启（仅 TS/TSX/Vue） | 要求使用 namespace 而不是 module 声明自定义 TypeScript 模块 |
| `@typescript-eslint/prefer-nullish-coalescing` | 开启（仅 TS/TSX/Vue） | 要求使用空值合并运算符而不是逻辑或等写法 |
| `@typescript-eslint/prefer-optional-chain` | 开启（仅 TS/TSX/Vue） | 要求使用简洁的可选链表达式而不是链式逻辑与或否定逻辑或 |
| `@typescript-eslint/restrict-template-expressions` | 开启（仅 TS/TSX/Vue） | 要求模板字符串中的表达式为 string 类型 |
| `@typescript-eslint/switch-exhaustiveness-check` | 开启（仅 TS/TSX/Vue） | 要求 switch 语句穷尽所有分支 |
| `@typescript-eslint/triple-slash-reference` | 开启（仅 TS/TSX/Vue） | 禁止某些三斜线指令，改用 ES6 风格的 import 声明 |
| `vue/attribute-hyphenation` | 开启 | 强制自定义组件属性的命名风格（短横线或驼峰） |
| `vue/attributes-order` | 开启 | 强制模板中属性的书写顺序 |
| `vue/block-order` | 开启 | 强制组件顶层块的顺序 |
| `vue/comment-directive` | 开启（仅 Vue） | 支持模板中的注释指令（如 eslint-disable） |
| `vue/component-definition-name-casing` | 开启 | 强制组件定义名称的大小写风格 |
| `vue/component-name-in-template-casing` | 开启（仅 Vue） | 强制模板中组件名的大小写风格 |
| `vue/define-macros-order` | 开启（仅 Vue） | 强制编译器宏（defineProps、defineEmits 等）的顺序 |
| `vue/first-attribute-linebreak` | 开启 | 强制第一个属性的位置 |
| `vue/jsx-uses-vars` | 开启（仅 Vue） | 防止 JSX 中使用的变量被误判为未使用 |
| `vue/multi-word-component-names` | 开启 | 要求组件名必须是多个单词 |
| `vue/no-arrow-functions-in-watch` | 开启 | 禁止使用箭头函数定义侦听器 |
| `vue/no-async-in-computed-properties` | 开启 | 禁止在计算属性中使用异步操作 |
| `vue/no-child-content` | 开启 | 禁止元素子内容被 v-html 或 v-text 等指令覆盖 |
| `vue/no-computed-properties-in-data` | 开启 | 禁止在 data 中访问计算属性 |
| `vue/no-deprecated-data-object-declaration` | 开启 | 禁止使用已废弃的 data 对象声明写法（Vue 3 起） |
| `vue/no-deprecated-delete-set` | 开启 | 禁止使用已废弃的 $delete 和 $set（Vue 3 起） |
| `vue/no-deprecated-destroyed-lifecycle` | 开启 | 禁止使用已废弃的 destroyed 和 beforeDestroy 钩子（Vue 3 起） |
| `vue/no-deprecated-dollar-listeners-api` | 开启 | 禁止使用已废弃的 $listeners（Vue 3 起） |
| `vue/no-deprecated-dollar-scopedslots-api` | 开启 | 禁止使用已废弃的 $scopedSlots（Vue 3 起） |
| `vue/no-deprecated-events-api` | 开启 | 禁止使用已废弃的事件 API（Vue 3 起） |
| `vue/no-deprecated-filter` | 开启 | 禁止使用已废弃的过滤器语法（Vue 3 起） |
| `vue/no-deprecated-functional-template` | 开启 | 禁止使用已废弃的 functional 模板（Vue 3 起） |
| `vue/no-deprecated-html-element-is` | 开启 | 禁止在 HTML 元素上使用已废弃的 is 属性（Vue 3 起） |
| `vue/no-deprecated-inline-template` | 开启 | 禁止使用已废弃的 inline-template 属性（Vue 3 起） |
| `vue/no-deprecated-model-definition` | 开启 | 禁止使用已废弃的 model 定义（Vue 3 起） |
| `vue/no-deprecated-props-default-this` | 开启 | 禁止在 props 默认值函数中使用已废弃的 this（Vue 3 起） |
| `vue/no-deprecated-router-link-tag-prop` | 开启 | 禁止使用 RouterLink 上已废弃的 tag 属性（Vue 3 起） |
| `vue/no-deprecated-scope-attribute` | 开启 | 禁止使用已废弃的 scope 属性（Vue 2.5 起） |
| `vue/no-deprecated-slot-attribute` | 开启 | 禁止使用已废弃的 slot 属性（Vue 2.6 起） |
| `vue/no-deprecated-slot-scope-attribute` | 开启 | 禁止使用已废弃的 slot-scope 属性（Vue 2.6 起） |
| `vue/no-deprecated-v-bind-sync` | 开启 | 禁止使用 v-bind 上已废弃的 .sync 修饰符（Vue 3 起） |
| `vue/no-deprecated-v-is` | 开启 | 禁止使用已废弃的 v-is 指令（Vue 3.1 起） |
| `vue/no-deprecated-v-on-native-modifier` | 开启 | 禁止使用已废弃的 .native 修饰符（Vue 3 起） |
| `vue/no-deprecated-v-on-number-modifiers` | 开启 | 禁止使用已废弃的数字（键码）修饰符（Vue 3 起） |
| `vue/no-deprecated-vue-config-keycodes` | 开启 | 禁止使用已废弃的 Vue.config.keyCodes（Vue 3 起） |
| `vue/no-dupe-keys` | 开启 | 禁止字段名重复 |
| `vue/no-dupe-v-else-if` | 开启 | 禁止 v-if 与 v-else-if 链中出现重复条件 |
| `vue/no-duplicate-attributes` | 开启 | 禁止属性重复 |
| `vue/no-export-in-script-setup` | 开启 | 禁止在 `<script setup>` 中使用 export |
| `vue/no-expose-after-await` | 开启 | 禁止在异步操作之后注册 expose |
| `vue/no-lifecycle-after-await` | 开启 | 禁止在异步操作之后注册生命周期钩子 |
| `vue/no-lone-template` | 开启 | 禁止不必要的 `<template>` |
| `vue/no-multiple-slot-args` | 开启 | 禁止向作用域插槽传递多个参数 |
| `vue/no-mutating-props` | 开启 | 禁止修改组件 props |
| `vue/no-parsing-error` | 开启 | 禁止 `<template>` 中出现解析错误 |
| `vue/no-ref-as-operand` | 开启 | 禁止将 ref() 包装的值当作操作数使用 |
| `vue/no-required-prop-with-default` | 开启 | 要求带默认值的 prop 必须是可选的 |
| `vue/no-reserved-component-names` | 开启 | 禁止在组件定义中使用保留名称 |
| `vue/no-reserved-keys` | 开启 | 禁止覆盖保留键 |
| `vue/no-reserved-props` | 开启 | 禁止在 props 中使用保留名称 |
| `vue/no-shared-component-data` | 开启 | 要求组件的 data 必须是函数 |
| `vue/no-side-effects-in-computed-properties` | 开启 | 禁止在计算属性中产生副作用 |
| `vue/no-template-key` | 开启 | 禁止在 `<template>` 上使用 key 属性 |
| `vue/no-template-shadow` | 开启 | 禁止模板中的变量声明遮蔽外层作用域变量 |
| `vue/no-textarea-mustache` | 开启 | 禁止在 `<textarea>` 中使用插值 |
| `vue/no-undef-components` | 开启（仅 Vue） | 禁止在 `<template>` 中使用未定义的组件 |
| `vue/no-unused-components` | 开启 | 禁止注册但未在模板中使用的组件 |
| `vue/no-unused-emit-declarations` | 开启（仅 Vue） | 禁止未使用的 emits 声明 |
| `vue/no-unused-vars` | 开启 | 禁止 v-for 指令或作用域属性中未使用的变量定义 |
| `vue/no-use-computed-property-like-method` | 开启 | 禁止把计算属性当作方法调用 |
| `vue/no-use-v-if-with-v-for` | 开启 | 禁止在同一元素上同时使用 v-if 与 v-for |
| `vue/no-useless-template-attributes` | 开启 | 禁止在 `<template>` 上使用无意义的属性 |
| `vue/no-v-for-template-key-on-child` | 开启 | 禁止将 `<template v-for>` 的 key 放在子元素上 |
| `vue/no-v-html` | 开启 | 禁止使用 v-html 以防 XSS 攻击 |
| `vue/no-v-text-v-html-on-component` | 开启 | 禁止在组件上使用 v-text 或 v-html |
| `vue/no-watch-after-await` | 开启 | 禁止在异步操作之后注册 watch |
| `vue/one-component-per-file` | 开启 | 强制每个文件只包含一个组件 |
| `vue/order-in-components` | 开启 | 强制组件中属性的顺序 |
| `vue/prefer-import-from-vue` | 开启 | 要求从 vue 导入而不是从 @vue 子包导入 |
| `vue/prop-name-casing` | 开启 | 强制组件中 prop 名的命名风格 |
| `vue/require-component-is` | 开启 | 要求 `<component>` 元素使用 v-bind:is |
| `vue/require-default-prop` | 开启 | 要求 prop 提供默认值 |
| `vue/require-explicit-emits` | 开启 | 要求为 $emit() 触发的事件声明 emits 选项 |
| `vue/require-prop-type-constructor` | 开启 | 要求 prop 类型使用构造函数 |
| `vue/require-prop-types` | 开启 | 要求 props 提供类型定义 |
| `vue/require-render-return` | 开启 | 要求渲染函数始终返回值 |
| `vue/require-slots-as-functions` | 开启 | 要求 $slots 的属性以函数方式使用 |
| `vue/require-toggle-inside-transition` | 开启 | 要求 `<transition>` 内部内容显式控制显示 |
| `vue/require-v-for-key` | 开启 | 要求 v-for 指令配合 v-bind:key |
| `vue/require-valid-default-prop` | 开启 | 要求 props 的默认值合法 |
| `vue/return-in-computed-property` | 开启 | 要求计算属性中存在 return 语句 |
| `vue/return-in-emits-validator` | 开启 | 要求 emits 校验函数中存在 return 语句 |
| `vue/this-in-template` | 开启 | 禁止在模板中使用 this |
| `vue/use-v-on-exact` | 开启 | 要求 v-on 使用 exact 修饰符 |
| `vue/v-bind-style` | 开启 | 强制 v-bind 指令的写法风格 |
| `vue/v-on-event-hyphenation` | 开启 | 强制模板中自定义组件 v-on 事件名的命名风格 |
| `vue/v-on-style` | 开启 | 强制 v-on 指令的写法风格 |
| `vue/v-slot-style` | 开启 | 强制 v-slot 指令的写法风格 |
| `vue/valid-attribute-name` | 开启 | 要求属性名合法 |
| `vue/valid-define-emits` | 开启 | 强制 defineEmits 编译宏的合法用法 |
| `vue/valid-define-options` | 开启 | 强制 defineOptions 编译宏的合法用法 |
| `vue/valid-define-props` | 开启 | 强制 defineProps 编译宏的合法用法 |
| `vue/valid-next-tick` | 开启 | 强制 nextTick 函数调用的合法用法 |
| `vue/valid-template-root` | 开启 | 强制模板根节点的合法写法 |
| `vue/valid-v-bind` | 开启 | 强制 v-bind 指令的合法用法 |
| `vue/valid-v-cloak` | 开启 | 强制 v-cloak 指令的合法用法 |
| `vue/valid-v-else` | 开启 | 强制 v-else 指令的合法用法 |
| `vue/valid-v-else-if` | 开启 | 强制 v-else-if 指令的合法用法 |
| `vue/valid-v-for` | 开启 | 强制 v-for 指令的合法用法 |
| `vue/valid-v-html` | 开启 | 强制 v-html 指令的合法用法 |
| `vue/valid-v-if` | 开启 | 强制 v-if 指令的合法用法 |
| `vue/valid-v-is` | 开启 | 强制 v-is 指令的合法用法 |
| `vue/valid-v-memo` | 开启 | 强制 v-memo 指令的合法用法 |
| `vue/valid-v-model` | 开启 | 强制 v-model 指令的合法用法 |
| `vue/valid-v-on` | 开启 | 强制 v-on 指令的合法用法 |
| `vue/valid-v-once` | 开启 | 强制 v-once 指令的合法用法 |
| `vue/valid-v-pre` | 开启 | 强制 v-pre 指令的合法用法 |
| `vue/valid-v-show` | 开启 | 强制 v-show 指令的合法用法 |
| `vue/valid-v-slot` | 开启 | 强制 v-slot 指令的合法用法 |
| `vue/valid-v-text` | 开启 | 强制 v-text 指令的合法用法 |
| `accessor-pairs` | 关闭 | 强制对象或类中的 getter 与 setter 成对出现 |
| `array-bracket-newline` | 关闭 | 已废弃。强制数组方括号内换行 |
| `array-bracket-spacing` | 关闭 | 已废弃。强制数组方括号内的空格一致 |
| `array-callback-return` | 关闭 | 强制数组方法的回调函数中使用 return 语句 |
| `array-element-newline` | 关闭 | 已废弃。强制数组元素之间换行 |
| `arrow-body-style` | 关闭 | 要求箭头函数体使用大括号 |
| `arrow-parens` | 关闭 | 已废弃。要求箭头函数参数使用括号 |
| `arrow-spacing` | 关闭 | 已废弃。强制箭头函数箭头前后的空格一致 |
| `block-scoped-var` | 关闭 | 强制变量在其定义的作用域内使用 |
| `block-spacing` | 关闭 | 已废弃。禁止或强制块内首尾空格 |
| `brace-style` | 关闭 | 已废弃。强制代码块使用一致的大括号风格 |
| `callback-return` | 关闭 | 已废弃。要求回调之后使用 return 语句 |
| `camelcase` | 关闭 | 强制使用驼峰命名法 |
| `capitalized-comments` | 关闭 | 强制或禁止注释首字母大写 |
| `class-methods-use-this` | 关闭 | 强制类方法使用 this |
| `comma-dangle` | 关闭 | 已废弃。要求或禁止尾随逗号 |
| `comma-spacing` | 关闭 | 已废弃。强制逗号前后的空格一致 |
| `comma-style` | 关闭 | 已废弃。强制一致的逗号风格 |
| `complexity` | 关闭 | 强制圈复杂度上限 |
| `computed-property-spacing` | 关闭 | 已废弃。强制计算属性方括号内的空格一致 |
| `consistent-return` | 关闭 | 要求 return 语句要么总是返回值要么总不返回 |
| `consistent-this` | 关闭 | 强制捕获当前执行上下文时使用一致的命名 |
| `curly` | 关闭 | 强制所有控制语句使用一致的大括号风格 |
| `default-case` | 关闭 | 要求 switch 语句中有 default 分支 |
| `default-case-last` | 关闭 | 要求 default 分支放在 switch 最后 |
| `default-param-last` | 关闭 | 强制默认参数放在最后 |
| `dot-location` | 关闭 | 已废弃。强制点号前后的换行一致 |
| `dot-notation` | 关闭 | 尽可能使用点号访问属性 |
| `eol-last` | 关闭 | 已废弃。要求或禁止文件末尾保留换行 |
| `func-call-spacing` | 关闭 | 已废弃。要求或禁止函数名与调用之间的空格 |
| `func-name-matching` | 关闭 | 要求函数名与赋值给的变量或属性名一致 |
| `func-names` | 关闭 | 要求或禁止函数表达式有名字 |
| `func-style` | 关闭 | 强制一致地使用函数声明或函数表达式 |
| `function-call-argument-newline` | 关闭 | 已废弃。强制函数调用参数之间的换行 |
| `function-paren-newline` | 关闭 | 已废弃。强制函数括号内换行一致 |
| `generator-star-spacing` | 关闭 | 已废弃。强制生成器函数中星号前后的空格一致 |
| `global-require` | 关闭 | 已废弃。要求 require() 调用放在模块顶层 |
| `grouped-accessor-pairs` | 关闭 | 要求对象字面量或类中的存取器成对分组 |
| `guard-for-in` | 关闭 | 要求 for-in 循环包含 if 语句 |
| `handle-callback-err` | 关闭 | 已废弃。要求回调函数中处理错误 |
| `id-blacklist` | 关闭 | 已废弃。禁止使用指定标识符 |
| `id-denylist` | 关闭 | 禁止使用指定标识符 |
| `id-length` | 关闭 | 强制标识符的最小和最大长度 |
| `id-match` | 关闭 | 要求标识符匹配指定正则表达式 |
| `implicit-arrow-linebreak` | 关闭 | 已废弃。强制箭头函数体的位置 |
| `indent` | 关闭 | 已废弃。强制一致的缩进 |
| `indent-legacy` | 关闭 | 已废弃。强制一致的缩进（旧版实现） |
| `init-declarations` | 关闭 | 要求或禁止变量声明时初始化 |
| `jsx-quotes` | 关闭 | 已废弃。强制 JSX 属性使用一致的单引号或双引号 |
| `key-spacing` | 关闭 | 已废弃。强制对象属性键值之间的空格一致 |
| `keyword-spacing` | 关闭 | 已废弃。强制关键字前后的空格一致 |
| `line-comment-position` | 关闭 | 已废弃。强制单行注释的位置 |
| `linebreak-style` | 关闭 | 已废弃。强制一致的换行符风格 |
| `lines-around-comment` | 关闭 | 已废弃。要求注释周围有空行 |
| `lines-around-directive` | 关闭 | 已废弃。要求或禁止指令前后有换行 |
| `lines-between-class-members` | 关闭 | 已废弃。要求或禁止类成员之间有空行 |
| `logical-assignment-operators` | 关闭 | 要求或禁止使用逻辑赋值运算符简写 |
| `max-classes-per-file` | 关闭 | 强制单个文件中的类数量上限 |
| `max-depth` | 关闭 | 强制代码块的最大嵌套深度 |
| `max-len` | 关闭 | 已废弃。强制单行最大长度 |
| `max-lines` | 关闭 | 强制单个文件的最大行数 |
| `max-lines-per-function` | 关闭 | 强制函数的最大行数 |
| `max-nested-callbacks` | 关闭 | 强制回调函数的最大嵌套深度 |
| `max-params` | 关闭 | 强制函数最多允许的参数个数 |
| `max-statements` | 关闭 | 强制函数块中最大语句数 |
| `max-statements-per-line` | 关闭 | 已废弃。强制单行最大语句数 |
| `multiline-comment-style` | 关闭 | 已废弃。强制多行注释使用特定风格 |
| `multiline-ternary` | 关闭 | 已废弃。强制三元表达式的操作数之间换行 |
| `new-cap` | 关闭 | 要求构造函数名以大写字母开头 |
| `new-parens` | 关闭 | 已废弃。要求或禁止无参构造函数调用时带括号 |
| `newline-after-var` | 关闭 | 已废弃。要求或禁止变量声明后有空行 |
| `newline-before-return` | 关闭 | 已废弃。要求在 return 语句前有空行 |
| `newline-per-chained-call` | 关闭 | 已废弃。要求链式调用每次调用后换行 |
| `no-alert` | 关闭 | 禁止使用 alert、confirm 和 prompt |
| `no-array-constructor` | 关闭 | 禁止使用 Array 构造函数 |
| `no-await-in-loop` | 关闭 | 禁止在循环中使用 await |
| `no-bitwise` | 关闭 | 禁止使用位运算符 |
| `no-buffer-constructor` | 关闭 | 已废弃。禁止使用 Buffer() 构造函数 |
| `no-caller` | 关闭 | 禁止使用 arguments.caller 或 arguments.callee |
| `no-catch-shadow` | 关闭 | 已废弃。禁止 catch 参数遮蔽外层作用域的变量 |
| `no-confusing-arrow` | 关闭 | 已废弃。禁止使用易被误认为比较的箭头函数 |
| `no-constructor-return` | 关闭 | 禁止在构造函数中返回值 |
| `no-continue` | 关闭 | 禁止使用 continue 语句 |
| `no-div-regex` | 关闭 | 禁止正则表达式以等号开头 |
| `no-duplicate-imports` | 关闭 | 禁止重复导入同一模块 |
| `no-else-return` | 关闭 | 禁止 if 中 return 之后出现 else 块 |
| `no-empty-function` | 关闭 | 禁止空函数 |
| `no-eq-null` | 关闭 | 禁止未做类型检查就与 null 比较 |
| `no-eval` | 关闭 | 禁止使用 eval() |
| `no-extend-native` | 关闭 | 禁止扩展原生类型 |
| `no-extra-bind` | 关闭 | 禁止不必要的 .bind() 调用 |
| `no-extra-label` | 关闭 | 禁止不必要的标签 |
| `no-extra-parens` | 关闭 | 已废弃。禁止不必要的括号 |
| `no-extra-semi` | 关闭 | 已废弃。禁止不必要的分号 |
| `no-floating-decimal` | 关闭 | 已废弃。禁止数字字面量中使用前导或后置小数点 |
| `no-implicit-coercion` | 关闭 | 禁止隐式类型转换简写 |
| `no-implicit-globals` | 关闭 | 禁止在全局作用域中声明 |
| `no-implied-eval` | 关闭 | 禁止使用类似 eval() 的方法 |
| `no-inline-comments` | 关闭 | 禁止在代码后面写行内注释 |
| `no-inner-declarations` | 关闭 | 禁止在嵌套块中声明变量或函数 |
| `no-invalid-this` | 关闭 | 禁止在 this 为 undefined 的上下文中使用 this |
| `no-iterator` | 关闭 | 禁止使用 __iterator__ 属性 |
| `no-label-var` | 关闭 | 禁止标签与变量同名 |
| `no-labels` | 关闭 | 禁止使用标签语句 |
| `no-lone-blocks` | 关闭 | 禁止不必要的嵌套块 |
| `no-lonely-if` | 关闭 | 禁止 else 块中只有 if 语句 |
| `no-loop-func` | 关闭 | 禁止循环中出现包含不安全引用的函数声明 |
| `no-magic-numbers` | 关闭 | 禁止使用魔法数字 |
| `no-mixed-operators` | 关闭 | 已废弃。禁止混合使用不同的二元运算符 |
| `no-mixed-requires` | 关闭 | 已废弃。禁止 require 调用与普通变量声明混用 |
| `no-mixed-spaces-and-tabs` | 关闭 | 已废弃。禁止缩进时混用空格和制表符 |
| `no-multi-assign` | 关闭 | 禁止使用链式赋值表达式 |
| `no-multi-spaces` | 关闭 | 已废弃。禁止出现多个连续空格 |
| `no-multi-str` | 关闭 | 禁止使用多行字符串 |
| `no-multiple-empty-lines` | 关闭 | 已废弃。禁止出现多个连续空行 |
| `no-native-reassign` | 关闭 | 已废弃。禁止对原生对象赋值 |
| `no-negated-condition` | 关闭 | 禁止使用否定条件 |
| `no-negated-in-lhs` | 关闭 | 已废弃。禁止在 in 表达式左侧使用否定运算 |
| `no-nested-ternary` | 关闭 | 禁止嵌套三元表达式 |
| `no-new` | 关闭 | 禁止在赋值或比较之外使用 new |
| `no-new-func` | 关闭 | 禁止使用 new Function |
| `no-new-object` | 关闭 | 已废弃。禁止使用 Object 构造函数 |
| `no-new-require` | 关闭 | 已废弃。禁止对 require 调用使用 new |
| `no-new-symbol` | 关闭 | 已废弃。禁止对 Symbol 使用 new |
| `no-new-wrappers` | 关闭 | 禁止对 String、Number、Boolean 使用 new |
| `no-object-constructor` | 关闭 | 禁止无参调用 Object 构造函数 |
| `no-octal-escape` | 关闭 | 禁止字符串中使用八进制转义序列 |
| `no-param-reassign` | 关闭 | 禁止重新赋值函数参数 |
| `no-path-concat` | 关闭 | 已废弃。禁止用字符串拼接 __dirname 和 __filename |
| `no-plusplus` | 关闭 | 禁止使用一元运算符 ++ 和 -- |
| `no-process-env` | 关闭 | 已废弃。禁止使用 process.env |
| `no-process-exit` | 关闭 | 已废弃。禁止使用 process.exit() |
| `no-promise-executor-return` | 关闭 | 禁止在 Promise 执行器中返回值 |
| `no-proto` | 关闭 | 禁止使用 __proto__ 属性 |
| `no-restricted-exports` | 关闭 | 禁止导出指定名称 |
| `no-restricted-globals` | 关闭 | 禁用指定的全局变量 |
| `no-restricted-modules` | 关闭 | 已废弃。禁止在 require 中加载指定模块 |
| `no-restricted-properties` | 关闭 | 禁止使用某些对象上的特定属性 |
| `no-restricted-syntax` | 关闭 | 禁用指定的语法 |
| `no-return-assign` | 关闭 | 禁止在 return 语句中使用赋值 |
| `no-return-await` | 关闭 | 已废弃。禁止不必要的 return await |
| `no-script-url` | 关闭 | 禁止使用 javascript: URL |
| `no-self-compare` | 关闭 | 禁止自我比较 |
| `no-sequences` | 关闭 | 禁止使用逗号运算符 |
| `no-shadow` | 关闭 | 禁止变量声明遮蔽外层作用域中的变量 |
| `no-spaced-func` | 关闭 | 已废弃。禁止函数名与调用之间存在空格 |
| `no-sync` | 关闭 | 已废弃。禁止使用同步方法 |
| `no-tabs` | 关闭 | 已废弃。禁止使用制表符 |
| `no-template-curly-in-string` | 关闭 | 禁止在普通字符串中使用模板占位符语法 |
| `no-ternary` | 关闭 | 禁止使用三元运算符 |
| `no-throw-literal` | 关闭 | 禁止抛出字面量作为异常 |
| `no-trailing-spaces` | 关闭 | 已废弃。禁止行尾出现空白字符 |
| `no-undef-init` | 关闭 | 禁止将变量初始化为 undefined |
| `no-undefined` | 关闭 | 禁止将 undefined 用作标识符 |
| `no-underscore-dangle` | 关闭 | 禁止标识符中使用悬空下划线 |
| `no-unexpected-multiline` | 关闭 | 禁止容易产生歧义的多行表达式 |
| `no-unmodified-loop-condition` | 关闭 | 禁止循环条件在循环中未被修改 |
| `no-unneeded-ternary` | 关闭 | 禁止可以简化的三元表达式 |
| `no-unreachable-loop` | 关闭 | 禁止最多只执行一次的循环 |
| `no-unused-expressions` | 关闭 | 禁止无用的表达式 |
| `no-use-before-define` | 关闭 | 禁止在变量定义之前使用它 |
| `no-useless-call` | 关闭 | 禁止不必要的 .call() 和 .apply() 调用 |
| `no-useless-computed-key` | 关闭 | 禁止对象和类中不必要的计算属性键 |
| `no-useless-concat` | 关闭 | 禁止不必要的字面量或模板字符串拼接 |
| `no-useless-constructor` | 关闭 | 禁止不必要的构造函数 |
| `no-useless-rename` | 关闭 | 禁止将导入、导出和解构赋值重命名为同名 |
| `no-useless-return` | 关闭 | 禁止多余的 return 语句 |
| `no-void` | 关闭 | 禁止使用 void 运算符 |
| `no-warning-comments` | 关闭 | 禁止注释中出现指定的警告词 |
| `no-whitespace-before-property` | 关闭 | 已废弃。禁止属性名之前出现空白 |
| `nonblock-statement-body-position` | 关闭 | 已废弃。强制单行语句的位置 |
| `object-curly-newline` | 关闭 | 已废弃。强制对象大括号内的换行一致 |
| `object-curly-spacing` | 关闭 | 已废弃。强制大括号内的空格一致 |
| `object-property-newline` | 关闭 | 已废弃。强制对象属性分行书写 |
| `object-shorthand` | 关闭 | 要求或禁止对象字面量使用方法和属性简写语法 |
| `one-var` | 关闭 | 强制函数中的变量一起声明或分别声明 |
| `one-var-declaration-per-line` | 关闭 | 已废弃。要求或禁止变量声明换行 |
| `operator-assignment` | 关闭 | 要求或禁止使用赋值运算符简写 |
| `operator-linebreak` | 关闭 | 已废弃。强制运算符的换行风格一致 |
| `padded-blocks` | 关闭 | 已废弃。要求或禁止块内填充空行 |
| `padding-line-between-statements` | 关闭 | 已废弃。要求或禁止语句之间的空行 |
| `prefer-arrow-callback` | 关闭 | 要求回调函数使用箭头函数 |
| `prefer-destructuring` | 关闭 | 要求使用数组或对象解构 |
| `prefer-exponentiation-operator` | 关闭 | 禁止使用 Math.pow，改用幂运算符 |
| `prefer-named-capture-group` | 关闭 | 要求正则使用命名捕获组 |
| `prefer-numeric-literals` | 关闭 | 禁止使用 parseInt()，改用二、八、十六进制字面量 |
| `prefer-object-has-own` | 关闭 | 禁止使用 Object.prototype.hasOwnProperty.call()，改用 Object.hasOwn() |
| `prefer-object-spread` | 关闭 | 禁止 Object.assign 首参为对象字面量，改用对象展开 |
| `prefer-promise-reject-errors` | 关闭 | 要求 Promise 的拒绝原因使用 Error 对象 |
| `prefer-reflect` | 关闭 | 已废弃。要求使用 Reflect 方法 |
| `prefer-regex-literals` | 关闭 | 禁止使用 RegExp 构造函数，改用正则字面量 |
| `prefer-template` | 关闭 | 要求使用模板字符串而不是字符串拼接 |
| `quote-props` | 关闭 | 已废弃。要求对象字面量属性名加引号 |
| `quotes` | 关闭 | 已废弃。强制使用一致的反引号、双引号或单引号 |
| `radix` | 关闭 | 要求 parseInt() 使用进制参数 |
| `require-atomic-updates` | 关闭 | 禁止因 await 或 yield 导致竞态条件的赋值 |
| `require-await` | 关闭 | 禁止没有 await 表达式的 async 函数 |
| `require-unicode-regexp` | 关闭 | 要求正则使用 u 或 v 标志 |
| `rest-spread-spacing` | 关闭 | 已废弃。强制剩余和扩展运算符与其表达式之间的空格 |
| `semi` | 关闭 | 已废弃。要求或禁止使用分号而不是 ASI |
| `semi-spacing` | 关闭 | 已废弃。强制分号前后的空格一致 |
| `semi-style` | 关闭 | 已废弃。强制分号的位置 |
| `sort-imports` | 关闭 | 强制模块内的 import 声明排序 |
| `sort-keys` | 关闭 | 要求对象键按顺序排列 |
| `sort-vars` | 关闭 | 要求同一声明块内的变量按顺序排列 |
| `space-before-blocks` | 关闭 | 已废弃。强制代码块前的空格一致 |
| `space-before-function-paren` | 关闭 | 已废弃。强制函数定义左括号前的空格一致 |
| `space-in-parens` | 关闭 | 已废弃。强制圆括号内的空格一致 |
| `space-infix-ops` | 关闭 | 已废弃。要求中缀运算符周围有空格 |
| `space-unary-ops` | 关闭 | 已废弃。强制一元运算符前后的空格一致 |
| `spaced-comment` | 关闭 | 已废弃。强制注释中双斜线或块注释符号后有空格 |
| `strict` | 关闭 | 要求或禁止使用严格模式指令 |
| `switch-colon-spacing` | 关闭 | 已废弃。强制 switch 语句冒号周围的空格 |
| `symbol-description` | 关闭 | 要求创建 Symbol 时提供描述 |
| `template-curly-spacing` | 关闭 | 已废弃。要求或禁止模板字符串中嵌入表达式周围的空格 |
| `template-tag-spacing` | 关闭 | 已废弃。要求或禁止模板标签与字面量之间的空格 |
| `unicode-bom` | 关闭 | 要求或禁止使用 Unicode 字节顺序标记 |
| `vars-on-top` | 关闭 | 要求 var 声明放在其作用域顶部 |
| `wrap-iife` | 关闭 | 已废弃。要求立即执行函数表达式使用括号包裹 |
| `wrap-regex` | 关闭 | 已废弃。要求正则字面量使用括号包裹 |
| `yield-star-spacing` | 关闭 | 已废弃。要求或禁止 yield 星号表达式周围的空格 |
| `yoda` | 关闭 | 要求或禁止尤达条件 |
| `@typescript-eslint/adjacent-overload-signatures` | 关闭 | 要求函数重载签名连续排列 |
| `@typescript-eslint/ban-tslint-comment` | 关闭 | 禁止使用 // tslint: 规则开关注释 |
| `@typescript-eslint/class-literal-property-style` | 关闭 | 强制类上的字面量属性使用一致的暴露风格 |
| `@typescript-eslint/class-methods-use-this` | 关闭 | 强制类方法使用 this |
| `@typescript-eslint/consistent-generic-constructors` | 关闭 | 强制在类型注解或构造函数名上指定泛型实参 |
| `@typescript-eslint/consistent-indexed-object-style` | 关闭 | 要求统一使用 Record 类型或索引签名 |
| `@typescript-eslint/consistent-return` | 关闭 | 要求 return 语句要么总是返回值要么总不返回 |
| `@typescript-eslint/consistent-type-assertions` | 关闭 | 强制类型断言的使用方式一致 |
| `@typescript-eslint/default-param-last` | 关闭 | 强制默认参数放在最后 |
| `@typescript-eslint/dot-notation` | 关闭 | 尽可能使用点号访问属性 |
| `@typescript-eslint/explicit-function-return-type` | 关闭 | 要求函数和类方法显式声明返回类型 |
| `@typescript-eslint/explicit-member-accessibility` | 关闭 | 要求类属性和方法显式声明可访问性修饰符 |
| `@typescript-eslint/init-declarations` | 关闭 | 要求或禁止变量声明时初始化 |
| `@typescript-eslint/max-params` | 关闭 | 强制函数最多允许的参数个数 |
| `@typescript-eslint/member-ordering` | 关闭 | 要求类成员声明顺序一致 |
| `@typescript-eslint/method-signature-style` | 关闭 | 强制使用特定的方法签名语法 |
| `@typescript-eslint/no-array-delete` | 关闭 | 禁止对数组值使用 delete 运算符 |
| `@typescript-eslint/no-base-to-string` | 关闭 | 要求仅在字符串化结果有意义时调用 toString 和 toLocaleString |
| `@typescript-eslint/no-confusing-non-null-assertion` | 关闭 | 禁止在容易引起误解的位置使用非空断言 |
| `@typescript-eslint/no-confusing-void-expression` | 关闭 | 要求 void 类型的表达式出现在语句位置 |
| `@typescript-eslint/no-deprecated` | 关闭 | 禁止使用被标记为 @deprecated 的代码 |
| `@typescript-eslint/no-dupe-class-members` | 关闭 | 禁止类成员重复定义 |
| `@typescript-eslint/no-duplicate-type-constituents` | 关闭 | 禁止联合类型或交叉类型中出现重复成员 |
| `@typescript-eslint/no-dynamic-delete` | 关闭 | 禁止对计算属性名使用 delete 运算符 |
| `@typescript-eslint/no-empty-function` | 关闭 | 禁止空函数 |
| `@typescript-eslint/no-empty-interface` | 关闭 | 已废弃。禁止声明空接口 |
| `@typescript-eslint/no-extraneous-class` | 关闭 | 禁止将类当作命名空间使用 |
| `@typescript-eslint/no-for-in-array` | 关闭 | 禁止使用 for-in 遍历数组 |
| `@typescript-eslint/no-generated-empty-object-type` | 关闭 | 禁止求值结果为空对象类型的类型运算 |
| `@typescript-eslint/no-implied-eval` | 关闭 | 禁止使用类似 eval() 的函数 |
| `@typescript-eslint/no-import-type-side-effects` | 关闭 | 当导入仅含内联类型限定符时要求使用顶层 import type |
| `@typescript-eslint/no-inferrable-types` | 关闭 | 禁止为可推导出类型的变量或参数显式声明类型 |
| `@typescript-eslint/no-invalid-this` | 关闭 | 禁止在类或类式对象之外使用 this |
| `@typescript-eslint/no-invalid-void-type` | 关闭 | 禁止在泛型或返回类型之外使用 void 类型 |
| `@typescript-eslint/no-loop-func` | 关闭 | 已废弃。禁止循环中出现包含不安全引用的函数声明 |
| `@typescript-eslint/no-loss-of-precision` | 关闭 | 已废弃。禁止会丢失精度的数字字面量 |
| `@typescript-eslint/no-magic-numbers` | 关闭 | 禁止使用魔法数字 |
| `@typescript-eslint/no-meaningless-void-operator` | 关闭 | 禁止在丢弃值之外使用 void 运算符 |
| `@typescript-eslint/no-misused-spread` | 关闭 | 禁止在可能产生意外行为时使用扩展运算符 |
| `@typescript-eslint/no-mixed-enums` | 关闭 | 禁止枚举同时包含数字和字符串成员 |
| `@typescript-eslint/no-non-null-asserted-nullish-coalescing` | 关闭 | 禁止在空值合并运算符左侧使用非空断言 |
| `@typescript-eslint/no-redeclare` | 关闭 | 禁止变量重复声明 |
| `@typescript-eslint/no-redundant-type-constituents` | 关闭 | 禁止联合或交叉类型中出现无意义或覆盖类型信息的成员 |
| `@typescript-eslint/no-restricted-imports` | 关闭 | 已废弃。禁止导入指定模块 |
| `@typescript-eslint/no-restricted-types` | 关闭 | 禁止使用特定类型 |
| `@typescript-eslint/no-shadow` | 关闭 | 禁止变量声明遮蔽外层作用域中的变量 |
| `@typescript-eslint/no-type-alias` | 关闭 | 已废弃。禁止使用类型别名 |
| `@typescript-eslint/no-unnecessary-boolean-literal-compare` | 关闭 | 禁止与布尔字面量进行不必要的相等比较 |
| `@typescript-eslint/no-unnecessary-parameter-property-assignment` | 关闭 | 禁止构造函数中多余的参数属性赋值 |
| `@typescript-eslint/no-unnecessary-qualifier` | 关闭 | 禁止不必要的命名空间限定符 |
| `@typescript-eslint/no-unnecessary-template-expression` | 关闭 | 禁止不必要的模板表达式 |
| `@typescript-eslint/no-unnecessary-type-arguments` | 关闭 | 禁止使用与默认值相同的类型实参 |
| `@typescript-eslint/no-unnecessary-type-conversion` | 关闭 | 禁止不会改变类型或值的类型转换写法 |
| `@typescript-eslint/no-unnecessary-type-parameters` | 关闭 | 禁止只被使用一次的类型参数 |
| `@typescript-eslint/no-unsafe-argument` | 关闭 | 禁止向函数传入 any 类型的值 |
| `@typescript-eslint/no-unsafe-assignment` | 关闭 | 禁止将 any 类型的值赋给变量或属性 |
| `@typescript-eslint/no-unsafe-call` | 关闭 | 禁止调用 any 类型的值 |
| `@typescript-eslint/no-unsafe-enum-comparison` | 关闭 | 禁止将枚举值与非枚举值比较 |
| `@typescript-eslint/no-unsafe-member-access` | 关闭 | 禁止访问 any 类型值的成员 |
| `@typescript-eslint/no-unsafe-return` | 关闭 | 禁止从函数返回 any 类型的值 |
| `@typescript-eslint/no-unsafe-type-assertion` | 关闭 | 禁止会缩小类型的类型断言 |
| `@typescript-eslint/no-unsafe-unary-minus` | 关闭 | 要求一元取负运算符作用于数字 |
| `@typescript-eslint/no-unused-private-class-members` | 关闭 | 禁止未使用的私有类成员 |
| `@typescript-eslint/no-use-before-define` | 关闭 | 禁止在变量定义之前使用它 |
| `@typescript-eslint/no-useless-constructor` | 关闭 | 禁止不必要的构造函数 |
| `@typescript-eslint/no-useless-default-assignment` | 关闭 | 禁止永远不会被使用的默认值 |
| `@typescript-eslint/no-useless-empty-export` | 关闭 | 禁止不产生任何影响的空导出 |
| `@typescript-eslint/no-var-requires` | 关闭 | 已废弃。禁止在 import 语句之外使用 require |
| `@typescript-eslint/non-nullable-type-assertion-style` | 关闭 | 要求使用非空断言而不是显式类型断言 |
| `@typescript-eslint/parameter-properties` | 关闭 | 要求或禁止在类构造函数中使用参数属性 |
| `@typescript-eslint/prefer-destructuring` | 关闭 | 要求使用数组或对象解构 |
| `@typescript-eslint/prefer-enum-initializers` | 关闭 | 要求枚举成员显式初始化 |
| `@typescript-eslint/prefer-find` | 关闭 | 查找单个结果时要求使用 find 而不是 filter 后取第一项 |
| `@typescript-eslint/prefer-for-of` | 关闭 | 在可行时要求使用 for-of 循环而不是普通 for 循环 |
| `@typescript-eslint/prefer-function-type` | 关闭 | 要求使用函数类型而不是带调用签名的接口 |
| `@typescript-eslint/prefer-includes` | 关闭 | 要求使用 includes 而不是 indexOf |
| `@typescript-eslint/prefer-literal-enum-member` | 关闭 | 要求枚举成员都是字面量值 |
| `@typescript-eslint/prefer-promise-reject-errors` | 关闭 | 要求 Promise 的拒绝原因使用 Error 对象 |
| `@typescript-eslint/prefer-readonly` | 关闭 | 要求从未在构造函数外修改的私有成员标记为 readonly |
| `@typescript-eslint/prefer-readonly-parameter-types` | 关闭 | 要求函数参数类型为 readonly 以防意外修改入参 |
| `@typescript-eslint/prefer-reduce-type-parameter` | 关闭 | 要求调用 reduce 时使用类型参数而不是类型断言 |
| `@typescript-eslint/prefer-regexp-exec` | 关闭 | 未使用全局标志时要求使用 RegExp#exec 而不是 String#match |
| `@typescript-eslint/prefer-return-this-type` | 关闭 | 当仅返回 this 类型时要求使用 this 类型 |
| `@typescript-eslint/prefer-string-starts-ends-with` | 关闭 | 要求使用 startsWith 和 endsWith 检查子串 |
| `@typescript-eslint/prefer-ts-expect-error` | 关闭 | 已废弃。要求使用 @ts-expect-error 而不是 @ts-ignore |
| `@typescript-eslint/promise-function-async` | 关闭 | 要求返回 Promise 的函数或方法标记为 async |
| `@typescript-eslint/related-getter-setter-pairs` | 关闭 | 要求 get 的返回类型可赋值给对应 set 的参数类型 |
| `@typescript-eslint/require-array-sort-compare` | 关闭 | 要求调用数组 sort 和 toSorted 时提供比较函数 |
| `@typescript-eslint/require-await` | 关闭 | 禁止没有 await 表达式且不返回 Promise 的 async 函数 |
| `@typescript-eslint/restrict-plus-operands` | 关闭 | 要求加法两侧操作数类型相同且为 bigint、number 或 string |
| `@typescript-eslint/return-await` | 关闭 | 强制返回的 Promise 使用一致的 await 方式 |
| `@typescript-eslint/sort-type-constituents` | 关闭 | 已废弃。要求联合或交叉类型的成员按字母排序 |
| `@typescript-eslint/strict-boolean-expressions` | 关闭 | 禁止在布尔表达式中使用特定类型 |
| `@typescript-eslint/strict-void-return` | 关闭 | 禁止将带返回值的函数传入只接受 void 函数的位置 |
| `@typescript-eslint/typedef` | 关闭 | 已废弃。要求在特定位置添加类型注解 |
| `@typescript-eslint/unbound-method` | 关闭 | 强制未绑定方法在其预期作用域中被调用 |
| `@typescript-eslint/unified-signatures` | 关闭 | 禁止出现可以合并为一个重载的多个重载签名 |
| `@typescript-eslint/use-unknown-in-catch-callback-variable` | 关闭 | 要求 Promise 拒绝回调的参数类型为 unknown |
| `vue/array-bracket-newline` | 关闭 | 在 `<template>` 中强制数组方括号内换行 |
| `vue/array-bracket-spacing` | 关闭 | 在 `<template>` 中强制数组方括号内的空格一致 |
| `vue/array-element-newline` | 关闭 | 在 `<template>` 中强制数组元素之间换行 |
| `vue/arrow-spacing` | 关闭 | 在 `<template>` 中强制箭头函数箭头前后的空格一致 |
| `vue/block-lang` | 关闭 | 禁止使用可用 lang 之外的取值 |
| `vue/block-spacing` | 关闭 | 在 `<template>` 中禁止或强制块内首尾空格 |
| `vue/block-tag-newline` | 关闭 | 强制块级标签开始与结束处换行 |
| `vue/brace-style` | 关闭 | 在 `<template>` 中强制代码块使用一致的大括号风格 |
| `vue/camelcase` | 关闭 | 在 `<template>` 中强制使用驼峰命名法 |
| `vue/comma-dangle` | 关闭 | 在 `<template>` 中要求或禁止尾随逗号 |
| `vue/comma-spacing` | 关闭 | 在 `<template>` 中强制逗号前后的空格一致 |
| `vue/comma-style` | 关闭 | 在 `<template>` 中强制一致的逗号风格 |
| `vue/component-api-style` | 关闭 | 强制组件的 API 风格 |
| `vue/component-options-name-casing` | 关闭 | 强制 components 选项中组件名的大小写 |
| `vue/custom-event-name-casing` | 关闭 | 强制自定义事件名的命名风格 |
| `vue/define-emits-declaration` | 关闭 | 强制 defineEmits 的声明风格 |
| `vue/define-props-declaration` | 关闭 | 强制 defineProps 的声明风格 |
| `vue/define-props-destructuring` | 关闭 | 强制 props 解构使用一致的写法 |
| `vue/dot-location` | 关闭 | 在 `<template>` 中强制点号前后的换行一致 |
| `vue/dot-notation` | 关闭 | 在 `<template>` 中尽可能使用点号访问属性 |
| `vue/enforce-style-attribute` | 关闭 | 强制或禁止在顶层 style 标签使用 scoped 和 module 属性 |
| `vue/eqeqeq` | 关闭 | 在 `<template>` 中要求使用 === 和 !== |
| `vue/func-call-spacing` | 关闭 | 在 `<template>` 中要求或禁止函数名与调用之间的空格 |
| `vue/html-button-has-type` | 关闭 | 禁止使用未显式声明 type 属性的 button |
| `vue/html-closing-bracket-newline` | 关闭 | 要求或禁止标签闭合括号前换行 |
| `vue/html-closing-bracket-spacing` | 关闭 | 要求或禁止标签闭合括号前的空格 |
| `vue/html-comment-content-newline` | 关闭 | 强制 HTML 注释内容的换行统一 |
| `vue/html-comment-content-spacing` | 关闭 | 强制 HTML 注释内容的空格统一 |
| `vue/html-comment-indent` | 关闭 | 强制 HTML 注释的缩进一致 |
| `vue/html-end-tags` | 关闭 | 强制结束标签的书写风格 |
| `vue/html-indent` | 关闭 | 强制 `<template>` 中的缩进一致 |
| `vue/html-quotes` | 关闭 | 强制 HTML 属性的引号风格 |
| `vue/html-self-closing` | 关闭 | 强制自闭合标签风格 |
| `vue/key-spacing` | 关闭 | 在 `<template>` 中强制对象属性键值之间的空格一致 |
| `vue/keyword-spacing` | 关闭 | 在 `<template>` 中强制关键字前后的空格一致 |
| `vue/match-component-file-name` | 关闭 | 要求组件 name 与文件名一致 |
| `vue/match-component-import-name` | 关闭 | 要求注册的组件名与导入的组件名一致 |
| `vue/max-attributes-per-line` | 关闭 | 强制每行最多的属性个数 |
| `vue/max-len` | 关闭 | 强制 .vue 文件中单行的最大长度 |
| `vue/max-lines-per-block` | 关闭 | 强制 Vue 单文件组件中各块的最大行数 |
| `vue/max-props` | 关闭 | 强制组件的 props 数量上限 |
| `vue/max-template-depth` | 关闭 | 强制模板的最大嵌套深度 |
| `vue/multiline-html-element-content-newline` | 关闭 | 要求多行元素内容的开始与结束处换行 |
| `vue/multiline-ternary` | 关闭 | 在 `<template>` 中强制三元表达式的操作数之间换行 |
| `vue/mustache-interpolation-spacing` | 关闭 | 强制插值表达式内的空格统一 |
| `vue/new-line-between-multi-line-property` | 关闭 | 强制多行属性之间换行 |
| `vue/next-tick-style` | 关闭 | 强制 nextTick 使用 Promise 或回调风格 |
| `vue/no-bare-strings-in-template` | 关闭 | 禁止在 `<template>` 中直接使用裸字符串 |
| `vue/no-boolean-default` | 关闭 | 禁止布尔类型的默认值 |
| `vue/no-console` | 关闭 | 禁止在 `<template>` 中使用 console |
| `vue/no-constant-condition` | 关闭 | 禁止在 `<template>` 的条件中使用常量表达式 |
| `vue/no-custom-modifiers-on-v-model` | 关闭 | 禁止在组件上的 v-model 使用自定义修饰符 |
| `vue/no-duplicate-attr-inheritance` | 关闭 | 使用 v-bind="$attrs" 时要求将 inheritAttrs 设为 false |
| `vue/no-duplicate-class-names` | 关闭 | 禁止 class 属性中出现重复的类名 |
| `vue/no-empty-component-block` | 关闭 | 禁止空的 template、script、style 块 |
| `vue/no-empty-pattern` | 关闭 | 在 `<template>` 中禁止空的解构模式 |
| `vue/no-extra-parens` | 关闭 | 在 `<template>` 中禁止不必要的括号 |
| `vue/no-implicit-coercion` | 关闭 | 在 `<template>` 中禁止隐式类型转换简写 |
| `vue/no-import-compiler-macros` | 关闭 | 禁止导入 Vue 编译器宏 |
| `vue/no-irregular-whitespace` | 关闭 | 禁止 .vue 文件中出现不规则空白字符 |
| `vue/no-literals-in-template` | 关闭 | 禁止模板中使用对象、数组和函数字面量 |
| `vue/no-loss-of-precision` | 关闭 | 在 `<template>` 中禁止会丢失精度的数字字面量 |
| `vue/no-multi-spaces` | 关闭 | 禁止出现多个连续空格 |
| `vue/no-multiple-objects-in-class` | 关闭 | 禁止向 class 传入包含多个对象的数组 |
| `vue/no-multiple-template-root` | 关闭 | 禁止模板存在多个根节点 |
| `vue/no-negated-condition` | 关闭 | 在 `<template>` 中禁止使用否定条件 |
| `vue/no-negated-v-if-condition` | 关闭 | 禁止在 v-if 与 v-else 中使用否定条件 |
| `vue/no-potential-component-option-typo` | 关闭 | 禁止组件选项可能存在拼写错误 |
| `vue/no-ref-object-reactivity-loss` | 关闭 | 禁止可能导致响应性丢失的 ref 对象用法 |
| `vue/no-restricted-block` | 关闭 | 禁止指定的块 |
| `vue/no-restricted-call-after-await` | 关闭 | 禁止在异步操作之后调用受限制的方法 |
| `vue/no-restricted-class` | 关闭 | 禁止在 Vue 组件中使用指定的类名 |
| `vue/no-restricted-component-names` | 关闭 | 禁止指定的组件名 |
| `vue/no-restricted-component-options` | 关闭 | 禁止指定的组件选项 |
| `vue/no-restricted-custom-event` | 关闭 | 禁止指定的自定义事件 |
| `vue/no-restricted-html-elements` | 关闭 | 禁止指定的元素 |
| `vue/no-restricted-props` | 关闭 | 禁止指定的 props |
| `vue/no-restricted-static-attribute` | 关闭 | 禁止指定的静态属性 |
| `vue/no-restricted-syntax` | 关闭 | 在 `<template>` 中禁用指定语法 |
| `vue/no-restricted-v-bind` | 关闭 | 禁止 v-bind 中指定的参数 |
| `vue/no-restricted-v-on` | 关闭 | 禁止 v-on 中指定的参数 |
| `vue/no-root-v-if` | 关闭 | 禁止在根元素上使用 v-if 指令 |
| `vue/no-setup-props-reactivity-loss` | 关闭 | 禁止会丢失 setup 中 props 响应性的用法 |
| `vue/no-shadow-native-events` | 关闭 | 禁止使用与原生 Web 事件同名的自定义事件 |
| `vue/no-spaces-around-equal-signs-in-attribute` | 关闭 | 禁止属性等号两侧出现空格 |
| `vue/no-sparse-arrays` | 关闭 | 在 `<template>` 中禁止稀疏数组 |
| `vue/no-static-inline-styles` | 关闭 | 禁止静态的行内 style 属性 |
| `vue/no-template-target-blank` | 关闭 | 禁止 target="_blank" 缺少 rel="noopener noreferrer" |
| `vue/no-this-in-before-route-enter` | 关闭 | 禁止在 beforeRouteEnter 中使用 this |
| `vue/no-undef-directives` | 关闭 | 禁止使用未定义的自定义指令 |
| `vue/no-undef-properties` | 关闭 | 禁止使用未定义的属性 |
| `vue/no-unsupported-features` | 关闭 | 禁止在指定版本上使用不受支持的 Vue 语法 |
| `vue/no-unused-properties` | 关闭 | 禁止未使用的属性 |
| `vue/no-unused-refs` | 关闭 | 禁止未使用的 ref |
| `vue/no-use-v-else-with-v-for` | 关闭 | 禁止在同一元素上同时使用 v-else-if 或 v-else 与 v-for |
| `vue/no-useless-concat` | 关闭 | 在 `<template>` 中禁止不必要的字面量或模板字符串拼接 |
| `vue/no-useless-mustaches` | 关闭 | 禁止不必要的插值表达式 |
| `vue/no-useless-v-bind` | 关闭 | 禁止不必要的 v-bind 指令 |
| `vue/no-v-for-template-key` | 关闭 | 已废弃。禁止在 `<template v-for>` 上使用 key 属性 |
| `vue/no-v-model-argument` | 关闭 | 已废弃。禁止在自定义组件的 v-model 上添加参数 |
| `vue/no-v-text` | 关闭 | 禁止使用 v-text |
| `vue/object-curly-newline` | 关闭 | 在 `<template>` 中强制对象大括号内的换行一致 |
| `vue/object-curly-spacing` | 关闭 | 在 `<template>` 中强制大括号内的空格一致 |
| `vue/object-property-newline` | 关闭 | 在 `<template>` 中强制对象属性分行书写 |
| `vue/object-shorthand` | 关闭 | 在 `<template>` 中要求或禁止对象字面量的简写语法 |
| `vue/operator-linebreak` | 关闭 | 在 `<template>` 中强制运算符的换行风格一致 |
| `vue/padding-line-between-blocks` | 关闭 | 要求或禁止各块之间有空行 |
| `vue/padding-line-between-tags` | 关闭 | 要求或禁止模板中相邻标签之间换行 |
| `vue/padding-lines-in-component-definition` | 关闭 | 要求或禁止组件定义中有空行 |
| `vue/prefer-define-options` | 关闭 | 要求使用 defineOptions 而不是默认导出 |
| `vue/prefer-prop-type-boolean-first` | 关闭 | 要求 Boolean 放在组件 prop 类型的第一位 |
| `vue/prefer-separate-static-class` | 关闭 | 要求模板中的静态类名放在单独的 class 属性中 |
| `vue/prefer-single-event-payload` | 关闭 | 要求自定义事件只传递一个参数 |
| `vue/prefer-template` | 关闭 | 在 `<template>` 中要求使用模板字符串而不是字符串拼接 |
| `vue/prefer-true-attribute-shorthand` | 关闭 | 当 v-bind 的值为 true 时要求使用简写形式 |
| `vue/prefer-use-template-ref` | 关闭 | 要求使用 useTemplateRef 而不是 ref 或 shallowRef 获取模板引用 |
| `vue/prefer-v-model` | 关闭 | 要求使用 v-model 而不是 :prop 与 @update:prop 组合 |
| `vue/quote-props` | 关闭 | 在 `<template>` 中要求对象字面量属性名加引号 |
| `vue/require-default-export` | 关闭 | 要求组件作为默认导出 |
| `vue/require-direct-export` | 关闭 | 要求组件直接导出 |
| `vue/require-emit-validator` | 关闭 | 要求 emits 提供类型定义 |
| `vue/require-explicit-slots` | 关闭 | 要求显式定义插槽 |
| `vue/require-expose` | 关闭 | 要求使用 expose 声明对外暴露的属性 |
| `vue/require-macro-variable-name` | 关闭 | 要求宏使用指定的变量名 |
| `vue/require-name-property` | 关闭 | 要求 Vue 组件包含 name 属性 |
| `vue/require-prop-comment` | 关闭 | 要求 props 带有注释 |
| `vue/require-typed-object-prop` | 关闭 | 要求为对象类型的 prop 添加类型声明 |
| `vue/require-typed-ref` | 关闭 | 要求 ref 和 shallowRef 具有明确的类型 |
| `vue/restricted-component-names` | 关闭 | 强制只允许使用指定的组件名 |
| `vue/script-indent` | 关闭 | 强制 `<script>` 中的缩进一致 |
| `vue/singleline-html-element-content-newline` | 关闭 | 要求单行元素内容的开始与结束处换行 |
| `vue/slot-name-casing` | 关闭 | 强制插槽名的命名风格 |
| `vue/sort-keys` | 关闭 | 强制与 order-in-components 兼容的键排序 |
| `vue/space-in-parens` | 关闭 | 在 `<template>` 中强制圆括号内的空格一致 |
| `vue/space-infix-ops` | 关闭 | 在 `<template>` 中要求中缀运算符周围有空格 |
| `vue/space-unary-ops` | 关闭 | 在 `<template>` 中强制一元运算符前后的空格一致 |
| `vue/static-class-names-order` | 关闭 | 强制静态类名的顺序 |
| `vue/template-curly-spacing` | 关闭 | 在 `<template>` 中要求或禁止模板字符串中嵌入表达式周围的空格 |
| `vue/v-for-delimiter-style` | 关闭 | 强制 v-for 指令的分隔符风格 |
| `vue/v-if-else-key` | 关闭 | 要求条件渲染的重复组件提供 key 属性 |
| `vue/v-on-handler-style` | 关闭 | 强制 v-on 指令中处理函数的书写风格 |
| `vue/valid-model-definition` | 关闭 | 已废弃。要求 model 选项的键合法 |
| `vue/valid-v-bind-sync` | 关闭 | 已废弃。强制 v-bind 上 .sync 修饰符的合法用法 |
