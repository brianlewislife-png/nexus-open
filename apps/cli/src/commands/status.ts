import { getHealth } from '../client';
import { banner, dim, error, info, success } from '../helpers';

export async function status(): Promise<void> {
  banner();
  try {
    const health = await getHealth();
    success(`NEXUS API is running`);
    dim('');
    dim(`  Version:      ${health.version}`);
    dim(`  Status:       ${health.status}`);
    dim(`  Database:     ${health.database}`);
    dim(`  Uptime:       ${Math.round(health.uptime)}s`);
    dim(`  Timestamp:    ${new Date(health.timestamp).toISOString()}`);
    dim('');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    error('NEXUS API is not reachable.');
    info(message);
    if (message.includes('docker compose')) {
      dim('');
      dim('  1. cp .env.example .env');
      dim('  2. docker compose up -d');
      dim('  3. Check again with: nexus status');
    }
    process.exitCode = 1;
  }
}