---
name: iconify-search
description: Iconify 图标搜索技能。通过 Iconify 官方 API 在 200,000+ 开源图标中按关键词搜索图标。
---

# Iconify Search

通过 Iconify 官方 API 在 200,000+ 开源图标中进行关键词搜索，覆盖 150+ 图标集（Lucide、Heroicons、Phosphor、Material Symbols、Tabler、Simple Icons 等）。

## When to Use

- 用户需要**按概念/关键词搜索图标**（"找几个 settings 图标"、"有什么好看的 dashboard 图标"）
- 用户需要在**特定图标集中搜索**（"Lucide 里有没有 printer 图标"）
- 用户需要**下载 SVG 图标**到本地项目
- 用户需要**浏览图标集**或了解某图标集的元信息
- 用户在开发前端项目时需要**集成图标组件**

## Core Workflow

```
用户描述需求 → 搜索图标 → 展示结果（含预览链接） → 用户选择 → 下载/集成
```

### Step 1: 解析用户需求

从用户描述中提取以下信息：
- **关键词** (query): 图标描述词，如 "home"、"settings"、"arrow-right"
- **目标图标集** (prefix): 如用户指定了 Lucide / Material Symbols / Heroicons 等
- **数量** (limit): 期望返回多少结果，默认 32
- **分页** (start): 是否需要翻页

### Step 2: 执行搜索

使用 `WebFetch` 或 `curl` 调用搜索 API：

```
GET https://api.iconify.design/search?query={keyword}&limit={n}&pretty=1
```

**参数说明**：

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | 是 | - | 搜索关键词，不区分大小写 |
| `limit` | 否 | 64 | 返回数量，范围 32-999 |
| `start` | 否 | 0 | 分页起始索引 |
| `prefix` | 否 | - | 限定单个图标集，如 `lucide` |
| `prefixes` | 否 | - | 限定多个图标集，逗号分隔，支持 `-` 结尾的部分匹配 |
| `category` | 否 | - | 按分类过滤 (General / Emoji / Animated Icons / Thematic) |

### Step 3: 解析并展示结果

响应结构（`APIv2SearchResponse`）：

```json
{
  "icons": ["lucide:home", "mdi:home", "heroicons:home"],
  "total": 156,
  "limit": 32,
  "start": 0,
  "collections": {
    "lucide": { "name": "Lucide", "total": 1500, "category": "General", ... },
    "mdi": { "name": "Material Design Icons", "total": 7000, ... }
  },
  "request": { "query": "home", "limit": "32" }
}
```

展示时应包含：

1. **图标列表**: `prefix:name` 格式，附带直接查看链接 `https://icon-sets.iconify.design/{prefix}/?icon={name}`
2. **SVG 直接链接**: `https://api.iconify.design/{prefix}/{name}.svg`
3. **涉及的图标集**: 名称、图标数量、分类
4. **分页信息**: total、当前 start/limit，是否有更多结果

### Step 4: 使用脚本执行操作

Skill 内置了 7 个 Node.js 脚本，位于 `scripts/` 目录，可直接用 `node` 执行。
**优先使用这些脚本**，它们已经封装了错误处理、格式化输出和管道协作。

#### Scripts 概览

| 脚本 | 功能 | 用法示例 |
|------|------|----------|
| `scripts/search.js` | 按关键词搜索图标 | `node scripts/search.js dashboard --limit 10 --table` |
| `scripts/download-svg.js` | 下载单个 SVG 图标 | `node scripts/download-svg.js lucide home -o ./icons/home.svg` |
| `scripts/batch-download.js` | 批量下载 SVG 图标 | `node scripts/batch-download.js lucide home settings user -o ./icons` |
| `scripts/list-collections.js` | 列出所有图标集 | `node scripts/list-collections.js --filter material --table` |
| `scripts/get-collection.js` | 获取某图标集中的图标列表 | `node scripts/get-collection.js lucide --search home` |
| `scripts/get-icon-data.js` | 获取图标 JSON 数据 | `node scripts/get-icon-data.js lucide home settings` |
| `scripts/keywords.js` | 关键词自动补全建议 | `node scripts/keywords.js hom --top 10` |

#### 管道协作示例

脚本支持 Unix 管道串联，实现复杂工作流：

```bash
# 搜索 → 批量下载
node scripts/search.js dashboard --names-only | node scripts/batch-download.js --pipe -o ./icons

# 搜索 → 预览（仅列出不下载）
node scripts/search.js dashboard --names-only | node scripts/batch-download.js --pipe --dry-run

# 查看某图标集 → 筛选 → 获取数据
node scripts/get-collection.js lucide --search home --names-only | node scripts/get-icon-data.js lucide --pipe --compact
```

#### 集成方式（不通过脚本）

**React 集成**:
```tsx
// npm install @iconify/react
import { Icon } from '@iconify/react';
<Icon icon="lucide:home" />
```

**Vue 集成**:
```html
<!-- npm install @iconify/vue -->
<Icon icon="lucide:home" />
```

**HTML 直接引用**:
```html
<img src="https://api.iconify.design/lucide/home.svg" alt="home" />
```

每个脚本均支持 `--help` 查看完整参数说明。

## Recommended Icon Sets

| 图标集 | 前缀 | 风格 | 适用场景 |
|--------|------|------|----------|
| Lucide | `lucide` | Outline 24px | 默认首选，shadcn/ui |
| Heroicons | `heroicons` | Outline/Solid | Tailwind CSS 项目 |
| Phosphor | `ph` | 6 种粗细 | 需要多权重切换 |
| Tabler Icons | `tabler` | Outline 24px | 图标种类最多 |
| Material Symbols | `material-symbols` | 3 种风格 | Material Design |
| Simple Icons | `simple-icons` | 品牌 Logo | 品牌/社交图标 |
| Carbon | `carbon` | Outline 16px | IBM 设计风格 |

## Common Icon Name Quick Reference

| 类别 | 常用图标名 |
|------|-----------|
| 导航 | home, menu, x, chevron-right, arrow-right, search, hamburger |
| 操作 | plus, minus, check, edit, trash-2, copy, download, upload |
| 对象 | file, folder, image, calendar, mail, link, globe, map-pin |
| 用户 | user, users, bell, lock, key, shield, settings |
| 媒体 | play, pause, volume-2, camera, mic, video, music |
| 数据 | bar-chart, trending-up, database, server, pie-chart, activity |
| 状态 | check-circle, x-circle, alert-triangle, info, help-circle |
| 箭头 | arrow-up, arrow-down, arrow-left, arrow-right, chevron-up, chevron-down |

## Other Useful API Endpoints

| 端点 | 用途 |
|------|------|
| `/collections` | 列出所有可用图标集及元信息 |
| `/collection?prefix={prefix}` | 列出某图标集下所有图标 |
| `/keywords?keyword={word}` | 关键词自动补全建议 |
| `/last-modified?prefixes={p1,p2}` | 检查图标集更新时间 |
| `/{prefix}.json?icons={name1,name2}` | 批量获取图标 JSON 数据 |

## Detailed API Docs

完整的 API 参数说明、响应结构、错误码等详见 `references/api_docs.md`。当需要查明参数细节、边界值或高级用法时，加载该参考文件。

## Resources

### scripts/ — 可执行 JS 脚本

| 脚本 | 对应 API | 核心选项 |
|------|----------|----------|
| `scripts/search.js` | `GET /search` | `--limit`, `--prefix`, `--category`, `--table`, `--names-only` |
| `scripts/download-svg.js` | `GET /{prefix}/{name}.svg` | `--color`, `--width`, `--height`, `--output`, `--print`, `--tag` |
| `scripts/batch-download.js` | `GET /{prefix}/{name}.svg` (批量) | `--prefix`, `--output`, `--color`, `--pipe`, `--dry-run` |
| `scripts/list-collections.js` | `GET /collections` | `--filter`, `--category`, `--sort`, `--table`, `--names-only`, `--top` |
| `scripts/get-collection.js` | `GET /collection` | `--search`, `--top`, `--names-only` |
| `scripts/get-icon-data.js` | `GET /{prefix}.json` | `--output`, `--compact`, `--body-only`, `--pipe` |
| `scripts/keywords.js` | `GET /keywords` | `--prefix`, `--top` |

共用模块 `scripts/lib/api-client.js` 封装了 `request()`, `printJSON()`, `die()`, `help()`, `imgTag()`, `reactJSX()` 等工具函数。

### references/ — 参考文档

- `references/api_docs.md` — 7 个 API 端点的完整参数说明、响应结构、错误码、分页最佳实践

### assets/ — 使用指南

- `assets/README.md` — 面向用户的提示词使用指南，按 7 大场景分类，每个场景包含 2-5 个可直接复制使用的自然语言提示词示例
