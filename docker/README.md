# NEXUS docker helpers

This directory holds Docker-related assets. The Compose file at the repo root
orchestrates the stack.

## Services

`docker compose up -d` starts:

| Service   | Image / build        | Purpose                      |
| --------- | -------------------- | ---------------------------- |
| postgres  | postgres:16-alpine   | Database                     |
| redis     | redis:7-alpine       | Cache / queues (future)      |
| api       | build apps/api       | Fastify REST API             |
| web       | build apps/web       | Next.js panel                |
| migrate   | build packages/database | Runs migrations + seed    |

Migration and seed run once on startup and exit.

## Healthchecks

- postgres — `pg_isready`
- redis — `redis-cli ping`
- api — `wget /api/health`
- web — `wget /`

`depends_on: condition: service_healthy` keeps startup ordering correct.

## Host networking notes

The API reaches a host Ollama instance at
`http://host.docker.internal:11434` (already wired via `extra_hosts`).