# HALAL-INVEST: Testing Strategy

## Test Hierarchy
1. **Unit Tests (Financial Core):**
   - Exact mathematical formula verification (P/E, P/B, ROE, ROCE, FCF, Margins, Debt/Equity, Interest Coverage, CCC, CAGR).
   - Accrual & cash divergence detection.
   - Shariah ratio calculations & AAOIFI threshold validation.
   - Position sizing tier rules.
2. **Safety Gate Tests:**
   - Missing financial statements must trigger `NO DECISION — INSUFFICIENT EVIDENCE`.
   - Shariah non-compliance must trigger `AVOID / NOT A CANDIDATE`.
   - Stale market price must block valuation confidence.
   - Mixed standalone/consolidated scope without flag must raise an invariant violation.
3. **Integration Tests:**
   - Full DO EVERYTHING research pipeline end-to-end execution.
   - API endpoints contract validation.
   - FYERS adapter safety: verifies that no order placement endpoints exist.
4. **UI & Accessibility Tests:**
   - Zero NaN / undefined / fake values.
   - Info tooltips ⓘ rendering for all financial ratios.
   - Responsive layout down to mobile screens.
