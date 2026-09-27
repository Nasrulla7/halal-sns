# HALAL-INVEST: Low Level Design (LLD)

## 1. Domain Entities & Interfaces
- **Instrument:** `id`, `symbol`, `name`, `exchange`, `isin`, `sector`, `industry`, `marketCap`, `currency`, `currentPrice`, `dayChange`, `dayChangePercent`, `high52w`, `low52w`, `volume`, `updatedAt`.
- **FinancialStatement:** `period` (e.g., FY24, FY23), `scope` ('CONSOLIDATED' | 'STANDALONE'), `revenue`, `costOfRevenue`, `grossProfit`, `operatingExpenses`, `operatingProfit`, `ebitda`, `depreciation`, `interestExpense`, `pbt`, `tax`, `netProfit`, `eps`, `cashAndEquivalents`, `shortTermInvestments`, `receivables`, `inventory`, `totalCurrentAssets`, `totalAssets`, `currentLiabilities`, `totalLiabilities`, `shortTermDebt`, `longTermDebt`, `totalDebt`, `totalEquity`, `operatingCashFlow`, `capex`, `freeCashFlow`, `dividendsPaid`.
- **ShariahAssessment:** `status` ('COMPLIANT' | 'REQUIRES_REVIEW' | 'NOT_COMPLIANT' | 'INSUFFICIENT_EVIDENCE'), `methodology` ('AAOIFI_STANDARD_21'), `version` ('2024.1'), `businessActivityScreen` ({ permissible: boolean, prohibitedRevenuePct: number, reason: string }), `financialRatios` ({ debtToMarketCapPct: number, interestBearingSecuritiesPct: number, receivablesToAssetsPct: number }), `purificationPercentage`: number, `auditTrail`: string[].
- **AssessmentVersion:** `id`, `instrumentId`, `assessmentDate`, `decision` ('BUY_CANDIDATE' | 'WAIT_INVESTIGATE' | 'HIGHER_RISK_SPECULATIVE' | 'AVOID_NOT_A_CANDIDATE' | 'REQUIRES_REVIEW' | 'NO_DECISION_INSUFFICIENT_EVIDENCE'), `holdingDecision`, `why`, `whyNot`, `evidenceSnapshot`, `invalidationConditions`, `evidenceQuality`, `confidenceScore`.

## 2. Deterministic Pipeline Stages
1. `validateUniverse(instrument)`: Checks supported market (India/NSE/BSE), listed status, verified identifier.
2. `verifyDataFreshness(instrument)`: Verifies prices, reports, and scope matching.
3. `calculateFinancialMetrics(statements)`: Computes P/E, P/B, ROE, ROCE, Margins, CAGRs, FCF, CCC.
4. `detectAccountingDivergence(statements)`: Checks cumulative Net Profit vs. Operating Cash Flow divergence.
5. `evaluateShariahCompliance(instrument, statements)`: Evaluates business screen + debt and liquidity ratios against AAOIFI rules.
6. `computeValuationBounds(metrics, history)`: Computes percentile multiples and Bull/Base/Bear scenarios.
7. `executeRedTeam(metrics, shariah, risks)`: Generates explicit counter-arguments and thesis break triggers.
8. `runFinalSafetyGate(packet)`: Hard gate evaluation. If missing critical evidence or Shariah non-compliant, halts decision.
9. `generateAssessment(packet)`: Emits final immutable assessment object.
