// 终端输出：帮助信息、步骤清单、执行进度与结果汇总
//
// 所有文案集中在此，避免各模块各写一套格式
import { PROFILES, STEPS, STEP_GROUPS, getStepCommand } from './steps.js';
import { printUsage } from './usage.js';

// 汇总表中步骤名的展示宽度，按等宽字符计算
const NAME_COLUMN_WIDTH = 26;

/**
 * 判断一个码点是否为全角字符（终端中占两列）
 *
 * @param {number} codePoint Unicode 码点
 * @returns {boolean} 是否占两列
 */
function isWideCodePoint(codePoint) {
  return (
    codePoint >= 0x1100 &&
    (codePoint <= 0x115f ||
      codePoint === 0x2329 ||
      codePoint === 0x232a ||
      (codePoint >= 0x2e80 && codePoint <= 0xa4cf && codePoint !== 0x303f) ||
      (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
      (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
      (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
      (codePoint >= 0xff00 && codePoint <= 0xff60) ||
      (codePoint >= 0xffe0 && codePoint <= 0xffe6))
  );
}

/**
 * 计算字符串在终端中的显示宽度
 *
 * @param {string} text 文本
 * @returns {number} 显示宽度
 */
function displayWidth(text) {
  let width = 0;

  for (const char of text) {
    width += isWideCodePoint(char.codePointAt(0) ?? 0) ? 2 : 1;
  }

  return width;
}

/**
 * 按显示宽度右侧补空格
 *
 * @param {string} text 文本
 * @param {number} width 目标宽度
 * @returns {string} 补齐后的文本
 */
function padDisplay(text, width) {
  return text + ' '.repeat(Math.max(0, width - displayWidth(text)));
}

/**
 * 格式化耗时
 *
 * @param {number} durationMs 毫秒
 * @returns {string} 可读耗时
 */
export function formatDuration(durationMs) {
  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }

  const seconds = durationMs / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

/**
 * 输出用法说明
 *
 * @returns {void}
 */
export function printHelp() {
  printUsage({
    title: '本地 CI 门禁',
    description: '按与 .github/workflows/ci.yml 相同的顺序执行同一组命令，全部通过后再推送',
    sections: [
      {
        heading: '用法',
        entries: [
          { command: 'node scripts/ci-local.js', description: '跑 full 档位（与 CI 完全一致）' },
          { command: 'node scripts/ci-local.js --profile quick', description: '只跑静态检查' },
          { command: 'node scripts/ci-local.js --only test-unit', description: '只跑指定步骤' },
          { command: 'node scripts/ci-local.js --skip build-storybook', description: '跳过指定步骤' },
          { command: 'node scripts/ci-local.js --from build-private', description: '从指定步骤开始' },
          { command: 'node scripts/ci-local.js --check-sync', description: '校验清单与 ci.yml 是否一致' },
          { command: 'node scripts/ci-local.js --list', description: '列出全部步骤' },
        ],
      },
      {
        heading: '选项',
        entries: [
          { command: '--profile <quick|test|build|full>', description: '执行档位，默认 full' },
          { command: '--only <id,id>', description: '只执行这些步骤（忽略档位范围）' },
          { command: '--skip <id,id>', description: '跳过这些步骤' },
          { command: '--from <id>', description: '从该步骤开始执行' },
          { command: '--keep-going', description: '某步失败后继续执行剩余步骤' },
          { command: '--install', description: '先执行 pnpm install --frozen-lockfile' },
          { command: '--strict-env', description: 'Node / pnpm 版本不一致时直接失败' },
          { command: '--verbose', description: '实时透传子进程输出' },
          { command: '--dry-run', description: '只打印将执行的命令，不实际执行' },
          { command: '--no-log', description: '不写日志文件' },
          { command: '--log-dir <path>', description: '自定义日志目录' },
          { command: '--no-git-guard', description: '跳过运行前后的工作区状态比对' },
          { command: '--list / --check-sync / --help', description: '辅助命令' },
        ],
      },
      {
        heading: '退出码',
        entries: [
          { command: '0', description: '全部门禁通过' },
          { command: '1', description: '存在门禁失败' },
          { command: '2', description: '参数或环境错误' },
          { command: '130', description: '用户中断' },
        ],
      },
    ],
    notes: ['脚本只做检查，不执行任何 git 操作。'],
  });
}

/**
 * 输出全部步骤与执行档位
 *
 * @returns {void}
 */
export function printStepList() {
  const lines = ['', '▸ 门禁步骤清单', ''];

  for (const step of STEPS) {
    const marker = step.localOnly ? '  （仅本地）' : '';

    lines.push(
      `  ${padDisplay(step.id, 16)}${padDisplay(STEP_GROUPS[step.group], 14)}${padDisplay(
        step.ciName,
        NAME_COLUMN_WIDTH,
      )}${getStepCommand(step)}${marker}`,
    );
  }

  lines.push('', '▸ 执行档位', '');

  for (const [profile, groups] of Object.entries(PROFILES)) {
    const names = groups.map((group) => STEP_GROUPS[group]).join(' → ');
    lines.push(`  ${padDisplay(profile, 10)}${names}`);
  }

  lines.push('');

  process.stdout.write(lines.join('\n'));
}

/**
 * 输出本次执行计划
 *
 * @param {{ profile: string, steps: { ciName: string, id: string }[], install: boolean, dryRun: boolean }} plan 执行计划
 * @returns {void}
 */
export function printPlan({ profile, steps, install, dryRun }) {
  console.info('');
  console.info('▸ 本地 CI 门禁');
  console.info(`  档位：${profile}，本次 ${steps.length} 步`);

  if (install) {
    console.info('  依赖：先执行 pnpm install --frozen-lockfile');
  }

  if (!dryRun) {
    console.info('');

    return;
  }

  console.info('  以下命令将按顺序执行：');

  for (const [index, step] of steps.entries()) {
    console.info(`    ${String(index + 1).padStart(2, ' ')}. [${step.id}] ${getStepCommand(step)}`);
  }

  console.info('');
}

/**
 * 输出运行时告警
 *
 * @param {string[]} warnings 告警列表
 * @returns {void}
 */
export function printWarnings(warnings) {
  if (warnings.length === 0) {
    return;
  }

  console.warn('');

  for (const warning of warnings) {
    console.warn(`⚠ ${warning}`);
  }
}

/**
 * 输出步骤开始执行的标题
 *
 * @param {{ ciName: string }} step 步骤定义
 * @param {number} index 当前序号，0 表示准备步骤
 * @param {number} total 总步骤数
 * @returns {void}
 */
export function printStepHeader(step, index, total) {
  const label = index === 0 ? '[准备]' : `[${index}/${total}]`;

  console.info(`${label} ${step.ciName}`);
}

/**
 * 输出步骤执行成功
 *
 * @param {number} durationMs 耗时
 * @returns {void}
 */
export function printStepSuccess(durationMs) {
  console.info(`  ✔ ${formatDuration(durationMs)}`);
}

/**
 * 输出步骤执行失败：给出原因、输出尾部与完整日志位置
 *
 * @param {{ exitCode: number | null, timedOut: boolean, signal: string | null, durationMs: number }} result 执行结果
 * @param {{ output: string, logPath: string | null, verbose: boolean }} context 输出上下文
 * @returns {void}
 */
export function printStepFailure(result, { output, logPath, verbose }) {
  let reason = `退出码 ${result.exitCode}`;

  if (result.timedOut) {
    reason = '执行超时';
  } else if (result.signal) {
    reason = `被信号 ${result.signal} 终止`;
  }

  console.error(`  ✖ ${reason}（${formatDuration(result.durationMs)}）`);

  // --verbose 时输出已经实时透传，无需重复打印尾部
  if (!verbose) {
    const tail = output.trimEnd().split(/\r?\n/).slice(-40);

    if (tail.length > 0 && tail[0] !== '') {
      console.error('  ── 输出尾部 ──');

      for (const line of tail) {
        console.error(`  ${line}`);
      }
    }
  }

  if (logPath) {
    console.error(`  ── 完整日志：${logPath} ──`);
  }
}

/**
 * 输出执行结果汇总
 *
 * @param {{ ciName: string, failed: boolean, durationMs: number }[]} results 各步骤结果
 * @param {{ totalMs: number }} options 汇总信息
 * @returns {void}
 */
export function printSummary(results, { totalMs }) {
  if (results.length === 0) {
    return;
  }

  console.info('');
  console.info('──────── 汇总 ────────');

  for (const result of results) {
    const line = `  ${result.failed ? '✖' : '✔'} ${padDisplay(result.ciName, NAME_COLUMN_WIDTH)} ${formatDuration(
      result.durationMs,
    )}`;

    if (result.failed) {
      console.error(line);
    } else {
      console.info(line);
    }
  }

  const failed = results.filter((result) => result.failed);
  const passed = results.length - failed.length;
  const summary = `通过 ${passed} / 失败 ${failed.length} / 总用时 ${formatDuration(totalMs)}`;

  console.info('');

  if (failed.length > 0) {
    console.error(`✖ ${summary}`);
    console.error(`  失败步骤：${failed.map((result) => result.ciName).join('、')}`);
  } else {
    console.info(`✔ ${summary}`);
    console.info('  全部门禁通过，可以提交并推送。');
  }
}

/**
 * 输出门禁清单同步校验结果
 *
 * @param {{ ok: boolean, issues: string[], expected: string[] }} result 校验结果
 * @returns {void}
 */
export function printSyncResult(result) {
  if (result.ok) {
    console.info(`✔ 门禁清单与 .github/workflows/ci.yml 同步（${result.expected.length} 步）`);

    return;
  }

  console.error('✖ 门禁清单与 .github/workflows/ci.yml 不同步：');

  for (const issue of result.issues) {
    console.error(`  ${issue}`);
  }

  console.error('  请让 scripts/ci/steps.js 与 ci.yml 的 run 命令逐条保持一致。');
}
