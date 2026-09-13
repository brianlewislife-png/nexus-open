"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Cpu,
  FolderKanban,
  Wrench,
  GraduationCap,
  Plug,
  Activity,
  Settings,
  MessagesSquare,
  X,
  Hexagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/models", label: "Models", icon: Cpu },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/skills", label: "Skills", icon: GraduationCap },
  { href: "/mcp", label: "MCP", icon: Plug },
  { href: "/sessions", label: "Sessions", icon: MessagesSquare },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-4 w-4", active && "text-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex h-16 items-center gap-3 border-b border-border/60 px-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 glow-sm">
        <Hexagon className="h-4 w-4 text-white" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-wide">NEXUS</div>
        <div className="text-[11px] text-muted-foreground">AI Workspace</div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border/60 bg-background/95 backdrop-blur transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between md:justify-start">
          {brand}
          <button
            onClick={onClose}
            className="mr-3 rounded-md p-1 text-muted-foreground hover:bg-accent md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {nav}
        <div className="border-t border-border/60 px-6 py-4">
          <p className="text-[11px] text-muted-foreground">
            Open Source AI Workspace
          </p>
          <p className="text-[11px] text-muted-foreground/60">v1.0.0</p>
        </div>
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}