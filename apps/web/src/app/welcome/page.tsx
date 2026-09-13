"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Hexagon,
  Bot,
  Cpu,
  Wrench,
  GraduationCap,
  Link2,
  Globe,
  Github,
  Instagram,
  Send,
  MessageCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiPut } from "@/lib/api";

const SOCIAL_LINKS = {
  github: process.env.NEXT_PUBLIC_NEXUS_URL_GITHUB || "",
  website: process.env.NEXT_PUBLIC_NEXUS_URL_WEBSITE || "",
  instagram: process.env.NEXT_PUBLIC_NEXUS_URL_INSTAGRAM || "",
  telegram: process.env.NEXT_PUBLIC_NEXUS_URL_TELEGRAM || "",
  whatsapp: process.env.NEXT_PUBLIC_NEXUS_URL_WHATSAPP || "",
};

const socials = [
  { icon: Github, label: "GitHub", href: SOCIAL_LINKS.github || "#" },
  { icon: Globe, label: "Site", href: SOCIAL_LINKS.website || "#" },
  { icon: Instagram, label: "Instagram", href: SOCIAL_LINKS.instagram || "#" },
  { icon: Send, label: "Telegram", href: SOCIAL_LINKS.telegram || "#" },
  { icon: MessageCircle, label: "WhatsApp", href: SOCIAL_LINKS.whatsapp || "#" },
];

export default function WelcomePage() {
  const router = useRouter();
  const [entering, setEntering] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleEnter = async () => {
    setEntering(true);
    setError(null);
    try {
      await apiPut("/api/settings/welcome_seen", { value: true });
      router.push("/dashboard");
    } catch (e) {
      setError(
        e instanceof Error
          ? `Could not reach the API (${e.message}). Make sure the backend is running with "docker compose up".`
          : "Could not reach the API."
      );
      setEntering(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.12),transparent_60%)]" />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 glow-md">
          <Hexagon className="h-8 w-8 text-white" />
        </div>

        <h1 className="mt-8 text-3xl font-bold tracking-tight md:text-5xl">
          NEXUS{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Open Source AI Workspace
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-base text-zinc-400 md:text-lg">
          Um ambiente unificado para trabalhar com Inteligência Artificial.
        </p>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-zinc-500">
          NEXUS connects models, agents, tools, skills and projects in a single,
          self-hosted space. Define your agents once, grant them precise
          permissions, tie them to a project context and start working across
          OpenAI, Gemini, Mistral and Ollama.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
          {["Open Source", "Self-Hosted", "Multi-Provider"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-indigo-300 backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-2">
          <Button size="lg" onClick={handleEnter} disabled={entering} className="h-12 px-8">
            {entering ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            Enter NEXUS
          </Button>
          {error && <p className="mt-2 max-w-md text-xs text-destructive">{error}</p>}
          <p className="text-xs text-zinc-600">
            Creates your workspace and takes you to the dashboard.
          </p>
        </div>

        <div className="mt-14">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-600">
            Connect
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                title={s.href.startsWith("http") ? s.label : `${s.label} (configure via env)`}
                className="group flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 transition-colors hover:border-indigo-500/40 hover:text-indigo-300"
              >
                <s.icon className="h-5 w-5" />
                <span className="text-[10px]">{s.label}</span>
              </a>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-zinc-600">
            Set the official links in .env (NEXT_PUBLIC_NEXUS_URL_*)
          </p>
        </div>
      </main>

      <footer className="relative z-10 flex flex-col items-center gap-1 border-t border-white/5 py-6 text-xs text-zinc-600">
        <div className="flex items-center gap-2">
          <Link2 className="h-3.5 w-3.5" />
          <span>NEXUS, Open Source AI Workspace</span>
        </div>
        <span>Created by Brian Lewis · September 13, 2026</span>
      </footer>
    </div>
  );
}