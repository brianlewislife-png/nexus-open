FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/cli/package.json apps/cli/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/ai/package.json packages/ai/package.json
RUN npm ci --ignore-scripts

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL=postgresql://nexus:nexus@postgres:5432/nexus?schema=public
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma \
  && npx turbo run build --filter=@nexus/api

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=builder /app/ /app/
ENV NODE_ENV=production
ENV PORT=3001
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/index.js"]