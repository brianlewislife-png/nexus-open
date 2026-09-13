"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useApiList } from "@/lib/hooks";
import { apiPost } from "@/lib/api";
import type { Agent, Project, Session } from "@/lib/api";

export function NewSessionDialog({
  open,
  onOpenChange,
  initialAgentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAgentId?: string;
}) {
  const router = useRouter();
  const { data: agents } = useApiList<Agent>("/api/agents");
  const { data: projects } = useApiList<Project>("/api/projects");

  const [agentId, setAgentId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && initialAgentId) setAgentId(initialAgentId);
  }, [open, initialAgentId]);

  React.useEffect(() => {
    if (open && !agentId && agents && agents.length > 0) {
      setAgentId(agents[0].id);
    }
  }, [open, agents, agentId]);

  const selectedAgent = agents?.find((a) => a.id === agentId) ?? null;
  const projectId = selectedAgent?.projectId ?? "";
  const projectName = projects?.find((p) => p.id === projectId)?.name;

  const handleCreate = async () => {
    if (!selectedAgent) return;
    setCreating(true);
    setError(null);
    try {
      const session = await apiPost<Session>("/api/sessions", {
        title: title || `Session with ${selectedAgent.name}`,
        agentId: selectedAgent.id,
        projectId: selectedAgent.projectId,
      });
      onOpenChange(false);
      setTitle("");
      setAgentId("");
      router.push(`/sessions/${session.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create session");
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Session</DialogTitle>
          <DialogDescription>
            A session binds an agent, its model and a project context together.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-title">Title</Label>
            <Input
              id="session-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={selectedAgent ? `Session with ${selectedAgent.name}` : "Session title"}
            />
          </div>
          <div className="space-y-2">
            <Label>Agent</Label>
            {agents && agents.length > 0 ? (
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                No agents yet.{" "}
                {open ? (
                  <span>
                    Create one on the <em>Agents</em> page first.
                  </span>
                ) : null}
              </p>
            )}
          </div>
          {selectedAgent && (
            <div className="rounded-lg border border-white/[0.05] bg-black/30 px-3 py-2 text-xs">
              <span className="text-muted-foreground">Project context: </span>
              <span className="text-indigo-300">{projectName ?? selectedAgent.projectId}</span>
            </div>
          )}
          <DialogFooter>
            <div className="flex w-full items-center justify-between gap-4">
              {error ? <span className="text-xs text-destructive">{error}</span> : <span />}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating || !selectedAgent}>
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  Start
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}