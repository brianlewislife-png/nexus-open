# Configuration

All NEXUS configuration happens through environment variables, centralized in
`.env` (see `.env.example`). Values are validated at boot by `@nexus/config`.

## Variables

| Variable             | Default                  | Description                                  |
| -------------------- | ------------------------ | -------------------------------------------- |
| `NODE_ENV`           | `development`            | Runtime environment                          |
| `DATABASE_URL`       | —                        | PostgreSQL connection string (required)      |
| `REDIS_URL`          | —                        | Redis URL (reserved for queues/cache)        |
| `PORT`               | `3001`                   | API port                                     |
| `OPENAI_API_KEY`     | —                        | OpenAI key (enables OpenAI provider)         |
| `GEMINI_API_KEY`     | —                        | Google Gemini key                            |
| `MISTRAL_API_KEY`    | —                        | Mistral key                                  |
| `OLLAMA_BASE_URL`    | `http://localhost:11434` | Ollama server                                |
| `NEXUS_BASE_URL`     | `http://localhost:3001`  | API URL (also used by the CLI)               |
| `NEXUS_WEB_URL`      | `http://localhost:3000`  | Web panel origin (CORS)                      |
| `NEXT_PUBLIC_API_URL`| `http://localhost:3001`  | API URL used by the browser                  |
| `JWT_SECRET`         | —                        | Reserved for future auth                     |
| `LOG_LEVEL`          | `info`                   | pino log level                               |

## Providers

A provider appears in the UI only when seeded (done by default) and becomes
usable once its key is configured:

- **OpenAI** — set `OPENAI_API_KEY`
- **Google Gemini** — set `GEMINI_API_KEY`
- **Mistral** — set `MISTRAL_API_KEY`
- **Ollama** — set `OLLAMA_BASE_URL`; works with zero keys

Run `nexus doctor` to check which providers are configured.

## Social / official links

The welcome screen and landing page show configurable social links. Set these
in `.env` (they stay empty/placeholder until real links are provided):

```env
NEXUS_URL_GITHUB=
NEXUS_URL_WEBSITE=
NEXUS_URL_INSTAGRAM=
NEXUS_URL_TELEGRAM=
NEXUS_URL_WHATSAPP=
```

## Seeding models

The seed (`packages/database/prisma/seed.ts`) registers default providers and
models. To re-run it:

```bash
npm run db:seed
```

or inside Docker:

```bash
docker compose run --rm migrate
```