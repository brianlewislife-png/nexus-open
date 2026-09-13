import { buildApp } from './app';
import { config } from '@nexus/config';
import { logger } from './lib/logger';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' });
    logger.info(`NEXUS API running on http://0.0.0.0:${config.PORT}`);
    logger.info(`Swagger docs available at http://0.0.0.0:${config.PORT}/docs`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();
