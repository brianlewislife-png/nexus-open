"use client";

import * as React from "react";
import { Menu, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewSessionDialog } from "@/components/layout/new-session-dialog";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const today = React.useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm text-muted-foreground">{today}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Play className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>
      <NewSessionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </header>
  );
}