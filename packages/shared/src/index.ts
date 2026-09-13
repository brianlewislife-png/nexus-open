export * from './types';

import { Permission } from './types';

// ─── Permission constants ─────────────────────────────────────────────────────

export const PERMISSIONS: readonly Permission[] = [
  Permission.FILES_READ,
  Permission.FILES_WRITE,
  Permission.TERMINAL,
  Permission.GIT,
  Permission.NETWORK,
  Permission.BROWSER,
  Permission.MCP,
];

export const ALL_PERMISSIONS = new Set<Permission>(PERMISSIONS);

export const DEFAULT_PERMISSIONS: Permission[] = [
  Permission.FILES_READ,
  Permission.FILES_WRITE,
  Permission.TERMINAL,
  Permission.NETWORK,
];

// ─── Status types ─────────────────────────────────────────────────────────────

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export type EntityStatus =
  | SessionStatus
  | AgentStatus
  | ProjectStatus
  | TaskStatus;

export const SESSION_STATUSES: readonly SessionStatus[] = Object.values(
  SessionStatus
);
export const AGENT_STATUSES: readonly AgentStatus[] = Object.values(AgentStatus);
export const PROJECT_STATUSES: readonly ProjectStatus[] = Object.values(
  ProjectStatus
);
export const TASK_STATUSES: readonly TaskStatus[] = Object.values(TaskStatus);

// ─── Common utility functions ─────────────────────────────────────────────────

export function generateId(prefix?: string): string {
  const id = crypto.randomUUID();
  return prefix ? `${prefix}_${id}` : id;
}

export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${String(date)}`);
  }
  return new Intl.DateTimeFormat(
    'en-US',
    options ?? { dateStyle: 'medium', timeStyle: 'short' }
  ).format(parsed);
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

export function truncate(value: string, maxLength: number, suffix = '...'): string {
  if (!Number.isFinite(maxLength) || maxLength < 0) {
    throw new Error(`Invalid maxLength: ${String(maxLength)}`);
  }
  if (value.length <= maxLength) {
    return value;
  }
  const safeSuffix = suffix.length > maxLength ? '' : suffix;
  return value.slice(0, Math.max(0, maxLength - safeSuffix.length)) + safeSuffix;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isEmail(value: string): boolean {
  return typeof value === 'string' && value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function isUrl(value: string): boolean {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isCuid(value: string): boolean {
  return typeof value === 'string' && /^c[a-z0-9]{24}$/.test(value);
}