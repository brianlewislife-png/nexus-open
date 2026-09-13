<div align="center">

  ![Uploading image.png…]()

<img src="docs/images/logo.svg" alt="NEXUS" width="120" />

# NEXUS, Open Source AI Workspace

**Stop switching between AI tools. Build in one place.**

NEXUS is an open-source, self-hosted AI workspace for managing models, agents,
tools, skills and development projects in one place.

`Open Source` · `Self-Hosted` · `Multi-Provider`

**🎂 Special Anniversary Edition, September 13, 2026**

Created by **Brian Lewis**

---

[Installation](#installation) · [Architecture](#architecture) · [Documentation](docs/) · [CLI](#cli) · [Contributing](CONTRIBUTING.md)

</div>

---

## What is NEXUS?

Developers constantly switch between AI platforms, terminals, projects and
tools. NEXUS is a single, professional, self-hosted workspace that connects
models, agents, tools, skills and projects in one place.

NEXUS is **not** a replacement for AI services. It is a **layer of
organization and control** on top of them:

```
                     NEXUS

            Models + Agents + Tools
                      +
            Projects + Context
                      +
            Skills + MCP
                      +
            Permissions + Activity
                      ↓
                 One Workspace
```

## Features

- **Multi-provider AI abstraction**: OpenAI, Google Gemini, Mistral and
  Ollama behind a single `AIProvider` interface. Add new providers without
  rewriting the core.
- **Agent management**: create, edit, duplicate and delete agents, assign
  models, tools, skills, projects and system prompts.
- **Explicit permission system**: filesystem, terminal, Git, network, browser
  and MCP capabilities are never granted by default. Agents operate under
  explicit permissions only.
- **Projects & context**: organize agents, sessions and context files per
  project workspace.
- **Sessions & chat**: a professional chat interface with tool activity
  shown inline. Nothing important is ever hidden.
- **Activity & logs**: every important event (session started, model used,
  tool executed, error) is recorded. Secrets are never logged.
- **Skills**: versioned, authored skill definitions with instructions and
  auxiliary files; architecture ready for a future catalog/marketplace.
- **MCP**: configure MCP servers and associate them with agents/projects.
  Every server can be treated as untrusted until you say otherwise.
- **Official CLI**: manage the workspace from your terminal.
- **Docker-first**: one command to start everything.

## Supported AI Providers

| Provider  | Package / SDK            | API key env var      |
| --------- | ------------------------ | -------------------- |
| OpenAI    | `openai`                 | `OPENAI_API_KEY`     |
| Google Gemini | `@google/generative-ai` | `GEMINI_API_KEY`     |
| Mistral   | `@mistralai/mistralai`   | `MISTRAL_API_KEY`    |
| Ollama    | HTTP (REST)              | `OLLAMA_BASE_URL`    |

## Architecture

```
nexus/
├── apps/
│   ├── web/          # Next.js frontend (App Router, Tailwind, shadcn/ui)
│   ├── api/          # Fastify REST API
│   └── cli/          # Official NEXUS CLI
├── packages/
│   ├── core/         # Business logic services
│   ├── ai/           # AI provider abstraction (OpenAI/Gemini/Mistral/Ollama)
│   ├── database/     # Prisma schema, migrations and seed
│   ├── config/       # Zod-validated environment configuration
│   └── shared/       # Shared types, permissions and utilities
├── docker/           # Docker helper assets
├── docs/             # Documentation
└── scripts/          # Dev/ops scripts
```

## Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, TypeScript, Fastify
- **Database:** PostgreSQL + Prisma ORM
- **Infra:** Docker, Docker Compose, Redis
- **CLI:** Node.js/TypeScript

## Installation

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- Node.js ≥ 20 (only needed for local development or the CLI)

### Quick start (Docker)

```bash
git clone <repository-url>
cd nexus
cp .env.example .env
docker compose up -d
```

Then open <http://localhost:3000>.

The first time you open the panel you will see the NEXUS welcome screen.
The API runs at <http://localhost:3001> (Swagger docs at `/docs`).

### Local development

```bash
# 1. Start PostgreSQL and Redis via Docker
docker compose up -d postgres redis

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# add your API keys to .env

# 4. Run migrations and seed
npm run db:migrate
npm run db:seed

# 5. Start the workspace
npm run dev
```

Open <http://localhost:3000> (web) and <http://localhost:3001/docs> (API).

## Configuration

Copy `.env.example` to `.env` and fill in values:

```env
DATABASE_URL=postgresql://nexus:nexus@localhost:5432/nexus?schema=public
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
MISTRAL_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434
```

**NEXUS never ships or commits real API keys.** The `.env` file is git-ignored
and `.env.example` contains placeholders only.

### Ollama

NEXUS supports [Ollama](https://ollama.com) for fully local models.

1. Install Ollama and pull a model: `ollama pull llama3.1:8b`
2. Keep `OLLAMA_BASE_URL` at `http://localhost:11434` (default).

Inside Docker, the API reaches a host Ollama through
`http://host.docker.internal:11434`.

## CLI

The official NEXUS CLI talks to the NEXUS API.

```bash
npm run build --workspace=nexus-cli   # or install globally: npm i -g ./apps/cli
nexus --help

nexus status          # API status
nexus agents          # list agents
nexus models          # list providers and models
nexus projects        # list projects
nexus logs            # recent activity
nexus doctor          # run diagnostics
nexus sessions        # recent sessions
nexus chat --agent <id> --message "hello"   # chat with an agent
```

See [CLI documentation](docs/cli.md).

## Security

- API keys are only read server-side from the environment; they are **never**
  exposed to the frontend and never logged.
- Agents require **explicit permissions** for filesystem, terminal, Git,
  network, browser and MCP operations.
- Endpoints are validated with zod and protected by rate limiting.
- Workspace isolation is a first-class concern, dangerous tools cannot run
  without explicit control.

See [SECURITY.md](SECURITY.md) for details and the responsible disclosure
process.

## Roadmap

- [x] Multi-provider AI abstraction (OpenAI, Gemini, Mistral, Ollama)
- [x] Agents, projects, sessions, messages, activity
- [x] Permissions system
- [x] Official CLI
- [x] Docker + Compose deployment
- [ ] Filesystem / Git / Terminal tool executors (permission-gated)
- [ ] MCP client runtime
- [ ] Skill catalog / marketplace
- [ ] Authentication (users, JWT)
- [ ] Streaming chat responses
- [ ] Background jobs with Redis queues

See the [docs](docs/) for more.

## Contributing

Contributions are welcome! Read [CONTRIBUTING.md](CONTRIBUTING.md) and our
[Code of Conduct](CODE_OF_CONDUCT.md) before opening a PR.

## License

[MIT](LICENSE)

## Credits

Created by **Brian Lewis** released as the **Special Anniversary Edition** on
**September 13, 2026**.

---

<div align="center">

**NEXUS, Open Source AI Workspace**

Created by Brian Lewis · September 13, 2026

</div>
