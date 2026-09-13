"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/shared/state";
import { apiPost } from "@/lib/api";
import type { Project } from "@/lib/api";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [directory, setDirectory] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const project = await apiPost<Project>("/api/projects", { name, description, directory });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageTitle title="New Project" description="Bind agents and sessions to a real directory on disk." />

      <form onSubmit={handleSubmit}>
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="h-4 w-4 text-violet-400" /> Project details
            </CardTitle>
            <CardDescription>The directory becomes the working context for agents and sessions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. nexus-web"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this project do?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="directory">Directory</Label>
              <Input
                id="directory"
                value={directory}
                onChange={(e) => setDirectory(e.target.value)}
                placeholder="/home/user/code/nexus-web"
              />
              <p className="text-xs text-muted-foreground">
                Absolute path on the host where the API runs. Leave empty to keep it virtual.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Create project
          </Button>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      </form>
    </div>
  );
}