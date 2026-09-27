# HALAL-INVEST: High Level Design (HLD)

```
+-------------------------------------------------------------------------+
|                      USER (Browser / Desktop / Tablet)                  |
+-------------------------------------------------------------------------+
                                    |
                                    v (HTTP / REST API)
+-------------------------------------------------------------------------+
|                        EXPRESS SERVER / API GATEWAY                     |
|  - Rate Limiter  - Auth Guard  - Input Validator  - Audit Logger        |
+-------------------------------------------------------------------------+
       |                         |                          |
       v                         v                          v
+--------------+       +-------------------+       +--------------------+
| Portfolio    |       | Research & DO     |       | User Rules &       |
| Engine       |       | EVERYTHING Engine |       | Watchlist Service  |
+--------------+       +-------------------+       +--------------------+
       |                         |                          |
       +------------+------------+--------------------------+
                    |
                    v
+-------------------------------------------------------------------------+
|                      ORCHESTRATION & SAFETY LAYER                       |
|  1. Data Freshness Check          2. Security & Scope Verification      |
|  3. Dependency Graph Invalidator  4. FINAL SAFETY GATE (Hard Block)     |
+-------------------------------------------------------------------------+
       |
       +--------------------+---------------------+
       |                    |                     |
       v                    v                     v
+---------------+    +---------------+    +-------------------------------+
| Deterministic |    | Shariah Hard  |    | Red-Team & Scenario Engine    |
| Financial     |    | Gate Engine   |    | - Bull / Base / Bear          |
| Calculator    |    | (AAOIFI v2024)|    | - Invalidation Conditions     |
+---------------+    +---------------+    +-------------------------------+
       \                    |                    /
        +-------------------+-------------------+
                            |
                            v
+-------------------------------------------------------------------------+
|                    EVIDENCE REGISTRY & DATA STORE                       |
|  - Facts & Calculations  - Document Provenance  - Assessment History    |
|  - PostgreSQL Schema (DDL) + Embedded Transactional Memory Store        |
+-------------------------------------------------------------------------+
                            ^
                            |
+-------------------------------------------------------------------------+
|                        EXTERNAL ADAPTER LAYER                           |
|  +--------------------+  +--------------------+  +--------------------+ |
|  | FYERS Broker       |  | Official Filings   |  | Regulatory /       | |
|  | Adapter (Server)   |  | IR Adapter         |  | Licensing Registry | |
|  +--------------------+  +--------------------+  +--------------------+ |
+-------------------------------------------------------------------------+
```

## Core Invariants:
1. All broker credentials remain strictly on the server.
2. No automated execution engine exists.
3. Shariah screen acts as a hard gate.
4. AI interpretation never computes or alters numerical facts.
