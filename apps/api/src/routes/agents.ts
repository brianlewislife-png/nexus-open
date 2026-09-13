import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '@nexus/database';
import {
  agentService,
  activityService,
  ApiResponse,
  PaginatedResponse,
} from '@nexus/core';
import type { Agent } from '@nexus/database';

const createAgentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  modelId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  permissions: z
    .object({
      allowed: z.array(z.string()),
      denied: z.array(z.string()),
    })
    .nullable()
    .optional(),
  tools: z.any().nullable().optional(),
  skills: z.any().nullable().optional(),
  settings: z.any().nullable().optional(),
});

const updateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  systemPrompt: z.string().nullable().optional(),
  modelId: z.string().nullable().optional(),
  permissions: z
    .object({
      allowed: z.array(z.string()),
      denied: z.array(z.string()),
    })
    .nullable()
    .optional(),
  tools: z.any().nullable().optional(),
  skills: z.any().nullable().optional(),
  isActive: z.boolean().optional(),
});

export default async function agentRoutes(app: FastifyInstance) {
  app.get('/api/agents', async (request: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = request.query as { projectId?: string };
    let agents: Agent[];
    if (projectId) {
      agents = await agentService.list(projectId);
    } else {
      const projects = await prisma.project.findMany({ select: { id: true } });
      const allAgents = await Promise.all(
        projects.map((p) => agentService.list(p.id))
      );
      agents = allAgents.flat();
    }

    const response: ApiResponse<PaginatedResponse<Agent>> = {
      success: true,
      data: {
        items: agents,
        total: agents.length,
        page: 1,
        pageSize: agents.length,
        totalPages: 1,
      },
    };
    return reply.send(response);
  });

  app.post('/api/agents', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createAgentSchema.parse(request.body);
    const agent = await agentService.create({
      name: body.name,
      projectId: body.projectId,
      description: body.description,
      systemPrompt: body.systemPrompt,
      modelId: body.modelId,
      permissions: body.permissions as any,
      tools: body.tools,
      skills: body.skills,
    });

    await activityService.log({
      action: 'agent.created',
      entityType: 'agent',
      entityId: agent.id,
      details: { name: agent.name, projectId: agent.projectId },
      level: 'info',
    });

    const response: ApiResponse<Agent> = { success: true, data: agent };
    return reply.status(201).send(response);
  });

  app.get('/api/agents/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const agent = await agentService.getById(id);
    if (!agent) {
      return reply.status(404).send({ success: false, error: `Agent with id "${id}" not found` });
    }

    const response: ApiResponse<typeof agent> = { success: true, data: agent };
    return reply.send(response);
  });

  app.patch('/api/agents/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = updateAgentSchema.parse(request.body);
    const agent = await agentService.update(id, body as any);

    await activityService.log({
      action: 'agent.updated',
      entityType: 'agent',
      entityId: agent.id,
      details: { changes: Object.keys(body) },
      level: 'info',
    });

    const response: ApiResponse<Agent> = { success: true, data: agent };
    return reply.send(response);
  });

  app.delete('/api/agents/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const agent = await agentService.remove(id);

    await activityService.log({
      action: 'agent.deleted',
      entityType: 'agent',
      entityId: agent.id,
      details: { name: agent.name },
      level: 'info',
    });

    const response: ApiResponse<Agent> = { success: true, data: agent };
    return reply.send(response);
  });

  app.post('/api/agents/:id/duplicate', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const duplicated = await agentService.duplicate(id);

    await activityService.log({
      action: 'agent.duplicated',
      entityType: 'agent',
      entityId: duplicated.id,
      details: { sourceId: id, name: duplicated.name },
      level: 'info',
    });

    const response: ApiResponse<Agent> = { success: true, data: duplicated };
    return reply.status(201).send(response);
  });
}
