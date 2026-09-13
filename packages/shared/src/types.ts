export enum Permission {
  FILES_READ = 'FILES_READ',
  FILES_WRITE = 'FILES_WRITE',
  TERMINAL = 'TERMINAL',
  GIT = 'GIT',
  NETWORK = 'NETWORK',
  BROWSER = 'BROWSER',
  MCP = 'MCP'
}

export type PermissionSet = Permission[];

export interface AgentPermissions {
  allowed: Permission[];
  denied: Permission[];
}

export interface ActivityEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  level: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}