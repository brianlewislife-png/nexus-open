"use client";

import * as React from "react";
import { Wrench, ShieldCheck, FileText, GitBranch, SquareTerminal, Globe, Plug } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTitle, ApiError, LoadingList, EmptyState } from "@/components/shared/state";
import { useApiList } from "@/lib/hooks";
import { permissionList } from "@/lib/api";
import type { Tool } from "@/lib/api";

const defaultTools: Tool[] = [
  {
    id: "files",
    name: "Files",
    description: "Read and write files within the agent's project.",
    type: "builtin",
    permissions: ["FILES_READ", "FILES_WRITE"],
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "git",
    name: "Git",
    description: "Clone, commit and inspect repositories.",
    type: "builtin",
    permissions: ["GIT"],
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Run shell commands in a sandboxed shell.",
    type: "builtin",
    permissions: ["TERMINAL"],
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
];

function toolIcon(name: string): React.ElementType {
  const key = name.toLowerCase();
  if (key.includes("file")) return FileText;
  if (key.includes("git")) return GitBranch;
  if (key.includes("terminal") || key.includes("shell")) return SquareTerminal;
  if (key.includes("http") || key.includes("network") || key.includes("web")) return Globe;
  if (key.includes("mcp")) return Plug;
  return Wrench;
}

function ToolGrid({ tools }: { tools: Tool[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => {
        const Icon = toolIcon(tool.name);
        const perms = permissionList(tool.permissions);
        return (
          <Card key={tool.id} className="card-glass p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                <Icon className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="uppercase">
                {tool.type}
              </Badge>
            </div>
            <h3 className="mt-4 font-semibold">{tool.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/[0.05] pt-3">
              {perms.length > 0 ? (
                perms.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
                  >
                    <ShieldCheck className="h-3 w-3" /> {p}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No permissions bound</span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function ToolsPage() {
  const tools = useApiList<Tool>("/api/tools");

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="Tools"
        description="Granular capabilities your agents can use inside their project context."
      />

      {tools.loading ? (
        <LoadingList rows={4} />
      ) : tools.error && tools.data.length === 0 ? (
        <ApiError onRetry={tools.reload} />
      ) : (
        <>
          {tools.data.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No custom tools registered"
              description="Tools in NEXUS are permission-gated capabilities. Filesystem, git and terminal are available through permissions — no separate tool installs required."
            />
          ) : null}
          <ToolGrid tools={tools.data.length > 0 ? tools.data : defaultTools} />
        </>
      )}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-indigo-400" /> Tool architecture
          </CardTitle>
          <CardDescription>
            Built-in capability tools are enabled purely through permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          <p>
            NEXUS ships capability tools that gate access to the host environment. When you grant
            an agent <code className="text-indigo-300">TERMINAL</code>, it can run shell commands —
            the same tool applies regardless of the model behind the agent.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              ["FILES_READ / FILES_WRITE", "Filesystem read/write scoped to the project"],
              ["TERMINAL", "Sandboxed shell execution"],
              ["GIT", "Git operations against local repos"],
              ["NETWORK", "Outbound HTTP requests"],
              ["BROWSER", "Controlled browser automation"],
              ["MCP", "Tools exposed by connected MCP servers"],
            ].map(([perm, desc]) => (
              <li key={perm} className="rounded-lg border border-white/[0.05] px-3 py-2">
                <div className="font-mono text-xs text-indigo-300">{perm}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}