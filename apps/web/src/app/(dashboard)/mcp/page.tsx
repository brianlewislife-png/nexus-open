"use client";

import * as React from "react";
import { Plug, Plus, Loader2, AlertOctagon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageTitle, ApiError, LoadingList, EmptyState } from "@/components/shared/state";
import { useApiList } from "@/lib/hooks";
import { apiPost, apiDelete, permissionList } from "@/lib/api";
import type { MCPServer, MCPServerStatus } from "@/lib/api";

const statusStyle = (status: MCPServerStatus) => {
  if (status === "connected") return "success" as const;
  if (status === "disconnected") return "secondary" as const;
  return "destructive" as const;
};

const mcpPermissions = ["FILES_READ", "FILES_WRITE", "TERMINAL", "NETWORK", "BROWSER", "GIT"];

export default function McpPage() {
  const servers = useApiList<MCPServer>("/api/mcp");
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await apiPost<MCPServer>("/api/mcp", { name, url, permissions });
      setOpen(false);
      setName("");
      setUrl("");
      setPermissions([]);
      servers.reload();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Disconnect this MCP server?")) return;
    try {
      await apiDelete(`/api/mcp/${id}`);
      servers.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="MCP Servers"
        description="Model Context Protocol servers that expose external tools to your agents."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Server
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <p className="text-sm text-amber-200/90">
          Never assume any MCP server is trustworthy. Only grant permissions you are ready to
          delegate, and only connect servers you control or fully audit.
        </p>
      </div>

      {servers.loading ? (
        <LoadingList rows={4} />
      ) : servers.error && servers.data.length === 0 ? (
        <ApiError onRetry={servers.reload} />
      ) : servers.data.length === 0 ? (
        <EmptyState
          icon={Plug}
          title="No MCP servers connected"
          description="Connect MCP servers to expose external tools to your agents."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Server
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {servers.data.map((server) => {
            const perms = permissionList(server.permissions);
            return (
              <Card key={server.id} className="card-glass">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                        <Plug className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{server.name}</CardTitle>
                        <CardDescription className="break-all font-mono text-xs">{server.url}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={statusStyle(server.status)} className="capitalize">
                      {server.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="mb-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                      Permissions
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {perms.length > 0 ? (
                        perms.map((p) => (
                          <span
                            key={p}
                            className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
                          >
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.05] pt-3">
                    <span className="text-xs text-muted-foreground">
                      Connected {new Date(server.updatedAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(server.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New MCP server</DialogTitle>
            <DialogDescription>
              Connect a Model Context Protocol endpoint. Verify what it can do before granting permissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mcp-name">Name</Label>
              <Input
                id="mcp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. my-tools-server"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mcp-url">URL</Label>
              <Input
                id="mcp-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:8080/mcp"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2">
                {mcpPermissions.map((perm) => (
                  <label
                    key={perm}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.05] px-3 py-2"
                  >
                    <Checkbox
                      checked={permissions.includes(perm)}
                      onCheckedChange={(checked) =>
                        setPermissions((prev) =>
                          checked ? [...prev, perm] : prev.filter((p) => p !== perm)
                        )
                      }
                    />
                    <span className="font-mono text-xs">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <div className="flex w-full items-center justify-between gap-4">
                {saveError ? <span className="text-xs text-destructive">{saveError}</span> : <span />}
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Connect
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