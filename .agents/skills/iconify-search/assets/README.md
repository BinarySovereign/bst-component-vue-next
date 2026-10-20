# iconify-search — 提示词使用指南

通过自然语言提示词即可使用本 Skill，无需手动调用脚本。以下是按场景分类的提示词模板。

---

## 场景 1：关键词搜索图标

| 基础用法 | 提示词示例 |
|----------|-----------|
| 通用搜索 | 帮我搜索几个 dashboard 图标 |
| 通用搜索 | 找一下有没有好看的 settings 图标 |
| 指定数量 | 帮我找 10 个 heart 相关图标 |
| 中文关键词 | 给我推荐一些关于"打印"的图标 |

**进阶用法**（带筛选）：

| 需求 | 提示词示例 |
|------|-----------|
| 指定图标集 | Lucide 里有没有 printer 图标？帮我搜一下 |
| 多个图标集 | 在 Lucide 和 Heroicons 里搜索 arrow 图标 |
| 按分类过滤 | 在 General 分类中搜索 "gift" 图标 |
| 分页浏览 | 搜索 camera 图标，给我看第 2 页结果 |

---

## 场景 2：浏览图标集

| 需求 | 提示词示例 |
|------|-----------|
| 列出所有图标集 | 列出 Iconify 上所有可用的图标集 |
| 按名称过滤 | 列出名称包含 "material" 的图标集 |
| 按图标数量排序 | 按图标数量从多到少列出前 20 个图标集 |
| 查看图标集详情 | 给我看看 Lucide 这个图标集有哪些图标 |
| 图标集内搜索 | Lucide 图标集里搜索包含 "chart" 的图标 |

---

## 场景 3：下载单个 SVG 图标

| 需求 | 提示词示例 |
|------|-----------|
| 基础下载 | 帮我下载 lucide:home 这个 SVG 图标 |
| 指定路径 | 把 lucide:settings 下载到 ./public/icons/settings.svg |
| 自定义颜色 | 下载 lucide:heart 图标，颜色改成红色 |
| 自定义尺寸 | 下载 material-symbols:star，设置 48x48 像素 |
| 仅查看不保存 | 把 lucide:arrow-right 的 SVG 内容打印出来看看 |
| 旋转/翻转 | 下载 lucide:chevron-right 并旋转 90 度 |

---

## 场景 4：批量下载 SVG 图标

| 需求 | 提示词示例 |
|------|-----------|
| 列表批量下载 | 帮我下载 lucide 里的 home、settings、user、search、bell 这 5 个图标 |
| 指定输出目录 | 把上面这些图标下载到 ./public/icons 目录 |
| 统一颜色 | 批量下载 Tabler 的 home/settings/user，颜色统一用 #6366f1 |
| 预览不下载 | 先预览一下 lucide 的 home/settings/user/bell 下载列表，不要实际下载 |
| 搜索后批量下载 | 帮我搜索 "chart" 相关的图标，然后把前 10 个全部下载到 ./charts |

---

## 场景 5：集成代码生成

| 需求 | 提示词示例 |
|------|-----------|
| React 组件 | 帮我用 @iconify/react 集成 lucide:settings 图标，给出完整代码 |
| Vue 组件 | 在 Vue 项目中如何使用 lucide:home 图标？ |
| HTML 引用 | 给我一个 HTML 页面，用 lucide 图标做导航栏 |
| 生成组件标签 | 把 lucide:heart 转成 React Icon 组件标签 |
| 生成 img 标签 | 把 lucide:settings 转成 HTML img 标签 |

---

## 场景 6：关键词自动补全

| 需求 | 提示词示例 |
|------|-----------|
| 补全建议 | 当我输入 "hom" 时有哪些图标关键词补全建议？ |
| 限定图标集补全 | 在 Lucide 中，"arr" 开头的关键词有哪些？ |
| 前 N 个建议 | 搜索 "dash" 关键词，只显示前 10 个补全建议 |

---

## 场景 7：获取图标数据（JSON）

| 需求 | 提示词示例 |
|------|-----------|
| 获取单个图标数据 | 帮我获取 lucide:home 的 JSON 数据 |
| 批量获取 | 给我 lucide 的 home、settings、user 三个图标的 JSON 数据 |
| 仅取 SVG body | 获取 lucide:settings 的 SVG path body |
| 搜索后获取数据 | 搜索 "menu" 图标，然后用管道获取它们的 JSON 数据 |

---

## 组合场景（管道操作）

| 需求 | 提示词示例 |
|------|-----------|
| 搜索 → 批量下载 | 搜索 dashboard 图标，把 Lucide 里的结果全部下载到 ./icons |
| 搜索 → 预览 | 搜索 "mail" 图标，预览 Lucide 的前 10 个下载文件名 |
| 搜索 → 获取数据 | 搜索 "arrow" 图标，获取所有 Lucide 箭头图标的 body 数据 |
| 图标集浏览 → 筛选下载 | 列出 Lucide 里所有含 "badge" 的图标，下载到 ./badges |
| 搜索 → React 组件 | 搜索 "calendar" 图标，帮我在 React 项目里集成 lucide:calendar-days |

---

## 快速参考卡

想快速测试 Skill 是否正常，直接发以下任意一条：

```
帮我搜索几个 dashboard 图标
lucide 里有没有 printer 图标？
下载 lucide:home 这个 SVG
列出所有包含 material 的图标集
```

---

## 提示词编写技巧

1. **关键触发词**：包含"搜索图标""找图标""Iconify""下载 SVG""图标集""Lucide""Heroicons"等词能确保 Skill 被自动加载
2. **指定图标集**：明确说 `Lucide 里...` 或 `在 Material Symbols 中...` 可以缩小范围
3. **指定数量**：说 `前 10 个` / `列出 5 个` 来限制返回数量
4. **管道操作**：使用 `搜索X然后下载` 或 `搜索X，获取数据` 句式串联多个操作
5. **自定义参数**：说 `红色` / `48px` / `旋转90度` 来定制下载的 SVG
