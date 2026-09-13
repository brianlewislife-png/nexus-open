import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '@nexus/database';
import { activityService, ApiResponse, PaginatedResponse, NotFoundError } from '@nexus/core';
import type { Skill } from '@nexus/database';

const createSkillSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  instructions: z.string().optional(),
  version: z.string().optional(),
  author: z.string().optional(),
  files: z.any().nullable().optional(),
  metadata: z.any().nullable().optional(),
});

const updateSkillSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  version: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  files: z.any().nullable().optional(),
  metadata: z.any().nullable().optional(),
  isActive: z.boolean().optional(),
});

export default async function skillRoutes(app: FastifyInstance) {
  app.get('/api/skills', async (_request, reply) => {
    const skills = await prisma.skill.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const response: ApiResponse<PaginatedResponse<Skill>> = {
      success: true,
      data: {
        items: skills,
        total: skills.length,
        page: 1,
        pageSize: skills.length,
        totalPages: 1,
      },
    };
    return reply.send(response);
  });

  app.post('/api/skills', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createSkillSchema.parse(request.body);
    const skill = await prisma.skill.create({ data: body });

    await activityService.log({
      action: 'skill.created',
      entityType: 'skill',
      entityId: skill.id,
      details: { name: skill.name },
      level: 'info',
    });

    const response: ApiResponse<Skill> = { success: true, data: skill };
    return reply.status(201).send(response);
  });

  app.get('/api/skills/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) {
      return reply.status(404).send({ success: false, error: `Skill with id "${id}" not found` });
    }

    const response: ApiResponse<Skill> = { success: true, data: skill };
    return reply.send(response);
  });

  app.patch('/api/skills/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = updateSkillSchema.parse(request.body);

    await prisma.skill.findUnique({ where: { id } }).then((found) => {
      if (!found) throw new NotFoundError(`Skill with id "${id}" not found`);
    });

    const skill = await prisma.skill.update({ where: { id }, data: body });

    await activityService.log({
      action: 'skill.updated',
      entityType: 'skill',
      entityId: skill.id,
      details: { changes: Object.keys(body) },
      level: 'info',
    });

    const response: ApiResponse<Skill> = { success: true, data: skill };
    return reply.send(response);
  });

  app.delete('/api/skills/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    await prisma.skill.findUnique({ where: { id } }).then((found) => {
      if (!found) throw new NotFoundError(`Skill with id "${id}" not found`);
    });

    const skill = await prisma.skill.delete({ where: { id } });

    await activityService.log({
      action: 'skill.deleted',
      entityType: 'skill',
      entityId: skill.id,
      details: { name: skill.name },
      level: 'info',
    });

    const response: ApiResponse<Skill> = { success: true, data: skill };
    return reply.send(response);
  });
}
