# ============================================================
# HALAL-INVEST PRODUCTION DOCKERFILE
# Multi-stage lightweight build using Bun + Vite + Express
# ============================================================

FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install build dependencies using Bun's native lockfile
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy full application source
COPY . .

# Compile client production bundle
RUN bun run build

# ============================================================
# Production Runner Stage
# ============================================================
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy package definitions and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy application source, compiled client bundle, and database schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/vite.config.ts ./vite.config.ts

EXPOSE 3000

# Healthcheck to verify the web service is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Start the full-stack server
CMD ["bun", "server.ts"]
