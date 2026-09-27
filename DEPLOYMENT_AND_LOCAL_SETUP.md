# Halal-Invest Local Mac Deployment & Setup Guide

This guide explains how to run the exact same **Halal-Invest** application locally on your Mac using Docker Compose with automatic PostgreSQL persistence and FYERS Sandbox/Live broker integration.

---

## Architecture Overview

Starting the application launches two isolated containers connected via a private network:
1. **Container 1 (`halal-invest-app`):** The full-stack Halal-Invest web application (Vite React SPA, Express API, Shariah compliance engine, Price Alert background worker powered by Bun and `bun.lock`).
2. **Container 2 (`halal-invest-postgres`):** Official PostgreSQL 16 database with persistent storage volume (`halal_invest_postgres_data`) that automatically runs migrations and seeds default financial and governance records on first launch.

---

## Quick Start: 1-Command Launch on Mac

### Step 1: Install Docker Desktop on macOS (if not already installed)
1. Download **Docker Desktop for Mac**:
   - For Apple Silicon Macs (M1/M2/M3/M4): [Download Apple Silicon DMG](https://www.docker.com/products/docker-desktop/)
   - For Intel Macs: [Download Intel DMG](https://www.docker.com/products/docker-desktop/)
2. Open the downloaded `.dmg`, drag Docker into your Applications folder, and launch it.

### Step 2: Configure Environment File
In the project directory on your Mac, create your local `.env` file from `.env.example`:
```bash
cp .env.example .env
```

*(By default, `.env` is pre-configured with `FYERS_SANDBOX=true`, meaning you can test the complete system immediately without entering broker keys.)*

### Step 3: Start Containers with One Command
Run the following in Terminal from the project root:
```bash
docker compose up -d --build
```

### Step 4: Open the Application
Open your web browser (Safari, Chrome, or Firefox) and navigate to:
```
http://localhost:3000
```

Both containers are now running in the background.

---

## Where to Provide Real FYERS Credentials Later

When you are ready to connect to real live market feeds and sync your authentic FYERS broker account:

1. Log in to the [FYERS API Dashboard](https://myapi.fyers.in/).
2. Create an App with:
   - **App Type:** Personal / Internal
   - **Redirect URI:** `http://localhost:3000/api/fyers/callback`
3. Open your `.env` file on your Mac and fill in your details:
   ```env
   # Switch off sandbox mode
   FYERS_SANDBOX=false

   # Enter your official FYERS API v3 credentials
   FYERS_APP_ID="YOUR_APP_ID-100"
   FYERS_SECRET_KEY="YOUR_SECRET_KEY"
   FYERS_REDIRECT_URI="http://localhost:3000/api/fyers/callback"
   ```
4. Restart the app container to load the credentials:
   ```bash
   docker compose restart app
   ```
5. Click **"FYERS: Connect"** in the top navigation bar of the application:
   - Click **"Open Official FYERS Login Window"**.
   - Authenticate with your FYERS mobile OTP/PIN.
   - Paste the authorization code back into Step 2 and click **"Validate Code"**.

*(Note: Capital safety invariant remains strictly enforced—automated trading is architecturally blocked under both Sandbox and Live modes. Only CNC manual delivery tickets are generated.)*

---

## Testing in FYERS Sandbox Mode (Without Real Credentials)

You do **not** need real broker credentials to test:
1. Open `http://localhost:3000` and click the **"FYERS: Connect"** button in the top navigation bar.
2. Under Step 2, click **"Use Sandbox Test Code (SANDBOX-TEST-CODE-2026)"** and press **Validate Code**.
3. The gateway will immediately connect in **Sandbox Simulator Mode**:
   - Quotes feed activates with simulated micro-price variance around verified exchange disclosures.
   - You can create price alerts for TCS, INFY, etc.
   - The 30-second background worker evaluates alert triggers against the feed.
   - You can generate pre-filled CNC delivery tickets with a single click.

---

## Automatic PostgreSQL Persistence Verification

Data persists across container restarts, computer reboots, and image updates:

- **Persistent Volume:** Stored in the Docker-managed volume `halal_invest_postgres_data`.
- **Automatic Initialization:** On first launch, `src/db/schema.sql` creates all 12 tables and indices, and `PostgresService` automatically seeds initial instruments, financial statements, and user rules.
- **Restarting without losing data:**
  ```bash
  # Stop containers safely:
  docker compose stop

  # Start containers again:
  docker compose start
  ```
  All user rules, price alerts, watchlists, and triggered events will remain exactly as you left them.

---

## Timezone Verification in KSA (Kingdom of Saudi Arabia)

The application dynamically detects your browser's local timezone:
- When accessed from Saudi Arabia, times format automatically as **Asia/Riyadh (AST, UTC+3)**.
- For example, NSE Market Hours (09:15 - 15:30 IST) will automatically display alongside your local KSA time: **(06:45 - 13:00 AST)**.
- To inspect or override your timezone, go to **Settings & Governance Rules** $\rightarrow$ **Regional Timezone & Localisation**.

---

## Helpful Docker Management Commands

| Action | Command |
| :--- | :--- |
| **View real-time logs** | `docker compose logs -f app` |
| **Check container status** | `docker compose ps` |
| **Restart application** | `docker compose restart app` |
| **Stop everything** | `docker compose down` |
| **Access PostgreSQL CLI** | `docker compose exec postgres psql -U halal_user -d halal_invest` |
| **Backup database to SQL file** | `docker compose exec postgres pg_dump -U halal_user halal_invest > backup.sql` |
