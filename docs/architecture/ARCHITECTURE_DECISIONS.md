# HALAL-INVEST: Architecture Decision Records (ADRs)

## ADR-001: Modular Monolith V1
- **Status:** Accepted
- **Context:** Halal-Invest V1 requires low operational complexity, ₹0 recurring infrastructure cost, and strong developer velocity, while maintaining the flexibility to scale to thousands of users.
- **Decision:** Build as a clean Modular Monolith in TypeScript with strict internal domain boundaries (Financial Engine, Shariah Engine, Valuation Engine, Risk Engine, Evidence Registry, Adapter Layer).
- **Consequences:** Avoids distributed systems overhead (Kafka, Kubernetes, 15 microservices) while keeping domain services isolated and easily extractable if horizontal scaling is required later.

## ADR-002: PostgreSQL Primary Data Architecture
- **Status:** Accepted
- **Context:** Financial and research data requires strict relational integrity, ACID transactions, complex aggregations, auditability, and JSON document storage for evidence snapshots.
- **Decision:** Target PostgreSQL as primary production database. Provide in-memory/embedded transactional repository for test/dev execution.
- **Consequences:** No SQLite in production; high data integrity, strict foreign keys, immutable audit trails.

## ADR-003: FYERS Broker Adapter Isolation
- **Status:** Accepted
- **Context:** FYERS is the initial broker for the Indian equity market, providing market data, quotes, and portfolio sync. FYERS must never become the brain of Halal-Invest.
- **Decision:** Abstract FYERS behind a standardized `BrokerAdapter` interface. Keep all broker credentials strictly on the server-side. Never leak tokens to the browser.
- **Consequences:** Allows adding Saudi Arabia (Tadawul) or US broker adapters in the future without changing the core investment research engine.

## ADR-004: Strictly No Automatic Trading in V1
- **Status:** Accepted
- **Context:** User capital safety is paramount. Algorithmic execution poses severe tail risk and regulatory implications.
- **Decision:** Disallow all automated order placement, modification, or cancellation in V1. Halal-Invest provides verified research and explicit manual order guidance. The user manually executes inside their official FYERS terminal.
- **Consequences:** Eliminates automated trading bugs, eliminates regulatory algorithmic trading liabilities, and enforces user human-in-the-loop discipline.

## ADR-005: Evidence-First Provenance Architecture
- **Status:** Accepted
- **Context:** Investment analysis must not rely on unverified claims or secondary website figures.
- **Decision:** Every single financial fact and calculation must store complete provenance: `source`, `publicationDate`, `effectiveDate`, `retrievalTimestamp`, `statementScope` (Standalone vs Consolidated), `currency`, `confidence`, and `formula` if derived.
- **Consequences:** Users can click any metric to inspect its exact source document and calculation trace.

## ADR-006: Deterministic Calculations vs AI Interpretation
- **Status:** Accepted
- **Context:** Generative AI models are prone to numerical hallucinations, subtle mathematical inconsistencies, and ungrounded claims.
- **Decision:** All numerical calculations (P/E, P/B, ROE, ROCE, FCF, Margins, Debt/Equity, CAGRs, Shariah ratios) are computed 100% deterministically by audited TypeScript domain logic. AI is restricted to qualitative interpretation, thesis red-teaming, and structured summarization over verified evidence packets.
- **Consequences:** Zero numerical hallucination. High auditability.

## ADR-007: Shariah Screening as a Mandatory Hard Gate
- **Status:** Accepted
- **Context:** A company cannot receive a normal investment recommendation if it fails Shariah compliance.
- **Decision:** Shariah screening is a hard pre-condition gate. Both business activity screening (prohibited revenue < 5%) and financial ratio screening (debt/market cap < 33%, interest-bearing securities < 33%, receivables/assets < 50% under AAOIFI v2024 standards) must be evaluated. If non-compliant, the assessment is strictly blocked (`AVOID / NOT A CANDIDATE`). If information is missing, the assessment defaults to `NO DECISION — INSUFFICIENT EVIDENCE`.
- **Consequences:** Never recommend non-halal instruments; strictly enforce purification calculation.

## ADR-008: Strict Prohibition of Unauthorized Exchange Scraping
- **Status:** Accepted
- **Context:** Scraping exchange web portals without authorization violates terms of service and risks IP bans.
- **Decision:** Restrict ingestion to official APIs (FYERS), public investor-relations disclosures with proper licensing metadata, and official public filings. Track license metadata for every source.
- **Consequences:** Clean legal posture and resilient ingestion pipeline.

## ADR-009: ₹0 Recurring Data/API Subscription Target for V1
- **Status:** Accepted
- **Context:** The platform must be sustainable without mandatory paid Bloomberg, Refinitiv, or expensive equity screener subscriptions.
- **Decision:** Architecture relies on broker data feeds (FYERS free API tier for active account holders), regulatory public disclosures, deterministic calculation engines, and optional LLM inference.
- **Consequences:** Minimizes fixed operational costs for the founder.

## ADR-010: Immutable Assessment History
- **Status:** Accepted
- **Context:** In investment research, changing views must be recorded over time rather than overwritten.
- **Decision:** Assessments and their underlying evidence packets are versioned and immutable. Historical snapshots record what was known at that date.
- **Consequences:** Complete historical track record: facilitates "Investment Memory" to determine if a thesis broke or if sentiment merely fluctuated.

## ADR-011: Source Adapter Architecture & Licensing Registry
- **Status:** Accepted
- **Context:** Different data sources have varying licenses, rate limits, and reliability profiles.
- **Decision:** Build a Source Adapter registry tracking access method, freshness SLA, license permissions (commercial, redistribution, automation), and fallback cascades.
- **Consequences:** Systematic failure isolation when a single external source is degraded.

## ADR-012: Database-Backed Orchestration for V1
- **Status:** Accepted
- **Context:** Distributed message brokers (Kafka, RabbitMQ) introduce severe operational burden for V1.
- **Decision:** Implement asynchronous tasks, event logs, and dependency invalidation triggers using PostgreSQL transaction-backed tables (`jobs`, `events`).
- **Consequences:** Simple backups, zero additional daemon dependencies, transactional reliability.

## ADR-013: API-First Architecture
- **Status:** Accepted
- **Context:** Investment analysis logic must not reside in React components.
- **Decision:** Expose all research, screening, portfolio, and execution guidance via typed REST endpoints. The web frontend is purely a presentation client.
- **Consequences:** Allows straightforward addition of mobile applications (iOS/Android) and CLI tools in future phases.
