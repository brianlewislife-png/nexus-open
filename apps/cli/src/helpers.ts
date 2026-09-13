import pc from 'picocolors';

export function printTable(
  headers: string[],
  rows: (string | number)[][]
): void {
  if (rows.length === 0) {
    info('No results.');
    return;
  }

  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length))
  );

  const renderRow = (cells: string[], color: (s: string) => string) => {
    const line = cells
      .map((c, i) => c.padEnd(widths[i] + 2))
      .join('')
      .trimEnd();
    process.stdout.write('  ' + color(line) + '\n');
  };

  renderRow(headers, pc.bold);
  process.stdout.write('  ' + pc.dim('-'.repeat(widths.reduce((a, b) => a + b + 2, 0))) + '\n');

  for (const row of rows) {
    renderRow(row.map((c) => String(c)), (s) => s);
  }
}

export function success(text: string): void {
  process.stdout.write(pc.green('✔') + ' ' + text + '\n');
}

export function error(text: string): void {
  process.stdout.write(pc.red('✖') + ' ' + text + '\n');
}

export function warn(text: string): void {
  process.stdout.write(pc.yellow('⚠') + ' ' + text + '\n');
}

export function info(text: string): void {
  process.stdout.write(pc.blue('ℹ') + ' ' + text + '\n');
}

export function dim(text: string): void {
  process.stdout.write(pc.dim(text) + '\n');
}

export function banner(): void {
  process.stdout.write(
    pc.cyan(pc.bold('\n  NEXUS') +
    pc.dim(', Open Source AI Workspace\n'))
  );
  process.stdout.write(pc.dim('  Special Anniversary Edition · September 13, 2026\n') + '\n');
}

export function parseFlags(
  args: string[],
  flags: Record<string, string>
): { values: Record<string, string>; positionals: string[] } {
  const values: Record<string, string> = {};
  const positionals: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const flagKey = flags[arg];
    if (flagKey) {
      values[flagKey] = args[i + 1] ?? '';
      i++;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const eq = key.indexOf('=');
      if (eq >= 0) {
        values[flags[`--${key.slice(0, eq)}`] ?? key.slice(0, eq)] = key.slice(eq + 1);
      } else {
        values[flags[arg] ?? key] = args[i + 1] ?? '';
        if (flags[arg]) i++;
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      const key = arg.slice(1);
      values[flags[arg] ?? key] = args[i + 1] ?? '';
      if (flags[arg]) i++;
    } else {
      positionals.push(arg);
    }
  }
  return { values, positionals };
}