// 清单同步校验：解析 `.github/workflows/ci.yml` 的 run 命令，与本地门禁清单逐条比对
//
// 只做必要的 YAML 解析：抽取所有 `run:` 条目（含 `|` / `>` 块标量），
// 归一化空白后与 `steps.js` 的命令按顺序比较。`uses:` 准备步骤不参与比对。
import { readFile } from 'node:fs/promises';

import { resolveRoot } from '../build/paths.js';
import { STEPS, getStepCommand } from './steps.js';

// CI 工作流文件，相对工作区根
const CI_FILE = '.github/workflows/ci.yml';

// 不参与门禁比对的命令：
// - 同步校验自身：它只存在于 ci.yml
// - 依赖安装：由 preflight 与 `--install` 承担，不占用门禁步骤编号
const IGNORED_COMMANDS = new Set(['pnpm ci:local --check-sync', 'pnpm install --frozen-lockfile']);

/**
 * 归一化命令文本：合并连续空白并去掉首尾空白
 *
 * @param {string} text 原始文本
 * @returns {string} 归一化结果
 */
export function normalizeCommand(text) {
  return text
    .split(/\s+/)
    .filter((item) => item !== '')
    .join(' ');
}

/**
 * 从 YAML 文本中抽取全部 run 命令
 *
 * @param {string} content YAML 文件内容
 * @returns {string[]} 归一化后的命令列表，按出现顺序
 */
export function extractRunCommands(content) {
  const lines = content.split(/\r?\n/);
  const commands = [];

  for (let index = 0; index < lines.length; index += 1) {
    const match = /^(\s*)(?:-\s+)?run:(\s.*)?$/.exec(lines[index]);

    if (!match) {
      continue;
    }

    const indent = match[1].length;
    const inline = (match[2] ?? '').trim();

    // 块标量（`run: >-` / `run: |`）需要继续向下收集缩进更深的行
    if (inline === '' || inline.startsWith('|') || inline.startsWith('>')) {
      const block = [];
      let blockIndent = null;
      let cursor = index + 1;

      while (cursor < lines.length) {
        const line = lines[cursor];

        if (line.trim() === '') {
          block.push('');
          cursor += 1;
          continue;
        }

        const currentIndent = line.length - line.trimStart().length;

        if (currentIndent <= indent) {
          break;
        }

        if (blockIndent === null) {
          blockIndent = currentIndent;
        }

        block.push(line.slice(Math.min(blockIndent, currentIndent)));
        cursor += 1;
      }

      index = cursor - 1;
      commands.push(normalizeCommand(block.join(' ')));

      continue;
    }

    commands.push(normalizeCommand(inline));
  }

  return commands;
}

/**
 * 校验本地清单与 ci.yml 是否逐条一致
 *
 * @returns {Promise<{ ok: boolean, issues: string[], expected: string[], actual: string[] }>} 校验结果
 */
export async function checkSync() {
  let content;

  try {
    content = await readFile(resolveRoot(CI_FILE), 'utf8');
  } catch {
    return {
      ok: false,
      issues: [`找不到 CI 工作流文件：${CI_FILE}`],
      expected: STEPS.filter((step) => !step.localOnly).map(getStepCommand),
      actual: [],
    };
  }

  const expected = STEPS.filter((step) => !step.localOnly)
    .map(getStepCommand)
    .filter((command) => !IGNORED_COMMANDS.has(command));
  const actual = extractRunCommands(content).filter((command) => !IGNORED_COMMANDS.has(command));
  const issues = [];
  const total = Math.max(expected.length, actual.length);

  for (let index = 0; index < total; index += 1) {
    const left = expected[index];
    const right = actual[index];

    if (left === right) {
      continue;
    }

    if (left === undefined) {
      issues.push(`第 ${index + 1} 步仅在 ci.yml 中存在：${right}`);
    } else if (right === undefined) {
      issues.push(`第 ${index + 1} 步仅在本地清单中存在：${left}`);
    } else {
      issues.push(`第 ${index + 1} 步不一致：\n    本地清单：${left}\n    ci.yml ：${right}`);
    }
  }

  return { ok: issues.length === 0, issues, expected, actual };
}
