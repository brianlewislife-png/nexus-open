#!/usr/bin/env node

import { agents } from './commands/agents';
import { chat } from './commands/chat';
import { doctor } from './commands/doctor';
import { showHelp } from './commands/help';
import { logs } from './commands/logs';
import { models } from './commands/models';
import { projects } from './commands/projects';
import { sessions } from './commands/sessions';
import { status } from './commands/status';
import { error } from './helpers';

const VERSION = '0.1.0';

function parseApiUrl(args: string[]): { apiUrl?: string; rest: string[] } {
  const rest: string[] = [];
  let apiUrl: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--api-url') {
      apiUrl = args[i + 1];
      i++;
    } else if (args[i].startsWith('--api-url=')) {
      apiUrl = args[i].split('=')[1];
    } else {
      rest.push(args[i]);
    }
  }
  return { apiUrl, rest };
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const { apiUrl, rest } = parseApiUrl(rawArgs);
  if (apiUrl) process.env.NEXUS_BASE_URL = apiUrl;

  const [cmd, ...cmdArgs] = rest;

  if (!cmd || cmd === '--help' || cmd === '-h' || cmd === 'help') {
    showHelp(cmdArgs[0]);
    return;
  }

  if (cmd === '--version' || cmd === '-v' || cmd === 'version') {
    process.stdout.write(`nexus ${VERSION}\n`);
    return;
  }

  switch (cmd) {
    case 'status':
      await status();
      break;
    case 'agents':
      await agents(cmdArgs);
      break;
    case 'projects':
      await projects();
      break;
    case 'models':
      await models(cmdArgs[0]);
      break;
    case 'logs':
      await logs(cmdArgs);
      break;
    case 'doctor':
      await doctor(apiUrl);
      break;
    case 'sessions':
      await sessions(cmdArgs);
      break;
    case 'chat':
      await chat(cmdArgs);
      break;
    default:
      error(`Unknown command: ${cmd}`);
      error('Run `nexus --help` to see available commands.');
      process.exitCode = 1;
  }
}

main().catch((err) => {
  error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});