import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '@nexus/database';
import { ApiResponse } from '@nexus/core';
import type { Setting } from '@nexus/database';

const setSettingSchema = z.object({
  value: z.any(),
});

export default async function settingsRoutes(app: FastifyInstance) {
  app.get('/api/settings', async (_request, reply) => {
    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });

    const response: ApiResponse<Setting[]> = { success: true, data: settings };
    return reply.send(response);
  });

  app.get('/api/settings/:key', async (request: FastifyRequest, reply: FastifyReply) => {
    const { key } = request.params as { key: string };
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) {
      return reply.status(404).send({
        success: false,
        error: `Setting with key "${key}" not found`,
      });
    }

    const response: ApiResponse<Setting> = { success: true, data: setting };
    return reply.send(response);
  });

  app.put('/api/settings/:key', async (request: FastifyRequest, reply: FastifyReply) => {
    const { key } = request.params as { key: string };
    const body = setSettingSchema.parse(request.body);

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: body.value },
      create: { key, value: body.value },
    });

    const response: ApiResponse<Setting> = { success: true, data: setting };
    return reply.send(response);
  });
}
