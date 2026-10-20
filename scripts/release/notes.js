// 发布说明提取：从包的 CHANGELOG 中取出指定版本的段落，用作 GitHub Release 正文
//
// 用法：
//   node scripts/release/notes.js --package vue-next-pro --version 1.1.0
//   node scripts/release/notes.js --package vue-next-pro --version 1.1.0 --lang en
//   node scripts/release/notes.js --package styles --version 1.1.0 --out release-notes.md
//
// 输出结构：包名与版本标题 → 中文段落 → 折叠的英文段落（--lang both 时）。
// 版本段落不存在时列出该文件中的全部版本，并以退出码 1 结束。
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

import { resolveRoot } from '../build/paths.js';
import { RELEASE_UNITS, listUnitKeys } from './units.js';

// 版本标题：`## [1.1.0] - 2026-10-20`，日期可省略
const VERSION_HEADING = /^## \[([^\]]+)\](?: - (.+))?$/;

// 任意二级标题，用于判定版本段落的结束位置
const H2_HEADING = /^## /;

// 进程退出码
const EXIT_CODE = {
  ok: 0,
  failed: 1,
  usage: 2,
};

/**
 * 输出用法说明
 *
 * @returns {void}
 */
function printUsage() {
  process.stdout.write(
    [
      '发布说明提取',
      '',
      '从包的 CHANGELOG 中取出指定版本的段落，用于 GitHub Release 正文',
      '',
      '用法：',
      '  node scripts/release/notes.js --package <unit> --version <x.y.z> [选项]',
      '',
      '选项：',
      `  --package <unit>      发布单元：${listUnitKeys().join(' / ')}`,
      '  --version <x.y.z>     要提取的版本号，须与 CHANGELOG 的版本标题一致',
      '  --lang <zh|en|both>   输出语言，默认 both',
      '  --out <file>          写入文件；省略时输出到 stdout',
      '  --help                显示本说明',
      '',
      '退出码：0 成功 / 1 版本段落不存在 / 2 参数错误',
      '',
    ].join('\n'),
  );
}

/**
 * 解析命令行参数
 *
 * @param {string[]} argv 进程参数（已去除前两个）
 * @returns {{ unit: string, version: string, lang: 'zh' | 'en' | 'both', out: string | null, help: boolean }}
 * 解析结果
 */
function parseArgs(argv) {
  const options = { unit: '', version: '', lang: 'both', out: null, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    const value = argv[index + 1];

    if (value === undefined || value.startsWith('-')) {
      throw new Error(`${arg} 需要一个取值`);
    }

    if (arg === '--package') {
      options.unit = value;
    } else if (arg === '--version') {
      options.version = value;
    } else if (arg === '--lang') {
      if (!['zh', 'en', 'both'].includes(value)) {
        throw new Error(`--lang 只接受 zh / en / both，收到 "${value}"`);
      }

      options.lang = value;
    } else if (arg === '--out') {
      options.out = value;
    } else {
      throw new Error(`未知参数：${arg}（执行 --help 查看用法）`);
    }

    index += 1;
  }

  return options;
}

/**
 * 解析 CHANGELOG，得到全部版本段落
 *
 * @param {string} content 文件内容
 * @returns {{ versions: string[], sections: Map<string, string[]> }} 版本顺序与各版本段落
 */
function parseSections(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const versions = [];
  const sections = new Map();

  let current = null;

  for (const line of lines) {
    if (H2_HEADING.test(line)) {
      const matched = VERSION_HEADING.exec(line.trim());

      if (matched) {
        current = matched[1];
        versions.push(current);
        sections.set(current, []);
      } else {
        current = null;
      }

      continue;
    }

    if (current !== null) {
      sections.get(current).push(line);
    }
  }

  // 去掉各段落首尾空行，避免拼接后出现多余间隔
  for (const [version, body] of sections) {
    let start = 0;
    let end = body.length;

    while (start < end && body[start].trim() === '') {
      start += 1;
    }

    while (end > start && body[end - 1].trim() === '') {
      end -= 1;
    }

    sections.set(version, body.slice(start, end));
  }

  return { versions, sections };
}

/**
 * 读取并解析指定语言的 CHANGELOG
 *
 * @param {{ dir: string }} unit 发布单元
 * @param {'zh' | 'en'} lang 语言
 * @returns {Promise<{ versions: string[], sections: Map<string, string[]> }>} 解析结果
 */
async function loadSections(unit, lang) {
  const file = join(resolveRoot(unit.dir), lang === 'zh' ? 'CHANGELOG-ZH.md' : 'CHANGELOG.md');
  const content = await readFile(file, 'utf8');

  return parseSections(content);
}

/**
 * 拼接 Release 正文
 *
 * @param {{ name: string }} unit 发布单元
 * @param {string} version 版本号
 * @param {{ zh: string[], en: string[] | null }} bodies 各语言段落
 * @returns {string} Markdown 正文
 */
function composeNotes(unit, version, { zh, en }) {
  const blocks = [`## ${unit.name} v${version}`, '', ...zh];

  if (en && en.length > 0) {
    blocks.push('', '<details>', '<summary>English</summary>', '', ...en, '', '</details>');
  }

  return `${blocks.join('\n')}\n`;
}

/**
 * 执行提取
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

  if (options.help) {
    printUsage();
    return EXIT_CODE.ok;
  }

  const unit = RELEASE_UNITS[options.unit];

  if (!unit) {
    process.stderr.write(`\n✖ --package 只能是 ${listUnitKeys().join(' / ')}\n\n`);
    return EXIT_CODE.usage;
  }

  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(options.version)) {
    process.stderr.write(`\n✖ --version 需为 SemVer（如 1.2.0），收到 "${options.version}"\n\n`);
    return EXIT_CODE.usage;
  }

  const wantZh = options.lang !== 'en';
  const wantEn = options.lang !== 'zh';

  let zhSections = null;
  let enSections = null;

  try {
    if (wantZh) {
      zhSections = await loadSections(unit, 'zh');
    }

    if (wantEn) {
      enSections = await loadSections(unit, 'en');
    }
  } catch (error) {
    process.stderr.write(`\n✖ 读取 CHANGELOG 失败：${error instanceof Error ? error.message : String(error)}\n\n`);
    return EXIT_CODE.failed;
  }

  const available = (zhSections ?? enSections).versions;

  if (!available.includes(options.version)) {
    process.stderr.write(
      `\n✖ ${options.unit} 的 CHANGELOG 中没有版本 "${options.version}"，现有版本：${available.join(' / ') || '（无）'}\n\n`,
    );
    return EXIT_CODE.failed;
  }

  if (zhSections && !zhSections.versions.includes(options.version)) {
    process.stderr.write(`\n✖ CHANGELOG-ZH.md 与 CHANGELOG.md 的版本标题不一致\n\n`);
    return EXIT_CODE.failed;
  }

  const notes = composeNotes(unit, options.version, {
    zh: (zhSections ?? enSections).sections.get(options.version),
    en: enSections ? enSections.sections.get(options.version) : null,
  });

  if (options.out) {
    await writeFile(resolveRoot(options.out), notes, 'utf8');
    process.stdout.write(`✔ 已写入 ${options.out}\n`);
  } else {
    process.stdout.write(notes);
  }

  return EXIT_CODE.ok;
}

process.exitCode = await main();
