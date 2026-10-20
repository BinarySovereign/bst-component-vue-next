#!/usr/bin/env node
// 本地 CI 门禁：按与 `.github/workflows/ci.yml` 相同的顺序执行同一组命令，通过后再推送
//
// 用法：
//   node scripts/ci-local.js                        跑 full 档位（与 CI 完全一致）
//   node scripts/ci-local.js --profile quick        只跑静态检查
//   node scripts/ci-local.js --skip build-storybook 跳过指定步骤
//   node scripts/ci-local.js --from build-private   从指定步骤开始
//   node scripts/ci-local.js --check-sync           只校验清单与 ci.yml 是否一致
//   node scripts/ci-local.js --list                 列出全部步骤
//   node scripts/ci-local.js --help                 显示完整说明
//
// 退出码：
//   0   全部门禁通过
//   1   某个门禁失败
//   2   参数错误、环境检查失败或清单与 ci.yml 不同步
//   130 用户中断
//
// 设计约束：
// - 只做检查，不执行任何 git 操作（add / commit / push 由使用者自行控制）
// - 命令必须与 ci.yml 逐条等价，`--check-sync` 负责防止漂移
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

import { resolveRoot } from './build/paths.js';
import { readGitStatus, runPreflight } from './ci/preflight.js';
import { cancelCurrentStep, runStep } from './ci/runner.js';
import { DEFAULT_PROFILE, selectSteps } from './ci/steps.js';
import { printHelp, printPlan, printStepList, printSummary, printSyncResult, printWarnings } from './ci/report.js';
import { checkSync } from './ci/sync.js';

// 默认日志目录，置于 node_modules 下可天然被版本管理忽略
const DEFAULT_LOG_DIR = 'node_modules/.cache/bst-ci-local';

// 安装依赖的超时时间
const INSTALL_TIMEOUT = 15 * 60 * 1000;

// 需要取值的参数
const VALUE_FLAGS = {
  profile: 'profile',
  only: 'only',
  skip: 'skip',
  from: 'from',
  'log-dir': 'logDir',
};

// 布尔参数与其对应的取值
const BOOLEAN_FLAGS = {
  install: ['install', true],
  'keep-going': ['keepGoing', true],
  'check-sync': ['checkSync', true],
  'strict-env': ['strictEnv', true],
  verbose: ['verbose', true],
  'dry-run': ['dryRun', true],
  list: ['list', true],
  'no-log': ['log', false],
  'no-git-guard': ['gitGuard', false],
  help: ['help', true],
};

/**
 * 解析命令行参数
 *
 * @param {string[]} argv 进程参数（已去除前两个）
 * @returns {{ options: Record<string, unknown>, error: string | null }} 解析结果
 */
function parseArgs(argv) {
  const options = {
    profile: DEFAULT_PROFILE,
    only: null,
    skip: null,
    from: null,
    logDir: DEFAULT_LOG_DIR,
    install: false,
    keepGoing: false,
    checkSync: false,
    strictEnv: false,
    verbose: false,
    dryRun: false,
    list: false,
    log: true,
    gitGuard: true,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '-h') {
      options.help = true;
      continue;
    }

    if (!token.startsWith('--')) {
      return { options, error: `无法识别的参数：${token}` };
    }

    const equalsIndex = token.indexOf('=');
    const name = equalsIndex === -1 ? token.slice(2) : token.slice(2, equalsIndex);
    const inlineValue = equalsIndex === -1 ? null : token.slice(equalsIndex + 1);

    if (Object.hasOwn(VALUE_FLAGS, name)) {
      const value = inlineValue ?? argv[index + 1];

      if (value === undefined || (inlineValue === null && value.startsWith('--'))) {
        return { options, error: `参数 --${name} 缺少取值` };
      }

      if (inlineValue === null) {
        index += 1;
      }

      options[VALUE_FLAGS[name]] = value;

      continue;
    }

    if (Object.hasOwn(BOOLEAN_FLAGS, name)) {
      if (inlineValue !== null) {
        return { options, error: `参数 --${name} 不接受取值` };
      }

      const [key, value] = BOOLEAN_FLAGS[name];
      options[key] = value;

      continue;
    }

    return { options, error: `无法识别的参数：--${name}` };
  }

  return { options, error: null };
}

/**
 * 生成带时间戳的日志文件路径
 *
 * @param {string} logDir 相对工作区根的日志目录
 * @returns {Promise<string>} 日志文件的绝对路径
 */
async function createLogPath(logDir) {
  const directory = resolveRoot(logDir);

  await mkdir(directory, { recursive: true });

  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(
    now.getMinutes(),
  )}${pad(now.getSeconds())}`;

  return join(directory, `${stamp}.log`);
}

/**
 * 关闭日志流
 *
 * @param {import('node:fs').WriteStream | null} logStream 日志流
 * @returns {Promise<void>} 关闭完成的 Promise
 */
async function closeLogStream(logStream) {
  if (!logStream) {
    return;
  }

  await new Promise((resolve) => {
    logStream.end(resolve);
  });
}

/**
 * 比对门禁运行前后的工作区状态，提示意外的源文件改动
 *
 * @param {string | null} baseline 运行前的 `git status --porcelain` 输出
 * @returns {Promise<void>} 比对完成的 Promise
 */
async function reportGitChanges(baseline) {
  if (baseline === null) {
    return;
  }

  const after = await readGitStatus();

  if (after === null) {
    return;
  }

  const beforeLines = new Set(baseline.split('\n'));
  const added = after.split('\n').filter((line) => line !== '' && !beforeLines.has(line));

  if (added.length === 0) {
    return;
  }

  console.warn('');
  console.warn('⚠ 门禁运行后工作区出现新的改动（通常不应发生，请确认测试或构建是否写入了源文件）：');

  for (const line of added) {
    console.warn(`  ${line}`);
  }
}

/**
 * 执行门禁
 *
 * @param {Record<string, unknown>} options 命令行选项
 * @returns {Promise<void>} 执行完成的 Promise
 */
async function execute(options) {
  const { steps, errors } = selectSteps(options);

  if (errors.length > 0) {
    for (const message of errors) {
      console.error(`✖ ${message}`);
    }

    process.exitCode = 2;

    return;
  }

  if (steps.length === 0) {
    console.error('✖ 本次没有可执行的步骤，请检查 --profile / --only / --skip / --from 的组合。');
    process.exitCode = 2;

    return;
  }

  printPlan({ profile: options.profile, steps, install: options.install, dryRun: options.dryRun });

  if (options.dryRun) {
    return;
  }

  const preflight = await runPreflight({ strictEnv: options.strictEnv });

  printWarnings(preflight.warnings);

  if (preflight.errors.length > 0) {
    for (const message of preflight.errors) {
      console.error(`✖ ${message}`);
    }

    console.error('');
    console.error('提示：首次运行可加 --install 自动安装依赖。');
    process.exitCode = 2;

    return;
  }

  const logPath = options.log ? await createLogPath(options.logDir) : null;
  const logStream = logPath ? createWriteStream(logPath, { flags: 'w' }) : null;
  const baseline = options.gitGuard ? await readGitStatus() : null;

  let interrupted = false;

  const onInterrupt = () => {
    if (interrupted) {
      return;
    }

    interrupted = true;
    console.warn('');
    console.warn('⚠ 收到中断信号，正在终止当前步骤…');
    cancelCurrentStep();
  };

  process.on('SIGINT', onInterrupt);
  process.on('SIGTERM', onInterrupt);

  const results = [];
  const startedAt = Date.now();

  if (logStream) {
    logStream.write(`本地 CI 门禁 - 档位 ${options.profile} - ${new Date().toISOString()}\n`);
  }

  try {
    // 安装步骤放在门禁之外，只在 --install 时执行，不参与 15 步的编号
    if (options.install && !interrupted) {
      const installResult = await runStep(
        {
          ciName: '安装依赖',
          command: 'pnpm',
          args: ['install', '--frozen-lockfile'],
          timeoutMs: INSTALL_TIMEOUT,
        },
        {
          env: preflight.env,
          logStream,
          verbose: options.verbose,
          index: 0,
          total: steps.length,
          logPath,
        },
      );

      results.push(installResult);

      if (installResult.failed) {
        throw new Error('依赖安装失败，已中止后续门禁');
      }
    }

    for (const [index, step] of steps.entries()) {
      if (interrupted) {
        break;
      }

      const result = await runStep(step, {
        env: preflight.env,
        logStream,
        verbose: options.verbose,
        index: index + 1,
        total: steps.length,
        logPath,
      });

      results.push(result);

      if (result.failed && !options.keepGoing) {
        break;
      }
    }
  } catch (error) {
    console.error(`✖ ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    process.off('SIGINT', onInterrupt);
    process.off('SIGTERM', onInterrupt);
    await closeLogStream(logStream);
  }

  printSummary(results, { totalMs: Date.now() - startedAt });

  if (logPath) {
    console.info(`  日志：${logPath}`);
  }

  if (options.gitGuard) {
    await reportGitChanges(baseline);
  }

  if (interrupted) {
    process.exitCode = 130;
  } else {
    process.exitCode = results.some((result) => result.failed) ? 1 : 0;
  }
}

/**
 * 入口
 *
 * @returns {Promise<void>} 执行完成的 Promise
 */
async function main() {
  const { options, error } = parseArgs(process.argv.slice(2));

  if (error) {
    console.error(`✖ ${error}`);
    console.error('使用 --help 查看用法。');
    process.exitCode = 2;

    return;
  }

  if (options.help) {
    printHelp();

    return;
  }

  if (options.list) {
    printStepList();

    return;
  }

  if (options.checkSync) {
    const result = await checkSync();

    printSyncResult(result);

    if (!result.ok) {
      process.exitCode = 2;
    }

    return;
  }

  await execute(options);
}

await main();
