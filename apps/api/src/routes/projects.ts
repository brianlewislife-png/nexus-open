import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '@nexus/database';
import { projectService, activityService, ApiResponse, PaginatedResponse } from '@nexus/core';
import type { Project } from '@nexus/database';

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  directory: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  directory: z.string().nullable().optional(),
  context: z.any().nullable().optional(),
  settings: z.any().nullable().optional(),
});

async function getDefaultUserId(): Promise<string> {
  const user = await prisma.user.findFirst();
  if (user) return user.id;
  const created = await prisma.user.create({
    data: { email: 'admin@nexus.local', name: 'Admin' },
  });
  return created.id;
}

export default async function projectRoutes(app: FastifyInstance) {
  app.get('/api/projects', async (request: FastifyRequest, reply: FastifyReply) => {
    const { search } = request.query as { search?: string };
    const userId = await getDefaultUserId();
    let projects = await projectService.list(userId);

    if (search) {
      const q = search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    const response: ApiResponse<PaginatedResponse<Project>> = {
      success: true,
      data: {
        items: projects,
        total: projects.length,
        page: 1,
        pageSize: projects.length,
        totalPages: 1,
      },
    };
    return reply.send(response);
  });

  app.post('/api/projects', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createProjectSchema.parse(request.body);
    const userId = await getDefaultUserId();
    const project = await projectService.create({ ...body, userId });

    await activityService.log({
      action: 'project.created',
      entityType: 'project',
      entityId: project.id,
      details: { name: project.name },
      level: 'info',
    });

    const response: ApiResponse<Project> = { success: true, data: project };
    return reply.status(201).send(response);
  });

  app.get('/api/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const project = await projectService.getById(id);
    if (!project) {
      return reply.status(404).send({ success: false, error: `Project with id "${id}" not found` });
    }

    const projectWithRelations = await prisma.project.findUnique({
      where: { id },
      include: { agents: true, sessions: true },
    });

    const response: ApiResponse<typeof projectWithRelations> = {
      success: true,
      data: projectWithRelations,
    };
    return reply.send(response);
  });

  app.patch('/api/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = updateProjectSchema.parse(request.body);
    const project = await projectService.update(id, body);

    await activityService.log({
      action: 'project.updated',
      entityType: 'project',
      entityId: project.id,
      details: { changes: Object.keys(body) },
      level: 'info',
    });

    const response: ApiResponse<Project> = { success: true, data: project };
    return reply.send(response);
  });

  app.delete('/api/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const project = await projectService.remove(id);

    await activityService.log({
      action: 'project.deleted',
      entityType: 'project',
      entityId: project.id,
      details: { name: project.name },
      level: 'info',
    });

    const response: ApiResponse<Project> = { success: true, data: project };
    return reply.send(response);
  });
}
