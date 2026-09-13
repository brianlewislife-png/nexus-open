# Contributing to NEXUS

First off, thank you for taking the time to contribute! 🎉

NEXUS is an open-source AI workspace. We welcome contributions of all kinds:
bug reports, feature requests, docs, tests, and code.

## Table of contents

- [Code of Conduct](#code-of-conduct)
- [Getting started](#getting-started)
- [Development setup](#development-setup)
- [Project structure](#project-structure)
- [How to contribute](#how-to-contribute)
- [Pull request guidelines](#pull-request-guidelines)
- [Style guide](#style-guide)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by the
[NEXUS Code of Conduct](CODE_OF_CONDUCT.md). By participating you are expected
to uphold this code.

## Getting started

1. **Fork** the repository.
2. **Clone** your fork:

   ```bash
   git clone <your-fork-url>
   cd nexus
   ```

3. Start the infrastructure:

   ```bash
   docker compose up -d postgres redis
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Configure your environment:

   ```bash
   cp .env.example .env
   ```

6. Run migrations and seed:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

7. Start the dev workspace:

   ```bash
   npm run dev
   ```

   - Web: <http://localhost:3000>
   - API: <http://localhost:3001>
   - API docs: <http://localhost:3001/docs>

## Project structure

The repository is a Turborepo monorepo:

- `apps/web`, Next.js frontend
- `apps/api`, Fastify REST API
- `apps/cli`, Official NEXUS CLI
- `packages/core`, Business logic services
- `packages/ai`, AI provider abstraction
- `packages/database`, Prisma schema and seed
- `packages/config`, Environment configuration
- `packages/shared`, Shared types and utilities

## How to contribute

### Reporting bugs

Open an issue and include:

- NEXUS version
- Environment (OS, Node version, Docker version)
- Steps to reproduce
- Expected vs actual behavior
- Logs (redacted of any secrets)

### Requesting features

Open an issue using the feature template. Describe the problem, the proposed
solution, and any alternatives you considered.

### Working on an issue

1. Comment on the issue to let others know you're on it.
2. Create a branch: `git checkout -b feat/my-feature` or `fix/my-bug`.
3. Write your code following the [style guide](#style-guide).
4. Add or update tests where applicable.
5. Run the verification commands below.
6. Open a pull request.

## Pull request guidelines

- Keep changes focused and small. One PR per feature/fix.
- Prefix the title with the type (`feat:`, `fix:`, `docs:`, `chore:`).
- Reference the related issue in the description (`Closes #123`).
- Make sure the full pipeline passes:

  ```bash
  npm run lint
  npm run typecheck
  npm test
  npm run build
  ```

- Never commit `.env` files or real credentials.
- Keep the CHANGELOG / docs updated when behavior changes.

## Style guide

- **TypeScript**, strict mode, no `any` outside of clearly scoped
  compatibility boundaries.
- Naming: `camelCase` for functions/variables, `PascalCase` for types.
- Follow the existing conventions in the file you are editing.
- No comments unless they explain *why*, not *what*.
- Run `npm run lint` before committing.

## Community

- GitHub Issues, bug reports and feature requests
- Discussions, ideas and questions
- Announcements, official updates

## Special Anniversary Edition

NEXUS v0.1 "Special Anniversary Edition" honors **September 13, 2026**,
release of the first public version by **Brian Lewis**. Contributors who land
code before the release will be credited in the release notes.