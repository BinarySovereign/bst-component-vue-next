#!/usr/bin/env node
/**
 * batch-download.js — 批量下载多个 SVG 图标
 *
 * 支持两种输入模式：
 *   1. 直接列出图标名称
 *   2. 配合 search.js 输出 → 管道批量下载
 *
 * 用法:
 *   node batch-download.js <prefix> <icon1> <icon2> ... [选项]
 *   node search.js dashboard --names-only | node batch-download.js --pipe [选项]
 *
 * 选项:
 *   --prefix,  -p <prefix>  图标集前缀
 *   --color,   -c <color>   统一颜色
 *   --width,   -w <px>      统一宽度
 *   --height,  -H <px>      统一高度
 *   --output,  -o <dir>     输出目录 (默认 ./icons)
 *   --pipe                   从 stdin 读取图标列表（每行一个，格式 "prefix:name" 或纯图标名）
 *   --dry-run                仅列出将要下载的文件，不实际下载
 *
 * 示例:
 *   node batch-download.js lucide home settings user search menu -o ./public/icons
 *   node batch-download.js --prefix lucide file folder image calendar mail link -o ./icons
 *   node search.js dashboard --names-only | node batch-download.js --pipe -o ./icons
 *   node batch-download.js --pipe --dry-run < icons.txt
 */

const fs = require("node:fs");
const path = require("node:path");
const { request, die, help } = require("./lib/api-client");

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  help(
    "batch-download.js",
    "[--prefix lucide] <icon1> <icon2> ... [--output ./icons] [--pipe] [--dry-run]",
    `  node batch-download.js lucide home settings user -o ./public/icons
  node batch-download.js --prefix lucide file folder image -o ./icons
  node search.js dashboard --names-only | node batch-download.js --pipe -o ./icons
  node batch-download.js --pipe --dry-run < icons.txt`
  );
  process.exit(0);
}

let prefix = "";
let outputDir = "./icons";
let color = "";
let width = "";
let height = "";
let pipeMode = false;
let dryRun = false;
const iconList = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case "--prefix":
    case "-p":
      prefix = args[++i];
      break;
    case "--output":
    case "-o":
      outputDir = args[++i];
      break;
    case "--color":
    case "-c":
      color = args[++i];
      break;
    case "--width":
    case "-w":
      width = args[++i];
      break;
    case "--height":
    case "-H":
      height = args[++i];
      break;
    case "--pipe":
      pipeMode = true;
      break;
    case "--dry-run":
      dryRun = true;
      break;
    default:
      iconList.push(arg);
      break;
  }
}

/**
 * 解析图标名称 → { prefix, name }
 */
function parseIcon(raw) {
  // 去掉可能的空白和引号
  let val = raw.trim().replace(/^["']|["']$/g, "");
  if (!val) return null;

  if (val.includes(":")) {
    const [p, ...rest] = val.split(":");
    return { prefix: p, name: rest.join(":") };
  } else if (prefix) {
    return { prefix, name: val };
  } else {
    return null;
  }
}

async function main() {
  let icons = [];

  if (pipeMode) {
    // 从 stdin 读取
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const input = Buffer.concat(chunks).toString().trim();
    if (!input) {
      die("stdin 无数据");
    }
    icons = input
      .split("\n")
      .map(parseIcon)
      .filter(Boolean);
  } else {
    // 从命令行参数读取
    if (iconList.length === 0) {
      die("请提供图标名称或使用 --pipe 从 stdin 读取");
    }
    if (prefix) {
      icons = iconList.map((name) => ({ prefix, name }));
    } else {
      icons = iconList.map(parseIcon).filter(Boolean);
    }
  }

  if (icons.length === 0) {
    die("没有可下载的图标");
  }

  // 构建 SVG 参数
  const svgParams = new URLSearchParams();
  if (color) svgParams.set("color", encodeURIComponent(color));
  if (width) svgParams.set("width", width);
  if (height) svgParams.set("height", height);
  svgParams.set("download", "1");

  // 创建输出目录
  if (!dryRun && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`共 ${icons.length} 个图标即将下载到 ${outputDir}/`);
  if (dryRun) {
    console.log("[DRY-RUN] 仅预览，不实际下载\n");
  }

  let success = 0;
  let failed = 0;

  for (const { prefix: p, name: n } of icons) {
    const qs = svgParams.toString();
    const svgPath = `/${p}/${n}.svg${qs ? "?" + qs : ""}`;
    const fileName = `${p}-${n.replace(/[/\\]/g, "-")}.svg`;
    const filePath = path.join(outputDir, fileName);

    if (dryRun) {
      console.log(`  → ${filePath}`);
      success++;
      continue;
    }

    process.stdout.write(`  下载 ${p}:${n} ... `);
    try {
      const svg = await request(svgPath, { text: true });
      fs.writeFileSync(filePath, svg, "utf-8");
      console.log(`✓ (${svg.length} B)`);
      success++;
    } catch (err) {
      console.log(`✗ ${err.message.slice(0, 50)}`);
      failed++;
    }

    // 简单的速率控制，避免过于激进
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n完成: ${success} 成功, ${failed} 失败`);
}

main().catch((err) => die(err.message));
