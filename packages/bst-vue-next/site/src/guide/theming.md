# 主题定制

## 令牌的分层

| 层次 | 内容 | 典型前缀 |
| --- | --- | --- |
| 原始色板 | 品牌 / 警告 / 错误 / 成功 / 中性 五组各 10 档 | `--bst-brand-color-*`、`--bst-gray-color-*` |
| 语义令牌 | 背景、文字、描边等按用途命名的取值，指向原始色板 | `--bst-bg-color-*`、`--bst-text-color-*`、`--bst-component-stroke` |
| 字体与尺寸 | 字号、行高、字体简写、尺寸阶梯、内外边距 | `--bst-font-*`、`--bst-size-*`、`--bst-comp-*` |
| 圆角与阴影 | 圆角阶梯与投影 | `--bst-radius-*`、`--bst-shadow-*` |

## 切换明暗

组件库通过 `:root` 上的属性或类名切换，两种写法都受支持：

```ts
// 写法一：属性开关
document.documentElement.setAttribute('theme-mode', 'dark');

// 写法二：类名开关
document.documentElement.classList.add('bst-theme-dark');
```
