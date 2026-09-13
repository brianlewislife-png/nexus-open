"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { apiGet, ApiError } from "@/lib/api";
import type { Setting } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function checkWelcome() {
      try {
        const setting = await apiGet<Setting>("/api/settings/welcome_seen");
        if (!cancelled) {
          if (setting.value !== true && setting.value !== "true") {
            router.replace("/welcome");
          } else {
            setChecking(false);
          }
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 404) {
          router.replace("/welcome");
        } else {
          setChecking(false);
        }
      }
    }
    checkWelcome();
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {checking ? (
            <div className="flex h-full min-h-[50vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}