# HALAL-INVEST: Data Architecture

## 1. Storage Strategy
- **Primary Relational Core:** PostgreSQL schema designed with strict primary/foreign key constraints, audit timestamps, and JSONB fields for immutable evidence packets.
- **Embedded/Test Engine:** Transactional memory repository mirroring the PostgreSQL schema for zero-dependency local execution and instant unit/integration testing.

## 2. Ingestion & Provenance Model
Every data field ingested or derived tracks:
- `metric`: Machine name of the value (e.g. `operating_profit_margin`).
- `value`: Numerical or structured representation.
- `period`: Associated fiscal quarter or annual period (e.g. `FY2024`).
- `statementScope`: `CONSOLIDATED` or `STANDALONE` (mixing without explicit normalization is strictly prohibited).
- `source`: Filing name, regulatory source, or adapter identifier.
- `retrievalTimestamp`: Exact ISO-8601 timestamp when fetched.
- `confidence`: `STRONG`, `MODERATE`, `LIMITED`, or `INSUFFICIENT`.
- `formula`: Plain mathematical expression used to derive the metric.

## 3. Scope Isolation
- **Consolidated vs. Standalone:** Both are maintained separately. Group-level metrics default to Consolidated; Standalone is preserved for parent company balance sheet audits.
- **TTM (Trailing Twelve Months):** Computed strictly as `Latest Q + (Latest Annual - Prior Year Matching 9M)` when complete quarterly filings are present.
- **Restatements:** Original values remain intact in audit logs; restated figures are stored with `restatementDate` and reason.
