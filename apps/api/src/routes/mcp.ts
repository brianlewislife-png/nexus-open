import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '@nexus/database';
import { activityService, ApiResponse, PaginatedResponse, NotFoundError } from '@nexus/core';
import type { MCPServer } from '@nexus/database';

const createMCPServerSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  config: z.any().nullable().optional(),
  permissions: z.any().nullable().optional(),
});

const updateMCPServerSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  config: z.any().nullable().optional(),
  permissions: z.any().nullable().optional(),
  status: z.enum(['connected', 'disconnected', 'error']).optional(),
});

export default async function mcpRoutes(app: FastifyInstance) {
  app.get('/api/mcp', async (_request, reply) => {
    const servers = await prisma.mCPServer.findMany({
      orderBy: { name: 'asc' },
    });

    const response: ApiResponse<PaginatedResponse<MCPServer>> = {
      success: true,
      data: {
        items: servers,
        total: servers.length,
        page: 1,
        pageSize: servers.length,
        totalPages: 1,
      },
    };
    return reply.send(response);
  });

  app.post('/api/mcp', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createMCPServerSchema.parse(request.body);
    const server = await prisma.mCPServer.create({ data: body });

    await activityService.log({
      action: 'mcp_server.created',
      entityType: 'mcp_server',
      entityId: server.id,
      details: { name: server.name, url: server.url },
      level: 'info',
    });

    const response: ApiResponse<MCPServer> = { success: true, data: server };
    return reply.status(201).send(response);
  });

  app.get('/api/mcp/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const server = await prisma.mCPServer.findUnique({ where: { id } });
    if (!server) {
      return reply.status(404).send({
        success: false,
        error: `MCP server with id "${id}" not found`,
      });
    }

    const response: ApiResponse<MCPServer> = { success: true, data: server };
    return reply.send(response);
  });

  app.patch('/api/mcp/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = updateMCPServerSchema.parse(request.body);

    await prisma.mCPServer.findUnique({ where: { id } }).then((found) => {
      if (!found) throw new NotFoundError(`MCP server with id "${id}" not found`);
    });

    const server = await prisma.mCPServer.update({ where: { id }, data: body });

    await activityService.log({
      action: 'mcp_server.updated',
      entityType: 'mcp_server',
      entityId: server.id,
      details: { changes: Object.keys(body) },
      level: 'info',
    });

    const response: ApiResponse<MCPServer> = { success: true, data: server };
    return reply.send(response);
  });

  app.delete('/api/mcp/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    await prisma.mCPServer.findUnique({ where: { id } }).then((found) => {
      if (!found) throw new NotFoundError(`MCP server with id "${id}" not found`);
    });

    const server = await prisma.mCPServer.delete({ where: { id } });

    await activityService.log({
      action: 'mcp_server.deleted',
      entityType: 'mcp_server',
      entityId: server.id,
      details: { name: server.name },
      level: 'info',
    });

    const response: ApiResponse<MCPServer> = { success: true, data: server };
    return reply.send(response);
  });
}
