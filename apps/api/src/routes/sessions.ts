import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '@nexus/database';
import { sessionService, activityService, ApiResponse, PaginatedResponse } from '@nexus/core';
import type { Session } from '@nexus/database';
import type { SessionWithCount } from '@nexus/core';

const createSessionSchema = z.object({
  title: z.string().optional(),
  agentId: z.string().min(1),
  projectId: z.string().nullable().optional(),
});

export default async function sessionRoutes(app: FastifyInstance) {
  app.get('/api/sessions', async (request: FastifyRequest, reply: FastifyReply) => {
    const { agentId, projectId, status } = request.query as {
      agentId?: string;
      projectId?: string;
      status?: string;
    };

    const sessions = await sessionService.list({
      agentId,
      projectId,
      status: status as any,
    });

    const response: ApiResponse<PaginatedResponse<SessionWithCount>> = {
      success: true,
      data: {
        items: sessions,
        total: sessions.length,
        page: 1,
        pageSize: sessions.length,
        totalPages: 1,
      },
    };
    return reply.send(response);
  });

  app.post('/api/sessions', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createSessionSchema.parse(request.body);
    const session = await sessionService.create(body);

    await activityService.log({
      action: 'session.created',
      entityType: 'session',
      entityId: session.id,
      details: { agentId: session.agentId, projectId: session.projectId },
      level: 'info',
    });

    const response: ApiResponse<Session> = { success: true, data: session };
    return reply.status(201).send(response);
  });

  app.get('/api/sessions/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const session = await sessionService.getById(id);
    if (!session) {
      return reply.status(404).send({ success: false, error: `Session with id "${id}" not found` });
    }

    const sessionWithMessages = await prisma.session.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    const response: ApiResponse<typeof sessionWithMessages> = {
      success: true,
      data: sessionWithMessages,
    };
    return reply.send(response);
  });
}
