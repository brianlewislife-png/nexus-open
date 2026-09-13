import { listSessions } from '../client';
import { error, info, parseFlags, printTable } from '../helpers';

const FLAGS: Record<string, string> = {
  '--agent': 'agent',
  '--project': 'project',
  '--limit': 'limit',
};

export async function sessions(args: string[]): Promise<void> {
  const { values } = parseFlags(args, FLAGS);
  try {
    const limit = parseInt(values.limit ?? '20', 10);
    const res = await listSessions(values.agent, values.project);
    const items = res.items.slice(0, limit);

    if (items.length === 0) {
      info('No sessions yet. Start one from the dashboard or chat command.');
      return;
    }

    printTable(
      ['ID', 'TITLE', 'AGENT', 'PROJECT', 'STATUS', 'CREATED'],
      items.map((s) => [
        s.id.slice(0, 8),
        (s.title ?? 'Untitled').slice(0, 24),
        s.agent?.name ?? '—',
        s.project?.name ?? '—',
        s.status,
        new Date(s.createdAt).toLocaleString().slice(0, 17),
      ])
    );
  } catch (err) {
    error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}