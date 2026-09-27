# HALAL-INVEST: Security Architecture

## 1. Zero Trust External Broker Boundary
- FYERS App ID, Secret Key, and Access Tokens are loaded via server-side environment variables only (`FYERS_APP_ID`, `FYERS_ACCESS_TOKEN`).
- **NEVER** expose broker secrets or access tokens to the browser client or frontend bundle.
- The web client receives read-only parsed market quotes, synced portfolio amounts, and formatted manual order instruction slips.

## 2. No Automated Execution (Air-Gapped Capital Safety)
- The backend API deliberately lacks endpoints for `order/place`, `order/modify`, or `order/cancel`.
- The user reviews the deterministic assessment and thesis inside Halal-Invest, then logs in separately to their official FYERS mobile app or terminal to place trades manually.

## 3. Data Integrity & Input Sanitization
- All client queries (symbol search, scenario overrides, budget adjustments) are validated with strict schemas.
- SQL injections are prevented via parameterized queries.
- Cross-Site Scripting (XSS) is mitigated through strict React escaping and CSP headers.

## 4. Immutable Audit Logs
- Every assessment generation, status change, and user rule override is recorded in an append-only audit trail with UTC timestamps and origin actor context.
