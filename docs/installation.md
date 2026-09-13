# Installation Guide

NEXUS runs anywhere Docker runs: Linux, macOS and Windows. Everything is
containerized by default — you only need Node.js for local development or to
use the CLI.

## Requirements

| Component   | Requirement                                             |
| ----------- | ------------------------------------------------------- |
| Docker      | Docker 24+ with Docker Compose (v2)                     |
| Node.js     | ≥ 20 (only for local development / CLI)                 |
| Memory      | ≥ 4 GB RAM recommended (more if you run local models)   |
| Disk        | ≥ 2 GB free                                             |
| Ollama      | Optional, for fully local models                        |

Check your setup:

```bash
docker --version    # Docker
docker compose version
node --version      # only needed for local dev / CLI
```

## Quick start

```bash
git clone <repository-url>
cd nexus
cp .env.example .env
docker compose up -d
```

Open <http://localhost:3000>.

| Service   | URL                       | Notes                        |
| --------- | ------------------------- | ---------------------------- |
| Web       | http://localhost:3000     | NEXUS panel                  |
| API       | http://localhost:3001     | REST API                     |
| API docs  | http://localhost:3001/docs| Swagger UI                   |
| PostgreSQL| localhost:5432            | `nexus` / `nexus` / `nexus`  |
| Redis     | localhost:6379            |                              |

On first launch the web panel shows the NEXUS welcome screen.

## Platform-specific notes

### Linux

Docker Desktop is not required. Install the Docker Engine and the
`docker-compose-plugin` package for your distribution, then:

```bash
systemctl --user enable --now docker    # or: sudo systemctl enable --now docker
docker compose up -d
```

Ollama on the host at `http://localhost:11434` is reachable from the API
container via `http://host.docker.internal:11434` (already configured in
`docker-compose.yml`).

### macOS

Install Docker Desktop or colima:

```bash
brew install colima docker docker-compose
colima start
docker compose up -d
```

Docker Desktop automatically provides `host.docker.internal`.

### Windows

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   and ensure the **WSL 2 backend** is enabled.
2. From PowerShell or WSL:

   ```powershell
   git clone <repository-url>
   cd nexus
   Copy-Item .env.example .env
   docker compose up -d
   ```

3. Open <http://localhost:3000>.

If your project folder is on a Windows drive and you use WSL, first move the
repo under the WSL filesystem (`~/nexus`) for best performance.

## Configuration

Copy `.env.example` to `.env` and add your API keys. Never commit `.env`.

```env
DATABASE_URL=postgresql://nexus:nexus@localhost:5432/nexus?schema=public
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
MISTRAL_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434
```

After changing `.env`, restart the stack:

```bash
docker compose up -d --force-recreate
```

## Updating

```bash
git pull
docker compose build
docker compose up -d
```

Database migrations run automatically via the `migrate` service on startup.

## Backup

The database volume holds all your data:

```bash
# Dump the database
docker compose exec postgres pg_dump -U nexus nexus > nexus_backup_$(date +%F).sql

# Restore
cat nexus_backup_2026-01-01.sql | docker compose exec -T postgres psql -U nexus nexus
```

## Troubleshooting

### The panel loads but the API is not reachable

- Check services: `docker compose ps`
- Check API logs: `docker compose logs api`
- Make sure ports `3000` and `3001` are free.
- Run `nexus doctor` (or use the CLI `doctor` command) for a diagnosis.

### First run, database not migrated

The `migrate` service seeds and migrates automatically. Verify:

```bash
docker compose logs migrate
```

To run it manually:

```bash
docker compose run --rm migrate
```

### Ollama not reachable

- Confirm Ollama is running: `curl http://localhost:11434/api/tags`
- In Docker, the API uses `http://host.docker.internal:11434`.
  On Linux without Docker Desktop add `--add-host=host.docker.internal:host-gateway`
  (already present in the compose file).

### Port already in use

Change the exposed host ports in `docker-compose.yml` (e.g. `"3000:3000"` →
`"8080:3000"`) and update `NEXUS_WEB_URL` accordingly.

### Reset everything

```bash
docker compose down -v          # removes volumes too
docker compose up -d
```

This deletes **all** data, including sessions and projects.