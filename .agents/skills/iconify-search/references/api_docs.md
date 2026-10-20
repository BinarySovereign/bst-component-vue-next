# Iconify API 详细参考文档

> 官方文档: https://iconify.design/docs/api/queries
> 源代码: https://github.com/iconify/api

---

## 1. Search API (`/search`)

### 端点

```
GET https://api.iconify.design/search
```

### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 范围 | 说明 |
|------|------|------|--------|------|------|
| `query` | string | **是** | - | - | 搜索关键词，不区分大小写 |
| `limit` | number | 否 | 64 | 32-999 | 返回结果最大数量 |
| `start` | number | 否 | 0 | 0 ~ `<limit` | 分页起始索引 |
| `prefix` | string | 否 | - | - | 限定单个图标集前缀，如 `lucide` |
| `prefixes` | string | 否 | - | - | 逗号分隔的图标集前缀列表，支持 `-` 结尾的部分匹配（如 `mdi-` 匹配 `mdi-light`） |
| `category` | string | 否 | - | - | 按图标集分类过滤（General, Emoji, Animated Icons, Thematic, Archive/Unmaintained） |
| `pretty` | boolean | 否 | false | - | 格式化 JSON 输出，便于阅读 |

### 常量定义

```typescript
const minSearchLimit = 32;
const maxSearchLimit = 999;
const defaultSearchLimit = 64;
```

### 响应结构

```typescript
interface APIv2SearchResponse {
  /** 图标名称列表，格式: "{prefix}:{name}" */
  icons: string[];

  /** 匹配结果总数，等于 icons.length */
  total: number;

  /** 本次查询的 limit 值 */
  limit: number;

  /** 第一个结果的索引 */
  start: number;

  /** 结果涉及的图标集元信息 */
  collections: Record<string, IconifyInfo>;

  /** 请求参数的副本（所有值均为字符串） */
  request: Record<string, string>;
}
```

### 响应示例

**成功搜索**:
```json
{
  "icons": [
    "lucide:home",
    "material-symbols:home",
    "heroicons:home",
    "ph:house",
    "tabler:home"
  ],
  "total": 156,
  "limit": 32,
  "start": 0,
  "collections": {
    "lucide": {
      "name": "Lucide",
      "total": 1500,
      "author": { "name": "Lucide Contributors", "url": "https://lucide.dev" },
      "license": { "title": "ISC", "spdx": "ISC", "url": "https://github.com/lucide-icons/lucide/blob/main/LICENSE" },
      "samples": ["a-arrow-down", "a-arrow-up", "accessibility"],
      "category": "General",
      "palette": false
    },
    "material-symbols": {
      "name": "Material Symbols",
      "total": 8413,
      "author": { "name": "Google", "url": "https://github.com/google/material-design-icons" },
      "license": { "title": "Apache 2.0", "spdx": "Apache-2.0", "url": "https://github.com/google/material-design-icons/blob/master/LICENSE" },
      "samples": ["downloading", "privacy-tip", "filter-drama-outline"],
      "height": 24,
      "category": "General",
      "palette": false
    }
  },
  "request": {
    "query": "home",
    "limit": "32",
    "pretty": "1"
  }
}
```

**无结果** (HTTP 200):
```json
{
  "icons": [],
  "total": 0,
  "limit": 64,
  "start": 0,
  "collections": {},
  "request": { "query": "zzzz", "pretty": "1" }
}
```

### 错误响应

| HTTP 状态码 | 条件 |
|------------|------|
| 400 | 缺少 `query` 参数 |
| 400 | `limit` 参数值不在 32-999 范围内 |
| 400 | `start` 参数无效 |
| 404 | 搜索功能未启用 / 搜索索引不可用 |

### Collections 条目结构

```typescript
interface IconifyInfo {
  name: string;            // 图标集名称
  total: number;           // 图标总数
  version?: string;        // 版本号
  author: {                // 作者信息
    name: string;
    url: string;
  };
  license: {               // 许可证信息
    title: string;
    spdx: string;
    url: string;
  };
  samples?: string[];      // 示例图标名称
  height?: number | number[];  // 图标高度
  displayHeight?: number;  // 显示高度
  category: string;        // 分类
  palette: boolean;        // 是否彩色图标
}
```

### 分类说明

| 分类 | 说明 |
|------|------|
| `General` | 通用 UI 图标集 |
| `Emoji` | 表情符号图标集 |
| `Animated Icons` | 动画图标集 |
| `Thematic` | 主题图标集 |
| `Archive / Unmaintained` | 已归档/不再维护的图标集 |

### 分页最佳实践

1. 初始搜索设置 `limit=32`（填满首屏）
2. 如果 `total >= limit`，存在更多结果
3. 用户翻页时设置 `limit=999` 获取所有剩余结果
4. 使用 `start` 参数可指定偏移量（性能影响可忽略）

---

## 2. SVG 下载 API

### 端点

```
GET https://api.iconify.design/{prefix}/{name}.svg
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `color` | string | 否 | 覆盖图标颜色，需 URL-encode `#`（如 `%23FF6600`） |
| `width` | string | 否 | 覆盖宽度 |
| `height` | string | 否 | 覆盖高度 |
| `flip` | string | 否 | 翻转方向（`horizontal` / `vertical`） |
| `rotate` | string | 否 | 旋转角度（`90` / `180` / `270`，仅数字，不带单位） |
| `download` | boolean | 否 | 设置 `Content-Disposition: attachment` 触发下载 |
| `box` | boolean | 否 | 包含 `viewBox` 属性 |

### 示例

```bash
# 基础下载
curl "https://api.iconify.design/lucide/home.svg"

# 设置颜色 (红色)
curl "https://api.iconify.design/lucide/home.svg?color=%23EF4444"

# 设置尺寸
curl "https://api.iconify.design/lucide/home.svg?width=48&height=48"

# 旋转 90°
curl "https://api.iconify.design/lucide/chevron-right.svg?rotate=90"
```

---

## 3. Collections API (`/collections`)

### 端点

```
GET https://api.iconify.design/collections
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `hidden` | boolean | 否 | 是否包含隐藏的图标集 |
| `prefixes` | string | 否 | 逗号分隔的前缀列表，仅返回指定的图标集 |
| `pretty` | boolean | 否 | 格式化 JSON |

### 响应

```json
{
  "lucide": { "name": "Lucide", "total": 1500, ... },
  "mdi": { "name": "Material Design Icons", "total": 7000, ... }
}
```

---

## 4. Collection API (`/collection`)

### 端点

```
GET https://api.iconify.design/collection?prefix={prefix}
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prefix` | string | **是** | 图标集前缀 |
| `pretty` | boolean | 否 | 格式化 JSON |

### 响应

返回指定图标集中的所有图标名称列表及元信息。

---

## 5. Keywords API (`/keywords`)

### 端点

```
GET https://api.iconify.design/keywords
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyword` | string | 条件必填 | 搜索包含此文本的关键词 |
| `prefix` | string | 条件必填 | 限定图标集前缀 |
| `pretty` | boolean | 否 | 格式化 JSON |

> `keyword` 和 `prefix` 至少提供一个。

### 用途

用于搜索框的自动补全建议。

---

## 6. Last Modified API (`/last-modified`)

### 端点

```
GET https://api.iconify.design/last-modified
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prefixes` | string | **是** | 逗号分隔的图标集前缀 |
| `pretty` | boolean | 否 | 格式化 JSON |

### 用途

检查图标集是否有更新，用于缓存失效判断。

---

## 7. 图标数据 API (`/{prefix}.json`)

### 端点

```
GET https://api.iconify.design/{prefix}.json?icons={name1,name2,name3}
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `icons` | string | **是** | 逗号分隔的图标名称列表 |
| `pretty` | boolean | 否 | 格式化 JSON |

### 用途

批量获取图标的 JSON 数据（SVG path data），适用于需要离线渲染或自定义渲染的场景。

---

## 注意事项

1. **无需认证**: Iconify API 是完全开放的，不需要 API Key
2. **无速率限制**: 公开 API 无硬性速率限制，但建议合理使用
3. **CORS**: API 支持跨域请求，可从浏览器直接调用
4. **HTTPS**: 必须使用 HTTPS 协议
5. **缓存**: 建议缓存搜索结果，使用 `/last-modified` 检查更新
