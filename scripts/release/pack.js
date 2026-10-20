// 发布打包：把根 dist 下的发布单元打成 .tgz，作为 GitHub Release 的附件
//
// 用法：
//   node scripts/release/pack.js                         打包全部发布单元
//   node scripts/release/pack.js --only vue-next-pro     只打包指定单元
//   node scripts/release/pack.js --only styles --expect-version 1.1.0
//
// 打包前会校验三件事，任一不满足即失败：
//   1. 根 dist/<单元> 存在，且已由 `pnpm move:main:dist` 产出
//   2. dist 清单的版本号与源码包 package.json 一致（防止用过期产物打 tag）
//   3. --expect-version 与源码包版本一致（防止 tag 版本与包版本漂移）
//
// 产物命名统一为 `bst-<单元>-<版本>.tgz`，与源码包目录名一致，便于 Release 页面识别。
import { readdir, readFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

import { execa } from 'execa';
import { mkdirp, pathExists, remove } from 'fs-extra';

import { DIST_DIR, resolveRoot } from '../build/paths.js';
import { RELEASE_UNITS, listUnitKeys } from './units.js';

// 默认打包输出目录，相对工作区根
const DEFAULT_OUT_DIR = 'release';

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
      '发布打包',
      '',
      '把根 dist 下的发布单元打成 .tgz，作为 GitHub Release 的附件',
      '',
      '用法：',
      '  node scripts/release/pack.js [选项]',
      '',
      '选项：',
      `  --out <dir>            输出目录，默认 ${DEFAULT_OUT_DIR}`,
      `  --only <unit>          只打包指定单元：${listUnitKeys().join(' / ')}`,
      '  --expect-version <v>   校验源码包版本与该值一致',
      '  --dry-run              只打印计划，不实际执行 pnpm pack',
      '  --help                 显示本说明',
      '',
      '退出码：0 成功 / 1 校验失败或打包失败 / 2 参数错误',
      '',
    ].join('\n'),
  );
}

/**
 * 解析命令行参数
 *
 * @param {string[]} argv 进程参数（已去除前两个）
 * @returns {{ out: string, only: string | null, expectVersion: string | null, dryRun: boolean, help: boolean }}
 * 解析结果
 */
function parseArgs(argv) {
  const options = { out: DEFAULT_OUT_DIR, only: null, expectVersion: null, dryRun: false, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    const value = argv[index + 1];

    if (value === undefined || value.startsWith('-')) {
      throw new Error(`${arg} 需要一个取值`);
    }

    if (arg === '--out') {
      options.out = value;
    } else if (arg === '--only') {
      options.only = value;
    } else if (arg === '--expect-version') {
      options.expectVersion = value;
    } else {
      throw new Error(`未知参数：${arg}（执行 --help 查看用法）`);
    }

    index += 1;
  }

  return options;
}

/**
 * 读取 JSON 清单
 *
 * @param {string} file 清单绝对路径
 * @returns {Promise<{ name?: string, version?: string }>} 清单内容
 */
async function readManifest(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

/**
 * 打包单个发布单元
 *
 * @param {string} unitKey 发布单元标识
 * @param {{ outDir: string, expectVersion: string | null, dryRun: boolean }} options 执行选项
 * @returns {Promise<{ ok: boolean, version: string, file: string | null }>} 执行结果
 */
async function packUnit(unitKey, { outDir, expectVersion, dryRun }) {
  const unit = RELEASE_UNITS[unitKey];
  const sourceManifest = await readManifest(resolveRoot(unit.dir, 'package.json'));
  const version = sourceManifest.version;

  if (!version) {
    process.stderr.write(`✖ ${unit.dir}/package.json 缺少 version\n`);

    return { ok: false, version: 'unknown', file: null };
  }

  if (expectVersion && version !== expectVersion) {
    process.stderr.write(
      `✖ ${unitKey} 的源码包版本为 ${version}，与 tag 版本 ${expectVersion} 不一致；请先同步 package.json 与 CHANGELOG\n`,
    );

    return { ok: false, version, file: null };
  }

  const distDir = resolveRoot(DIST_DIR, unitKey);
  const distManifestPath = join(distDir, 'package.json');

  if (!(await pathExists(distManifestPath))) {
    process.stderr.write(`✖ 缺少 ${DIST_DIR}/${unitKey}/package.json，请先执行 pnpm move:main:dist\n`);

    return { ok: false, version, file: null };
  }

  const distManifest = await readManifest(distManifestPath);

  // dist 清单版本与源码包不一致说明产物是旧的，此时打出来的包会带错误版本号
  if (distManifest.version !== version) {
    process.stderr.write(
      `✖ ${DIST_DIR}/${unitKey} 的版本为 ${distManifest.version}，源码包为 ${version}；` +
        `产物已过期，请重新执行 pnpm move:main:dist\n`,
    );

    return { ok: false, version, file: null };
  }

  if (distManifest.name !== unit.name) {
    process.stderr.write(`✖ ${DIST_DIR}/${unitKey} 的包名为 ${distManifest.name}，预期 ${unit.name}\n`);

    return { ok: false, version, file: null };
  }

  const targetName = `${unit.file}-${version}.tgz`;
  const targetFile = join(outDir, targetName);

  if (dryRun) {
    process.stdout.write(`  · 将打包 ${unit.name}@${version} -> ${targetName}\n`);

    return { ok: true, version, file: targetFile };
  }

  await remove(targetFile);

  const before = new Set(await readdir(outDir));
  const result = await execa('pnpm', ['pack', '--pack-destination', outDir], { cwd: distDir, reject: false });

  if (result.exitCode !== 0) {
    process.stderr.write(`✖ ${unitKey} 打包失败：\n${result.all ?? ''}\n`);

    return { ok: false, version, file: null };
  }

  const produced = (await readdir(outDir)).find((name) => name.endsWith('.tgz') && !before.has(name));

  if (!produced) {
    process.stderr.write(`✖ ${unitKey} 未生成 .tgz，pnpm pack 输出：\n${result.all ?? ''}\n`);

    return { ok: false, version, file: null };
  }

  await rename(join(outDir, produced), targetFile);

  return { ok: true, version, file: targetFile };
}

/**
 * 执行打包
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

  const units = options.only ? [options.only] : listUnitKeys();

  for (const unitKey of units) {
    if (!RELEASE_UNITS[unitKey]) {
      process.stderr.write(`\n✖ --only 只能是 ${listUnitKeys().join(' / ')}\n\n`);
      return EXIT_CODE.usage;
    }
  }

  const outDir = resolveRoot(options.out);

  await mkdirp(outDir);

  process.stdout.write(`\n▸ 发布打包（${units.length} 个单元）\n`);

  let failed = 0;

  for (const unitKey of units) {
    const result = await packUnit(unitKey, {
      outDir,
      expectVersion: options.expectVersion,
      dryRun: options.dryRun,
    });

    if (!result.ok) {
      failed += 1;
      continue;
    }

    if (!options.dryRun && result.file) {
      process.stdout.write(`  ✔ ${RELEASE_UNITS[unitKey].file}-${result.version}.tgz\n`);
    }
  }

  if (failed > 0) {
    process.stderr.write(`\n✖ ${failed} 个单元打包失败\n\n`);
    return EXIT_CODE.failed;
  }

  process.stdout.write(`\n✔ 全部完成，产物目录：${options.out}\n\n`);

  return EXIT_CODE.ok;
}

process.exitCode = await main();
