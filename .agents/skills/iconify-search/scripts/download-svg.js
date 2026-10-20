#!/usr/bin/env node
/**
 * download-svg.js — 下载单个 SVG 图标到本地
 *
 * 从 Iconify API 获取 SVG 并保存为文件。
 *
 * 用法:
 *   node download-svg.js <prefix> <icon-name> [选项]
 *
 * 选项:
 *   --color,  -c <css-color>  图标颜色 (如 #EF4444, red, currentColor)
 *   --width,  -w <px>         宽度
 *   --height, -h <px>         高度
 *   --rotate, -r <deg>        旋转角度 (90, 180, 270)
 *   --flip,   -f <dir>        翻转方向 (horizontal, vertical)
 *   --output, -o <path>       输出文件路径
 *   --print                   打印 SVG 内容到 stdout 而非保存文件
 *
 * 示例:
 *   node download-svg.js lucide home
 *   node download-svg.js lucide home --color "%23EF4444" --output ./icons/red-home.svg
 *   node download-svg.js material-symbols settings --width 48 --height 48
 *   node download-svg.js lucide chevron-right --rotate 90 --print
 */

const fs = require("node:fs");
const path = require("node:path");
const { request, die, help, imgTag, reactJSX } = require("./lib/api-client");

const args = process.argv.slice(2);

if (args.length < 2 || args.includes("--help") || args.includes("-h")) {
  help(
    "download-svg.js",
    "<prefix> <icon-name> [--color red] [--width 48] [--output icon.svg] [--print] [--tag img|react]",
    `  node download-svg.js lucide home
  node download-svg.js lucide home --color "%23EF4444" -o ./icons/red-home.svg
  node download-svg.js material-symbols settings -w 48 -h 48
  node download-svg.js mdi account --print`
  );
  process.exit(0);
}

const prefix = args[0];
const iconName = args[1];

const svgParams = new URLSearchParams();
let outputPath = "";
let printOnly = false;
let tagType = "";

for (let i = 2; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case "--color":
    case "-c":
      svgParams.set("color", args[++i]);
      break;
    case "--width":
    case "-w":
      svgParams.set("width", args[++i]);
      break;
    case "--height":
    case "-h":
      svgParams.set("height", args[++i]);
      break;
    case "--rotate":
    case "-r":
      svgParams.set("rotate", args[++i]);
      break;
    case "--flip":
    case "-f":
      svgParams.set("flip", args[++i]);
      break;
    case "--output":
    case "-o":
      outputPath = args[++i];
      break;
    case "--print":
      printOnly = true;
      break;
    case "--tag":
      tagType = args[++i];
      break;
    default:
      break;
  }
}

// tag 模式：仅生成标签，不下载 SVG
if (tagType === "img") {
  const fullName = `${prefix}:${iconName}`;
  const colorRaw = svgParams.get("color");
  const widthRaw = svgParams.get("width");
  const heightRaw = svgParams.get("height");
  const opts = {};
  if (colorRaw) opts.color = decodeURIComponent(colorRaw);
  if (widthRaw) opts.width = parseInt(widthRaw, 10);
  if (heightRaw) opts.height = parseInt(heightRaw, 10);
  console.log(imgTag(prefix, iconName, opts));
  process.exit(0);
}

if (tagType === "react") {
  const fullName = `${prefix}:${iconName}`;
  const colorRaw = svgParams.get("color");
  const widthRaw = svgParams.get("width");
  const heightRaw = svgParams.get("height");
  const opts = {};
  if (colorRaw) opts.color = decodeURIComponent(colorRaw);
  if (widthRaw) opts.width = parseInt(widthRaw, 10);
  if (heightRaw) opts.height = parseInt(heightRaw, 10);
  console.log(reactJSX(fullName, opts));
  process.exit(0);
}

// download 模式
const svgPath = `/${prefix}/${iconName}.svg${svgParams.size ? "?" + svgParams.toString() : ""}`;

(async () => {
  try {
    // 追加 download 参数以获取 attachment header（仅保存文件时）
    const dlPath = outputPath ? svgPath + (svgPath.includes("?") ? "&" : "?") + "download=1" : svgPath;
    const svg = await request(dlPath, { text: true });

    if (printOnly) {
      console.log(svg);
      return;
    }

    const targetPath = outputPath || `${iconName}.svg`;
    const dir = path.dirname(targetPath);
    if (dir && dir !== "." && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(targetPath, svg, "utf-8");
    console.log(`✓ 已保存: ${path.resolve(targetPath)} (${svg.length} bytes)`);
  } catch (err) {
    die(`下载失败: ${err.message}`);
  }
})();
