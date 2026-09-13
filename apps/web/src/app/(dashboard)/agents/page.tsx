"use client";

import * as React from "react";
import Link from "next/link";
import { Bot, Copy, Plus, Trash2, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTitle, ApiError, LoadingList, EmptyState } from "@/components/shared/state";
import { useApiList } from "@/lib/hooks";
import { apiDelete, apiPost } from "@/lib/api";
import type { Agent, Model, Project } from "@/lib/api";

export default function AgentsPage() {
  const agents = useApiList<Agent>("/api/agents");
  const models = useApiList<Model>("/api/models");
  const projects = useApiList<Project>("/api/projects");

  const modelNames = React.useMemo(
    () => new Map(models.data.map((m) => [m.id, m.name])),
    [models.data]
  );
  const projectNames = React.useMemo(
    () => new Map(projects.data.map((p) => [p.id, p.name])),
    [projects.data]
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this agent? Sessions attached to it will be removed.")) return;
    try {
      await apiDelete(`/api/agents/${id}`);
      agents.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await apiPost(`/api/agents/${id}/duplicate`);
      agents.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Duplicate failed");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="Agents"
        description="AI agents with scoped permissions, models and tool access."
        action={
          <Button asChild>
            <Link href="/agents/new">
              <Plus className="mr-2 h-4 w-4" /> Create Agent
            </Link>
          </Button>
        }
      />

      {agents.loading ? (
        <LoadingList rows={6} />
      ) : agents.error && agents.data.length === 0 ? (
        <ApiError onRetry={agents.reload} />
      ) : agents.data.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No agents yet"
          description="Create your first agent to assign a model, project and permissions."
          action={
            <Button asChild>
              <Link href="/agents/new">
                <Plus className="mr-2 h-4 w-4" /> Create Agent
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-white/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.data.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <Link href={`/agents/${agent.id}`} className="font-medium hover:text-primary">
                      {agent.name}
                    </Link>
                    {agent.description && (
                      <div className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                        {agent.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {agent.modelId ? (
                      <span className="text-sm">{modelNames.get(agent.modelId) ?? agent.modelId}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {agent.projectId ? (
                      <span className="text-sm">{projectNames.get(agent.projectId) ?? agent.projectId}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={agent.isActive ? "success" : "secondary"}>
                      {agent.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title="Edit">
                        <Link href={`/agents/new?edit=${agent.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" title="Duplicate" onClick={() => handleDuplicate(agent.id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(agent.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}