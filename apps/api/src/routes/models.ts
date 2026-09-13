import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@nexus/database';
import { modelService, ApiResponse, PaginatedResponse } from '@nexus/core';
import type { Provider, Model } from '@nexus/database';

export default async function modelRoutes(app: FastifyInstance) {
  app.get('/api/providers', async (_request, reply) => {
    const providers = await modelService.listProviders();
    const providersWithModels = await Promise.all(
      providers.map(async (provider) => {
        const models = await prisma.model.findMany({
          where: { providerId: provider.id, isActive: true },
          orderBy: { name: 'asc' },
        });
        return { ...provider, models };
      })
    );

    const response: ApiResponse<typeof providersWithModels> = {
      success: true,
      data: providersWithModels,
    };
    return reply.send(response);
  });

  app.get('/api/providers/:id/models', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const models = await prisma.model.findMany({
      where: { providerId: id, isActive: true },
      orderBy: { name: 'asc' },
    });

    const response: ApiResponse<Model[]> = { success: true, data: models };
    return reply.send(response);
  });

  app.get('/api/models', async (request: FastifyRequest, reply: FastifyReply) => {
    const { provider } = request.query as { provider?: string };
    const models = await modelService.listModels(provider);

    const response: ApiResponse<PaginatedResponse<Model>> = {
      success: true,
      data: {
        items: models,
        total: models.length,
        page: 1,
        pageSize: models.length,
        totalPages: 1,
      },
    };
    return reply.send(response);
  });

  app.get('/api/models/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const model = await modelService.getModelById(id);
    if (!model) {
      return reply.status(404).send({ success: false, error: `Model with id "${id}" not found` });
    }

    const response: ApiResponse<Model> = { success: true, data: model };
    return reply.send(response);
  });
}
