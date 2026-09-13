"use client";

import * as React from "react";
import { Activity, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTitle, ApiError, LoadingList, EmptyState } from "@/components/shared/state";
import { useApiList } from "@/lib/hooks";
import type { ActivityLog, ActivityLevel } from "@/lib/api";

type LevelFilter = "all" | ActivityLevel;

const levelStyle = (level: ActivityLevel) => {
  switch (level) {
    case "error":
      return "destructive" as const;
    case "warning":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
};

export default function ActivityPage() {
  const activity = useApiList<ActivityLog>("/api/activity");
  const [level, setLevel] = React.useState<LevelFilter>("all");

  const filtered = React.useMemo(() => {
    const sorted = [...activity.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return level === "all" ? sorted : sorted.filter((a) => a.level === level);
  }, [activity.data, level]);

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="Activity"
        description="Everything that happened in your workspace."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={activity.reload}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Select value={level} onValueChange={(v) => setLevel(v as LevelFilter)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {activity.loading ? (
        <LoadingList rows={8} />
      ) : activity.error && activity.data.length === 0 ? (
        <ApiError onRetry={activity.reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={level === "all" ? "No activity yet" : `No ${level} events`}
          description="Events from agents, sessions and tools will show up here over time."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <Card key={entry.id} className="card-glass p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={levelStyle(entry.level)} className="w-20 justify-center capitalize">
                  {entry.level}
                </Badge>
                <span className="min-w-0 flex-1 text-sm">{entry.action}</span>
                <span className="rounded-full border border-white/[0.05] px-2 py-0.5 text-[11px] uppercase text-muted-foreground">
                  {entry.entityType}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
              {entry.details && Object.keys(entry.details).length > 0 && (
                <pre className="mt-3 overflow-x-auto rounded-lg border border-white/[0.05] bg-black/30 px-3 py-2 font-mono text-xs text-zinc-400">
                  {JSON.stringify(entry.details, null, 2)}
                </pre>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}