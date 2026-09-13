import { banner, dim, info } from '../helpers';

const COMMANDS: Record<string, string> = {
  status: 'Show API status and connectivity',
  agents: 'List agents (create/delete with sub-commands)',
  projects: 'List projects',
  models: 'List providers and available models',
  logs: 'Show recent activity logs',
  doctor: 'Run NEXUS diagnostics',
  sessions: 'List recent sessions',
  chat: 'Send a message to a session and print the response',
  help: 'Show help for a command',
};

export function showHelp(command?: string): void {
  if (command && COMMANDS[command]) {
    banner();
    info(`nexus ${command}`);
    dim(`  ${COMMANDS[command]}`);
    dim('');
    helpDetails(command);
    return;
  }

  banner();
  info('An open-source, self-hosted AI workspace for managing models, agents, tools, skills and projects in one place.\n');
  dim('Usage: nexus <command> [options]');
  dim('');
  dim('Commands:');
  dim('');
  for (const [name, desc] of Object.entries(COMMANDS)) {
    dim(`  ${name.padEnd(12)} ${desc}`);
  }
  dim('');
  dim('Global options:');
  dim('  --api-url <url>    Override the API base URL (default: $NEXUS_BASE_URL or http://localhost:3001)');
  dim('  --help, -h         Show help');
  dim('  --version, -v      Show version');
  dim('');
  dim('Examples:');
  dim('  nexus status');
  dim('  nexus agents');
  dim('  nexus agents create --name "Backend Agent" --model <modelId>');
  dim('  nexus models');
  dim('  nexus doctor');
  dim('  nexus logs --limit 20');
}

function helpDetails(command: string): void {
  switch (command) {
    case 'agents':
      dim('Sub-commands:');
      dim('  nexus agents                                         List agents');
      dim('  nexus agents create --name <n> --model <id> [options]  Create an agent');
      dim('  nexus agents delete <agentId>                         Delete an agent');
      dim('  nexus agents duplicate <agentId>                      Duplicate an agent');
      dim('Options: --name, --model, --project, --prompt, --description');
      break;
    case 'logs':
      dim('Options:');
      dim('  --limit <n>     Number of entries (default 20)');
      dim('  --level <lvl>   Filter by level (info|warning|error|success)');
      break;
    case 'chat':
      dim('Options:');
      dim('  --session <id>    Session ID');
      dim('  --message <text>  Message to send');
      break;
    case 'sessions':
      dim('Options:');
      dim('  --agent <id>    Filter by agent');
      dim('  --project <id>  Filter by project');
      break;
    default:
      break;
  }
}