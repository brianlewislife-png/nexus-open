# NEXUS CLI

The official NEXUS CLI is a terminal interface to the NEXUS API. It is a
Node.js/TypeScript application in `apps/cli`.

## Installation

```bash
# From inside the repository
npm install
npm run build --workspace=nexus-cli
npm i -g ./apps/cli

# Verify
nexus --help
```

The CLI talks to the API at `NEXUS_BASE_URL` (default `http://localhost:3001`),
or use `--api-url`:

```bash
nexus --api-url http://my-nexus:3001 status
```

## Commands

### `nexus`

With no arguments, prints the banner and help.

### `nexus --help` / `nexus help [command]`

Global and per-command help.

### <code>nexus status</code>

Shows the API status: version, status, database connectivity and uptime. If
the API is not running it suggests starting the stack:

```bash
docker compose up -d
```

### `nexus agents`

Lists agents in a table (ID, name, model, project, status).

```bash
nexus agents create --name "Backend Agent" --model <modelId> [--project <projectId>] [--prompt "System prompt"]
nexus agents delete <agentId>
nexus agents duplicate <agentId>
nexus agents show <agentId>
```

### `nexus models [provider]`

Lists providers and their models. Passing a provider slug filters output.

### `nexus projects`

Lists projects with agent/session counts.

### `nexus logs [--limit N] [--level LEVEL]`

Shows recent activity events. Default limit is 20.

### `nexus sessions [--agent <id>] [--project <id>] [--limit N]`

Lists recent sessions.

### <code>nexus chat --session &lt;id&gt; --message "text"</code>

Sends a message to an existing session and prints the assistant response.

```bash
# Or start a new session from an agent
nexus chat --agent <agentId> --message "Hello" [--title "CLI Session"]
```

### `nexus doctor`

Runs diagnostics and prints a PASS/WARN/FAIL table:

- API reachability
- Database connectivity
- Provider API key configuration (OpenAI, Gemini, Mistral)
- Ollama reachability

Exit code `1` when any check fails; `0` otherwise.

## Examples

```bash
nexus status
nexus agents
nexus models
nexus models ollama
nexus doctor
```

## Exit codes

| Code | Meaning                     |
| ---- | --------------------------- |
| 0    | Success                     |
| 1    | Error (API down, bad input) |