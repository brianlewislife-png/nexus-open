"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FolderKanban, Bot, MessagesSquare, Plus, FolderInput, ArrowLeft, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTitle, ApiError, LoadingList, EmptyState } from "@/components/shared/state";
import { useApiData } from "@/lib/hooks";
import { useApiList } from "@/lib/hooks";
import { apiDelete } from "@/lib/api";
import type { Project, Agent, Model } from "@/lib/api";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: project, error, loading, reload } = useApiData<Project>(`/api/projects/${id}`);
  const agents = useApiList<Agent>("/api/agents");
  const models = useApiList<Model>("/api/models");

  const modelNames = React.useMemo(
    () => new Map(models.data.map((m) => [m.id, m.name])),
    [models.data]
  );

  const projectAgents = React.useMemo(() => {
    const included = project?.agents ?? [];
    if (included.length > 0) return included;
    return agents.data.filter((a) => a.projectId === id);
  }, [project, agents.data, id]);
  const projectSessions = project?.sessions ?? [];

  const handleDelete = async () => {
    if (!confirm("Delete this project? Its agents and sessions will be removed.")) return;
    try {
      await apiDelete(`/api/projects/${id}`);
      router.push("/projects");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <LoadingList rows={4} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <PageTitle title="Project" />
        <ApiError className="mt-6" onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
        <Link href="/projects">
          <ArrowLeft className="mr-2 h-4 w-4" /> Projects
        </Link>
      </Button>

      <PageTitle
        title={project.name}
        description={project.description || "No description provided."}
        action={
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        }
      />

      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderInput className="h-4 w-4 text-violet-400" /> Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/[0.05] bg-black/30 px-4 py-3 font-mono text-sm text-indigo-200">
            {project.directory || "No directory configured, virtual context"}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Sessions and agents bound to this project operate relative to this directory.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-4 w-4 text-indigo-400" /> Agents
                <Badge variant="secondary">{projectAgents.length}</Badge>
              </CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/agents/new?project=${project.id}`}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add agent
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projectAgents.length === 0 ? (
              <EmptyState
                title="No agents in this project"
                description="Create an agent scoped to this project."
                action={
                  <Button size="sm" asChild>
                    <Link href={`/agents/new?project=${project.id}`}>
                      <Plus className="mr-2 h-4 w-4" /> Add agent
                    </Link>
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-2">
                {projectAgents.map((agent) => (
                  <li key={agent.id}>
                    <Link
                      href={`/agents/${agent.id}`}
                      className="flex items-center justify-between rounded-lg border border-white/[0.05] px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {agent.modelId ? modelNames.get(agent.modelId) ?? agent.modelId : "No model"}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{agent.isActive ? "Active" : "Inactive"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessagesSquare className="h-4 w-4 text-indigo-400" /> Sessions
              <Badge variant="secondary">{projectSessions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No sessions yet. Start one from an agent in this project.
              </p>
            ) : (
              <ul className="space-y-2">
                {projectSessions.map((session) => (
                  <li key={session.id}>
                    <Link
                      href={`/sessions/${session.id}`}
                      className="flex items-center justify-between rounded-lg border border-white/[0.05] px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      <span className="truncate font-medium">{session.title ?? "Untitled session"}</span>
                      <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                        {session.status} · {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}