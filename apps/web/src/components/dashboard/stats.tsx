import { Bot, Cpu, FolderKanban, MessagesSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsProps {
  activeAgents: number;
  configuredModels: number;
  projects: number;
  recentSessions: number;
}

export function Stats({ activeAgents, configuredModels, projects, recentSessions }: StatsProps) {
  const items = [
    { label: "Active Agents", value: activeAgents, icon: Bot },
    { label: "Configured Models", value: configuredModels, icon: Cpu },
    { label: "Projects", value: projects, icon: FolderKanban },
    { label: "Recent Sessions", value: recentSessions, icon: MessagesSquare },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="card-glass p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <div className="rounded-lg bg-indigo-500/15 p-1.5 text-indigo-400">
              <item.icon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-semibold tabular-nums">{item.value}</div>
        </Card>
      ))}
    </div>
  );
}