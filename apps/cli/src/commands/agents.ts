import {
  createAgent,
  deleteAgent,
  duplicateAgent,
  getAgent,
  listAgents,
} from '../client';
import { error, info, printTable, success } from '../helpers';
import { parseFlags } from '../helpers';
import { showHelp } from './help';

const FLAGS: Record<string, string> = {
  '--name': 'name',
  '--model': 'model',
  '--project': 'project',
  '--prompt': 'prompt',
  '--description': 'description',
  '--projectId': 'projectId',
};

export async function agents(args: string[]): Promise<void> {
  const sub = args[0];
  const { values, positionals } = parseFlags(args.slice(1), FLAGS);

  switch (sub) {
    case undefined:
    case 'list':
      await list();
      break;
    case 'create':
      await create(values);
      break;
    case 'delete': {
      const id = positionals[0] || values.id;
      if (!id) {
        error('Usage: nexus agents delete <agentId>');
        process.exitCode = 1;
        return;
      }
      await remove(id);
      break;
    }
    case 'duplicate': {
      const id = positionals[0] || values.id;
      if (!id) {
        error('Usage: nexus agents duplicate <agentId>');
        process.exitCode = 1;
        return;
      }
      await duplicate(id);
      break;
    }
    case 'show': {
      const id = positionals[0] || values.id;
      if (!id) {
        error('Usage: nexus agents show <agentId>');
        process.exitCode = 1;
        return;
      }
      await show(id);
      break;
    }
    case undefined:
      break;
    default:
      showHelp('agents');
      process.exitCode = 1;
  }
}

async function list(): Promise<void> {
  const res = await listAgents();
  if (res.items.length === 0) {
    info('No agents yet. Create one: nexus agents create --name "My Agent" --model <modelId>');
    return;
  }
  printTable(
    ['ID', 'NAME', 'MODEL', 'PROJECT', 'STATUS'],
    res.items.map((a) => [
      a.id.slice(0, 8),
      a.name,
      a.model?.name ?? '—',
      a.project?.name ?? '—',
      a.isActive ? 'ACTIVE' : 'INACTIVE',
    ])
  );
}

async function create(values: Record<string, string>): Promise<void> {
  if (!values.name || !values.model) {
    error('Usage: nexus agents create --name <name> --model <modelId> [--project <projectId>] [--prompt <systemPrompt>]');
    process.exitCode = 1;
    return;
  }

  const data: Record<string, unknown> = {
    name: values.name,
    modelId: values.model,
    description: values.description,
    systemPrompt: values.prompt,
    permissions: { allowed: [], denied: [] },
    tools: [],
    skills: [],
  };
  if (values.project) data.projectId = values.project;

  const agent = await createAgent(data);
  success(`Agent created: ${agent.name} (${agent.id})`);
}

async function remove(id: string): Promise<void> {
  await deleteAgent(id);
  success(`Agent deleted: ${id}`);
}

async function duplicate(id: string): Promise<void> {
  const agent = await duplicateAgent(id);
  success(`Agent duplicated: ${agent.name} (${agent.id})`);
}

async function show(id: string): Promise<void> {
  const agent = await getAgent(id);
  printTable(['FIELD', 'VALUE'], [
    ['ID', agent.id],
    ['Name', agent.name],
    ['Model', agent.model?.name ?? '—'],
    ['Project', agent.project?.name ?? '—'],
    ['Active', String(agent.isActive)],
    ['Created', agent.createdAt],
  ]);
}