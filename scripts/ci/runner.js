// 步骤执行器：串行执行单条命令，负责计时、日志落盘与输出折叠
//
// 与 CI 语义保持一致：默认任一步骤失败即停止，--keep-going 才继续
import process from 'node:process';

import { execa } from 'execa';

import { WORKSPACE_ROOT } from '../build/paths.js';
import { getStepCommand } from './steps.js';
import { printStepFailure, printStepHeader, printStepSuccess } from './report.js';

// 当前正在执行的子进程，供中断时终止
let currentProcess = null;

/**
 * 终止当前正在执行的步骤（用于响应 Ctrl+C）
 *
 * @returns {void}
 */
export function cancelCurrentStep() {
  if (!currentProcess) {
    return;
  }

  try {
    // Windows 下 execa 会连同子进程树一起终止，避免 vitest worker 残留
    currentProcess.kill('SIGTERM', { forceKillAfterDelay: 5000 });
  } catch {
    // 进程可能已经退出，终止失败不影响主流程
  }
}

/**
 * 执行单个步骤
 *
 * @param {{ ciName: string, command: string, args: string[], timeoutMs: number }} step 步骤定义
 * @param {{
 *   env: NodeJS.ProcessEnv,
 *   logStream: import('node:fs').WriteStream | null,
 *   verbose: boolean,
 *   index: number,
 *   total: number,
 *   logPath: string | null,
 * }} options 执行选项
 * @returns {Promise<{
 *   ciName: string,
 *   failed: boolean,
 *   exitCode: number | null,
 *   timedOut: boolean,
 *   signal: string | null,
 *   durationMs: number,
 *   output: string,
 * }>} 执行结果
 */
export async function runStep(step, { env, logStream, verbose = false, index = 1, total = 1, logPath = null }) {
  const command = getStepCommand(step);

  printStepHeader(step, index, total);
  console.info(`       $ ${command}`);

  if (logStream) {
    logStream.write(`\n===== ${step.ciName} =====\n$ ${command}\n`);
  }

  const startedAt = Date.now();
  const subprocess = execa(step.command, step.args, {
    cwd: WORKSPACE_ROOT,
    env,
    // 合并 stdout / stderr，保证日志里两条流的时间顺序正确
    all: true,
    reject: false,
    timeout: step.timeoutMs,
    forceKillAfterDelay: 5000,
  });

  currentProcess = subprocess;

  let output = '';

  if (subprocess.all) {
    subprocess.all.on('data', (chunk) => {
      const text = chunk.toString();

      output += text;

      if (logStream) {
        logStream.write(text);
      }

      // 实时透传只在 --verbose 下开启，否则失败时只打印尾部
      if (verbose) {
        process.stdout.write(text);
      }
    });
  }

  let result;

  try {
    result = await subprocess;
  } finally {
    currentProcess = null;
  }

  const durationMs = Date.now() - startedAt;
  const summary = {
    ciName: step.ciName,
    failed: Boolean(result.failed),
    exitCode: result.exitCode ?? null,
    timedOut: Boolean(result.timedOut),
    signal: result.signal ?? null,
    durationMs,
    output: output || result.all || '',
  };

  if (logStream) {
    logStream.write(`\n[${summary.failed ? '失败' : '通过'}] ${summary.ciName} ${durationMs}ms\n`);
  }

  if (summary.failed) {
    printStepFailure(summary, { output: summary.output, logPath, verbose });
  } else {
    printStepSuccess(durationMs);
  }

  return summary;
}
