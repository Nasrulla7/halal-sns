# Halal-Invest Platform

Evidence-first halal investment research, screening, monitoring, and portfolio assessment platform.

## Quick Start on macOS / Local Environment

For comprehensive local deployment with Docker & PostgreSQL, please see [`DEPLOYMENT_AND_LOCAL_SETUP.md`](./DEPLOYMENT_AND_LOCAL_SETUP.md).

### 1. Requirements
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS / Linux / Windows)
- Alternatively: [Bun](https://bun.sh) (v1.0+) or Node.js (v20+)

### 2. Run with Docker Compose (Recommended)
```bash
# 1. Clone/extract project & enter directory
cd halal-invest

# 2. Copy sample environment file
cp .env.example .env

# 3. Build & start full application + PostgreSQL
docker compose up -d --build
```
Access the application at [http://localhost:3000](http://localhost:3000).

### 3. Run Locally with Bun or Node.js
```bash
# Install dependencies
bun install   # or: npm install

# Run test suite
bun run test  # or: npm test

# Start development server
bun run dev   # or: npm run dev
```

---

## What's Included in this Project

- `Dockerfile`: Multi-stage Alpine container for production execution.
- `docker-compose.yml`: Automated 1-command service orchestration for web app and PostgreSQL 16.
- `package.json` & `bun.lock`: Application dependencies and lockfile.
- `.env.example`: Configurable environment variables (PostgreSQL, FYERS Sandbox/Live credentials).
- `server.ts`: Full-stack Express backend server and REST endpoints.
- `src/`: Complete React TypeScript frontend, Shariah engine, calculators, and broker adapters.
- `src/db/schema.sql`: PostgreSQL relational database schema and indexes.
- `DEPLOYMENT_AND_LOCAL_SETUP.md`: Full macOS setup and verification manual.
