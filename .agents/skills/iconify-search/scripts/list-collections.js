#!/usr/bin/env node
/**
 * list-collections.js — 列出所有可用的图标集
 *
 * 调用 GET https://api.iconify.design/collections
 *
 * 用法:
 *   node list-collections.js [选项]
 *
 * 选项:
 *   --filter,  -f <keyword>  按名称过滤 (不区分大小写)
 *   --category -c <cat>       按分类过滤
 *   --prefixes -p <a,b,c>     仅返回指定前缀的图标集
 *   --sort,    -s <field>     排序字段 (name, total; 默认 name)
 *   --table                   表格形式输出
 *   --compact                 紧凑 JSON 输出
 *   --names-only              仅输出前缀列表，每行一个
 *   --top,     -t <n>         只显示前 n 个
 *
 * 示例:
 *   node list-collections.js --top 10
 *   node list-collections.js --filter material
 *   node list-collections.js --category General --sort total --table
 *   node list-collections.js --names-only
 */

const { request, printJSON, die, help } = require("./lib/api-client");

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  help(
    "list-collections.js",
    "[--filter material] [--category General] [--sort total] [--table] [--names-only] [--top 10]",
    `  node list-collections.js --top 10
  node list-collections.js --filter material --table
  node list-collections.js --category General --sort total
  node list-collections.js --names-only`
  );
  process.exit(0);
}

let filter = "";
let category = "";
let prefixes = "";
let sortField = "name";
let table = false;
let compact = false;
let namesOnly = false;
let top = 0;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case "--filter":
    case "-f":
      filter = args[++i].toLowerCase();
      break;
    case "--category":
    case "-c":
      category = args[++i];
      break;
    case "--prefixes":
    case "-p":
      prefixes = args[++i];
      break;
    case "--sort":
    case "-s":
      sortField = args[++i];
      break;
    case "--table":
      table = true;
      break;
    case "--compact":
      compact = true;
      break;
    case "--names-only":
      namesOnly = true;
      break;
    case "--top":
    case "-t":
      top = parseInt(args[++i], 10);
      break;
    default:
      break;
  }
}

(async () => {
  try {
    const params = new URLSearchParams();
    if (prefixes) params.set("prefixes", prefixes);
    const data = await request(`/collections?${params.toString()}`);

    // 过滤
    let entries = Object.entries(data);
    if (filter) {
      entries = entries.filter(
        ([key, info]) =>
          key.toLowerCase().includes(filter) ||
          (info.name && info.name.toLowerCase().includes(filter))
      );
    }
    if (category) {
      entries = entries.filter(
        ([, info]) => info.category && info.category === category
      );
    }

    // 排序
    if (sortField === "total") {
      entries.sort((a, b) => (b[1].total || 0) - (a[1].total || 0));
    } else {
      entries.sort((a, b) => a[0].localeCompare(b[0]));
    }

    // 截取
    if (top > 0) entries = entries.slice(0, top);

    // 输出
    if (namesOnly) {
      entries.forEach(([key]) => console.log(key));
      return;
    }

    if (table) {
      const cols = ["前缀", "名称", "图标数", "分类", "许可", "高度"];
      const widths = [22, 26, 8, 12, 12, 6];
      const pad = (s, w) => {
        let len = 0;
        for (const ch of String(s)) {
          len += /[\u4e00-\u9fff\uff00-\uffef]/.test(ch) ? 2 : 1;
        }
        return String(s) + " ".repeat(Math.max(0, w - len));
      };

      const sep = widths.map((w) => "-".repeat(w)).join("-+-");
      console.log(cols.map((c, i) => pad(c, widths[i])).join(" | "));
      console.log(sep);

      for (const [key, info] of entries) {
        console.log(
          [
            pad(key, widths[0]),
            pad(info.name || "-", widths[1]),
            pad(String(info.total || ""), widths[2]),
            pad(info.category || "-", widths[3]),
            pad((info.license && info.license.spdx) || "-", widths[4]),
            pad(String(info.height || ""), widths[5]),
          ].join(" | ")
        );
      }

      console.log(`\n共 ${entries.length} 个图标集`);
    } else {
      const output = {};
      for (const [key, info] of entries) {
        output[key] = {
          name: info.name,
          total: info.total,
          category: info.category,
          license: info.license ? info.license.spdx : undefined,
          height: info.height,
          author: info.author ? info.author.name : undefined,
        };
      }
      printJSON(output, compact);
    }
  } catch (err) {
    die(`获取图标集列表失败: ${err.message}`);
  }
})();
