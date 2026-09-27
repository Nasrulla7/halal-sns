# HALAL-INVEST: Scalability Architecture

## Scale Progression (1 -> 10 -> 100 -> 10K -> 100K Users)
- **V1 (1 - 100 Users):** Modular Monolith running on Node.js/Express, transactional PostgreSQL storage, local memory cache for static company profiles, and on-demand financial calculations.
- **V2 (100 - 10K Users):** Horizontally scaled API nodes behind a load balancer; read-replica PostgreSQL instances; Redis-backed cache for price quotes and company financial statements.
- **V3 (10K - 100K+ Users):** Event-driven micro-workers for background ingestion, document parsing, and continuous screening; read-heavy CDN caching for universal Shariah ratings and financial statements.

## Key Scaling Principle
The core investment logic (financial calculations, Shariah hard gate, valuation models) is pure domain logic with zero external side effects. It can be executed inside worker threads, serverless functions, or distributed task queues without architectural rewrites.
