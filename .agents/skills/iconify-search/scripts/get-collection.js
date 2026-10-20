#!/usr/bin/env node
/**
 * get-collection.js — 获取指定图标集内的所有图标列表
 *
 * 调用 GET https://api.iconify.design/collection?prefix={prefix}
 *
 * 用法:
 *   node get-collection.js <prefix> [选项]
 *
 * 选项:
 *   --search,  -s <keyword>  在图标集内按名称搜索
 *   --top,     -t <n>        只显示前 n 个
 *   --names-only              仅输出图标名列表，每行一个
 *   --compact                 紧凑 JSON
 *
 * 示例:
 *   node get-collection.js lucide
 *   node get-collection.js lucide --search home
 *   node get-collection.js material-symbols --names-only --top 50
 */

const { request, printJSON, die, help } = require("./lib/api-client");

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  help(
    "get-collection.js",
    "<prefix> [--search home] [--names-only] [--top 50]",
    `  node get-collection.js lucide
  node get-collection.js lucide --search home
  node get-collection.js material-symbols --names-only --top 50`
  );
  process.exit(0);
}

const prefix = args[0];
let search = "";
let top = 0;
let namesOnly = false;
let compact = false;

for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case "--search":
    case "-s":
      search = args[++i].toLowerCase();
      break;
    case "--top":
    case "-t":
      top = parseInt(args[++i], 10);
      break;
    case "--names-only":
      namesOnly = true;
      break;
    case "--compact":
      compact = true;
      break;
    default:
      break;
  }
}

(async () => {
  try {
    const data = await request(`/collection?prefix=${encodeURIComponent(prefix)}`);

    let icons = [];

    // 响应格式可能是不同的（categorized / uncategorized）
    if (data.icons && Array.isArray(data.icons)) {
      icons = data.icons;
    } else if (data.categories) {
      // categorized 格式
      for (const cat of Object.values(data.categories)) {
        if (Array.isArray(cat)) icons.push(...cat);
      }
    } else if (data.uncategorized) {
      icons = data.uncategorized;
    }

    // 搜索过滤
    if (search) {
      icons = icons.filter((name) => name.toLowerCase().includes(search));
    }

    // top 截取
    if (top > 0) icons = icons.slice(0, top);

    if (namesOnly) {
      icons.forEach((name) => console.log(name));
      return;
    }

    console.log(`图标集: ${data.name || prefix} (${prefix})`);
    console.log(`图标总数: ${data.total || icons.length}`);
    if (data.author) console.log(`作者: ${data.author.name}`);
    if (data.license) console.log(`许可: ${data.license.title} (${data.license.spdx})`);
    console.log(`分类: ${data.category || "-"}\n`);

    if (icons.length <= 200) {
      // 小量显示为列式列表
      const cols = 4;
      const colWidth = 30;
      for (let i = 0; i < icons.length; i += cols) {
        const row = icons
          .slice(i, i + cols)
          .map((name) => name.padEnd(colWidth))
          .join("");
        console.log(`  ${row}`);
      }
    } else {
      printJSON(icons, compact);
    }

    console.log(`\n显示: ${Math.min(icons.length, top || icons.length)} / ${data.total || icons.length}`);
  } catch (err) {
    die(`获取图标集失败: ${err.message}`);
  }
})();
