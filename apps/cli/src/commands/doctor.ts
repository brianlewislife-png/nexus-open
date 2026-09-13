import { getHealth } from '../client';
import { banner, dim, error, info, printTable, success, warn } from '../helpers';

const ENV_KEYS: Record<string, string> = {
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  ollama: 'OLLAMA_BASE_URL',
};

interface CheckResult {
  check: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
}

export async function doctor(apiUrl?: string): Promise<void> {
  banner();
  info('Running NEXUS diagnostics...\n');

  const results: CheckResult[] = [];

  let apiOk = false;
  try {
    const health = await getHealth();
    apiOk = true;
    results.push({
      check: 'API reachable',
      status: 'PASS',
      detail: `v${health.version} · ${health.status}`,
    });
    results.push({
      check: 'Database',
      status: health.database === 'connected' ? 'PASS' : 'FAIL',
      detail: health.database,
    });
  } catch (err) {
    results.push({
      check: 'API reachable',
      status: 'FAIL',
      detail: apiUrl
        ? `Cannot reach ${apiUrl}`
        : 'Cannot reach http://localhost:3001 (NEXUS_BASE_URL)',
    });
    results.push({ check: 'Database', status: 'FAIL', detail: 'API unreachable' });
  }

  for (const [slug, envKey] of Object.entries(ENV_KEYS)) {
    const value = process.env[envKey];
    if (slug === 'ollama') {
      continue;
    } else if (value && value.length > 0) {
      results.push({
        check: `${slug} provider`,
        status: 'PASS',
        detail: 'API key configured',
      });
    } else {
      results.push({
        check: `${slug} provider`,
        status: 'WARN',
        detail: `${envKey} not set, provider disabled`,
      });
    }
  }

  if (apiOk) {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    let reachable = false;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${ollamaUrl}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);
      reachable = res.ok;
    } catch {
      reachable = false;
    }
    if (reachable) {
      results.push({ check: 'Ollama', status: 'PASS', detail: `Reachable at ${ollamaUrl}` });
    } else {
      results.push({ check: 'Ollama', status: 'WARN', detail: `Not reachable at ${ollamaUrl} (expected if not running)` });
    }
  }

  printTable(
    ['CHECK', 'STATUS', 'DETAIL'],
    results.map((r) => [r.check.padEnd(15), r.status, r.detail])
  );

  dim('');
  const fails = results.filter((r) => r.status === 'FAIL').length;
  const warns = results.filter((r) => r.status === 'WARN').length;

  if (fails === 0 && warns === 0) {
    success('All checks passed. NEXUS is ready.');
  } else if (fails === 0) {
    warn(`${warns} warning(s). NEXUS is functional but some integrations need configuration.`);
  } else {
    error(`${fails} check(s) failed. See the NEXUS docs for troubleshooting.`);
    process.exitCode = 1;
  }
}