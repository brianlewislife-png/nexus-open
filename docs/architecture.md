# Architecture

NEXUS is a Turborepo monorepo with three applications and five shared packages.

```
nexus/
├── apps/
│   ├── web/          # Next.js App Router frontend (Tailwind + shadcn/ui)
│   ├── api/          # Fastify REST API
│   └── cli/          # Official NEXUS CLI
├── packages/
│   ├── core/         # Business logic services on top of Prisma
│   ├── ai/           # AI provider abstraction layer
│   ├── database/     # Prisma schema, migrations, seed
│   ├── config/       # Zod-validated environment configuration
│   └── shared/       # Shared types, permission constants, utilities
├── docker/           # Docker assets
├── docs/             # Documentation
└── scripts/          # Helper scripts
```

## Data flow

```
Web (Next.js) ──> Fastify API ──> @nexus/core services ──> Prisma ──> PostgreSQL
                     │  ▲
                     │  └── @nexus/ai providers ──> OpenAI / Gemini / Mistral / Ollama
                     │
                     └── ActivityLog (every important event)
```

- The **web** app talks only to the **API** over REST.
- The **CLI** talks only to the **API** over REST.
- The **API** never calls provider SDKs directly, it uses the
  `AIProvider` interface from `@nexus/ai`.
- The **core** package owns all business rules and writes activity events.

## AI provider abstraction

`packages/ai` defines:

```
AIProvider
├── OpenAIProvider   (openai SDK)
├── GeminiProvider   (@google/generative-ai)
├── MistralProvider  (@mistralai/mistralai)
└── OllamaProvider   (REST over HTTP)
```

The rest of the application talks to `AIProvider`; adding a provider means
implementing one interface and registering it in the factory
(`createProvider`). API keys are resolved server-side from the environment
(`OPENAI_API_KEY`, `GEMINI_API_KEY`, `MISTRAL_API_KEY`, `OLLAMA_BASE_URL`).

## Permission model

- Agents have explicit `allowed` / `denied` permission sets.
- Permission keys: `FILES_READ`, `FILES_WRITE`, `TERMINAL`, `GIT`,
  `NETWORK`, `BROWSER`, `MCP`.
- Nothing is granted by default; dangerous tools require deliberate
  configuration and workspace isolation is enforced.

## Database

PostgreSQL with Prisma. Models: `User`, `Project`, `Agent`, `Provider`,
`Model`, `Session`, `Message`, `Tool`, `Skill`, `MCPServer`,
`ActivityLog`, `Setting`. Migrations live in `packages/database/prisma/migrations`.

## Security boundaries

- Secrets never leave the server; the frontend receives no keys.
- Every route validates input with zod and is rate-limited.
- Activity logging never includes secrets.
- MCP servers are untrusted by default and scoped per agent/project.

## Extension points

- **New provider** → implement `AIProvider`, register in `createProvider`.
- **New tool** → define capability + permissions in the shared package.
- **New skill** → model already supports version, author, files, metadata.
- **MCP** → architecture ready for a client runtime (roadmap).
- **Authentication** → `User` model and JWT env hook are prepared.