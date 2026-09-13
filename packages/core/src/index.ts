import { Prisma, prisma } from '@nexus/database';
import type {
  ActivityLog,
  ActivityLevel,
  Agent,
  Message,
  Model,
  Project,
  Provider,
  Session,
} from '@nexus/database';
import type { AgentPermissions, PaginatedResponse } from '@nexus/shared';
import { config } from '@nexus/config';

export * from '@nexus/shared';
export * from '@nexus/config';

// ─── Errors ──────────────────────────────────────────────────────────────────

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ─── Shared aliases ──────────────────────────────────────────────────────────

export type SessionStatusValue = 'active' | 'paused' | 'completed' | 'failed';
export type MessageRoleValue = 'user' | 'assistant' | 'system';
export type ActivityLevelValue = 'info' | 'warning' | 'error' | 'debug';

function requireNotFound<T>(value: T | null, resource: string, id: string): T {
  if (value === null || value === undefined) {
    throw new NotFoundError(`${resource} with id "${id}" not found`);
  }
  return value;
}

function jsonNullable(
  value: unknown
): Prisma.InputJsonValue | typeof Prisma.DbNull | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return Prisma.DbNull;
  }
  return value as Prisma.InputJsonValue;
}

// ─── Project service ─────────────────────────────────────────────────────────

export interface CreateProjectInput {
  name: string;
  userId: string;
  description?: string | null;
  directory?: string | null;
  context?: Prisma.InputJsonValue | null;
  settings?: Prisma.InputJsonValue | null;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  directory?: string | null;
  context?: Prisma.InputJsonValue | null;
  settings?: Prisma.InputJsonValue | null;
}

export const projectService = {
  async create(input: CreateProjectInput): Promise<Project> {
    if (!input.name?.trim()) {
      throw new ValidationError('Project name is required');
    }
    return prisma.project.create({
      data: {
        name: input.name.trim(),
        userId: input.userId,
        description: input.description,
        directory: input.directory,
        context: jsonNullable(input.context),
        settings: jsonNullable(input.settings),
      },
    });
  },

  async getById(id: string, userId?: string): Promise<Project | null> {
    return prisma.project.findFirst({
      where: { id, ...(userId ? { userId } : {}) },
    });
  },

  async list(
    userId?: string,
    options: { take?: number; skip?: number } = {}
  ): Promise<Project[]> {
    return prisma.project.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
      ...(options.take !== undefined ? { take: options.take } : {}),
      ...(options.skip !== undefined ? { skip: options.skip } : {}),
    });
  },

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    await prisma.project.findUnique({ where: { id } }).then((found) => {
      requireNotFound(found, 'Project', id);
    });
    return prisma.project.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.directory !== undefined ? { directory: input.directory } : {}),
        ...(input.context !== undefined
          ? { context: jsonNullable(input.context) }
          : {}),
        ...(input.settings !== undefined
          ? { settings: jsonNullable(input.settings) }
          : {}),
      },
    });
  },

  async remove(id: string): Promise<Project> {
    await prisma.project.findUnique({ where: { id } }).then((found) => {
      requireNotFound(found, 'Project', id);
    });
    return prisma.project.delete({ where: { id } });
  },
};

// ─── Agent service ───────────────────────────────────────────────────────────

export interface CreateAgentInput {
  name: string;
  projectId?: string | null;
  description?: string | null;
  systemPrompt?: string | null;
  permissions?: AgentPermissions | null;
  tools?: Prisma.InputJsonValue | null;
  skills?: Prisma.InputJsonValue | null;
  modelId?: string | null;
  isActive?: boolean;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string | null;
  systemPrompt?: string | null;
  permissions?: AgentPermissions | null;
  tools?: Prisma.InputJsonValue | null;
  skills?: Prisma.InputJsonValue | null;
  modelId?: string | null;
  isActive?: boolean;
}

export type AgentWithModel = Agent & { model: Model | null; project: Project | null };

export const agentService = {
  async create(input: CreateAgentInput): Promise<Agent> {
    if (!input.name?.trim()) {
      throw new ValidationError('Agent name is required');
    }
    if (input.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
      });
      requireNotFound(project, 'Project', input.projectId);
    }

    return prisma.agent.create({
      data: {
        name: input.name.trim(),
        projectId: input.projectId,
        description: input.description,
        systemPrompt: input.systemPrompt,
        permissions: jsonNullable(input.permissions),
        tools: jsonNullable(input.tools),
        skills: jsonNullable(input.skills),
        modelId: input.modelId,
        isActive: input.isActive ?? true,
      },
    });
  },

  async getById(id: string): Promise<AgentWithModel | null> {
    return prisma.agent.findUnique({
      where: { id },
      include: { model: true, project: true },
    });
  },

  async list(projectId: string): Promise<Agent[]> {
    return prisma.agent.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  },

  async update(id: string, input: UpdateAgentInput): Promise<Agent> {
    await prisma.agent.findUnique({ where: { id } }).then((found) => {
      requireNotFound(found, 'Agent', id);
    });

    return prisma.agent.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.systemPrompt !== undefined
          ? { systemPrompt: input.systemPrompt }
          : {}),
        ...(input.permissions !== undefined
          ? { permissions: jsonNullable(input.permissions) }
          : {}),
        ...(input.tools !== undefined
          ? { tools: jsonNullable(input.tools) }
          : {}),
        ...(input.skills !== undefined
          ? { skills: jsonNullable(input.skills) }
          : {}),
        ...(input.modelId !== undefined ? { modelId: input.modelId } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
  },

  async remove(id: string): Promise<Agent> {
    await prisma.agent.findUnique({ where: { id } }).then((found) => {
      requireNotFound(found, 'Agent', id);
    });
    return prisma.agent.delete({ where: { id } });
  },

  async duplicate(
    id: string,
    options: { name?: string } = {}
  ): Promise<Agent> {
    const source = requireNotFound(
      await prisma.agent.findUnique({ where: { id } }),
      'Agent',
      id
    );

    return prisma.agent.create({
      data: {
        name: options.name?.trim() || `${source.name} (copy)`,
        description: source.description,
        systemPrompt: source.systemPrompt,
        permissions: jsonNullable(source.permissions),
        tools: jsonNullable(source.tools),
        skills: jsonNullable(source.skills),
        isActive: true,
        projectId: source.projectId,
        modelId: source.modelId,
      },
    });
  },
};

// ─── Session service ─────────────────────────────────────────────────────────

export interface CreateSessionInput {
  agentId: string;
  projectId?: string | null;
  title?: string | null;
}

export interface UpdateSessionInput {
  title?: string | null;
  status?: SessionStatusValue;
}

export interface ListSessionOptions {
  agentId?: string;
  projectId?: string;
  status?: SessionStatusValue;
  limit?: number;
}

export type SessionWithCount = Session & { _count: { messages: number } };

export const sessionService = {
  async create(input: CreateSessionInput): Promise<Session> {
    let agent: Agent | null;
    if (input.projectId) {
      agent = await prisma.agent.findFirst({
        where: { id: input.agentId, projectId: input.projectId },
      });
    } else {
      agent = await prisma.agent.findUnique({ where: { id: input.agentId } });
    }
    agent = requireNotFound(agent, 'Agent', input.agentId);

    const projectId = input.projectId ?? agent.projectId;
    const related = projectId
      ? await prisma.project.findUnique({ where: { id: projectId } })
      : null;
    requireNotFound(related, 'Project', projectId ?? input.agentId);

    return prisma.session.create({
      data: {
        agentId: input.agentId,
        projectId,
        title: input.title,
      },
    });
  },

  async getById(id: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { id } });
  },

  async list(options: ListSessionOptions = {}): Promise<SessionWithCount[]> {
    const { agentId, projectId, status, limit = 50 } = options;
    return prisma.session.findMany({
      where: {
        ...(agentId ? { agentId } : {}),
        ...(projectId ? { projectId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: { _count: { select: { messages: true } } },
    });
  },

  async update(id: string, input: UpdateSessionInput): Promise<Session> {
    await prisma.session.findUnique({ where: { id } }).then((found) => {
      requireNotFound(found, 'Session', id);
    });
    return prisma.session.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
  },
};

// ─── Message service ─────────────────────────────────────────────────────────

export interface CreateMessageInput {
  sessionId: string;
  content: string;
  role: MessageRoleValue;
  metadata?: Prisma.InputJsonValue | null;
}

export interface ListMessageOptions {
  limit?: number;
  cursor?: string;
  order?: 'asc' | 'desc';
}

export const messageService = {
  async create(input: CreateMessageInput): Promise<Message> {
    if (!input.content?.trim()) {
      throw new ValidationError('Message content is required');
    }
    const session = await prisma.session.findUnique({
      where: { id: input.sessionId },
    });
    requireNotFound(session, 'Session', input.sessionId);

    return prisma.message.create({
      data: {
        sessionId: input.sessionId,
        content: input.content,
        role: input.role,
        metadata: jsonNullable(input.metadata),
      },
    });
  },

  async getById(id: string): Promise<Message | null> {
    return prisma.message.findUnique({ where: { id } });
  },

  async list(
    sessionId: string,
    options: ListMessageOptions = {}
  ): Promise<Message[]> {
    const { limit = 50, cursor, order = 'asc' } = options;
    return prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: order },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  },
};

// ─── Activity service ────────────────────────────────────────────────────────

export type ActivityLevelInput = 'info' | 'warning' | 'error' | 'debug' | 'success';

const ACTIVITY_LEVEL_MAP: Record<ActivityLevelInput, ActivityLevel> = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  debug: 'debug',
  success: 'info',
};

export interface CreateActivityInput {
  action: string;
  entityType: string;
  entityId: string;
  details?: Prisma.InputJsonValue | null;
  level?: ActivityLevelInput;
}

export interface ListActivityOptions {
  entityType?: string;
  entityId?: string;
  level?: ActivityLevelValue;
  page?: number;
  pageSize?: number;
}

export const activityService = {
  async log(input: CreateActivityInput): Promise<ActivityLog> {
    if (!input.action?.trim() || !input.entityType?.trim() || !input.entityId?.trim()) {
      throw new ValidationError('action, entityType and entityId are required');
    }
    return prisma.activityLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        details: jsonNullable(input.details),
        level: ACTIVITY_LEVEL_MAP[input.level ?? 'info'],
      },
    });
  },

  async getRecent(limit = 50): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.max(1, Math.min(limit, 500)),
    });
  },

  async listByEntity(
    entityType: string,
    entityId: string,
    limit = 50
  ): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: Math.max(1, Math.min(limit, 500)),
    });
  },

  async list(
    options: ListActivityOptions = {}
  ): Promise<PaginatedResponse<ActivityLog>> {
    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.max(1, Math.min(options.pageSize ?? 20, 100));

    const where = {
      ...(options.entityType ? { entityType: options.entityType } : {}),
      ...(options.entityId ? { entityId: options.entityId } : {}),
      ...(options.level ? { level: options.level } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },
};

// ─── Model service ───────────────────────────────────────────────────────────

function envProviderConfig(providerSlug: string): Record<string, unknown> {
  switch (providerSlug) {
    case 'openai':
      return config.OPENAI_API_KEY ? { apiKey: config.OPENAI_API_KEY } : {};
    case 'gemini':
      return config.GEMINI_API_KEY ? { apiKey: config.GEMINI_API_KEY } : {};
    case 'mistral':
      return config.MISTRAL_API_KEY ? { apiKey: config.MISTRAL_API_KEY } : {};
    case 'ollama':
      return { baseUrl: config.OLLAMA_BASE_URL };
    default:
      return {};
  }
}

export interface ModelConfig {
  model: Model;
  provider: Provider;
  config: Record<string, unknown>;
}

export const modelService = {
  async listProviders(): Promise<Provider[]> {
    return prisma.provider.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  },

  async getProviderBySlug(slug: string): Promise<Provider | null> {
    return prisma.provider.findUnique({ where: { slug } });
  },

  async listModels(providerSlug?: string): Promise<Model[]> {
    return prisma.model.findMany({
      where: {
        isActive: true,
        ...(providerSlug ? { provider: { slug: providerSlug } } : {}),
      },
      orderBy: { name: 'asc' },
    });
  },

  async getModelById(id: string): Promise<Model | null> {
    return prisma.model.findUnique({ where: { id } });
  },

  async getModelBySlug(
    providerSlug: string,
    slug: string
  ): Promise<Model | null> {
    return prisma.model.findFirst({
      where: { slug, provider: { slug: providerSlug } },
    });
  },

  async getModelConfig(id: string): Promise<ModelConfig> {
    const model = requireNotFound(
      await prisma.model.findUnique({
        where: { id },
        include: { provider: true },
      }),
      'Model',
      id
    );

    const dbConfig =
      (model.provider.config as Record<string, unknown> | null) ?? {};
    const parameters =
      (model.parameters as Record<string, unknown> | null) ?? {};

    return {
      model,
      provider: model.provider,
      config: {
        ...dbConfig,
        ...parameters,
        ...envProviderConfig(model.provider.slug),
      },
    };
  },
};

// ─── Services registry ───────────────────────────────────────────────────────

export const services = {
  projects: projectService,
  agents: agentService,
  sessions: sessionService,
  messages: messageService,
  activity: activityService,
  models: modelService,
};