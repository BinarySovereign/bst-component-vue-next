#!/usr/bin/env node
// 提交信息校验：按 `docs/rules/commit-msg-rules.md` 校验 `docs/commit-msg` 下的归档文件
//
// 用法：
//   node scripts/ci/check-commit-msg.js              校验序号最大的一份（本地提交前用）
//   node scripts/ci/check-commit-msg.js --msg 3      校验指定序号
//   node scripts/ci/check-commit-msg.js --all        校验全部归档文件（CI 用）
//   node scripts/ci/check-commit-msg.js --help / -h
//
// 校验规则：中文块 + `---` + 英文块 + 署名行，两块各自含 `type: 标题` 与逐条正文，
// 提交类型限定 11 种，标题与条目末尾不得加标点，两块条目数需一一对应。
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

import { resolveRoot } from '../build/paths.js';
import { printUsage as printUsageBlock } from './usage.js';

// 提交信息归档目录，相对工作区根
const COMMIT_MSG_DIR = 'docs/commit-msg';

// 提交信息文件名前缀，完整文件名为 commit-msg-<序号>.md
const COMMIT_MSG_PREFIX = 'commit-msg-';

// 提交信息文件后缀，按规范必须为 .md
const COMMIT_MSG_EXTENSION = '.md';

// 允许的提交类型，与 docs/rules/commit-msg-rules.md 的表格保持一致
const COMMIT_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];

// 标题行：类型、半角冒号、一个空格与摘要
const TITLE_PATTERN = /^([A-Za-z][A-Za-z]*): (\S.*)$/;

// 语言块分隔行
const BLOCK_SEPARATOR = '---';

// 正文条目前缀
const BULLET_PREFIX = '- ';

// 署名行：Copyright (c) <年份> <作者署名>. All rights reserved.
const SIGNATURE_PATTERN = /^Copyright \(c\) \d{4} .+\. All rights reserved\.$/;

// 句末标点，标题与正文条目均不得以之结尾
const TRAILING_PUNCTUATION_PATTERN = /[，。；：！？、,.;:!?]$/;

// 中文标题的最大字数
const TITLE_MAX_LENGTH = 30;

// 文件名中的序号匹配，后缀可省略以兼容历史归档
const MESSAGE_FILE_PATTERN = new RegExp(`^${COMMIT_MSG_PREFIX}(\\d+)(?:${COMMIT_MSG_EXTENSION.replace('.', '\\.')})?$`);

// 进程退出码
const EXIT_CODE = {
  // 全部文件通过校验
  ok: 0,
  // 存在不符合规范的文件
  failed: 1,
  // 参数错误或找不到目标文件
  usage: 2,
};

/**
 * 输出用法说明
 *
 * @returns {void}
 */
function printUsage() {
  printUsageBlock({
    title: '提交信息校验',
    description: `按 docs/rules/commit-msg-rules.md 校验 ${COMMIT_MSG_DIR}/ 下的归档文件`,
    sections: [
      {
        heading: '用法',
        entries: [
          { command: 'node scripts/ci/check-commit-msg.js', description: '校验序号最大的一份（本地提交前用）' },
          { command: 'node scripts/ci/check-commit-msg.js --msg 3', description: '校验指定序号' },
          { command: 'node scripts/ci/check-commit-msg.js --all', description: '校验全部归档文件（CI 用）' },
          { command: 'node scripts/ci/check-commit-msg.js --help', description: '显示本说明' },
        ],
      },
    ],
    notes: [
      `归档目录：${COMMIT_MSG_DIR}/，文件名为 ${COMMIT_MSG_PREFIX}<序号>${COMMIT_MSG_EXTENSION}`,
      '规范见 docs/rules/commit-msg-rules.md',
    ],
  });
}

/**
 * 去掉数组首尾的空行
 *
 * @param {string[]} lines 行数组
 * @returns {string[]} 去掉首尾空行后的副本
 */
function trimBlankLines(lines) {
  let start = 0;
  let end = lines.length;

  while (start < end && lines[start].trim() === '') {
    start += 1;
  }

  while (end > start && lines[end - 1].trim() === '') {
    end -= 1;
  }

  return lines.slice(start, end);
}

/**
 * 校验单个语言块
 *
 * @param {string[]} lines 块内行（已去掉首尾空行）
 * @param {'zh' | 'en'} language 语言标识
 * @returns {{ titleType: string, entries: number, errors: string[] }} 解析结果
 */
function parseBlock(lines, language) {
  const label = language === 'zh' ? '中文块' : '英文块';
  const errors = [];
  const result = { titleType: '', entries: 0, errors };

  if (lines.length === 0) {
    errors.push(`${label}内容为空`);
    return result;
  }

  const [titleLine, ...rest] = lines;
  const matched = TITLE_PATTERN.exec(titleLine);

  if (!matched) {
    errors.push(`${label}标题需写成 "type: 描述"（第 1 行：${titleLine}）`);
  } else {
    const [, type, text] = matched;
    result.titleType = type;

    if (!COMMIT_TYPES.includes(type)) {
      errors.push(`${label}的提交类型 "${type}" 不在允许列表：${COMMIT_TYPES.join(' / ')}`);
    }

    if (TRAILING_PUNCTUATION_PATTERN.test(text)) {
      errors.push(`${label}标题末尾不得加标点（当前：${text}）`);
    }

    if (language === 'zh' && [...text].length > TITLE_MAX_LENGTH) {
      errors.push(`${label}标题不得超过 ${TITLE_MAX_LENGTH} 字（当前 ${[...text].length} 字）`);
    }
  }

  if (rest.length === 0) {
    errors.push(`${label}标题之后需空一行并至少写 1 条正文`);
    return result;
  }

  if (rest[0].trim() !== '') {
    errors.push(`${label}标题与正文之间需空一行`);
    return result;
  }

  const entries = rest.slice(1);

  if (entries.length === 0) {
    errors.push(`${label}至少需要 1 条正文条目`);
    return result;
  }

  result.entries = entries.length;

  for (const entry of entries) {
    if (entry.trim() === '') {
      errors.push(`${label}正文条目之间不得空行`);
      continue;
    }

    if (!entry.startsWith(BULLET_PREFIX)) {
      errors.push(`${label}每条正文需以 "${BULLET_PREFIX}" 开头（当前：${entry}）`);
      continue;
    }

    const text = entry.slice(BULLET_PREFIX.length).trim();

    if (text === '') {
      errors.push(`${label}正文条目不得为空`);
      continue;
    }

    if (TRAILING_PUNCTUATION_PATTERN.test(text)) {
      errors.push(`${label}正文条目末尾不得加标点（当前：${text}）`);
    }
  }

  return result;
}

/**
 * 校验提交信息全文
 *
 * @param {string} content 提交信息内容
 * @returns {{ ok: boolean, errors: string[] }} 校验结果
 */
function validateMessage(content) {
  const errors = [];
  const lines = trimBlankLines(content.replace(/\r\n/g, '\n').split('\n'));

  if (lines.length === 0) {
    return { ok: false, errors: ['提交信息内容为空'] };
  }

  const separatorIndexes = [];

  lines.forEach((line, index) => {
    if (line.trim() === BLOCK_SEPARATOR) {
      separatorIndexes.push(index);
    }
  });

  if (separatorIndexes.length !== 1) {
    return {
      ok: false,
      errors: [`提交信息需恰好包含一个独占一行的 "${BLOCK_SEPARATOR}" 分隔行，实际为 ${separatorIndexes.length} 个`],
    };
  }

  const separatorIndex = separatorIndexes[0];

  if (lines[separatorIndex - 1]?.trim() !== '') {
    errors.push(`"${BLOCK_SEPARATOR}" 分隔行之前需空一行`);
  }

  if (lines[separatorIndex + 1]?.trim() !== '') {
    errors.push(`"${BLOCK_SEPARATOR}" 分隔行之后需空一行`);
  }

  const signatureIndex = lines.length - 1;

  if (!SIGNATURE_PATTERN.test(lines[signatureIndex])) {
    errors.push(
      `最后一行需为署名行，格式 "Copyright (c) <年份> <作者署名>. All rights reserved."（当前：${lines[signatureIndex]}）`,
    );
  }

  if (lines[signatureIndex - 1]?.trim() !== '') {
    errors.push('署名行之前需空一行');
  }

  const signatureCount = lines.filter((line) => SIGNATURE_PATTERN.test(line)).length;

  if (signatureCount !== 1) {
    errors.push(`署名行全文只能出现一次，实际出现 ${signatureCount} 次`);
  }

  const zhResult = parseBlock(trimBlankLines(lines.slice(0, separatorIndex)), 'zh');
  const enResult = parseBlock(trimBlankLines(lines.slice(separatorIndex + 1, signatureIndex)), 'en');

  errors.push(...zhResult.errors, ...enResult.errors);

  if (zhResult.titleType && enResult.titleType && zhResult.titleType !== enResult.titleType) {
    errors.push(`中文块与英文块的提交类型需一致（中文 "${zhResult.titleType}"，英文 "${enResult.titleType}"）`);
  }

  if (zhResult.entries !== enResult.entries) {
    errors.push(`中文块与英文块的正文条目数需一一对应（中文 ${zhResult.entries} 条，英文 ${enResult.entries} 条）`);
  }

  return { ok: errors.length === 0, errors };
}

/**
 * 列出全部提交信息文件
 *
 * @returns {Promise<Array<{ name: string, sequence: number, path: string }>>} 按序号升序排列
 */
async function listMessageFiles() {
  const dir = resolveRoot(COMMIT_MSG_DIR);

  let names;

  try {
    names = await readdir(dir);
  } catch {
    return [];
  }

  return names
    .map((name) => {
      const matched = MESSAGE_FILE_PATTERN.exec(name);

      return matched ? { name, sequence: Number.parseInt(matched[1], 10), path: join(dir, name) } : null;
    })
    .filter((item) => item !== null)
    .sort((left, right) => left.sequence - right.sequence);
}

/**
 * 校验单个文件并输出结果
 *
 * @param {{ name: string, path: string }} file 待校验文件
 * @returns {Promise<boolean>} 通过返回 true
 */
async function checkFile(file) {
  const result = validateMessage(await readFile(file.path, 'utf8'));

  if (result.ok) {
    process.stdout.write(`  ✔ ${COMMIT_MSG_DIR}/${file.name}\n`);
    return true;
  }

  process.stdout.write(`  ✖ ${COMMIT_MSG_DIR}/${file.name}\n`);

  for (const error of result.errors) {
    process.stdout.write(`      - ${error}\n`);
  }

  return false;
}

/**
 * 解析命令行参数
 *
 * @param {string[]} argv 进程参数（已去除前两个）
 * @returns {{ mode: 'latest' | 'all' | 'help', sequence?: number }} 解析结果
 */
function parseArgs(argv) {
  const options = { mode: 'latest', sequence: undefined };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--') {
      // 包管理器透传参数时会带回分隔符本身，忽略即可
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.mode = 'help';
    } else if (arg === '--all') {
      options.mode = 'all';
    } else if (arg === '--msg') {
      const value = argv[index + 1];

      if (value === undefined || value.startsWith('-')) {
        throw new Error('--msg 需要提供一个序号');
      }

      const sequence = Number.parseInt(value, 10);

      if (Number.isNaN(sequence) || sequence < 1) {
        throw new Error(`--msg 需要提供正整数序号，收到 "${value}"`);
      }

      options.mode = 'latest';
      options.sequence = sequence;
      index += 1;
    } else {
      throw new Error(`未知参数：${arg}（执行 --help 查看用法）`);
    }
  }

  return options;
}

/**
 * 执行校验
 *
 * @returns {Promise<number>} 进程退出码
 */
async function main() {
  let options;

  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`\n✖ ${error instanceof Error ? error.message : String(error)}\n\n`);
    return EXIT_CODE.usage;
  }

  if (options.mode === 'help') {
    printUsage();
    return EXIT_CODE.ok;
  }

  const files = await listMessageFiles();

  if (files.length === 0) {
    process.stderr.write(
      `\n✖ 未在 ${COMMIT_MSG_DIR}/ 找到任何 ${COMMIT_MSG_PREFIX}<序号>${COMMIT_MSG_EXTENSION} 文件\n\n`,
    );
    return EXIT_CODE.usage;
  }

  let targets = files;

  if (options.sequence !== undefined) {
    targets = files.filter((file) => file.sequence === options.sequence);

    if (targets.length === 0) {
      process.stderr.write(
        `\n✖ 未找到 ${COMMIT_MSG_DIR}/${COMMIT_MSG_PREFIX}${options.sequence}${COMMIT_MSG_EXTENSION}，现有序号：${files
          .map((file) => file.sequence)
          .join(' / ')}\n\n`,
      );
      return EXIT_CODE.usage;
    }
  } else if (options.mode === 'latest') {
    targets = [files[files.length - 1]];
  }

  process.stdout.write(`\n▸ 提交信息校验（${targets.length} 份）\n`);

  let failed = 0;

  for (const file of targets) {
    // 逐份串行校验，保持输出顺序与序号一致
    const passed = await checkFile(file);

    if (!passed) {
      failed += 1;
    }
  }

  process.stdout.write('\n');

  if (failed > 0) {
    process.stderr.write(`✖ ${failed} 份提交信息不符合 docs/rules/commit-msg-rules.md\n\n`);
    return EXIT_CODE.failed;
  }

  process.stdout.write('✔ 全部符合规范\n\n');
  return EXIT_CODE.ok;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    process.stderr.write(`\n✖ ${error instanceof Error ? error.message : String(error)}\n\n`);
    process.exitCode = EXIT_CODE.failed;
  },
);
