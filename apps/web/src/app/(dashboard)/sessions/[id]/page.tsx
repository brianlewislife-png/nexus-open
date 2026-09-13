"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Cpu,
  FolderKanban,
  ShieldCheck,
  Info,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ApiError, LoadingList } from "@/components/shared/state";
import { useApiData } from "@/lib/hooks";
import {
  apiPost,
  allPermissionIds,
  jsonStringArray,
  PERMISSIONS,
  type Agent,
  type Session as NexusSession,
  type Project,
} from "@/lib/api";

export default function SessionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const session = useApiData<NexusSession>(`/api/sessions/${id}`);
  const agent = useApiData<Agent>(
    session.data ? `/api/agents/${session.data.agentId}` : null
  );
  const project = useApiData<Project>(
    session.data ? `/api/projects/${session.data.projectId}` : null
  );

  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.data?.messages?.length]);

  React.useEffect(() => {
    if (!session.data || session.data.status !== "active") return;
    const timer = setInterval(() => {
      session.reload();
    }, 3000);
    return () => clearInterval(timer);
  }, [session.data, session.reload]);

  const handleSend = async (content: string) => {
    await apiPost("/api/chat", { sessionId: id, message: content });
    await session.reload();
  };

  if (session.loading && !session.data) {
    return (
      <div className="p-6">
        <LoadingList rows={5} />
      </div>
    );
  }

  if (session.error && !session.data) {
    return (
      <div className="p-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/sessions">
            <ArrowLeft className="mr-2 h-4 w-4" /> Sessions
          </Link>
        </Button>
        <ApiError onRetry={session.reload} />
      </div>
    );
  }

  const current = session.data!;
  const theAgent = agent.data;
  const hasModel = Boolean(theAgent?.modelId);

  const permissionLabels = PERMISSIONS.reduce<Record<string, string>>((acc, p) => {
    acc[p.id] = p.label;
    return acc;
  }, {});

  const messages = current.messages ?? [];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      <aside className="hidden shrink-0 overflow-y-auto border-r border-border/60 bg-background/60 p-4 md:block md:w-72">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/sessions">
            <ArrowLeft className="mr-2 h-4 w-4" /> Sessions
          </Link>
        </Button>

        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Session
        </div>
        <h1 className="text-base font-semibold">{current.title ?? "Untitled session"}</h1>

        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <Bot className="h-3.5 w-3.5" /> Agent
            </dt>
            <dd className="mt-1">
              {theAgent ? (
                <Link href={`/agents/${theAgent.id}`} className="font-medium hover:text-primary">
                  {theAgent.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">Loading…</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <Cpu className="h-3.5 w-3.5" /> Model
            </dt>
            <dd className="mt-1 font-medium">
              {theAgent?.model?.name ?? theAgent?.modelId ?? "Not assigned"}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <FolderKanban className="h-3.5 w-3.5" /> Project
            </dt>
            <dd className="mt-1">
              {project.data ? (
                <Link href={`/projects/${project.data.id}`} className="font-medium hover:text-primary">
                  {project.data.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">{current.projectId}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <Wrench className="h-3.5 w-3.5" /> Tools
            </dt>
            <dd className="mt-1">
              {theAgent && jsonStringArray(theAgent.tools).length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {jsonStringArray(theAgent.tools).map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Permissions
            </dt>
            <dd className="mt-1">
              {theAgent && allPermissionIds(theAgent.permissions).length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {allPermissionIds(theAgent.permissions).map((p) => (
                    <Badge key={p} variant="secondary" className="text-[10px]">
                      {permissionLabels[p] ?? p}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </dd>
          </div>
        </dl>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-4 md:hidden">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/sessions">
              <ArrowLeft className="mr-2 h-4 w-4" /> Sessions
            </Link>
          </Button>
          <span className="truncate text-sm font-medium">{current.title ?? "Untitled session"}</span>
        </div>

        {!hasModel && theAgent && (
          <div className="flex items-start gap-2 border-b border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/90">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <span>
              This agent has no model assigned.{" "}
              <Link href={`/agents/new?edit=${theAgent.id}`} className="underline hover:text-amber-100">
                Configure an agent model
              </Link>{" "}
              to start a conversation.
            </span>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="space-y-5 px-4 py-6 md:px-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Bot className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium">No messages yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Send a message to start this session.
                </p>
              </div>
            ) : (
              messages.map((message) => <ChatMessage key={message.id} message={message} />)
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t border-border/60 p-4">
          <ChatInput onSend={handleSend} disabled={Boolean(theAgent && !hasModel)} />
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Enter to send · Shift+Enter for a new line
          </p>
        </div>
      </main>
    </div>
  );
}