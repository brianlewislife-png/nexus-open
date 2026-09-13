import { Bot, User, FileText, SquareTerminal, GitBranch, Globe, Plug, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/api";

interface ToolActivityEntry {
  kind?: "read" | "write" | "terminal" | "git" | "http" | "mcp" | "browser" | string;
  label?: string;
  labelText?: string;
  text?: string;
}

const toolIcon = (kind?: string) => {
  switch (kind) {
    case "read":
    case "write":
      return FileText;
    case "terminal":
      return SquareTerminal;
    case "git":
      return GitBranch;
    case "http":
      return Globe;
    case "mcp":
    case "browser":
      return Plug;
    default:
      return SquareTerminal;
  }
};

function ToolActivity({ entries }: { entries: ToolActivityEntry[] }) {
  return (
    <div className="mt-3 space-y-1.5">
      {entries.map((entry, i) => {
        const Icon = toolIcon(entry.kind);
        const label = entry.label ?? entry.labelText ?? entry.text ?? "Running tool";
        return (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-1.5 text-xs text-muted-foreground"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
            <span className="truncate">{label}</span>
            <Loader2 className="ml-auto h-3 w-3 shrink-0 animate-spin text-primary" />
          </div>
        );
      })}
    </div>
  );
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-[80%] rounded-lg border border-white/[0.05] bg-white/[0.03] px-4 py-2 text-center text-xs text-muted-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  const metadata = (message.metadata ?? {}) as { toolActivity?: ToolActivityEntry[] };
  const toolActivity = metadata.toolActivity ?? [];

  return (
    <div className={cn("flex w-full gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-indigo-500/20 text-indigo-300" : "bg-violet-500/20 text-violet-300"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn("flex max-w-[75%] flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-br-md bg-indigo-600 text-white"
              : "rounded-bl-md border border-white/[0.06] bg-card"
          )}
        >
          {message.content}
        </div>
        {toolActivity.length > 0 && <ToolActivity entries={toolActivity} />}
        <span className="mt-1 px-1 text-[10px] tabular-nums text-muted-foreground">
          {new Date(message.createdAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}