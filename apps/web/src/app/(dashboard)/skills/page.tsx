"use client";

import * as React from "react";
import { GraduationCap, Plus, Loader2, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageTitle, ApiError, LoadingCards, EmptyState } from "@/components/shared/state";
import { useApiList } from "@/lib/hooks";
import { apiPost } from "@/lib/api";
import type { Skill } from "@/lib/api";

export default function SkillsPage() {
  const skills = useApiList<Skill>("/api/skills");
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [version, setVersion] = React.useState("1.0.0");
  const [author, setAuthor] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await apiPost<Skill>("/api/skills", { name, version, author, description });
      setOpen(false);
      setName("");
      setVersion("1.0.0");
      setAuthor("");
      setDescription("");
      skills.reload();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="Skills"
        description="Reusable instructions and workflows that agents can pull in."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Skill
          </Button>
        }
      />

      {skills.loading ? (
        <LoadingCards />
      ) : skills.error && skills.data.length === 0 ? (
        <ApiError onRetry={skills.reload} />
      ) : skills.data.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No skills yet"
          description="Skills package instructions for agents. Create one to make reusable behaviors."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Skill
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.data.map((skill) => (
            <Card key={skill.id} className="card-glass p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <Badge variant={skill.isActive ? "success" : "secondary"}>
                  {skill.isActive ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <h3 className="mt-4 font-semibold">{skill.name}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{skill.description}</p>
              <div className="mt-4 flex items-center gap-2 border-t border-white/[0.05] pt-3 text-xs text-muted-foreground">
                {skill.version && <Badge variant="outline">v{skill.version}</Badge>}
                <span className="truncate">{skill.author || "Unknown author"}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-2">
        <CardContent className="flex items-start gap-3 p-5">
          <BookOpen className="mt-0.5 h-4 w-4 text-indigo-400" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Catalog coming soon.</span> A public skills
            marketplace for sharing, versioning and installing community skills is in the works.
          </p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New skill</DialogTitle>
            <DialogDescription>
              Package reusable instructions your agents can adopt.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Name</Label>
              <Input
                id="skill-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. unit-testing"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skill-version">Version</Label>
                <Input
                  id="skill-version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-author">Author</Label>
                <Input
                  id="skill-author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-desc">Description</Label>
              <Textarea
                id="skill-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What workflow does this skill capture?"
              />
            </div>
            <DialogFooter>
              <div className="flex w-full items-center justify-between gap-4">
                {saveError ? (
                  <span className="text-xs text-destructive">{saveError}</span>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Create
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}