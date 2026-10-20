// CI 门禁清单：本地脚本 `ci:local` 与 `.github/workflows/ci.yml` 的共用事实来源
//
// 除 `localOnly` 标记的步骤外，每个步骤的 command + args 必须与 ci.yml 对应 step 的 `run` 命令逐字等价，
// `pnpm ci:local --check-sync` 会解析 ci.yml 并逐条比对，任一侧单独改动都会失败。
//
// 顺序即执行顺序，不可随意调整：
// - `build:docs` / `build:storybook` 依赖样式包产物，必须排在 `move:main:dist` 之前
// - `move:main:dist` 会删除各包的 build/，因此必须排在最后

// 单步超时基准，单位毫秒
const MINUTE = 60 * 1000;

// 门禁分组：决定各执行档位覆盖的步骤范围
export const STEP_GROUPS = {
  static: '静态检查',
  test: '测试',
  build: '构建',
  docs: '文档与示例',
  dist: '产物归拢',
};

// 执行档位：按层递进，便于按改动范围选择
export const PROFILES = {
  quick: ['static'],
  test: ['static', 'test'],
  build: ['static', 'test', 'build'],
  full: ['static', 'test', 'build', 'docs', 'dist'],
};

// 默认档位：推送前使用，与 CI 完全对齐
export const DEFAULT_PROFILE = 'full';

// 门禁步骤，与 ci.yml 的 step 一一对应
// ci.yml 中「检出仓库 / 安装 pnpm / 安装 Node / 安装依赖」四个准备步骤不在此列，
// 由 preflight 的版本校验与 `--install` 承担
export const STEPS = [
  {
    id: 'prettier',
    ciName: '格式检查',
    group: 'static',
    command: 'pnpm',
    args: ['exec', 'prettier', '--check', '.'],
    timeoutMs: 5 * MINUTE,
  },
  {
    id: 'commit-msg',
    ciName: '校验提交信息',
    group: 'static',
    // 只在本地门禁里执行：CI 不做提交信息校验，由提交前手动跑一遍保证规范
    // localOnly 的步骤不参与 `--check-sync` 的逐条比对
    localOnly: true,
    command: 'node',
    args: ['scripts/ci/check-commit-msg.js', '--all'],
    timeoutMs: 2 * MINUTE,
  },
  {
    id: 'typecheck',
    ciName: 'TypeScript 类型检查',
    group: 'static',
    command: 'pnpm',
    args: ['typecheck'],
    timeoutMs: 10 * MINUTE,
  },
  {
    id: 'eslint',
    ciName: 'ESLint 静态检查',
    group: 'static',
    command: 'pnpm',
    args: [
      'exec',
      'eslint',
      './packages',
      './scripts',
      './babel.config.cjs',
      './eslint.config.js',
      './stylelint.config.js',
      './vitest.config.ts',
      '--max-warnings',
      '0',
      '--no-cache',
    ],
    timeoutMs: 10 * MINUTE,
  },
  {
    id: 'stylelint',
    ciName: 'Stylelint 样式检查',
    group: 'static',
    command: 'pnpm',
    args: ['lint:style'],
    timeoutMs: 5 * MINUTE,
  },
  {
    id: 'test-unit',
    ciName: '单元测试',
    group: 'test',
    command: 'pnpm',
    args: ['test:unit'],
    timeoutMs: 15 * MINUTE,
  },
  {
    id: 'test-snap',
    ciName: '快照测试',
    group: 'test',
    command: 'pnpm',
    args: ['test:snap'],
    timeoutMs: 15 * MINUTE,
  },
  {
    id: 'build-private',
    ciName: '组件源码包构建',
    group: 'build',
    command: 'pnpm',
    args: ['build:private'],
    timeoutMs: 20 * MINUTE,
  },
  {
    id: 'build-style',
    ciName: '样式包构建',
    group: 'build',
    command: 'pnpm',
    args: ['build:style'],
    timeoutMs: 10 * MINUTE,
  },
  {
    id: 'build-next',
    ciName: '基础组件主包聚合',
    group: 'build',
    command: 'pnpm',
    args: ['build:vue:next'],
    timeoutMs: 10 * MINUTE,
  },
  {
    id: 'build-pro',
    ciName: '高级组件主包聚合',
    group: 'build',
    command: 'pnpm',
    args: ['build:vue:next:pro'],
    timeoutMs: 10 * MINUTE,
  },
  {
    id: 'build-ai',
    ciName: 'AI 组件主包聚合',
    group: 'build',
    command: 'pnpm',
    args: ['build:vue:next:pro:ai'],
    timeoutMs: 10 * MINUTE,
  },
  {
    id: 'build-docs',
    ciName: '文档站构建',
    group: 'docs',
    command: 'pnpm',
    args: ['build:docs'],
    timeoutMs: 15 * MINUTE,
  },
  {
    id: 'build-storybook',
    ciName: 'Storybook 构建',
    group: 'docs',
    command: 'pnpm',
    args: ['build:storybook'],
    timeoutMs: 15 * MINUTE,
  },
  {
    id: 'move-dist',
    ciName: '归拢产物到根 dist',
    group: 'dist',
    command: 'pnpm',
    args: ['move:main:dist'],
    timeoutMs: 10 * MINUTE,
  },
];

/**
 * 按 id 查找步骤
 *
 * @param {string} id 步骤标识
 * @returns {(typeof STEPS)[number] | undefined} 命中的步骤
 */
export function getStepById(id) {
  return STEPS.find((step) => step.id === id);
}

/**
 * 还原步骤的完整命令行文本，供展示与同步校验使用
 *
 * @param {(typeof STEPS)[number]} step 步骤定义
 * @returns {string} 归一化后的命令文本
 */
export function getStepCommand(step) {
  return [step.command, ...step.args].join(' ');
}

/**
 * 把逗号分隔的步骤 id 拆成数组
 *
 * @param {string} value 原始取值
 * @returns {string[]} 拆分后的 id 列表
 */
function parseIdList(value) {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

/**
 * 按档位与过滤条件展开本次要执行的步骤
 *
 * @param {{ profile?: string, only?: string | null, skip?: string | null, from?: string | null }} options 过滤条件
 * @returns {{ steps: (typeof STEPS)[number][], errors: string[] }} 选中的步骤与校验错误
 */
export function selectSteps({ profile = DEFAULT_PROFILE, only = null, skip = null, from = null } = {}) {
  const errors = [];
  const groups = PROFILES[profile];

  if (!groups) {
    errors.push(`未知的执行档位：${profile}（可选值：${Object.keys(PROFILES).join(' / ')}）`);

    return { steps: [], errors };
  }

  // 默认按档位圈定范围；--only 一旦给出就以显式清单为准，便于只跑某几步
  let steps = STEPS.filter((step) => groups.includes(step.group));

  if (only) {
    const ids = parseIdList(only);
    const unknown = ids.filter((id) => !getStepById(id));

    if (unknown.length > 0) {
      errors.push(`--only 中存在未知步骤：${unknown.join(', ')}`);
    }

    steps = STEPS.filter((step) => ids.includes(step.id));
  }

  if (skip) {
    const ids = parseIdList(skip);
    const unknown = ids.filter((id) => !getStepById(id));

    if (unknown.length > 0) {
      errors.push(`--skip 中存在未知步骤：${unknown.join(', ')}`);
    }

    steps = steps.filter((step) => !ids.includes(step.id));
  }

  if (from) {
    const index = steps.findIndex((step) => step.id === from);

    if (index === -1) {
      errors.push(`--from 指定的步骤不在本次执行范围内：${from}`);
    } else {
      steps = steps.slice(index);
    }
  }

  return { steps, errors };
}
