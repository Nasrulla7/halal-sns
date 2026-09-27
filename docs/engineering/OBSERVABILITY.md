# HALAL-INVEST: Observability & Audit Architecture

## 1. System Metrics & Telemetry
- API latency per endpoint (p50, p95, p99).
- Error counts and unhandled exception traces.
- Source adapter uptime and response latency.

## 2. Investment Audit Trail
Every assessment outcome is written to `audit_logs` with:
- Timestamp (UTC).
- Instrument Symbol and ISIN.
- Deterministic calculation checksum.
- Shariah decision and ratio snapshot.
- Assessment decision (`BUY_CANDIDATE`, `WAIT_INVESTIGATE`, `AVOID_NOT_A_CANDIDATE`, etc.).
- Provenance references.
