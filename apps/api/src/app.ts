import Fastify from 'fastify';
import { logger } from './lib/logger';
import errorHandler from './lib/errors';
import corsPlugin from './plugins/cors';
import rateLimitPlugin from './plugins/rateLimit';
import swaggerPlugin from './plugins/swagger';

import healthRoutes from './routes/health';
import projectRoutes from './routes/projects';
import agentRoutes from './routes/agents';
import modelRoutes from './routes/models';
import sessionRoutes from './routes/sessions';
import messageRoutes from './routes/messages';
import activityRoutes from './routes/activity';
import skillRoutes from './routes/skills';
import toolRoutes from './routes/tools';
import mcpRoutes from './routes/mcp';
import settingsRoutes from './routes/settings';
import chatRoutes from './routes/chat';

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
    trustProxy: true,
  });

  await app.register(errorHandler);
  await app.register(corsPlugin);
  await app.register(rateLimitPlugin);
  await app.register(swaggerPlugin);

  await app.register(healthRoutes);
  await app.register(projectRoutes);
  await app.register(agentRoutes);
  await app.register(modelRoutes);
  await app.register(sessionRoutes);
  await app.register(messageRoutes);
  await app.register(activityRoutes);
  await app.register(skillRoutes);
  await app.register(toolRoutes);
  await app.register(mcpRoutes);
  await app.register(settingsRoutes);
  await app.register(chatRoutes);

  return app;
}
