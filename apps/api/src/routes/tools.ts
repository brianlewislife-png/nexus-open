import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '@nexus/database';
import { activityService, ApiResponse, PaginatedResponse, NotFoundError } from '@nexus/core';
import type { Tool } from '@nexus/database';

const createToolSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['builtin', 'custom', 'mcp']).default('builtin'),
  config: z.any().nullable().optional(),
  permissions: z.any().nullable().optional(),
});

const updateToolSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  type: z.enum(['builtin', 'custom', 'mcp']).optional(),
  config: z.any().nullable().optional(),
  permissions: z.any().nullable().optional(),
  isActive: z.boolean().optional(),
});

export default async function toolRoutes(app: FastifyInstance) {
  app.get('/api/tools', async (_request, reply) => {
    const tools = await prisma.tool.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const response: ApiResponse<PaginatedResponse<Tool>> = {
      success: true,
      data: {
        items: tools,
        total: tools.length,
        page: 1,
        pageSize: tools.length,
        totalPages: 1,
      },
    };
    return reply.send(response);
  });

  app.post('/api/tools', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createToolSchema.parse(request.body);
    const tool = await prisma.tool.create({ data: body });

    await activityService.log({
      action: 'tool.created',
      entityType: 'tool',
      entityId: tool.id,
      details: { name: tool.name, type: tool.type },
      level: 'info',
    });

    const response: ApiResponse<Tool> = { success: true, data: tool };
    return reply.status(201).send(response);
  });

  app.get('/api/tools/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const tool = await prisma.tool.findUnique({ where: { id } });
    if (!tool) {
      return reply.status(404).send({ success: false, error: `Tool with id "${id}" not found` });
    }

    const response: ApiResponse<Tool> = { success: true, data: tool };
    return reply.send(response);
  });

  app.patch('/api/tools/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = updateToolSchema.parse(request.body);

    await prisma.tool.findUnique({ where: { id } }).then((found) => {
      if (!found) throw new NotFoundError(`Tool with id "${id}" not found`);
    });

    const tool = await prisma.tool.update({ where: { id }, data: body });

    await activityService.log({
      action: 'tool.updated',
      entityType: 'tool',
      entityId: tool.id,
      details: { changes: Object.keys(body) },
      level: 'info',
    });

    const response: ApiResponse<Tool> = { success: true, data: tool };
    return reply.send(response);
  });

  app.delete('/api/tools/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    await prisma.tool.findUnique({ where: { id } }).then((found) => {
      if (!found) throw new NotFoundError(`Tool with id "${id}" not found`);
    });

    const tool = await prisma.tool.delete({ where: { id } });

    await activityService.log({
      action: 'tool.deleted',
      entityType: 'tool',
      entityId: tool.id,
      details: { name: tool.name },
      level: 'info',
    });

    const response: ApiResponse<Tool> = { success: true, data: tool };
    return reply.send(response);
  });
}
