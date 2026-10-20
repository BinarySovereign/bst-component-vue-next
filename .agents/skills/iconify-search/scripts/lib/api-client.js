/**
 * Iconify API Client — 共享网络请求与格式化工具
 *
 * 所有脚本均通过此模块调用 Iconify API，
 * 确保一致的请求处理、错误报告和输出格式化。
 */

const https = require("node:https");
const http = require("node:http");

const API_BASE = "api.iconify.design";

/**
 * 发起 GET 请求并返回解析后的 JSON 或纯文本
 * @param {string} pathname - API 路径，含 query string
 * @param {object} [opts={}]
 * @param {boolean} [opts.text=false] - 是否返回纯文本而非 JSON
 * @returns {Promise<object|string>}
 */
function request(pathname, opts = {}) {
  const { text = false } = opts;

  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        hostname: API_BASE,
        path: pathname,
        headers: { Accept: "application/json" },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 400) {
            const preview = data.slice(0, 300);
            return reject(
              new Error(`HTTP ${res.statusCode} ${res.statusMessage}\n${preview}`)
            );
          }
          if (text) return resolve(data);
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("请求超时 (15s)"));
    });
  });
}

/**
 * 输出格式化的 JSON
 * @param {object} data
 * @param {boolean} [compact=false]
 */
function printJSON(data, compact = false) {
  console.log(JSON.stringify(data, null, compact ? 0 : 2));
}

/**
 * 输出错误信息并退出
 * @param {string} message
 * @param {number} [code=1]
 */
function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

/**
 * 输出使用说明
 * @param {string} scriptName - 脚本文件名
 * @param {string} usage - 用法描述
 * @param {string} [examples=''] - 示例
 */
function help(scriptName, usage, examples = "") {
  console.log(`用法: node ${scriptName} ${usage}`);
  if (examples) console.log(`\n示例:\n${examples}`);
}

// ------------- 模板字面量工具 -------------

/**
 * 生成 SVG 标签，可直接嵌入 HTML
 * @param {string} prefix - 图标集前缀
 * @param {string} name - 图标名称
 * @param {object} [opts={}]
 * @param {string} [opts.color] - CSS 颜色值
 * @param {number} [opts.width]
 * @param {number} [opts.height]
 * @returns {string} <img> 标签
 */
function imgTag(prefix, name, opts = {}) {
  const params = [];
  if (opts.color) params.push(`color=${encodeURIComponent(opts.color)}`);
  if (opts.width) params.push(`width=${opts.width}`);
  if (opts.height) params.push(`height=${opts.height}`);
  const qs = params.length ? "?" + params.join("&") : "";
  const src = `https://api.iconify.design/${prefix}/${name}.svg${qs}`;
  return `<img src="${src}" alt="${name}" class="iconify-icon">`;
}

/**
 * 生成 @iconify/react 组件 JSX
 * @param {string} name - 格式 "prefix:name"
 * @param {object} [opts={}]
 * @returns {string}
 */
function reactJSX(name, opts = {}) {
  const attrs = [];
  if (opts.color) attrs.push(`color="${opts.color}"`);
  if (opts.width) attrs.push(`width={${opts.width}}`);
  if (opts.height) attrs.push(`height={${opts.height}}`);
  const attrStr = attrs.length ? " " + attrs.join(" ") : "";
  return `<Icon icon="${name}"${attrStr} />`;
}

module.exports = { request, printJSON, die, help, imgTag, reactJSX };
