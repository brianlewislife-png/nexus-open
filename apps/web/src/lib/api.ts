const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const url = `${BASE_URL}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (e) {
    throw new ApiError(
      0,
      e instanceof Error
        ? `Could not reach the API at ${BASE_URL}: ${e.message}`
        : `Could not reach the API at ${BASE_URL}`
    );
  }

  const text = await res.text().catch(() => "");
  let parsed: ApiEnvelope<T> | undefined;
  if (text) {
    try {
      parsed = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      parsed = undefined;
    }
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      parsed?.error ||
        parsed?.message ||
        (text ? text : `Request failed with status ${res.status}`)
    );
  }

  if (!parsed) return {} as ApiEnvelope<T>;
  if (parsed.success === false) {
    throw new ApiError(res.status, parsed.error || "Request failed");
  }
  return parsed;
}

export async function apiGet<T>(path: string): Promise<T> {
  const envelope = await request<T>(path);
  return envelope.data as T;
}

export async function apiList<T>(path: string): Promise<T[]> {
  const envelope = await request<Paginated<T>>(path);
  return envelope.data?.items ?? [];
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const envelope = await request<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return envelope.data as T;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const envelope = await request<T>(path, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return envelope.data as T;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const envelope = await request<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return envelope.data as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const envelope = await request<T>(path, { method: "DELETE" });
  return envelope.data as T;
}

// ─── Entity types (mirrors @nexus/database schema) ───────────────────────────

export interface AgentPermissions {
  allowed: string[];
  denied: string[];
}

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  systemPrompt: string | null;
  permissions: AgentPermissions | null;
  tools: unknown;
  skills: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  modelId: string | null;
  model?: Model | null;
  project?: Project | null;
}

export interface Model {
  id: string;
  name: string;
  slug: string;
  parameters?: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  providerId: string;
  configured?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  baseUrl: string | null;
  isActive: boolean;
  config?: unknown;
  createdAt: string;
  updatedAt: string;
  models: Model[];
  configured?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  directory: string | null;
  context?: unknown;
  settings?: unknown;
  createdAt: string;
  updatedAt: string;
  userId: string;
  agents?: Agent[];
  sessions?: Session[];
}

export type SessionStatus = "active" | "paused" | "completed" | "failed";

export interface Session {
  id: string;
  title: string | null;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  agentId: string;
  projectId: string;
  _count?: { messages: number };
  agent?: Agent | null;
  project?: Project | null;
  messages?: Message[];
}

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  sessionId: string;
}

export interface ChatResponse {
  userMessage: Message;
  assistantMessage: Message;
}

export interface Skill {
  id: string;
  name: string;
  description: string | null;
  version: string | null;
  author: string | null;
  instructions: string | null;
  files?: unknown;
  metadata?: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ToolType = "builtin" | "custom" | "mcp";

export interface Tool {
  id: string;
  name: string;
  description: string | null;
  type: ToolType;
  config?: unknown;
  permissions: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MCPServerStatus = "connected" | "disconnected" | "error";

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: MCPServerStatus;
  permissions: unknown;
  config?: unknown;
  createdAt: string;
  updatedAt: string;
}

export type ActivityLevel = "info" | "warning" | "error" | "debug";

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown> | null;
  level: ActivityLevel;
  createdAt: string;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  updatedAt: string;
}

// ─── Helpers for JSON columns ────────────────────────────────────────────────

export function permissionList(value: unknown, side: "allowed" | "denied" = "allowed"): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  if (typeof value === "object") {
    const perms = value as Record<string, unknown>;
    const list = perms[side];
    if (Array.isArray(list)) {
      return list.filter((v): v is string => typeof v === "string");
    }
    return [];
  }
  return [];
}

export function allPermissionIds(value: unknown): string[] {
  const allowed = permissionList(value, "allowed");
  return [...new Set(allowed)];
}

export function jsonStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (typeof v === "string") return v;
        if (typeof v === "object" && v !== null) {
          const name = (v as Record<string, unknown>).name;
          if (typeof name === "string") return name;
        }
        return null;
      })
      .filter((v): v is string => v !== null);
  }
  return [];
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const PERMISSIONS = [
  { id: "FILES_READ", label: "Files Read", description: "Read files from disk" },
  { id: "FILES_WRITE", label: "Files Write", description: "Write and modify files" },
  { id: "TERMINAL", label: "Terminal", description: "Execute shell commands" },
  { id: "GIT", label: "Git", description: "Run git operations" },
  { id: "NETWORK", label: "Network", description: "Make HTTP requests" },
  { id: "BROWSER", label: "Browser", description: "Control a browser" },
  { id: "MCP", label: "MCP", description: "Use MCP server tools" },
] as const;

export const PERMISSION_IDS = PERMISSIONS.map((p) => p.id);

export const BASE_API_URL = BASE_URL;