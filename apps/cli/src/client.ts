const BASE_URL = process.env.NEXUS_BASE_URL || 'http://localhost:3001';

interface ApiError extends Error {
  status?: number;
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  baseUrlOverride?: string
): Promise<T> {
  const base = baseUrlOverride || BASE_URL;
  const url = `${base}/api${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch {
    const err = new Error(
      `Cannot reach the NEXUS API at ${base}. Is the server running? Try: docker compose up -d`
    ) as ApiError;
    err.status = 0;
    throw err;
  }

  const body = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: T;
    error?: string;
    message?: string;
  };

  if (!response.ok || body.success === false) {
    const err = new Error(
      body.error || body.message || `Request failed with status ${response.status}`
    ) as ApiError;
    err.status = response.status;
    throw err;
  }

  return (body.data ?? body) as T;
}

export function getHealth() {
  return apiFetch<HealthResponse>('/health', {}, process.env.NEXUS_BASE_URL);
}

export function listAgents(projectId?: string) {
  const q = projectId ? `?projectId=${projectId}` : '';
  return apiFetch<Paginated<Agent>>(`/agents${q}`);
}

export function getAgent(id: string) {
  return apiFetch<Agent>(`/agents/${id}`);
}

export function createAgent(data: Record<string, unknown>) {
  return apiFetch<Agent>('/agents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function duplicateAgent(id: string) {
  return apiFetch<Agent>(`/agents/${id}/duplicate`, {
    method: 'POST',
  });
}

export function deleteAgent(id: string) {
  return apiFetch<{ id: string }>(`/agents/${id}`, {
    method: 'DELETE',
  });
}

export function listProjects(search?: string) {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiFetch<Paginated<Project>>(`/projects${q}`);
}

export function listModels(provider?: string) {
  const q = provider ? `?provider=${provider}` : '';
  return apiFetch<Paginated<Model>>(`/models${q}`);
}

export function listProviders() {
  return apiFetch<Paginated<Provider>>('/providers');
}

export function listActivity(level?: string, limit = 20) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (level) params.set('level', level);
  return apiFetch<Paginated<ActivityLog>>(`/activity?${params.toString()}`);
}

export function listSessions(agentId?: string, projectId?: string) {
  const params = new URLSearchParams();
  if (agentId) params.set('agentId', agentId);
  if (projectId) params.set('projectId', projectId);
  const qs = params.toString();
  return apiFetch<Paginated<Session>>(`/sessions${qs ? `?${qs}` : ''}`);
}

export function getSession(id: string) {
  return apiFetch<Session>(`/sessions/${id}`);
}

export function createSession(data: { title?: string; agentId: string; projectId?: string }) {
  return apiFetch<Session>('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function sendMessage(sessionId: string, message: string) {
  return apiFetch<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ sessionId, message }),
  });
}

export interface HealthResponse {
  status: string;
  version: string;
  uptime: number;
  timestamp: string;
  database: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  modelId?: string;
  projectId?: string;
  permissions: unknown;
  tools: unknown;
  skills: unknown;
  isActive: boolean;
  createdAt: string;
  model?: Model | null;
  project?: Project | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  directory?: string;
  createdAt: string;
  _count?: { agents: number; sessions: number };
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  baseUrl?: string;
  isActive: boolean;
  models?: Model[];
}

export interface Model {
  id: string;
  name: string;
  slug: string;
  providerId: string;
  parameters?: Record<string, unknown>;
  isActive: boolean;
  provider?: Provider;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  level: 'info' | 'warning' | 'error' | 'success';
  createdAt: string;
}

export interface Session {
  id: string;
  title?: string;
  agentId: string;
  projectId?: string;
  status: string;
  createdAt: string;
  agent?: Agent;
  project?: Project;
}

export interface ChatResponse {
  userMessage: { id: string; content: string };
  assistantMessage: { id: string; content: string };
  session: Session;
}