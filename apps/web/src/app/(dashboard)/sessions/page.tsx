"use client";

import * as React from "react";
import Link from "next/link";
import { MessagesSquare, Play, ExternalLink } from "lucide-react";
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
import { NewSessionDialog } from "@/components/layout/new-session-dialog";
import { PageTitle, ApiError, LoadingList, EmptyState } from "@/components/shared/state";
import { useApiList } from "@/lib/hooks";
import type { Session, Agent, Project, SessionStatus } from "@/lib/api";

const statusStyle = (status: SessionStatus) => {
  switch (status) {
    case "active":
      return "success" as const;
    case "paused":
      return "warning" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

export default function SessionsPage() {
  const sessions = useApiList<Session>("/api/sessions");
  const agents = useApiList<Agent>("/api/agents");
  const projects = useApiList<Project>("/api/projects");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const agentNames = React.useMemo(
    () => new Map(agents.data.map((a) => [a.id, a.name])),
    [agents.data]
  );
  const projectNames = React.useMemo(
    () => new Map(projects.data.map((p) => [p.id, p.name])),
    [projects.data]
  );

  const sorted = React.useMemo(
    () => [...sessions.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [sessions.data]
  );

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="Sessions"
        description="Chat sessions tied to agents, models and projects."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Play className="mr-2 h-4 w-4" /> New Session
          </Button>
        }
      />

      {sessions.loading ? (
        <LoadingList rows={6} />
      ) : sessions.error && sessions.data.length === 0 ? (
        <ApiError onRetry={sessions.reload} />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No sessions yet"
          description="Start a session to chat with an agent."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Play className="mr-2 h-4 w-4" /> New Session
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-white/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.title ?? "Untitled session"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {agentNames.get(session.agentId) ?? session.agentId}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {projectNames.get(session.projectId) ?? session.projectId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusStyle(session.status)} className="capitalize">
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {session._count?.messages ?? 0}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    {new Date(session.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/sessions/${session.id}`}>
                        Open <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NewSessionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}