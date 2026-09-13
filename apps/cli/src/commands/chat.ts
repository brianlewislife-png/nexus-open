import { createSession, sendMessage } from '../client';
import { dim, error, info, parseFlags, success } from '../helpers';

const FLAGS: Record<string, string> = {
  '--session': 'session',
  '--message': 'message',
  '--agent': 'agent',
  '--title': 'title',
};

export async function chat(args: string[]): Promise<void> {
  const { values } = parseFlags(args, FLAGS);

  if (!values.message) {
    error('Usage: nexus chat --session <sessionId> --message "<message>"');
    error('       nexus chat --agent <agentId> --message "<message>" [--title <title>]');
    process.exitCode = 1;
    return;
  }

  try {
    let sessionId = values.session;

    if (!sessionId) {
      if (!values.agent) {
        error('Provide --session or --agent to start a chat.');
        process.exitCode = 1;
        return;
      }
      const session = await createSession({
        title: values.title || 'CLI Session',
        agentId: values.agent,
      });
      sessionId = session.id;
      info(`Session created: ${sessionId}`);
    }

    dim('');
    info(`Sending message to session ${sessionId}...`);
    const result = await sendMessage(sessionId, values.message);
    dim('');

    success('Response:');
    dim('');
    process.stdout.write(result.assistantMessage.content + '\n');
  } catch (err) {
    error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}