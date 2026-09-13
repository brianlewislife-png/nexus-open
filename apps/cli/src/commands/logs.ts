import { listActivity } from '../client';
import { error, info, parseFlags, printTable } from '../helpers';

const FLAGS: Record<string, string> = {
  '--limit': 'limit',
  '--level': 'level',
};

export async function logs(args: string[]): Promise<void> {
  const { values } = parseFlags(args, FLAGS);
  const limit = parseInt(values.limit ?? '20', 10);
  const level = values.level;

  try {
    const res = await listActivity(level, limit);
    if (res.items.length === 0) {
      info('No activity recorded yet.');
      return;
    }

    const levelColor = (lvl: string) => {
      switch (lvl) {
        case 'error': return 'error';
        case 'warning': return 'warn';
        case 'success': return 'ok';
        default: return 'info';
      }
    };

    printTable(
      ['TIME', 'LEVEL', 'ACTION', 'ENTITY', 'DETAILS'],
      res.items.map((a) => [
        new Date(a.createdAt).toLocaleTimeString(),
        levelColor(a.level),
        a.action,
        a.entityType ?? '—',
        a.entityId?.slice(0, 8) ?? '',
      ])
    );
  } catch (err) {
    error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}