import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { activityService, ApiResponse, PaginatedResponse } from '@nexus/core';
import type { ActivityLog } from '@nexus/database';

export default async function activityRoutes(app: FastifyInstance) {
  app.get('/api/activity', async (request: FastifyRequest, reply: FastifyReply) => {
    const { level, entityType, page, pageSize } = request.query as {
      level?: string;
      entityType?: string;
      page?: string;
      pageSize?: string;
    };

    const result = await activityService.list({
      level: level as any,
      entityType,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });

    const response: ApiResponse<PaginatedResponse<ActivityLog>> = {
      success: true,
      data: result,
    };
    return reply.send(response);
  });
}
