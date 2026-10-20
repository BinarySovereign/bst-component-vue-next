// 根 dist 归拢：把三个主包与样式包的 build/ 产物集中到仓库根的 dist 目录
//
//   dist/
//   ├─ vue-next/
//   │  ├─ package.json
//   │  ├─ LICENSE
//   │  ├─ es/ lib/ umd/
//   ├─ vue-next-pro/     （同上）
//   ├─ vue-next-pro-ai/  （同上）
//   └─ styles/
//      ├─ package.json
//      ├─ LICENSE
//      └─ web/
//
// 归拢完成后会移除各包的 build/ 目录，使根 dist 成为唯一产物来源。
//
// 四个公开包都是自包含的发布根：各自带归一化后的 package.json（以便用 pnpm 的
// `github:<owner>/<repo>#path:/dist/<包名>` 直接安装）与许可证副本。
// 许可证随单元下发而非只放根 dist：消费方按 subdirectory 方式安装时只会取到单元目录，
// 根 dist 下的文件不在其可见范围内。
//
// !important：下发的 package.json 保留工作区的 `catalog:<组名>` 协议，未展开为具体区间。
// 该协议由 pnpm 在打包阶段解析（已实测：`pnpm pack` 会把 `catalog:runtime` 写为 `^1.11.23`），
// 因此**必须用 pnpm 发布**；若改用 `npm publish`，`catalog:` 会被原样写进 tarball
// 而使消费方安装失败。脚本会统计并打印 catalog 引用数量以提醒这一点。
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { copy, mkdirp, pathExists, remove } from 'fs-extra';
import { glob } from 'glob';

import { BUILD_DIR, DIST_DIR, PACKAGE_DIRS, resolveRoot, resolvePackage } from './paths.js';

// 归拢单元：源包标识 -> 根 dist 下的目标目录名
const DIST_UNITS = {
  vueNext: 'vue-next',
  vueNextPro: 'vue-next-pro',
  vueNextProAi: 'vue-next-pro-ai',
};

// 样式包在根 dist 下的目录名
const STYLES_DIST_NAME = 'styles';

// 发布清单必备文件名
const MANIFEST_FILE = 'package.json';

// 发布清单需剔除的字段
// 均为开发期专用、或会误导消费方的配置，不应随产物下发
const PUBLISH_MANIFEST_DROP_FIELDS = [
  // npm 见到 private 会直接拒发
  'private',
  // 构建 / 测试 / 校验命令属开发期脚本，消费方无需
  'scripts',
  'devDependencies',
  'devEngines',
  // 工作区与包管理器声明只对仓库自身生效
  'workspaces',
  'packageManager',
  // !important：必须剔除 type。
  // 声明 "type": "module" 时，lib/ 下的 CommonJS 产物（.js）会被 Node 按 ESM 解析，
  // require() 得到的是空 ESM 命名空间（实测 keys 为空、default 为 undefined），
  // 且**不会报错**，属静默失效。剔除后 .js 回落为 CommonJS，与 main / exports.require 一致；
  // es/ 下的 .mjs 不受影响（.mjs 恒为 ESM）。
  'type',
];

// 许可证文件名候选，按优先级排列，命中首个即用
const LICENSE_FILE_CANDIDATES = ['LICENSE', 'LICENSE.md', 'LICENCE'];

// 清单中承载产物路径、需按单元根重写的字段
const MANIFEST_PATH_FIELDS = ['main', 'module', 'types', 'browser', 'exports', 'typesVersions'];

// 源包清单中指向其内部构建目录的前缀
// 归拢会把 `build/` 下的内容提升为单元根，故该前缀在单元清单中已不成立
const SOURCE_BUILD_PREFIX = './build/';

/**
 * 去掉清单值中指向源包 `build/` 的前缀
 *
 * 递归处理字符串 / 数组 / 对象三种形态（`exports` 是嵌套对象，`files` 是数组）。
 *
 * @param {unknown} value 清单字段值
 * @returns {unknown} 重写后的值
 */
function stripSourceBuildPrefix(value) {
  if (typeof value === 'string') {
    return value.startsWith(SOURCE_BUILD_PREFIX) ? `./${value.slice(SOURCE_BUILD_PREFIX.length)}` : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => stripSourceBuildPrefix(item));
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, stripSourceBuildPrefix(item)]));
  }

  return value;
}

/**
 * 列出单元根下实际存在的顶层目录
 *
 * 供 `files` 字段使用：源包写的 `files: ["build"]` 指构建目录本身，
 * 而归拢后该目录的内容已提升为单元根，只能实测有哪些分层目录。
 *
 * @param {string} target 单元目录
 * @returns {Promise<string[]>} 顶层目录名（升序）
 */
async function listUnitLayers(target) {
  const entries = await readdir(target, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * 判断目录是否存在且含有文件
 *
 * 仅存在目录不足以说明有产物，需确认其中确有文件
 *
 * @param {string} dir 待检查的目录
 * @returns {Promise<boolean>} 是否为有效产物目录
 */
async function hasProducedFiles(dir) {
  if (!(await pathExists(dir))) {
    return false;
  }

  const files = await glob('**/*', { cwd: dir, nodir: true });

  return files.length > 0;
}

/**
 * 定位仓库根的许可证文件
 *
 * @returns {Promise<string | null>} 许可证的绝对路径，候选均不存在时返回 null
 */
async function resolveLicenseFile() {
  for (const candidate of LICENSE_FILE_CANDIDATES) {
    const absolute = resolveRoot(candidate);

    if (await pathExists(absolute)) {
      return absolute;
    }
  }

  return null;
}

/**
 * 统计包清单中 catalog 协议的引用数量
 *
 * 用于在归拢日志中提示「发布需走 pnpm」：该协议只有 pnpm 会在打包阶段展开。
 *
 * @param {string} packageRoot 源包根目录
 * @returns {Promise<number>} 引用数量，无法读取清单时返回 0
 */
async function countCatalogSpecifiers(packageRoot) {
  try {
    const raw = await readFile(join(packageRoot, MANIFEST_FILE), 'utf8');
    const pkg = JSON.parse(raw);

    return ['dependencies', 'peerDependencies', 'optionalDependencies'].reduce(
      (count, field) =>
        count +
        Object.values(pkg[field] ?? {}).filter(
          (specifier) => typeof specifier === 'string' && specifier.startsWith('catalog:'),
        ).length,
      0,
    );
  } catch {
    return 0;
  }
}

/**
 * 向归拢后的单元目录写入发布清单与附带文件
 *
 * 清单不从源包逐字复制，而是剔除开发期专用与有害字段后重新写出：
 * 源包清单面向「仓库内的开发」，其 scripts / devDependencies / type 等字段
 * 在发布根下要么无意义，要么会直接破坏产物解析（详见 PUBLISH_MANIFEST_DROP_FIELDS）。
 *
 * 同时把清单中指向源包 `build/` 的路径改写到单元根：样式包的 `main` / `exports`
 * 形如 `./build/web/index.css`，而归拢后该文件位于单元根的 `web/` 下，
 * 不改写会得到入口全部悬空的包。主包清单本就指向 `es/` / `lib/`，不受影响。
 *
 * @param {object} options 配置项
 * @param {string} options.packageRoot 源包根目录
 * @param {string} options.target 根 dist 下的单元目录
 * @returns {Promise<{ copied: string[], dropped: string[], rewritten: string[] }>} 已写入 / 已剔除 / 已改写路径的字段
 */
async function writeUnitMetadata({ packageRoot, target }) {
  const pkg = JSON.parse(await readFile(join(packageRoot, MANIFEST_FILE), 'utf8'));
  const dropped = PUBLISH_MANIFEST_DROP_FIELDS.filter((field) => Object.hasOwn(pkg, field));

  for (const field of dropped) {
    delete pkg[field];
  }

  // 改写指向源包 build/ 的路径，使入口落在单元根上
  const rewritten = [];

  for (const field of MANIFEST_PATH_FIELDS) {
    if (!Object.hasOwn(pkg, field)) {
      continue;
    }

    const next = stripSourceBuildPrefix(pkg[field]);

    if (JSON.stringify(next) !== JSON.stringify(pkg[field])) {
      pkg[field] = next;
      rewritten.push(field);
    }
  }

  // files 中的构建目录名需换成单元根下实际存在的分层目录
  if (Array.isArray(pkg.files) && pkg.files.includes(BUILD_DIR)) {
    const layers = await listUnitLayers(target);
    const next = pkg.files.flatMap((entry) => (entry === BUILD_DIR ? layers : [entry]));

    pkg.files = [...new Set(next)];
    rewritten.push('files');
  }

  const copied = [MANIFEST_FILE];

  // 保留源清单的 2 空格缩进，与仓库其它 JSON 一致
  await writeFile(join(target, MANIFEST_FILE), `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

  return { copied, dropped, rewritten };
}

/**
 * 归拢单个单元
 *
 * @param {object} options 配置项
 * @param {string} options.packageKey 源包标识
 * @param {string} options.targetName 根 dist 下的目录名
 * @param {string} options.distRoot 根 dist 目录
 * @param {string | null} options.licenseFile 许可证文件绝对路径，缺失时为 null
 * @returns {Promise<boolean>} 是否实际归拢
 */
async function moveUnit({ packageKey, targetName, distRoot, licenseFile }) {
  const packageRoot = resolvePackage(packageKey);
  const buildDir = join(packageRoot, BUILD_DIR);
  const target = join(distRoot, targetName);

  if (!(await hasProducedFiles(buildDir))) {
    console.info(`  归拢跳过：${targetName} 尚无产物`);

    return false;
  }

  await remove(target);
  await mkdirp(target);

  // 先复制再删源目录：复制途中失败时 build/ 仍完好，可直接重跑
  await copy(buildDir, target, { overwrite: true });
  await remove(buildDir);

  const { copied, dropped, rewritten } = await writeUnitMetadata({ packageRoot, target });
  const catalogCount = await countCatalogSpecifiers(packageRoot);

  // 许可证随单元下发：消费方用 `#path:/dist/<包名>` 安装时只取该目录，根 dist 不在其可见范围内
  if (licenseFile) {
    const licenseName = basename(licenseFile);

    await copy(licenseFile, join(target, licenseName), { overwrite: true });
    copied.push(licenseName);
  }

  // 告知 catalog 引用数量：它是「必须用 pnpm 发布」的外部约束，不写出来就会被 `npm publish` 静默破坏
  const catalogHint = catalogCount > 0 ? `，含 ${catalogCount} 处 catalog: 引用，须用 pnpm 发布` : '';
  const dropHint = dropped.length > 0 ? `；已剔除 ${dropped.join(' / ')}` : '';
  const rewriteHint = rewritten.length > 0 ? `；已改写路径 ${rewritten.join(' / ')}` : '';

  console.info(
    `  归拢 ${targetName} -> ${target}（已写入：${copied.join('、')}${dropHint}${rewriteHint}${catalogHint}）`,
  );

  return true;
}

/**
 * 归拢全部产物到根 dist
 *
 * @returns {Promise<void>} 归拢完成的 Promise
 */
export async function moveToDist() {
  const distRoot = resolveRoot(DIST_DIR);

  // 每次归拢都重建根 dist，避免上一轮已删除模块的产物残留
  await remove(distRoot);
  await mkdirp(distRoot);

  // 归拢时重建 dist 根目录，故许可证在此处解析一次，随后下发到各单元
  const licenseFile = await resolveLicenseFile();

  if (!licenseFile) {
    // 不中止：缺许可证不影响产物可用性，但必须让使用者知道各单元不会带上它
    console.warn(`  许可证缺失：${LICENSE_FILE_CANDIDATES.join(' / ')} 在仓库根均未找到，各单元将不带许可证`);
  }

  const units = [
    ...Object.entries(DIST_UNITS).map(([packageKey, targetName]) => ({ packageKey, targetName })),
    { packageKey: 'styles', targetName: STYLES_DIST_NAME },
  ];

  let moved = 0;

  for (const unit of units) {
    if (await moveUnit({ ...unit, distRoot, licenseFile })) {
      moved += 1;
    }
  }

  // 归拢完成后清空全部包的 build/：产物已集中到根 dist，中间目录不再保留。
  // 覆盖源码包（其产物已聚合进主包）与未被归拢的包，使 build/ 不会残留。
  let cleaned = 0;

  for (const packageKey of Object.keys(PACKAGE_DIRS)) {
    const buildDir = join(resolvePackage(packageKey), BUILD_DIR);

    if (await pathExists(buildDir)) {
      await remove(buildDir);
      cleaned += 1;
    }
  }

  console.info(`  根 dist 归拢完成：${moved} / ${units.length} 个单元已就位 -> ${distRoot}`);
  console.info(`  已清理 ${cleaned} 个残留的 build/ 目录`);
}
