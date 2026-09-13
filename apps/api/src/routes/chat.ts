import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '@nexus/database';
import {
  messageService,
  sessionService,
  activityService,
  modelService,
  ApiResponse,
  ValidationError,
} from '@nexus/core';
import { createProvider, AIProviderConfig } from '@nexus/ai';
import { config } from '@nexus/config';
import type { Message } from '@nexus/database';

const chatSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1),
});

function getApiKeyForProvider(slug: string): string | undefined {
  switch (slug) {
    case 'openai':
      return config.OPENAI_API_KEY;
    case 'gemini':
      return config.GEMINI_API_KEY;
    case 'mistral':
      return config.MISTRAL_API_KEY;
    case 'ollama':
      return config.OLLAMA_BASE_URL;
    default:
      return undefined;
  }
}

interface ChatResponse {
  userMessage: Message;
  assistantMessage: Message;
}

export default async function chatRoutes(app: FastifyInstance) {
  app.post('/api/chat', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = chatSchema.parse(request.body);

    const session = await sessionService.getById(body.sessionId);
    if (!session) {
      return reply.status(404).send({
        success: false,
        error: `Session with id "${body.sessionId}" not found`,
      });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: session.agentId },
      include: { model: { include: { provider: true } } },
    });

    if (!agent) {
      return reply.status(404).send({
        success: false,
        error: `Agent with id "${session.agentId}" not found`,
      });
    }

    if (!agent.modelId || !agent.model) {
      return reply.status(400).send({
        success: false,
        error: 'Agent is not configured with a model. Please assign a model to this agent.',
      });
    }

    const modelConfig = await modelService.getModelConfig(agent.modelId);
    const providerSlug = modelConfig.provider.slug;
    const apiKey = getApiKeyForProvider(providerSlug);

    if (!apiKey) {
      return reply.status(400).send({
        success: false,
        error: `Missing API key for provider "${providerSlug}". Set the appropriate environment variable.`,
      });
    }

    await activityService.log({
      action: 'chat.session_started',
      entityType: 'session',
      entityId: session.id,
      details: { agentId: agent.id, modelSlug: modelConfig.model.slug },
      level: 'info',
    });

    await activityService.log({
      action: 'chat.model_used',
      entityType: 'model',
      entityId: modelConfig.model.id,
      details: {
        provider: providerSlug,
        model: modelConfig.model.slug,
        agentId: agent.id,
      },
      level: 'info',
    });

    const userMessage = await messageService.create({
      sessionId: body.sessionId,
      content: body.message,
      role: 'user',
    });

    await activityService.log({
      action: 'chat.message_created',
      entityType: 'message',
      entityId: userMessage.id,
      details: { role: 'user', sessionId: body.sessionId },
      level: 'info',
    });

    const history = await messageService.list(body.sessionId, { order: 'asc', limit: 100 });

    const aiMessages = history.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    if (agent.systemPrompt) {
      aiMessages.unshift({ role: 'system', content: agent.systemPrompt });
    }

    const providerConfig: AIProviderConfig = {
      apiKey,
      model: modelConfig.model.slug,
      ...(providerSlug === 'ollama' ? { baseUrl: config.OLLAMA_BASE_URL } : {}),
    };

    let provider;
    try {
      provider = await createProvider(providerSlug, providerConfig);
    } catch (err: any) {
      return reply.status(502).send({
        success: false,
        error: `Failed to initialize provider "${providerSlug}": ${err.message}`,
      });
    }

    let aiResponse;
    try {
      aiResponse = await provider.complete({
        messages: aiMessages,
      });
    } catch (err: any) {
      return reply.status(502).send({
        success: false,
        error: `Provider call failed: ${err.message}`,
      });
    }

    await activityService.log({
      action: 'chat.tool_executed',
      entityType: 'session',
      entityId: session.id,
      details: { placeholder: true, provider: providerSlug },
      level: 'debug',
    });

    const assistantMessage = await messageService.create({
      sessionId: body.sessionId,
      content: aiResponse.content,
      role: 'assistant',
      metadata: {
        model: aiResponse.model,
        provider: aiResponse.provider,
        usage: aiResponse.usage,
      },
    });

    await activityService.log({
      action: 'chat.message_created',
      entityType: 'message',
      entityId: assistantMessage.id,
      details: { role: 'assistant', sessionId: body.sessionId },
      level: 'info',
    });

    const response: ApiResponse<ChatResponse> = {
      success: true,
      data: {
        userMessage,
        assistantMessage,
      },
    };
    return reply.send(response);
  });
}
