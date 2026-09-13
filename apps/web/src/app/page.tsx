import Link from "next/link";
import {
  Hexagon,
  Bot,
  Cpu,
  Wrench,
  GraduationCap,
  Plug,
  FolderKanban,
  Shield,
  GitBranch,
  Server,
  ArrowRight,
  Github,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Agents",
    description:
      "Create autonomous agents with precise permissions, file access, terminal, git, network and browser.",
  },
  {
    icon: Cpu,
    title: "Multiple Providers",
    description:
      "OpenAI, Gemini, Mistral and Ollama. Wire every model into one interface. No context switching.",
  },
  {
    icon: Wrench,
    title: "Permission-Gated Tools",
    description:
      "Filesystem, git, terminal and HTTP capabilities that agents can only use when you grant them.",
  },
  {
    icon: GraduationCap,
    title: "Shareable Skills",
    description:
      "Pack reusable instructions and workflows into skills. Versioned, authored and composable.",
  },
  {
    icon: Plug,
    title: "MCP Integration",
    description:
      "Connect MCP servers to give your agents access to external systems and live tool ecosystems.",
  },
  {
    icon: FolderKanban,
    title: "Project Context",
    description:
      "Bind agents and sessions to projects with real directory context. Work where your code lives.",
  },
];

const providers = ["OpenAI", "Gemini", "Mistral", "Ollama"];

const installSteps = [
  { label: "Clone", code: "git clone https://github.com/brianlewis/nexus.git" },
  { label: "Configure", code: "cp .env.example .env" },
  { label: "Run", code: "docker compose up -d" },
];

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm text-indigo-200">
      <code>{code}</code>
    </pre>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />

      <header className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
            <Hexagon className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-wide">NEXUS</span>
        </div>
        <Link
          href="/welcome"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Launch App <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-20 text-center md:pt-32">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-indigo-300 backdrop-blur">
          <Server className="h-3.5 w-3.5" />
          Open Source · Self-Hosted · Multi-Provider
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Stop switching between AI tools.{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Build in one place.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
          NEXUS is an open source AI workspace that unifies agents, models,
          tools, skills and projects behind a single self-hosted interface.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/welcome"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-indigo-600 px-6 text-sm font-medium text-white shadow-lg shadow-indigo-950/50 transition-colors hover:bg-indigo-500"
          >
            Launch App <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#install"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-6 text-sm font-medium text-zinc-200 backdrop-blur transition-colors hover:bg-white/10"
          >
            <Github className="h-4 w-4" /> Get started
          </a>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold md:text-3xl">What is NEXUS?</h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-zinc-400">
          NEXUS is a self-hosted control plane for AI work. Instead of juggling
          chat apps, code assistants and disconnected automations, you define
          agents once, give them a model, scope them to a project and grant
          the exact permissions they need to get work done.
        </p>
        <div className="mx-auto mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-glass rounded-xl p-6 transition-colors hover:border-indigo-500/30"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold md:text-3xl">Why NEXUS?</h2>
        <div className="mx-auto mt-12 grid gap-6 md:grid-cols-2">
          {[
            {
              icon: Shield,
              title: "You own your data",
              text: "Self-hosted by default. Your prompts, agent logs and projects never leave your machine.",
            },
            {
              icon: GitBranch,
              title: "Granular permissions",
              text: "Agents are sandboxed to the rights you grant. Read files, run commands or browse on your terms.",
            },
            {
              icon: Cpu,
              title: "Model-agnostic",
              text: "Swap between OpenAI, Gemini, Mistral or a local Ollama model without rewriting your setup.",
            },
            {
              icon: FolderKanban,
              title: "Project-first workflow",
              text: "Sessions carry context: the agent, the model and the project directory it operates on.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 rounded-xl border border-white/10 p-6">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold md:text-3xl">Supported AI Providers</h2>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Configure API keys via environment variables. Nothing is hardcoded.
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
          {providers.map((p) => (
            <div
              key={p}
              className="flex h-24 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] font-mono text-sm text-zinc-300 transition-colors hover:border-indigo-500/40"
            >
              {p}
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">Self-hosted. Yours.</h2>
            <p className="mt-4 text-zinc-400">
              NEXUS runs entirely on your infrastructure via Docker. No cloud
              dependency, no account required, no telemetry. Bring your own
              provider keys and stay in control.
            </p>
            <h2 className="mt-10 text-2xl font-semibold md:text-3xl">Open Source</h2>
            <p className="mt-4 text-zinc-400">
              The entire platform is MIT licensed. Read it, audit it, fork it
              and extend it. Community contributions shape every release.
            </p>
          </div>
          <div>
            <h2 className="mb-6 text-2xl font-semibold md:text-3xl">Architecture</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Web", "Next.js frontend on :3000"],
                ["API", "REST backend on :3001"],
                ["Agents", "Permission-scoped runners"],
                ["Providers", "OpenAI · Gemini · Mistral · Ollama"],
                ["Tools", "FS · Git · Shell · HTTP · MCP"],
                ["Storage", "SQLite · local-first"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <div className="font-medium text-indigo-300">{k}</div>
                  <div className="mt-1 text-xs text-zinc-500">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="install" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold md:text-3xl">Installation</h2>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Three commands. Requirements: Docker and Docker Compose.
        </p>
        <div className="mx-auto mt-10 max-w-2xl space-y-4">
          {installSteps.map((step, i) => (
            <div key={step.label} className="overflow-hidden rounded-xl border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {i + 1}. {step.label}
                </span>
              </div>
              <CodeBlock code={step.code} />
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold md:text-3xl">Contributing</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-zinc-400">
          NEXUS is built in the open. Report issues, suggest features, write
          skills or submit pull requests on GitHub. Every contribution makes
          the workspace better for everyone.
        </p>
        <div className="mt-8 text-center">
          <a
            href="#"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-6 text-sm font-medium text-zinc-200 backdrop-blur transition-colors hover:bg-white/10"
          >
            <Github className="h-4 w-4" /> Contribute on GitHub
          </a>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 md:flex-row">
          <div className="flex items-center gap-2">
            <Hexagon className="h-4 w-4 text-indigo-400" />
            <span>NEXUS, Open Source AI Workspace</span>
          </div>
          <div className="flex items-center gap-1.5">
            Created by Brian Lewis with <Heart className="h-3.5 w-3.5 text-rose-500" /> · September 13, 2026
          </div>
        </div>
      </footer>
    </div>
  );
}