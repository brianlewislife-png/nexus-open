"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Bot, Play, Pencil, Copy, Trash2, ArrowLeft, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NewSessionDialog } from "@/components/layout/new-session-dialog";
import { PageTitle, ApiError, LoadingList } from "@/components/shared/state";
import { useApiData } from "@/lib/hooks";
import {
  apiDelete,
  apiPost,
  allPermissionIds,
  jsonStringArray,
  PERMISSIONS,
} from "@/lib/api";
import type { Agent } from "@/lib/api";

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: agent, error, loading, reload } = useApiData<Agent>(`/api/agents/${id}`);
  const [sessionDialogOpen, setSessionDialogOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <LoadingList rows={5} />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="p-6">
        <PageTitle title="Agent" />
        <ApiError className="mt-6" onRetry={reload} />
      </div>
    );
  }

  const granted = allPermissionIds(agent.permissions);
  const tools = jsonStringArray(agent.tools);
  const skills = jsonStringArray(agent.skills);

  const permissionLabels = PERMISSIONS.reduce<Record<string, string>>((acc, p) => {
    acc[p.id] = p.label;
    return acc;
  }, {});

  const duplicate = async () => {
    try {
      const copy = await apiPost<Agent>(`/api/agents/${agent.id}/duplicate`);
      router.push(`/agents/${copy.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Duplicate failed");
    }
  };

  const remove = async () => {
    if (!confirm("Delete this agent? Sessions attached to it will be removed.")) return;
    try {
      await apiDelete(`/api/agents/${id}`);
      router.push("/agents");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
        <Link href="/agents">
          <ArrowLeft className="mr-2 h-4 w-4" /> Agents
        </Link>
      </Button>

      <PageTitle
        title={agent.name}
        description={agent.description || "No description provided."}
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setSessionDialogOpen(true)}>
              <Play className="mr-2 h-4 w-4" /> Start Session
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/agents/new?edit=${agent.id}`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button variant="outline" onClick={duplicate}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </Button>
            <Button variant="ghost" onClick={remove} className="text-destructive hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-base">System prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-lg border border-white/[0.05] bg-black/40 p-4 font-mono text-sm leading-relaxed text-zinc-300">
                {agent.systemPrompt || "No system prompt set."}
              </pre>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-indigo-400" /> Granted permissions
              </CardTitle>
              <CardDescription>The exact capabilities this agent can exercise.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {granted.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  None. This agent can only call the model.
                </p>
              ) : (
                granted.map((p) => (
                  <Badge key={p} variant="secondary">
                    {permissionLabels[p] ?? p}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-base">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Model</div>
                <div className="mt-0.5 font-medium">
                  {agent.model?.name ?? agent.modelId ?? "Not assigned"}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Project</div>
                <Link
                  href={`/projects/${agent.projectId}`}
                  className="mt-0.5 block font-medium hover:text-primary"
                >
                  {agent.project?.name ?? agent.projectId}
                </Link>
              </div>
              <Separator />
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
                <div className="mt-0.5 font-medium">{agent.isActive ? "Active" : "Inactive"}</div>
              </div>
              <Separator />
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Created</div>
                <div className="mt-0.5 font-medium">{new Date(agent.createdAt).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-4 w-4 text-indigo-400" /> Tools & skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Tools</div>
                {tools.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {tools.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-muted-foreground">None</p>
                )}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Skills</div>
                {skills.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <Badge key={s} variant="outline">
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-muted-foreground">None</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <NewSessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        initialAgentId={agent.id}
      />
    </div>
  );
}