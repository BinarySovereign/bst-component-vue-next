#!/usr/bin/env node
// 构建总入口：按目标编排各包的构建与产物归拢
//
// 用法：
//   node scripts/build-package.js --build <目标>
//   node scripts/build-package.js --move main-package
//   node scripts/build-package.js --help / --h
//
// --build 目标：
//   private         依次构建三个组件源码包，产出各自的 es / lib / umd
//   styles          构建样式包，产出 CSS
//   vue-next        把基础组件源码包产物聚合到基础组件主包
//   vue-next-pro    把高级组件源码包产物聚合到高级组件主包
//   vue-next-pro-ai 把 AI 组件源码包产物聚合到 AI 组件主包
//
// --move 目标：
//   main-package    把三个主包与样式包的产物归拢到根 dist
import process from 'node:process';

import { AGGREGATE_MAP, aggregatePackage, buildComponents, buildTypes } from './build/components.js';
import { moveToDist } from './build/dist.js';
import { buildStyles } from './build/styles.js';

// 组件源码包标识，与 build:private 的构建单元一一对应
const SOURCE_PACKAGES = ['basicComponents', 'advancedComponents', 'aiComponents'];

// --build 可用目标
const BUILD_TARGETS = ['private', 'styles', ...Object.keys(AGGREGATE_MAP)];

// --move 可用目标
const MOVE_TARGETS = ['main-package'];

/**
 * 输出用法说明
 *
 * @returns {void}
 */
function printUsage() {
  process.stdout.write(
    [
      '构建总入口',
      '',
      '用法：',
      '  node scripts/build-package.js --build <目标>',
      '  node scripts/build-package.js --move <目标>',
      '',
      '可用 --build 目标：',
      '  private          依次构建三个组件源码包（es / lib / umd）',
      '  styles           构建样式包并产出 CSS',
      '  vue-next         聚合基础组件源码包产物到基础组件主包',
      '  vue-next-pro     聚合高级组件源码包产物到高级组件主包',
      '  vue-next-pro-ai  聚合 AI 组件源码包产物到 AI 组件主包',
      '',
      '可用 --move 目标：',
      '  main-package     归拢全部产物到根 dist',
      '',
    ].join('\n'),
  );
}

/**
 * 解析命令行参数
 *
 * @param {string[]} argv 进程参数（已去除前两个）
 * @returns {{ mode: 'build' | 'move' | 'help', target?: string }} 解析结果
 */
function parseArgs(argv) {
  const buildIndex = argv.indexOf('--build');
  const moveIndex = argv.indexOf('--move');

  if (argv.includes('--help') || argv.includes('-h') || (buildIndex === -1 && moveIndex === -1)) {
    return { mode: 'help' };
  }

  if (buildIndex !== -1) {
    return { mode: 'build', target: argv[buildIndex + 1] };
  }

  return { mode: 'move', target: argv[moveIndex + 1] };
}

/**
 * 执行构建目标
 *
 * @param {string} target 构建目标
 * @returns {Promise<void>} 执行完成的 Promise
 */
async function runBuild(target) {
  if (!BUILD_TARGETS.includes(target)) {
    throw new Error(`未知的构建目标：${target}（可选值：${BUILD_TARGETS.join(' / ')}）`);
  }

  if (target === 'styles') {
    console.info('▸ 构建样式包');

    await buildStyles({ packageKey: 'styles' });

    return;
  }

  if (target === 'private') {
    console.info('▸ 构建组件源码包');

    for (const packageKey of SOURCE_PACKAGES) {
      console.info(`  · ${packageKey}`);

      // 无源码时跳过类型产出，避免对空输入白跑一次 tsc
      const produced = await buildComponents({ packageKey });

      if (produced) {
        await buildTypes({ packageKey });
      }
    }

    return;
  }

  // 其余目标均为「把源码包产物聚合到主包」
  console.info(`▸ 聚合到主包 ${target}`);

  await aggregatePackage({ target });
}

/**
 * 执行归拢目标
 *
 * @param {string} target 归拢目标
 * @returns {Promise<void>} 执行完成的 Promise
 */
async function runMove(target) {
  if (!MOVE_TARGETS.includes(target)) {
    throw new Error(`未知的归拢目标：${target}（可选值：${MOVE_TARGETS.join(' / ')}）`);
  }

  console.info('▸ 归拢产物到根 dist');

  await moveToDist();
}

async function main() {
  const { mode, target } = parseArgs(process.argv.slice(2));

  if (mode === 'help') {
    printUsage();

    return;
  }

  if (!target) {
    throw new Error(`${mode === 'build' ? '--build' : '--move'} 需要一个目标值`);
  }

  if (mode === 'build') {
    await runBuild(target);
  } else {
    await runMove(target);
  }
}

main().catch((error) => {
  process.stderr.write(`\n构建失败：${error.message}\n`);
  process.exitCode = 1;
});
