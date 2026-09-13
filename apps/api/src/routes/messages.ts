import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { messageService, activityService, ApiResponse, PaginatedResponse } from '@nexus/core';
import type { Message } from '@nexus/database';

const createMessageSchema = z.object({
  content: z.string().min(1),
});

export default async function messageRoutes(app: FastifyInstance) {
  app.get('/api/sessions/:id/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const messages = await messageService.list(id);

    const response: ApiResponse<PaginatedResponse<Message>> = {
      success: true,
      data: {
        items: messages,
        total: messages.length,
        page: 1,
        pageSize: messages.length,
        totalPages: 1,
      },
    };
    return reply.send(response);
  });

  app.post('/api/sessions/:id/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = createMessageSchema.parse(request.body);

    const message = await messageService.create({
      sessionId: id,
      content: body.content,
      role: 'user',
    });

    await activityService.log({
      action: 'message.created',
      entityType: 'message',
      entityId: message.id,
      details: { sessionId: id, role: 'user' },
      level: 'info',
    });

    const response: ApiResponse<Message> = { success: true, data: message };
    return reply.status(201).send(response);
  });
}
