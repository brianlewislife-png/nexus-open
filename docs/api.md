# NEXUS API

The NEXUS API is a Fastify REST API. Base URL: `http://localhost:3001/api`
(`http://localhost:3001/docs` for the Swagger UI).

All responses use a common envelope:

```json
{ "success": true, "data": { ... } }
```

Errors:

```json
{ "success": false, "error": "message" }
```

## Health

| Method | Path       | Description                        |
| ------ | ---------- | ---------------------------------- |
| GET    | /api/health | Server + database health           |

## Projects

| Method | Path                | Description                  |
| ------ | ------------------- | ---------------------------- |
| GET    | /api/projects       | List projects (`?search=`)   |
| POST   | /api/projects       | Create project               |
| GET    | /api/projects/:id   | Get project with relations   |
| PATCH  | /api/projects/:id   | Update project               |
| DELETE | /api/projects/:id   | Delete project               |

Create body:

```json
{ "name": "E-commerce", "description": "Store platform", "directory": "/workspaces/ecommerce" }
```

## Agents

| Method  | Path                     | Description             |
| ------- | ------------------------ | ----------------------- |
| GET     | /api/agents              | List agents (`?projectId=`) |
| POST    | /api/agents              | Create agent            |
| GET     | /api/agents/:id          | Get agent with model    |
| PATCH   | /api/agents/:id          | Update agent            |
| DELETE  | /api/agents/:id          | Delete agent            |
| POST    | /api/agents/:id/duplicate| Duplicate agent         |

Create body:

```json
{
  "name": "Backend Agent",
  "description": "Handles API work",
  "systemPrompt": "You are a backend developer.",
  "modelId": "clx...",
  "projectId": "clx...",
  "permissions": { "allowed": ["FILES_READ", "FILES_WRITE", "GIT"], "denied": ["TERMINAL", "NETWORK"] },
  "tools": ["git", "files"],
  "skills": ["code-review"]
}
```

## Providers & Models

| Method | Path                  | Description                |
| ------ | --------------------- | -------------------------- |
| GET    | /api/providers        | List providers             |
| GET    | /api/models           | List models (`?provider=`) |
| GET    | /api/models/:id       | Get model                  |

## Sessions

| Method | Path             | Description                       |
| ------ | ---------------- | --------------------------------- |
| GET    | /api/sessions    | List sessions (`?agentId=&projectId=&status=`) |
| POST   | /api/sessions    | Create session                    |
| GET    | /api/sessions/:id| Get session with messages         |

Create body:

```json
{ "title": "Bug hunt", "agentId": "clx...", "projectId": "clx..." }
```

## Messages

| Method | Path                       | Description          |
| ------ | -------------------------- | -------------------- |
| GET    | /api/sessions/:id/messages | List session messages|
| POST   | /api/sessions/:id/messages | Create a user message|

## Chat

| Method | Path       | Description                                       |
| ------ | ---------- | ------------------------------------------------- |
| POST   | /api/chat  | Send a message; the agent's model answers         |

Body:

```json
{ "sessionId": "clx...", "message": "Hello!" }
```

The server builds the provider from the agent's assigned model, calls it
through the `AIProvider` interface, stores both messages, and returns them:

```json
{
  "success": true,
  "data": {
    "userMessage": { "id": "...", "content": "Hello!", "role": "user" },
    "assistantMessage": { "id": "...", "content": "Hi there!", "role": "assistant" }
  }
}
```

## Skills

| Method | Path            | Description        |
| ------ | --------------- | ------------------ |
| GET    | /api/skills     | List skills        |
| POST   | /api/skills     | Create skill       |
| GET    | /api/skills/:id | Get skill          |
| PATCH  | /api/skills/:id | Update skill       |
| DELETE | /api/skills/:id | Delete skill       |

Body:

```json
{ "name": "Code Review", "description": "Runs a strict review", "version": "1.0.0", "author": "Brian Lewis", "instructions": "Review the diff for correctness..." }
```

## Tools

| Method | Path          | Description      |
| ------ | ------------- | ---------------- |
| GET    | /api/tools    | List tools       |
| POST   | /api/tools    | Create tool      |
| GET    | /api/tools/:id| Get tool         |
| PATCH  | /api/tools/:id| Update tool      |
| DELETE | /api/tools/:id| Delete tool      |

## MCP

| Method | Path          | Description         |
| ------ | ------------- | ------------------- |
| GET    | /api/mcp      | List MCP servers    |
| POST   | /api/mcp      | Create server       |
| GET    | /api/mcp/:id  | Get server          |
| PATCH  | /api/mcp/:id  | Update server       |
| DELETE | /api/mcp/:id  | Delete server       |

## Activity

| Method | Path         | Description                          |
| ------ | ------------ | ------------------------------------ |
| GET    | /api/activity| List activity (`?level=&entityType=&page=&pageSize=`) |

## Settings

| Method | Path               | Description            |
| ------ | ------------------ | ---------------------- |
| GET    | /api/settings      | List settings          |
| GET    | /api/settings/:key | Get one setting        |
| PUT    | /api/settings/:key | Set a setting          |

`PUT /api/settings/welcome_screen_shown` with `{ "value": true }` dismisses the
welcome screen permanently.