#!/usr/bin/env node
/**
 * search.js — 按关键词搜索图标
 *
 * 调用 GET https://api.iconify.design/search?query={keyword}&limit={n}&prefix={p}&...
 *
 * 用法:
 *   node search.js <keyword> [选项]
 *
 * 选项:
 *   --limit,   -l <n>      返回数量 (32-999, 默认 64)
 *   --start,   -s <n>      分页起始索引 (默认 0)
 *   --prefix,  -p <prefix> 限定图标集前缀
 *   --prefixes -P <a,b,c>  逗号分隔的多个前缀
 *   --category -c <cat>    按分类过滤
 *   --compact              紧凑 JSON 输出
 *   --names-only           仅输出图标名称，每行一个
 *   --table                表格形式输出
 *
 * 示例:
 *   node search.js dashboard
 *   node search.js home --limit 10 --prefix lucide
 *   node search.js arrow --category General --compact
 *   node search.js settings --names-only
 */

const { request, printJSON, die, help } = require("./lib/api-client");

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  help(
    "search.js",
    "<keyword> [--limit 64] [--prefix lucide] [--category General] [--names-only] [--table] [--compact]",
    `  node search.js dashboard
  node search.js home --limit 10 --prefix lucide
  node search.js arrow --prefixes "lucide,material-symbols" --table
  node search.js settings --compact | jq .icons`
  );
  process.exit(0);
}

const keyword = args[0];

// 解析命名参数
const params = new URLSearchParams();
params.set("query", keyword);

let compact = false;
let namesOnly = false;
let table = false;

for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case "--limit":
    case "-l":
      params.set("limit", args[++i]);
      break;
    case "--start":
    case "-s":
      params.set("start", args[++i]);
      break;
    case "--prefix":
    case "-p":
      params.set("prefix", args[++i]);
      break;
    case "--prefixes":
    case "-P":
      params.set("prefixes", args[++i]);
      break;
    case "--category":
    case "-c":
      params.set("category", args[++i]);
      break;
    case "--compact":
      compact = true;
      break;
    case "--names-only":
      namesOnly = true;
      break;
    case "--table":
      table = true;
      break;
    default:
      break;
  }
}

(async () => {
  try {
    const data = await request(`/search?${params.toString()}`);

    if (namesOnly) {
      data.icons.forEach((icon) => console.log(icon));
      return;
    }

    if (table) {
      const cols = ["图标名称", "图标集", "集名称", "许可"];
      const colWidths = [42, 18, 22, 12];
      const pad = (s, w) => {
        // 中文字符按 2 宽度计算
        let len = 0;
        for (const ch of String(s)) {
          len += /[\u4e00-\u9fff\uff00-\uffef]/.test(ch) ? 2 : 1;
        }
        return String(s) + " ".repeat(Math.max(0, w - len));
      };

      const sep = colWidths.map((w) => "-".repeat(w)).join("-+-");
      console.log(cols.map((c, i) => pad(c, colWidths[i])).join(" | "));
      console.log(sep);

      const getSetInfo = (icon) => {
        const [prefix] = icon.split(":");
        const col = data.collections[prefix];
        if (!col) return ["", ""];
        return [col.name || "", (col.license && col.license.spdx) || ""];
      };

      let count = 0;
      for (const icon of data.icons) {
        if (count >= 100) {
          console.log(`\n... 共 ${data.total} 条结果，仅显示前 100 条`);
          break;
        }
        const [prefix, name] = icon.split(":");
        const [setName, license] = getSetInfo(icon);
        console.log(
          [pad(icon, colWidths[0]), pad(prefix, colWidths[1]), pad(setName, colWidths[2]), pad(license, colWidths[3])].join(" | ")
        );
        count++;
      }

      console.log(`\n共 ${data.total} 个结果 (limit=${data.limit}, start=${data.start})`);
    } else {
      printJSON(data, compact);
    }
  } catch (err) {
    die(`搜索失败: ${err.message}`);
  }
})();
