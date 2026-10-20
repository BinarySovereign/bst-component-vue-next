#!/usr/bin/env node
/**
 * get-icon-data.js — 获取图标的 JSON 数据（SVG body）
 *
 * 调用 GET https://api.iconify.design/{prefix}.json?icons={names}
 *
 * 用法:
 *   node get-icon-data.js <prefix> <icon1> [icon2 ...] [选项]
 *
 * 选项:
 *   --output,  -o <path>   保存 JSON 到文件
 *   --compact               紧凑 JSON
 *   --body-only             仅输出 body 字段
 *   --pipe                  从 stdin 读取图标名列表（每行一个）
 *
 * 示例:
 *   node get-icon-data.js lucide home settings user
 *   node get-icon-data.js mdi account --compact
 *   node get-icon-data.js lucide home --output ./icon-data.json
 *   node search.js home --names-only | node get-icon-data.js lucide --pipe --compact
 */

const fs = require("node:fs");
const { request, printJSON, die, help } = require("./lib/api-client");

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  help(
    "get-icon-data.js",
    "<prefix> <icon1> [icon2 ...] [--output data.json] [--compact] [--body-only] [--pipe]",
    `  node get-icon-data.js lucide home settings user
  node get-icon-data.js mdi account --compact
  node get-icon-data.js lucide home --output ./data.json
  node search.js home --names-only | node get-icon-data.js lucide --pipe --compact`
  );
  process.exit(0);
}

let prefix = "";
let compact = false;
let bodyOnly = false;
let pipeMode = false;
let outputPath = "";
const iconList = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case "--output":
    case "-o":
      outputPath = args[++i];
      break;
    case "--compact":
      compact = true;
      break;
    case "--body-only":
      bodyOnly = true;
      break;
    case "--pipe":
      pipeMode = true;
      break;
    default:
      if (!prefix) {
        prefix = arg;
      } else {
        iconList.push(arg);
      }
      break;
  }
}

async function main() {
  let icons = [];

  if (pipeMode) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const input = Buffer.concat(chunks).toString().trim();
    if (!input) die("stdin 无数据");
    icons = input
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        // 处理 "prefix:name" 或纯 "name" 格式
        if (trimmed.includes(":")) {
          const [, name] = trimmed.split(":");
          return name.trim();
        }
        return trimmed;
      })
      .filter(Boolean);
  } else {
    icons = iconList;
  }

  if (!prefix) die("请提供图标集前缀");
  if (icons.length === 0) die("请提供至少一个图标名称");

  try {
    const names = icons.join(",");
    const data = await request(
      `/${encodeURIComponent(prefix)}.json?icons=${encodeURIComponent(names)}`
    );

    if (bodyOnly) {
      for (const [name, iconData] of Object.entries(data.icons || {})) {
        if (iconData.body) {
          console.log(`${name}: ${iconData.body}`);
        }
      }
      return;
    }

    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(data, null, compact ? 0 : 2), "utf-8");
      console.log(`✓ 已保存: ${outputPath}`);
    } else {
      printJSON(data, compact);
    }
  } catch (err) {
    die(`获取图标数据失败: ${err.message}`);
  }
}

main().catch((err) => die(err.message));
