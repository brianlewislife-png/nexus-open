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
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_NEXUS_URL_GITHUB=
ARG NEXT_PUBLIC_NEXUS_URL_WEBSITE=
ARG NEXT_PUBLIC_NEXUS_URL_INSTAGRAM=
ARG NEXT_PUBLIC_NEXUS_URL_TELEGRAM=
ARG NEXT_PUBLIC_NEXUS_URL_WHATSAPP=
ENV DATABASE_URL=postgresql://nexus:nexus@postgres:5432/nexus?schema=public
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_NEXUS_URL_GITHUB=$NEXT_PUBLIC_NEXUS_URL_GITHUB
ENV NEXT_PUBLIC_NEXUS_URL_WEBSITE=$NEXT_PUBLIC_NEXUS_URL_WEBSITE
ENV NEXT_PUBLIC_NEXUS_URL_INSTAGRAM=$NEXT_PUBLIC_NEXUS_URL_INSTAGRAM
ENV NEXT_PUBLIC_NEXUS_URL_TELEGRAM=$NEXT_PUBLIC_NEXUS_URL_TELEGRAM
ENV NEXT_PUBLIC_NEXUS_URL_WHATSAPP=$NEXT_PUBLIC_NEXUS_URL_WHATSAPP
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma \
  && npx turbo run build --filter=@nexus/web

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=builder /app/ /app/
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]