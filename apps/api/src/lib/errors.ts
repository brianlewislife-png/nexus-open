import { FastifyInstance, FastifyError } from 'fastify';
import { NotFoundError, ValidationError } from '@nexus/core';

export default async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({
        success: false,
        error: error.message,
      });
    }

    if (error instanceof ValidationError) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }

    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
    });
  });
}
