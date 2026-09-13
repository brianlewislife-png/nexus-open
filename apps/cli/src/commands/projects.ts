import { listProjects } from '../client';
import { error, info, printTable } from '../helpers';

export async function projects(): Promise<void> {
  try {
    const res = await listProjects();
    if (res.items.length === 0) {
      info('No projects yet. Create one from the NEXUS web dashboard.');
      return;
    }
    printTable(
      ['ID', 'NAME', 'DESCRIPTION', 'AGENTS', 'SESSIONS'],
      res.items.map((p) => [
        p.id.slice(0, 8),
        p.name,
        (p.description ?? '').slice(0, 40) || '—',
        String(p._count?.agents ?? 0),
        String(p._count?.sessions ?? 0),
      ])
    );
  } catch (err) {
    error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}