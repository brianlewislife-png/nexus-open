import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { config } from '@nexus/config';

export default async function corsPlugin(app: FastifyInstance) {
  await app.register(cors, {
    origin: config.NEXUS_WEB_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}
