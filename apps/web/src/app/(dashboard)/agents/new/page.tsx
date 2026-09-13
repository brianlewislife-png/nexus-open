"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageTitle } from "@/components/shared/state";
import { useApiList } from "@/lib/hooks";
import {
  apiGet,
  apiPost,
  apiPatch,
  allPermissionIds,
  jsonStringArray,
  PERMISSIONS,
} from "@/lib/api";
import type { Agent, Model, Project, Tool, Skill } from "@/lib/api";

const staticTools = [
  { id: "files", name: "Files", permissions: ["FILES_READ", "FILES_WRITE"] },
  { id: "git", name: "Git", permissions: ["GIT"] },
  { id: "terminal", name: "Terminal", permissions: ["TERMINAL"] },
];

export default function NewAgentPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading form…</div>}>
      <NewAgentForm />
    </React.Suspense>
  );
}

function NewAgentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const prefillProject = searchParams.get("project");

  const models = useApiList<Model>("/api/models");
  const projects = useApiList<Project>("/api/projects");
  const toolsApi = useApiList<Tool>("/api/tools");
  const skills = useApiList<Skill>("/api/skills");

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [systemPrompt, setSystemPrompt] = React.useState("");
  const [modelId, setModelId] = React.useState("");
  const [projectId, setProjectId] = React.useState("");
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [tools, setTools] = React.useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = React.useState(Boolean(editId));

  React.useEffect(() => {
    if (editId) {
      let cancelled = false;
      apiGet<Agent>(`/api/agents/${editId}`)
        .then((agent) => {
          if (cancelled) return;
          setName(agent.name);
          setDescription(agent.description ?? "");
          setSystemPrompt(agent.systemPrompt ?? "");
          setModelId(agent.modelId ?? "");
          setProjectId(agent.projectId);
          setPermissions(allPermissionIds(agent.permissions));
          setTools(jsonStringArray(agent.tools));
          setSelectedSkills(jsonStringArray(agent.skills));
        })
        .catch((e) => setError(e instanceof Error ? e.message : "Failed to load agent"))
        .finally(() => setLoadingEdit(false));
      return () => {
        cancelled = true;
      };
    }
    if (prefillProject) {
      setProjectId(prefillProject);
    }
  }, [editId, prefillProject]);

  const toggle = (arr: string[], value: string, add: boolean) =>
    add ? [...arr, value] : arr.filter((v) => v !== value);

  const toolsList = toolsApi.data.length > 0 ? toolsApi.data : staticTools;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError("A project is required — agents must be scoped to a project.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      name,
      description: description || null,
      systemPrompt: systemPrompt || null,
      modelId: modelId || null,
      permissions: { allowed: permissions, denied: [] },
      tools,
      skills: selectedSkills,
    };
    try {
      if (editId) {
        await apiPatch(`/api/agents/${editId}`, {
          name,
          description: description || null,
          systemPrompt: systemPrompt || null,
          modelId: modelId || null,
          permissions: { allowed: permissions, denied: [] },
          tools,
          skills: selectedSkills,
        });
        router.push(`/agents/${editId}`);
      } else {
        const agent = await apiPost<Agent>("/api/agents", payload);
        router.push(`/agents/${agent.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title={editId ? "Edit Agent" : "New Agent"}
        description="Define an agent, its model, project scope and exact capabilities."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-base">Identity</CardTitle>
            <CardDescription>How the agent is named, scoped and described.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. code-reviewer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select value={modelId || "none"} onValueChange={(v) => setModelId(v === "none" ? "" : v)}>
                  <SelectTrigger disabled={loadingEdit}>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.data.length > 0 ? (
                      models.data.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none">No models available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this agent for?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              {editId ? (
                <Input id="project" value={projectId || undefined} placeholder="Project set at creation" disabled />
              ) : (
                <Select value={projectId || "none"} onValueChange={(v) => setProjectId(v === "none" ? "" : v)}>
                  <SelectTrigger disabled={loadingEdit}>
                    <SelectValue placeholder="Select a project (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.data.length > 0 ? (
                      projects.data.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none">No projects yet — create one first</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">
                Agents are always scoped to a project — their sessions run in that project&apos;s context.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System prompt</Label>
              <Textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Behaviors, goals and constraints of this agent."
                className="min-h-[140px] font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-base">Permissions</CardTitle>
            <CardDescription>Everything the agent is allowed to do. Grant the minimum.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {PERMISSIONS.map((permission) => (
              <label
                key={permission.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/[0.05] p-3 hover:bg-accent"
              >
                <Checkbox
                  checked={permissions.includes(permission.id)}
                  onCheckedChange={(checked) =>
                    setPermissions((prev) => toggle(prev, permission.id, checked === true))
                  }
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium">{permission.label}</span>
                  <span className="block text-xs text-muted-foreground">{permission.description}</span>
                </span>
              </label>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-base">Tools</CardTitle>
              <CardDescription>
                {toolsApi.data.length > 0
                  ? "Tools registered on the API."
                  : "Capability tools — permission-gated, activated on the agent."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {toolsList.map((tool) => (
                <label
                  key={`${tool.id}-${tool.name}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.05] p-3 hover:bg-accent"
                >
                  <Checkbox
                    checked={tools.includes(tool.id)}
                    onCheckedChange={(checked) => setTools((prev) => toggle(prev, tool.id, checked === true))}
                  />
                  <span className="text-sm">{tool.name}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-base">Skills</CardTitle>
              <CardDescription>Reusable instructions this agent can use.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {skills.data.length > 0 ? (
                skills.data.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.05] p-3 hover:bg-accent"
                  >
                    <Checkbox
                      checked={selectedSkills.includes(skill.id)}
                      onCheckedChange={(checked) =>
                        setSelectedSkills((prev) => toggle(prev, skill.id, checked === true))
                      }
                    />
                    <span className="flex-1 text-sm">{skill.name}</span>
                    {skill.version && <span className="text-[10px] text-muted-foreground">v{skill.version}</span>}
                  </label>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills created yet. You can still save this agent and add skills later.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving || loadingEdit}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {editId ? "Save changes" : "Create agent"}
          </Button>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      </form>
    </div>
  );
}