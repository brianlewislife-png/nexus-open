import { FastifyInstance } from 'fastify';
import { prisma } from '@nexus/database';
import { ApiResponse } from '@nexus/shared';

interface HealthData {
  status: string;
  version: string;
  uptime: number;
  timestamp: string;
  database: 'connected' | 'disconnected';
}

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/api/health', async (_request, reply) => {
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    const response: ApiResponse<HealthData> = {
      success: true,
      data: {
        status: 'ok',
        version: '0.1.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbStatus,
      },
    };

    return reply.send(response);
  });
}
