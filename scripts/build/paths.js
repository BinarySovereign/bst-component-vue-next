// 工作区路径解析：为全部构建脚本提供稳定、跨平台的绝对路径
//
// 而是直接基于本文件自身位置推导。构建脚本可能被从任意目录调用（如 pnpm -C、CI），
// 自身位置是唯一不随调用点变化的锚点。
import { dirname, join, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 归一化路径分隔符为 POSIX 风格
 *
 * @param {string} target 待归一化的路径
 * @returns {string} 归一化后的路径
 */
export function toPosix(target) {
  return target.split(sep).join(posix.sep);
}

// 本文件位于 <root>/scripts/build/paths.js，故上溯两级即工作区根
export const WORKSPACE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// 各包目录，相对工作区根
export const PACKAGE_DIRS = {
  // 共享类型包（private）：只有类型声明，不产出运行时模块，声明在构建期内联进组件产物
  bstTypes: 'packages/bst-types',
  // 组件源码包（private）：产出各自产物，供主包聚合
  basicComponents: 'packages/bst-basic-components',
  advancedComponents: 'packages/bst-advanced-components',
  aiComponents: 'packages/bst-ai-components',
  // 样式包：唯一的样式来源，产出 CSS
  styles: 'packages/bst-styles',
  // 主包（发布）：聚合对应源码包的产物
  vueNext: 'packages/bst-vue-next',
  vueNextPro: 'packages/bst-vue-next-pro',
  vueNextProAi: 'packages/bst-vue-next-pro-ai',
};

// 各包的产物目录名，相对包根
// 约定：所有包一律先产出到自身的 build/ 下，再由 `--move main-package` 归拢到根 dist，
// 归拢完成后 build/ 会被移除，因此它是可随时重建的中间产物，不入版本管理
export const BUILD_DIR = 'build';

// 根 dist 目录名，归拢任务的最终落点
export const DIST_DIR = 'dist';

// 构建脚本内部的临时目录，任务结束即清理
// 置于 node_modules 下，天然被版本管理忽略，不会污染仓库根
// 不使用包内的临时目录，避免被自身的产物扫描再次读入
export const TEMP_DIR = 'node_modules/.bst-temp';

/**
 * 解析工作区内的绝对路径
 *
 * @param {...string} paths 相对工作区根的路径片段
 * @returns {string} 绝对路径
 */
export function resolveRoot(...paths) {
  return resolve(WORKSPACE_ROOT, ...paths);
}

/**
 * 解析某个包的绝对路径
 *
 * @param {keyof PACKAGE_DIRS} name 包标识
 * @param {...string} paths 包内相对路径片段
 * @returns {string} 绝对路径
 */
export function resolvePackage(name, ...paths) {
  const dir = PACKAGE_DIRS[name];

  if (!dir) {
    throw new Error(`未知的包标识：${name}（可选值：${Object.keys(PACKAGE_DIRS).join(' / ')}）`);
  }

  return resolveRoot(dir, ...paths);
}

/**
 * 计算 from 到 to 的 POSIX 风格相对路径，供 Less @import 等场景使用
 *
 * @param {string} from 起始目录（绝对路径）
 * @param {string} to 目标文件（绝对路径）
 * @returns {string} 相对路径
 */
export function relativePosix(from, to) {
  return toPosix(relative(from, to));
}

export { join, dirname, resolve };
