// 运行前环境检查：把本地与 CI 的环境差异尽量提前暴露出来
//
// 校验项：
// 1. Node 版本满足 package.json 的 engines.node，且与 .nvmrc 对齐
// 2. pnpm 版本与 packageManager 字段一致（CI 的 pnpm 版本就取自该字段）
// 3. 依赖已安装（node_modules/.pnpm 存在）
// 4. 已安装依赖与 pnpm-lock.yaml 是否一致（只告警，不自动安装）
// 5. 剔除本地 shell 中可能污染构建结果的变量（NODE_ENV / BROWSERSLIST 等）
// 6. 记录运行前的 git 工作区状态，供结束后比对
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import process from 'node:process';

import { execa } from 'execa';

import { WORKSPACE_ROOT, resolveRoot } from '../build/paths.js';

// 这些变量在 CI 环境中不存在，本地若被 shell 污染会直接改变构建产物
// NODE_ENV 会命中 babel.config.cjs 的 lib/umd 分支，BROWSERSLIST 会改变 Babel 与 autoprefixer 的目标
export const POLLUTING_ENV_KEYS = ['NODE_ENV', 'BROWSERSLIST', 'BROWSERSLIST_ENV', 'TEST_TARGET', 'DOCS_BASE'];

// 版本号前缀，只支持 engines 里最常见的 `>=x.y.z` 写法
const LOWER_BOUND_PREFIX = '>=';

/**
 * 读取并解析工作区内的 JSON 文件
 *
 * @param {string} relativePath 相对工作区根的路径
 * @returns {Promise<Record<string, unknown>>} 解析结果
 */
async function readJson(relativePath) {
  const content = await readFile(resolveRoot(relativePath), 'utf8');

  return JSON.parse(content);
}

/**
 * 解析 `x.y.z` 形式的版本号
 *
 * @param {string} text 版本文本
 * @returns {{ major: number, minor: number, patch: number } | null} 解析结果，无法解析时为 null
 */
function parseVersion(text) {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(String(text).trim());

  if (!match) {
    return null;
  }

  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

/**
 * 比较两个版本号
 *
 * @param {{ major: number, minor: number, patch: number }} left 左值
 * @param {{ major: number, minor: number, patch: number }} right 右值
 * @returns {number} 左值大于右值返回正数，小于返回负数，相等返回 0
 */
function compareVersion(left, right) {
  return left.major - right.major || left.minor - right.minor || left.patch - right.patch;
}

/**
 * 构造子进程环境：剔除会污染构建结果的变量
 *
 * @returns {{ env: NodeJS.ProcessEnv, stripped: string[] }} 清理后的环境与命中的变量名
 */
export function createChildEnv() {
  const env = { ...process.env };
  const stripped = [];

  for (const key of POLLUTING_ENV_KEYS) {
    if (env[key] !== undefined) {
      stripped.push(key);
      delete env[key];
    }
  }

  return { env, stripped };
}

/**
 * 读取 git 工作区状态
 *
 * @returns {Promise<string | null>} `git status --porcelain` 的输出，git 不可用时为 null
 */
export async function readGitStatus() {
  const result = await execa('git', ['status', '--porcelain'], { cwd: WORKSPACE_ROOT, reject: false });

  if (result.failed) {
    return null;
  }

  return result.stdout;
}

/**
 * 读取文本文件，文件不存在时返回 null
 *
 * @param {string} relativePath 相对工作区根的路径
 * @returns {Promise<string | null>} 文件内容
 */
async function readText(relativePath) {
  try {
    return await readFile(resolveRoot(relativePath), 'utf8');
  } catch {
    // 文件可能不存在（例如尚未安装依赖），由调用方决定如何处理
    return null;
  }
}

/**
 * 检查已安装依赖与锁文件是否一致
 *
 * 这里不比较各 package.json 的修改时间：改动 scripts 等非依赖字段也会让时间更新，
 * 会造成长期误报。pnpm 在安装时会把锁文件复制一份到 node_modules/.pnpm/lock.yaml，
 * 两份内容不一致才意味着「锁文件变了但没重装」。
 *
 * @param {string[]} warnings 告警收集器
 * @returns {Promise<void>} 检查完成的 Promise
 */
async function checkLockfileFreshness(warnings) {
  const lockfile = await readText('pnpm-lock.yaml');
  const installed = await readText('node_modules/.pnpm/lock.yaml');

  if (lockfile === null) {
    warnings.push('未找到 pnpm-lock.yaml，CI 的 --frozen-lockfile 会失败');

    return;
  }

  if (installed === null) {
    // 依赖缺失已由 node_modules 检查报错，这里不重复提示
    return;
  }

  if (lockfile.replace(/\r\n/g, '\n') !== installed.replace(/\r\n/g, '\n')) {
    warnings.push('依赖安装状态与 pnpm-lock.yaml 不一致，建议加 --install 重新安装');
  }
}

/**
 * 读取 pnpm 实际版本
 *
 * @returns {Promise<string | null>} 版本号，执行失败时为 null
 */
async function readPnpmVersion() {
  const result = await execa('pnpm', ['--version'], { cwd: WORKSPACE_ROOT, reject: false });

  if (result.failed) {
    return null;
  }

  return result.stdout.trim();
}

/**
 * 执行全部运行前检查
 *
 * @param {{ strictEnv?: boolean }} options 检查选项
 * @returns {Promise<{ errors: string[], warnings: string[], env: NodeJS.ProcessEnv }>} 检查结果
 */
export async function runPreflight({ strictEnv = false } = {}) {
  const errors = [];
  const warnings = [];
  const { env, stripped } = createChildEnv();

  if (stripped.length > 0) {
    warnings.push(`已从子进程环境中剔除可能污染构建的变量：${stripped.join(', ')}`);
  }

  let packageJson;

  try {
    packageJson = await readJson('package.json');
  } catch (error) {
    errors.push(`无法读取根 package.json：${error instanceof Error ? error.message : String(error)}`);

    return { errors, warnings, env };
  }

  // Node 版本：低于 engines 下限直接失败，与 .nvmrc 的极小版本不一致时只告警
  const currentNode = parseVersion(process.versions.node);
  const enginesNode = String(packageJson.engines?.node ?? '');

  if (currentNode && enginesNode.startsWith(LOWER_BOUND_PREFIX)) {
    const lowerBound = parseVersion(enginesNode.slice(LOWER_BOUND_PREFIX.length));

    if (lowerBound && compareVersion(currentNode, lowerBound) < 0) {
      errors.push(`Node 版本过低：当前 v${process.versions.node}，package.json 要求 ${enginesNode}`);
    }
  } else {
    warnings.push(`无法解析 engines.node（${enginesNode || '未声明'}），已跳过 Node 版本校验`);
  }

  try {
    const nvmrc = (await readFile(resolveRoot('.nvmrc'), 'utf8')).trim();
    const expected = parseVersion(nvmrc);

    if (expected && currentNode && (expected.major !== currentNode.major || expected.minor !== currentNode.minor)) {
      warnings.push(`当前 Node v${process.versions.node} 与 .nvmrc 的 ${nvmrc} 不一致（CI 使用 .nvmrc）`);
    }
  } catch {
    // .nvmrc 缺失时不影响本地运行，CI 侧会自行暴露问题
  }

  // pnpm 版本：CI 由 packageManager 字段决定，本地必须同版本，否则锁文件与产物可能不一致
  const packageManager = String(packageJson.packageManager ?? '');
  const [, expectedPnpm] = packageManager.split('@');
  const actualPnpm = await readPnpmVersion();

  if (actualPnpm === null) {
    errors.push('未找到 pnpm，请先通过 corepack enable 启用');
  } else if (expectedPnpm && actualPnpm !== expectedPnpm) {
    const message = `pnpm 版本不一致：当前 ${actualPnpm}，package.json 要求 ${expectedPnpm}`;

    if (strictEnv) {
      errors.push(message);
    } else {
      warnings.push(`${message}（可执行 corepack use pnpm@${expectedPnpm} 对齐）`);
    }
  }

  // 依赖：CI 每次都会 pnpm install，本地缺依赖时后续步骤必然失败，提前给出明确提示
  if (!existsSync(resolveRoot('node_modules', '.pnpm'))) {
    errors.push('未找到 node_modules/.pnpm，请先执行 pnpm install 或加 --install 参数');
  }

  // 锁文件新鲜度：只告警，避免每次跑门禁都触发联网安装
  await checkLockfileFreshness(warnings);

  return { errors, warnings, env };
}
