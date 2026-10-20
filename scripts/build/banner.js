// 产物统一文件头：全部构建产物（JS / 类型声明 / CSS）顶部只保留这一处注释
//
// 构建期会剥离源码内的全部注释，仅保留本 banner：
// 注释对运行时无用，却会显著增大产物体积，并让内部实现细节随产物外泄。
// 作者与日期不在脚本内硬编码，统一取自仓库根 package.json 与构建当天，避免多份产物文案漂移。
import { createRequire } from 'node:module';

import { resolveRoot } from './paths.js';

const require = createRequire(import.meta.url);

/**
 * 读取仓库根 package.json 的 author 字段
 *
 * 读取失败不影响构建，缺省为空串（banner 退化为不含作者的版权行）。
 *
 * @returns {string} 作者名，缺失时为空串
 */
function readAuthor() {
  try {
    const { author } = require(resolveRoot('package.json'));

    // 统一为「名称 (组织)」的写法，源码里写成 Name(Org) 时也能在产物中对齐
    return typeof author === 'string' ? author.trim().replace(/\s*\(/, ' (') : '';
  } catch {
    return '';
  }
}

/**
 * 格式化为 YYYY/MM/DD
 *
 * 取本机时区日期而非 UTC：构建在中国时区凌晨进行时，UTC 会落到前一天
 *
 * @param {Date} [date] 待格式化的日期，默认当前时间
 * @returns {string} 形如 2026/05/23 的日期文本
 */
function formatDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');

  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

const author = readAuthor();

// 作者缺失时不留多余空格，保证句子结构完整
const holder = author ? ` ${author}.` : '.';

export const BANNER = `/**
 * Copyright (c) ${formatDate()}${holder} Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */
`;
