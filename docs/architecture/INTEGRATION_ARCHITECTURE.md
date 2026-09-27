# HALAL-INVEST: Integration Architecture

## 1. Broker Integration: FYERS Adapter
- **Purpose:** Read-only ingestion of real-time quotes, historical OHLCV bars, market status, and user portfolio holdings.
- **Protocol:** Server-to-server REST & WebSocket protocols.
- **Fallback Strategy:** If FYERS API is unreachable, the system marks market data as `STALE` with an explicit warning banner and halts valuation updates. It never generates synthetic prices.
- **Manual Order Assistant:** Generates a pre-formatted order slip (Symbol, Exchange, Transaction Type, Limit Price Range, Quantity based on position sizing) for copy-pasting or manual entry into FYERS.

## 2. Regulatory & Filing Sources
- **Strategy:** Official exchange public disclosures (NSE / BSE announcements, SEBI corporate filings) and company investor-relations portals.
- **Compliance:** Full tracking of robot policies, licensing permissions, and terms of service. No unauthorized web scraping.
- **Licensing Registry:** Internal registry stores permission flags (`automationAllowed`, `commercialAllowed`, `attributionRequired`).
