# HALAL-INVEST: Master Product Specification

## 1. Product Mission & Positioning
Halal-Invest is an evidence-first halal investment research, analysis, monitoring, and investment-assessment platform for long-term wealth creation.
- **Positioning:** "Investing, with evidence."
- **Primary Market:** India (NSE / BSE listed equities)
- **Target User:** Individual Muslim investors, family offices, and wealth builders seeking institutional-grade rigor without gambling, day-trading hype, or ungrounded stock tips.

## 2. Core Functional Pillars
1. **Investment Universe & Safety Gate:** Rigorous validation of security identity, trading status, and statement availability. Default state on failure is `NO DECISION — INSUFFICIENT EVIDENCE`.
2. **Shariah Hard Gate:** AAOIFI-compliant business activity screening (conventional banking, alcohol, tobacco, gambling, pork, weapons, adult entertainment < 5% non-permissible revenue) and financial ratio screening (total debt < 33% market cap, interest-bearing investments < 33%, cash & receivables < 50% total assets).
3. **Deterministic Financial Analysis:** 5-10 year multi-statement analysis (Income, Balance Sheet, Cash Flow), audited ratio computation (P/E, P/B, ROE, ROCE, FCF, Margins, Debt/Equity, Interest Coverage, Cash Conversion Cycle).
4. **Earnings Quality & Accruals:** Cash vs. Profit reconciliation, divergence detection, unusual one-off items.
5. **Valuation & Scenario Analysis:** Historical multiples percentiles, EV/EBITDA, FCF yield, Bull / Base / Bear scenario modeling.
6. **Red-Teaming & Invalidation Conditions:** Active generation of counter-arguments, bear cases, and explicit thesis breakdown criteria.
7. **Portfolio Fit & Position Sizing:** Conservative position sizing tiers (5-10% Very Strong down to 0% Major Concerns).
8. **Manual FYERS Execution:** Server-side broker adapter with manual order guidance. Zero automated execution.
