# Security Policy

NEXUS takes security seriously. This document describes how to report
vulnerabilities and the expectations we set for the project's security
behavior.

## Supported Versions

| Version       | Supported          |
| ------------- | ------------------ |
| 0.1.0 (latest) | :white_check_mark: |

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Report vulnerabilities privately by opening a security advisory on GitHub or by
contacting the project maintainers directly.

When reporting, include:

- The affected version(s)
- A description of the vulnerability (type, impact)
- Steps to reproduce (redacting any personal credentials)
- Suggested fix, if you have one

You can expect:

- An acknowledgement within **48 hours**.
- A status update within **5 business days**.
- Coordination on disclosure timing if a fix is needed.

## Security commitments

NEXUS is designed with the following security principles:

### Secrets

- API keys are **never** stored in the repository, committed, or logged.
- Keys are read server-side from environment variables only.
- `.env` is git-ignored; `.env.example` contains placeholders only.
- Logs must never include keys, tokens, or secrets. The activity system
  records *events*, not credentials.

### Agent permissions

- Agents receive **no permissions by default**.
- Capabilities must be granted explicitly per agent:
  - `FILES_READ`, `FILES_WRITE`, `TERMINAL`, `GIT`, `NETWORK`,
    `BROWSER`, `MCP`
- Dangerous operations (terminal, network, browser) require explicit and
  deliberate configuration.
- Workspace isolation is enforced, agents must not access files or execute
  commands outside their assigned workspace without explicit permission.

### API

- Inputs are validated with type-safe schemas (zod).
- Endpoints are protected with rate limiting.
- Errors return safe messages that do not leak internals.
- Authentication/authorization hooks are prepared for the auth roadmap.

### MCP

- MCP servers can be given restricted permissions and are treated as
  untrusted until explicitly configured otherwise.
- MCP server configuration is isolated per agent/project.

## Safe local deployment

For a single-operator self-hosted instance:

1. Keep `docker compose` services on a private network.
2. Set real API keys only in your local `.env`, never in a shared file.
3. Keep the exposed panel behind a reverse proxy with TLS (recommended).
4. Apply OS-level updates to your host regularly.

## Security.txt

Once the project has official domains, a `security.txt` will be published
there. Until then, use the channels described above.