"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus, Trash2, ExternalLink, Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTitle, ApiError, LoadingList, EmptyState } from "@/components/shared/state";
import { useApiList } from "@/lib/hooks";
import { apiDelete } from "@/lib/api";
import type { Project, Agent } from "@/lib/api";

export default function ProjectsPage() {
  const router = useRouter();
  const projects = useApiList<Project>("/api/projects");
  const agents = useApiList<Agent>("/api/agents");

  const agentCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const agent of agents.data) {
      counts.set(agent.projectId, (counts.get(agent.projectId) ?? 0) + 1);
    }
    return counts;
  }, [agents.data]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? Its agents and sessions will be removed.")) return;
    try {
      await apiDelete(`/api/projects/${id}`);
      projects.reload();
      agents.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (projects.loading) {
    return (
      <div className="space-y-6 p-6">
        <LoadingList rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="Projects"
        description="Directories with real context for your agents and sessions."
        action={
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Link>
          </Button>
        }
      />

      {projects.error && projects.data.length === 0 ? (
        <ApiError onRetry={projects.reload} />
      ) : projects.data.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Projects give agents a working directory and context. Create one to get started."
          action={
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.data.map((project) => (
            <Card key={project.id} className="card-glass p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDelete(project.id)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Link href={`/projects/${project.id}`} className="mt-4 block font-semibold hover:text-primary">
                {project.name}
              </Link>
              <p className="mt-1 line-clamp-2 min-h-[2lh] text-sm text-muted-foreground">
                {project.description || "No description."}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5" /> {agentCounts.get(project.id) ?? 0} agents
                </span>
                <span className="truncate font-mono text-[10px]">
                  {project.directory || "virtual context"}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="mt-3 w-full" asChild>
                <Link href={`/projects/${project.id}`}>
                  Open <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}