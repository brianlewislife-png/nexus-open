# AGENTS.md

Guidance for AI agents working in the NEXUS repository.

## Project

NEXUS is an open-source, self-hosted AI workspace (monorepo). Apps live in
`apps/`, shared packages in `packages/`.

## Verification commands

Run these after making changes:

```bash
npm install                 # install deps (workspaces hoist to the root)
npm run typecheck           # turbo typecheck across all workspace packages
npm run build               # turbo build (also regenerates dist)
npm test                    # node --test scripts/smoke.test.mjs (needs dist first)
npm run lint                # turbo lint (no linters configured yet)
```

Prisma schema changes:

```bash
npx prisma generate         # from packages/database
npx prisma migrate dev      # needs a running PostgreSQL (docker compose up -d postgres)
```

## Important rules

- **No real API keys.** Keys are read server-side from the environment only.
  `.env` is git-ignored; only `.env.example` (placeholders) is committed.
- **AI provider abstraction.** The API talks to providers through
  `AIProvider` in `packages/ai` (`createProvider(slug, config)`). Never call a
  provider SDK directly from `apps/api`.
- `packages/core` owns all business logic via the Prisma client from
  `@nexus/database`. Routes stay thin.
- Agents/sessions may exist without a project (`projectId` is nullable).
- All API responses use the `ApiResponse` envelope `{ success, data?/error? }`.
- Typescript strict mode everywhere. No `any` outside narrow compatibility
  boundaries.

## Workspace package names

- `@nexus/shared` (packages/shared)
- `@nexus/config` (packages/config)
- `@nexus/database` (packages/database)
- `@nexus/core` (packages/core)
- `@nexus/ai` (packages/ai)
- `@nexus/api` (apps/api)
- `nexus-cli` (apps/cli)
- `@nexus/web` (apps/web)