"use client";

import * as React from "react";
import Link from "next/link";
import { Bot, Plus, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Stats } from "@/components/dashboard/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewSessionDialog } from "@/components/layout/new-session-dialog";
import { ApiError, LoadingCards, LoadingList, EmptyState, PageTitle } from "@/components/shared/state";
import { useApiList, useApiData } from "@/lib/hooks";
import type {
  Agent,
  Model,
  Project,
  Provider,
  Session,
  ActivityLog,
} from "@/lib/api";

export default function DashboardPage() {
  const agents = useApiList<Agent>("/api/agents");
  const models = useApiList<Model>("/api/models");
  const projects = useApiList<Project>("/api/projects");
  const sessions = useApiList<Session>("/api/sessions");
  const activity = useApiList<ActivityLog>("/api/activity");
  const providers = useApiData<Provider[]>("/api/providers");

  const [sessionDialogOpen, setSessionDialogOpen] = React.useState(false);

  const retryAll = () => {
    agents.reload();
    models.reload();
    projects.reload();
    sessions.reload();
    activity.reload();
    providers.reload();
  };

  const loading =
    agents.loading ||
    models.loading ||
    projects.loading ||
    sessions.loading ||
    activity.loading ||
    providers.loading;

  const unreachable =
    agents.error && models.error && projects.error && sessions.error && activity.error && providers.error;

  const configuredModels = models.data.filter((m) => m.configured ?? m.isActive).length;
  const recentActivity = [...activity.data]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const levelBadge = (level: ActivityLog["level"]) => {
    if (level === "error") return "destructive" as const;
    if (level === "warning") return "warning" as const;
    return "secondary" as const;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <LoadingCards />
        <LoadingList rows={3} />
      </div>
    );
  }

  if (unreachable) {
    return (
      <div className="p-6">
        <ApiError className="mt-8" onRetry={retryAll} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="Dashboard"
        description="Overview of your NEXUS workspace"
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/agents/new">
                <Bot className="mr-2 h-4 w-4" /> Create Agent
              </Link>
            </Button>
            <Button onClick={() => setSessionDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Start Session
            </Button>
          </div>
        }
      />

      <Stats
        activeAgents={agents.data.length}
        configuredModels={configuredModels}
        projects={projects.data.length}
        recentSessions={sessions.data.length}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="card-glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  description="Events from agents, sessions and tools will appear here."
                />
              ) : (
                <ul className="space-y-2">
                  {recentActivity.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center gap-3 rounded-lg border border-white/[0.05] px-3 py-2.5"
                    >
                      <Badge variant={levelBadge(entry.level)} className="w-16 justify-center capitalize">
                        {entry.level}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.entityType} · {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="card-glass p-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Bot className="h-4 w-4 text-indigo-400" /> Quick Actions
              </div>
              <div className="mt-4 space-y-2">
                <Link
                  href="/agents/new"
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] px-3 py-2 text-sm hover:bg-accent"
                >
                  Create Agent <Plus className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/projects/new"
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] px-3 py-2 text-sm hover:bg-accent"
                >
                  New Project <Plus className="h-4 w-4 text-muted-foreground" />
                </Link>
                <button
                  onClick={() => setSessionDialogOpen(true)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/[0.05] px-3 py-2 text-sm hover:bg-accent"
                >
                  Start Session <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </Card>

            <Card className="card-glass p-5">
              <div className="text-sm font-medium">Recent Sessions</div>
              <div className="mt-4 space-y-2">
                {sessions.data.length > 0 ? (
                  [...sessions.data]
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .slice(0, 4)
                    .map((s) => (
                      <Link
                        key={s.id}
                        href={`/sessions/${s.id}`}
                        className="group flex items-center justify-between rounded-lg border border-white/[0.05] px-3 py-2 text-sm hover:bg-accent"
                      >
                        <span className="truncate">{s.title ?? "Untitled session"}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground">No sessions yet.</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="card-glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Integration Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {providers.data && providers.data.length > 0 ? (
                providers.data.map((provider) => {
                  const configured = provider.configured ?? (provider.models?.length ?? 0) > 0;
                  return (
                    <div
                      key={provider.id}
                      className="flex items-center justify-between rounded-lg border border-white/[0.05] px-3 py-2.5"
                    >
                      <div>
                        <div className="text-sm font-medium">{provider.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(provider.models ?? []).length} model
                          {(provider.models ?? []).length === 1 ? "" : "s"}
                        </div>
                      </div>
                      {configured ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Circle className="h-4 w-4" /> Not configured
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  title="No providers"
                  description="Configure provider API keys in the backend environment."
                  action={
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/models">View models</Link>
                    </Button>
                  }
                />
              )}
              <p className="pt-1 text-xs text-muted-foreground">
                Keys are read from the API environment and validated at request time. See{" "}
                <Link href="/settings" className="text-indigo-400 hover:underline">
                  Settings
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <NewSessionDialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen} />
    </div>
  );
}