# Stylelint 规则清单

> 统计范围：`stylelint`（核心规则）与基座配置 `stylelint-config-standard` 提供的全部规则，共 150 条，开关状态取自根 `stylelint.config.js` 的实际解析结果。
>
> 「开启」表示规则在本项目样式文件中生效；「关闭」表示未启用；「关闭（配置中显式禁用）」表示规则在配置里被显式设为 `null`；「开启（仅组件样式）」表示仅对 `packages/bst-styles/web/{basic,advanced,ai}-components/**/*.less` 生效。

| 规则名称 | 规则是否开启 | 规则详细描述 |
| --- | --- | --- |
| `alpha-value-notation` | 开启 | 强制 alpha 值使用百分比或数字表示 |
| `annotation-no-unknown` | 开启 | 禁止未知的注释标记（如 `!default`） |
| `at-rule-descriptor-no-unknown` | 开启 | 禁止 at 规则中使用未知的描述符 |
| `at-rule-descriptor-value-no-unknown` | 开启 | 禁止 at 规则的描述符使用未知取值 |
| `at-rule-empty-line-before` | 开启 | 要求或禁止 at 规则前有空行 |
| `at-rule-no-deprecated` | 开启 | 禁止使用已废弃的 at 规则 |
| `at-rule-no-unknown` | 开启 | 禁止使用未知的 at 规则 |
| `at-rule-no-vendor-prefix` | 开启 | 禁止 at 规则使用厂商前缀 |
| `at-rule-prelude-no-invalid` | 开启 | 禁止 at 规则的前置参数使用无效写法 |
| `block-no-redundant-nested-style-rules` | 开启 | 禁止代码块中冗余的嵌套样式规则 |
| `color-function-alias-notation` | 开启 | 强制颜色函数别名使用一致写法（如 `rgb` 与 `rgba`） |
| `color-function-notation` | 开启 | 强制颜色函数使用现代或传统语法 |
| `color-hex-length` | 开启 | 强制十六进制颜色使用短写或长写 |
| `color-named` | 开启（仅组件样式） | 要求或禁止使用颜色关键字（组件样式中禁止 `red` 等命名颜色） |
| `comment-no-empty` | 开启 | 禁止空注释 |
| `comment-whitespace-inside` | 开启 | 要求或禁止注释内的空格 |
| `container-name-pattern` | 开启 | 要求容器名匹配指定模式 |
| `custom-media-pattern` | 开启 | 要求自定义媒体查询名匹配指定模式 |
| `custom-property-empty-line-before` | 开启 | 要求或禁止自定义属性前有空行 |
| `custom-property-no-missing-var-function` | 开启 | 禁止自定义属性缺少 var() 函数 |
| `declaration-block-no-duplicate-custom-properties` | 开启 | 禁止声明块中出现重复的自定义属性 |
| `declaration-block-no-duplicate-properties` | 开启 | 禁止声明块中出现重复的属性 |
| `declaration-block-no-redundant-longhand-properties` | 开启 | 禁止声明块中可合并为简写的冗余长手属性（已忽略 flex、inset 相关） |
| `declaration-block-no-shorthand-property-overrides` | 开启 | 禁止简写属性覆盖已声明的长手属性 |
| `declaration-block-single-line-max-declarations` | 开启 | 限制单行声明块中的最大声明数 |
| `declaration-empty-line-before` | 开启 | 要求或禁止声明前有空行 |
| `declaration-property-value-keyword-no-deprecated` | 开启 | 禁止属性值中使用已废弃的关键字 |
| `font-family-name-quotes` | 开启 | 要求或禁止字体名使用引号 |
| `font-family-no-duplicate-names` | 开启 | 禁止字体族名称重复 |
| `font-family-no-missing-generic-family-keyword` | 开启 | 禁止字体族缺少通用字体关键字 |
| `function-calc-no-unspaced-operator` | 开启 | 禁止 calc() 中运算符两侧缺少空格 |
| `function-name-case` | 开启 | 强制函数名使用大写或小写 |
| `function-url-quotes` | 开启 | 要求或禁止 url() 使用引号 |
| `hue-degree-notation` | 开启 | 强制色相使用角度或数字表示 |
| `keyframe-block-no-duplicate-selectors` | 开启 | 禁止关键帧中出现重复选择器 |
| `keyframe-declaration-no-important` | 开启 | 禁止关键帧声明中使用 !important |
| `keyframe-selector-notation` | 开启 | 强制关键帧选择器使用百分比或关键字 |
| `layer-name-pattern` | 开启 | 要求 @layer 层名匹配指定模式 |
| `length-zero-no-unit` | 开启 | 禁止长度值为 0 时带单位 |
| `lightness-notation` | 开启 | 强制亮度值使用百分比或数字表示 |
| `media-feature-name-no-unknown` | 开启 | 禁止使用未知的媒体特性名 |
| `media-feature-name-no-vendor-prefix` | 开启 | 禁止媒体特性名使用厂商前缀 |
| `media-feature-name-value-no-unknown` | 开启 | 禁止媒体特性使用未知取值 |
| `media-feature-range-notation` | 开启 | 强制媒体特性范围使用前缀写法或上下文写法 |
| `media-query-no-invalid` | 开启（CSS）/ 关闭（Less） | 禁止非法的媒体查询；Less 中的变量是编译期插值，静态无法校验 |
| `media-type-no-deprecated` | 开启 | 禁止使用已废弃的媒体类型 |
| `named-grid-areas-no-invalid` | 开启 | 禁止非法的命名网格区域 |
| `nesting-selector-no-missing-scoping-root` | 开启 | 禁止缺少作用域根（&）的嵌套选择器 |
| `no-duplicate-at-import-rules` | 开启 | 禁止重复的 @import 规则 |
| `no-invalid-double-slash-comments` | 开启 | 禁止无效的双斜线注释 |
| `no-invalid-position-at-import-rule` | 开启 | 禁止 @import 出现在非法位置 |
| `no-invalid-position-declaration` | 开启 | 禁止声明出现在非法位置 |
| `no-irregular-whitespace` | 开启 | 禁止使用不规则空白字符 |
| `number-max-precision` | 开启 | 限制数字的最大精度（小数位数） |
| `property-no-deprecated` | 开启 | 禁止使用已废弃的属性 |
| `property-no-unknown` | 开启 | 禁止使用未知属性（含带厂商前缀的属性） |
| `property-no-vendor-prefix` | 开启 | 禁止属性使用厂商前缀 |
| `rule-empty-line-before` | 开启 | 要求或禁止规则前有空行 |
| `selector-anb-no-unmatchable` | 开启 | 禁止不可匹配的 An+B 选择器（如 :nth-child(0)） |
| `selector-attribute-quotes` | 开启 | 要求或禁止属性选择器的值加引号 |
| `selector-id-pattern` | 开启 | 要求 ID 选择器名匹配指定模式 |
| `selector-no-vendor-prefix` | 开启 | 禁止选择器使用厂商前缀 |
| `selector-not-notation` | 开启 | 强制 :not() 使用简单写法或复杂写法 |
| `selector-pseudo-class-no-unknown` | 开启 | 禁止使用未知的伪类 |
| `selector-pseudo-element-colon-notation` | 开启 | 强制伪元素使用单冒号或双冒号 |
| `selector-pseudo-element-no-unknown` | 开启 | 禁止使用未知的伪元素 |
| `selector-type-case` | 开启 | 强制类型选择器名使用大写或小写 |
| `shorthand-property-no-redundant-values` | 开启 | 禁止简写属性中出现冗余取值 |
| `string-no-newline` | 开启 | 禁止字符串中出现换行 |
| `syntax-string-no-invalid` | 开启 | 禁止字符串使用无效语法 |
| `value-no-vendor-prefix` | 开启 | 禁止值使用厂商前缀 |
| `at-rule-allowed-list` | 关闭 | 仅允许使用指定的 at 规则 |
| `at-rule-disallowed-list` | 关闭 | 禁止使用指定的 at 规则 |
| `at-rule-property-required-list` | 关闭 | 要求指定的 at 规则必须包含特定属性 |
| `block-no-empty` | 关闭（配置中显式禁用） | 禁止空的代码块 |
| `color-hex-alpha` | 关闭 | 要求或禁止十六进制颜色使用 alpha 通道 |
| `color-no-hex` | 关闭 | 禁止使用十六进制颜色 |
| `color-no-invalid-hex` | 关闭 | 禁止使用无效的十六进制颜色 |
| `comment-empty-line-before` | 关闭（配置中显式禁用） | 要求或禁止注释前有空行 |
| `comment-pattern` | 关闭 | 要求注释匹配指定模式 |
| `comment-word-disallowed-list` | 关闭 | 禁止注释中出现指定词语 |
| `custom-property-pattern` | 关闭（配置中显式禁用） | 要求自定义属性名匹配指定模式 |
| `declaration-no-important` | 关闭 | 禁止使用 !important |
| `declaration-property-max-values` | 关闭 | 限制属性的最大取值个数 |
| `declaration-property-unit-allowed-list` | 关闭 | 仅允许指定属性使用特定单位 |
| `declaration-property-unit-disallowed-list` | 关闭 | 禁止指定属性使用特定单位 |
| `declaration-property-value-allowed-list` | 关闭 | 仅允许指定属性使用特定取值 |
| `declaration-property-value-disallowed-list` | 关闭 | 禁止指定属性使用特定取值 |
| `declaration-property-value-no-unknown` | 关闭（配置中显式禁用） | 禁止属性使用未知取值 |
| `display-notation` | 关闭 | 强制 display 属性的多关键字值使用一致写法 |
| `font-weight-notation` | 关闭 | 强制 font-weight 使用数字或关键字表示 |
| `function-allowed-list` | 关闭 | 仅允许使用指定的函数 |
| `function-disallowed-list` | 关闭 | 禁止使用指定的函数 |
| `function-linear-gradient-no-nonstandard-direction` | 关闭 | 禁止 linear-gradient() 使用非标准方向写法 |
| `function-no-unknown` | 关闭 | 禁止使用未知函数 |
| `function-url-no-scheme-relative` | 关闭 | 禁止使用无协议（相对协议）的 URL |
| `function-url-scheme-allowed-list` | 关闭 | 仅允许 url() 使用指定协议 |
| `function-url-scheme-disallowed-list` | 关闭 | 禁止 url() 使用指定协议 |
| `import-notation` | 关闭（配置中显式禁用） | 强制 @import 使用字符串或 url() 写法 |
| `keyframes-name-pattern` | 关闭（配置中显式禁用） | 要求关键帧名匹配指定模式 |
| `max-nesting-depth` | 关闭 | 限制选择器最大嵌套深度 |
| `media-feature-name-allowed-list` | 关闭 | 仅允许使用指定的媒体特性名 |
| `media-feature-name-disallowed-list` | 关闭 | 禁止使用指定的媒体特性名 |
| `media-feature-name-unit-allowed-list` | 关闭 | 限制媒体特性名只允许使用指定单位 |
| `media-feature-name-value-allowed-list` | 关闭 | 仅允许媒体特性使用指定取值 |
| `no-descending-specificity` | 关闭（配置中显式禁用） | 禁止选择器特异性递减 |
| `no-duplicate-selectors` | 关闭（配置中显式禁用） | 禁止重复的选择器 |
| `no-empty-source` | 关闭（配置中显式禁用） | 禁止空的样式源文件 |
| `no-unknown-animations` | 关闭 | 禁止使用未知的动画名 |
| `no-unknown-custom-media` | 关闭 | 禁止使用未定义的自定义媒体查询 |
| `no-unknown-custom-properties` | 关闭 | 禁止使用未定义的自定义属性 |
| `property-allowed-list` | 关闭 | 仅允许使用指定的属性 |
| `property-disallowed-list` | 关闭 | 禁止使用指定的属性 |
| `property-layout-mappings` | 关闭 | 强制布局相关属性使用指定的逻辑属性映射 |
| `relative-selector-nesting-notation` | 关闭 | 强制相对选择器的嵌套写法一致 |
| `rule-nesting-at-rule-required-list` | 关闭 | 要求规则内必须包含指定的 at 规则 |
| `rule-selector-property-disallowed-list` | 关闭 | 禁止指定选择器使用特定属性 |
| `selector-attribute-name-disallowed-list` | 关闭 | 禁止使用指定的属性选择器名 |
| `selector-attribute-operator-allowed-list` | 关闭 | 仅允许属性选择器使用指定运算符 |
| `selector-attribute-operator-disallowed-list` | 关闭 | 禁止属性选择器使用指定运算符 |
| `selector-class-pattern` | 关闭（配置中显式禁用） | 要求类选择器名匹配指定模式 |
| `selector-combinator-allowed-list` | 关闭 | 仅允许使用指定的选择器组合器 |
| `selector-combinator-disallowed-list` | 关闭 | 禁止使用指定的选择器组合器 |
| `selector-disallowed-list` | 关闭 | 禁止使用指定的选择器 |
| `selector-max-attribute` | 关闭 | 限制单个选择器中属性选择器的最大个数 |
| `selector-max-class` | 关闭 | 限制单个选择器中类选择器的最大个数 |
| `selector-max-combinators` | 关闭 | 限制单个选择器中组合器的最大个数 |
| `selector-max-compound-selectors` | 关闭 | 限制单个选择器中复合选择器的最大个数 |
| `selector-max-id` | 关闭 | 限制单个选择器中 ID 选择器的最大个数 |
| `selector-max-pseudo-class` | 关闭 | 限制单个选择器中伪类的最大个数 |
| `selector-max-specificity` | 关闭 | 限制选择器的最大特异性 |
| `selector-max-type` | 关闭 | 限制单个选择器中类型选择器的最大个数 |
| `selector-max-universal` | 关闭 | 限制单个选择器中通配选择器的最大个数 |
| `selector-nested-pattern` | 关闭 | 要求嵌套选择器匹配指定模式 |
| `selector-no-deprecated` | 关闭 | 禁止使用已废弃的选择器 |
| `selector-no-invalid` | 关闭 | 禁止使用无效的选择器 |
| `selector-no-qualifying-type` | 关闭 | 禁止用类型选择器限定其他选择器 |
| `selector-no-unmatchable` | 关闭 | 禁止使用不可匹配的选择器 |
| `selector-pseudo-class-allowed-list` | 关闭 | 仅允许使用指定的伪类 |
| `selector-pseudo-class-disallowed-list` | 关闭 | 禁止使用指定的伪类 |
| `selector-pseudo-element-allowed-list` | 关闭 | 仅允许使用指定的伪元素 |
| `selector-pseudo-element-disallowed-list` | 关闭 | 禁止使用指定的伪元素 |
| `selector-type-no-unknown` | 关闭（配置中显式禁用） | 禁止使用未知的类型选择器 |
| `time-min-milliseconds` | 关闭 | 限制时间值的最小毫秒数 |
| `unit-allowed-list` | 关闭 | 仅允许使用指定的单位 |
| `unit-disallowed-list` | 关闭 | 禁止使用指定的单位 |
| `unit-layout-mappings` | 关闭 | 强制单位使用指定的逻辑属性映射 |
| `unit-no-unknown` | 关闭 | 禁止使用未知单位 |
| `value-keyword-case` | 关闭（配置中显式禁用） | 强制关键字值使用大写或小写 |
| `value-keyword-layout-mappings` | 关闭 | 强制关键字值使用指定的逻辑映射 |
