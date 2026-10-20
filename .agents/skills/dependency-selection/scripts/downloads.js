#!/usr/bin/env node
const ENDPOINT = 'https://api.npmjs.org/downloads/point';
const DEFAULT_MIN = 10_000;
const WEEKS_PER_MONTH = 30.44 / 7; // ≈ 4.349
const TIMEOUT_MS = 15_000;

function printHelp() {
  process.stdout.write(
    [
      '查询 npm 包下载量并按门槛判定',
      '',
      '用法：node downloads.mjs [--min <n>] [--json] <pkg> [<pkg> ...]',
      '',
      '  --min <n>   周下载量硬门槛，默认 10000。低于它 → 排除；',
      '              低于它的 10 倍 → 灰区；否则 → 放行。',
      '  --json      以 JSON 输出。',
      '',
      '示例：',
      '  node downloads.mjs vue vitest @vue/server-renderer',
      '  node downloads.mjs --min 50000 --json eslint',
      '',
    ].join('\n'),
  );
}

function fail(message) {
  process.stderr.write(`downloads.mjs: ${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const packages = [];
  let min = DEFAULT_MIN;
  let asJson = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--json') {
      asJson = true;
      continue;
    }

    if (arg === '--min' || arg.startsWith('--min=')) {
      const raw = arg === '--min' ? argv[++i] : arg.slice('--min='.length);
      const parsed = Number(raw);
      if (raw === undefined || raw === '' || !Number.isFinite(parsed) || parsed < 0) {
        fail(`--min 需要一个非负数字，收到：${raw === undefined ? '(缺失)' : raw}`);
      }
      min = parsed;
      continue;
    }

    if (arg.startsWith('-')) {
      fail(`未知参数：${arg}（用 --help 查看用法）`);
    }

    packages.push(arg);
  }

  if (packages.length === 0) {
    fail('至少需要一个包名。用法：node downloads.mjs [--min <n>] <pkg> [<pkg> ...]');
  }

  return { packages, min, asJson };
}

async function fetchCount(window, name) {
  const url = `${ENDPOINT}/last-${window}/${name}`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (response.status === 404) return null; 
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      return typeof body?.downloads === 'number' ? body.downloads : null;
    } catch (error) {
      if (attempt === 1) throw new Error(`${window} 窗口查询失败：${error.message}`);
    }
  }

  return null;
}

function trendOf(week, month) {
  if (week === null || month === null) return '—';
  const monthlyAveragePerWeek = month / WEEKS_PER_MONTH;
  if (monthlyAveragePerWeek === 0) return '—';
  const ratio = week / monthlyAveragePerWeek;
  if (ratio < 0.6) return '下滑';
  if (ratio > 1.4) return '上升';
  return '平稳';
}

function verdictOf(week, min) {
  if (week === null) return '未找到';
  if (week < min) return '排除';
  if (week < min * 10) return '灰区';
  return '放行';
}

function formatNumber(value) {
  return value === null ? '—' : value.toLocaleString('en-US');
}

function padEndVisible(text, width) {
  const visibleLength = [...text].length;
  return text + ' '.repeat(Math.max(0, width - visibleLength));
}

function renderTable(rows, min) {
  const headers = ['包名', '周下载量', '月下载量', '趋势', '判定'];
  const cells = rows.map((row) => [
    row.name,
    formatNumber(row.week),
    formatNumber(row.month),
    row.trend,
    row.verdict,
  ]);

  const widths = headers.map((header, column) =>
    Math.max(...[header, ...cells.map((row) => row[column])].map((text) => [...text].length)),
  );

  const lines = [];
  lines.push(
    `门槛：周下载量 < ${min.toLocaleString('en-US')} 判「排除」，< ${(min * 10).toLocaleString('en-US')} 判「灰区」`,
  );
  lines.push('');
  lines.push(headers.map((header, column) => padEndVisible(header, widths[column])).join('  '));
  lines.push(widths.map((width) => '-'.repeat(width)).join('  '));
  for (const row of cells) {
    lines.push(row.map((text, column) => padEndVisible(text, widths[column])).join('  '));
  }

  return lines.join('\n');
}

async function main() {
  const { packages, min, asJson } = parseArgs(process.argv.slice(2));
  const unique = [...new Set(packages)];

  const results = await Promise.all(
    unique.map(async (name) => {
      const [week, month] = await Promise.all([
        fetchCount('week', name),
        fetchCount('month', name),
      ]);
      return {
        name,
        week,
        month,
        trend: trendOf(week, month),
        verdict: verdictOf(week, min),
      };
    }),
  );

  const order = { 未找到: 0, 排除: 1, 灰区: 2, 放行: 3 };
  results.sort((a, b) => {
    const byVerdict = (order[a.verdict] ?? 9) - (order[b.verdict] ?? 9);
    if (byVerdict !== 0) return byVerdict;
    return (a.week ?? -1) - (b.week ?? -1);
  });

  if (asJson) {
    process.stdout.write(`${JSON.stringify({ min, packages: results }, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${renderTable(results, min)}\n`);

  const excluded = results.filter((row) => row.verdict === '排除' || row.verdict === '未找到');
  if (excluded.length > 0) {
    process.stdout.write(
      `\n注意：${excluded.map((row) => row.name).join('、')} 未过包级门槛，不应进入版本对比。\n` +
        '若用户目标确实只能由它实现，改为给出 2–3 个量级更高的替代候选。\n',
    );
  }
}

main().catch((error) => {
  fail(`查询失败：${error.message}。将「下载量」记入「未验证项」，不要用印象数字替代。`);
});
