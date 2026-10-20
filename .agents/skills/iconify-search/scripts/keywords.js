#!/usr/bin/env node
/**
 * keywords.js — 关键词自动补全建议
 *
 * 调用 GET https://api.iconify.design/keywords?keyword={keyword}
 *
 * 用法:
 *   node keywords.js <keyword> [选项]
 *
 * 选项:
 *   --prefix,  -p <prefix>  限定图标集前缀
 *   --top,     -t <n>       只显示前 n 条
 *   --compact                紧凑输出
 *
 * 示例:
 *   node keywords.js home
 *   node keywords.js hom --prefix lucide --top 10
 *   node keywords.js arr --compact
 */

const { request, printJSON, die, help } = require("./lib/api-client");

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  help(
    "keywords.js",
    "<keyword> [--prefix lucide] [--top 10]",
    `  node keywords.js home
  node keywords.js hom --prefix lucide --top 10`
  );
  process.exit(0);
}

const keyword = args[0];
let prefix = "";
let top = 0;
let compact = false;

for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case "--prefix":
    case "-p":
      prefix = args[++i];
      break;
    case "--top":
    case "-t":
      top = parseInt(args[++i], 10);
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
    const params = new URLSearchParams();
    params.set("keyword", keyword);
    if (prefix) params.set("prefix", prefix);

    const data = await request(`/keywords?${params.toString()}`);

    // 响应格式为字符串数组
    let keywords = Array.isArray(data) ? data : [];

    if (top > 0) keywords = keywords.slice(0, top);

    if (compact) {
      printJSON(keywords, true);
    } else {
      console.log(`匹配 "${keyword}" 的关键词 (共 ${keywords.length} 条):\n`);
      keywords.forEach((kw, i) => {
        console.log(`  ${String(i + 1).padStart(3)}. ${kw}`);
      });
    }
  } catch (err) {
    die(`获取关键词失败: ${err.message}`);
  }
})();
