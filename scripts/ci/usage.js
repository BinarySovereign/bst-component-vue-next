// 统一用法输出：`scripts/ci` 下全部脚本的 --help 共用同一套格式
//
// 结构固定为：标题 → 说明 → 各区块（用法、选项、退出码…）→ 补充说明，
// 区块内的「命令 + 说明」两列按最长命令自动对齐，避免各脚本手写空格导致列宽漂移。
import process from 'node:process';

/**
 * 格式化一组「命令 + 说明」行
 *
 * @param {{ command: string, description: string }[]} entries 行定义
 * @returns {string[]} 已对齐的文本行
 */
function formatEntries(entries) {
  // 命令列宽取最长一条，再统一留两个空格作为与说明的分隔
  const width = Math.max(...entries.map((entry) => entry.command.length)) + 2;

  return entries.map((entry) => `  ${entry.command.padEnd(width)}${entry.description}`);
}

/**
 * 输出统一风格的用法说明
 *
 * @param {{
 *   title: string,
 *   description?: string,
 *   sections?: { heading: string, entries: { command: string, description: string }[] }[],
 *   notes?: string[],
 * }} options 用法定义
 * @returns {void}
 */
export function printUsage({ title, description = '', sections = [], notes = [] }) {
  const lines = [title];

  if (description !== '') {
    lines.push('', description);
  }

  for (const section of sections) {
    if (section.entries.length === 0) {
      continue;
    }

    lines.push('', `${section.heading}：`, ...formatEntries(section.entries));
  }

  if (notes.length > 0) {
    lines.push('', ...notes);
  }

  // 末尾保留一个空行，与各脚本既有的输出习惯一致
  lines.push('');

  process.stdout.write(lines.join('\n'));
}
