/**
 * HALAL-INVEST Core Domain Types
 * Authoritative types for the investment research and assessment engine.
 */

export type FinancialScope = 'CONSOLIDATED' | 'STANDALONE';

export type EvidenceQuality = 'STRONG' | 'MODERATE' | 'LIMITED' | 'INSUFFICIENT';

export type ShariahStatus =
  | 'COMPLIANT'
  | 'REQUIRES_REVIEW'
  | 'NOT_COMPLIANT'
  | 'INSUFFICIENT_EVIDENCE';

export type AssessmentDecision =
  | 'BUY CANDIDATE'
  | 'WAIT / INVESTIGATE'
  | 'HIGHER RISK / SPECULATIVE'
  | 'AVOID / NOT A CANDIDATE'
  | 'REQUIRES REVIEW'
  | 'NO DECISION — INSUFFICIENT EVIDENCE';

export type HoldingDecision =
  | 'HOLD'
  | 'REVIEW'
  | 'CONSIDER_REDUCING'
  | 'SELL_EXIT_CANDIDATE';

export interface Instrument {
  id: string; // e.g. "NSE:TCS"
  symbol: string;
  name: string;
  isin: string;
  exchange: 'NSE' | 'BSE';
  country: 'IN' | 'SA' | 'US';
  sector: string;
  industry: string;
  marketCap: number; // In Crores (INR Cr)
  currency: 'INR' | 'SAR' | 'USD';
  currentPrice: number;
  dayChange: number;
  dayChangePercent: number;
  high52w: number;
  low52w: number;
  volume: number;
  isActive: boolean;
  listingDate: string;
  description: string;
  businessModel: string;
  competitiveMoat: string;
  customerConcentration: string;
  pricingPower: string;
  cyclicality: 'Defensive' | 'Cyclical' | 'Highly Cyclical';
  lastPriceUpdate: string;
}

export interface FinancialStatement {
  period: string; // "FY2024", "FY2023", etc.
  fiscalYear: number;
  scope: FinancialScope;
  // Income Statement (INR Crores)
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingProfit: number;
  ebitda: number;
  depreciation: number;
  interestExpense: number;
  profitBeforeTax: number;
  tax: number;
  netProfit: number;
  eps: number; // INR per share
  // Balance Sheet (INR Crores)
  cashAndEquivalents: number;
  shortTermInvestments: number;
  receivables: number;
  inventory: number;
  totalCurrentAssets: number;
  totalAssets: number;
  currentLiabilities: number;
  totalLiabilities: number;
  shortTermDebt: number;
  longTermDebt: number;
  totalDebt: number;
  totalEquity: number;
  bookValuePerShare: number;
  // Cash Flow (INR Crores)
  operatingCashFlow: number;
  capex: number;
  freeCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  dividendsPaid: number;
  sharesOutstanding: number; // in Crores
  sourceRef: string;
  filingDate: string;
}

export interface FinancialRatios {
  peRatio: number; // Price-to-Earnings Ratio (P/E)
  pbRatio: number; // Price-to-Book Ratio (P/B)
  roe: number; // Return on Equity (ROE) %
  roce: number; // Return on Capital Employed (ROCE) %
  eps: number; // Earnings Per Share (EPS)
  fcf: number; // Free Cash Flow (FCF) in Cr
  fcfYield: number; // FCF / Market Cap %
  ebitdaMargin: number; // EBITDA Margin %
  operatingMargin: number; // Operating Margin %
  netMargin: number; // Net Margin %
  debtToEquity: number; // Debt / Equity ratio
  interestCoverage: number; // EBIT / Interest expense
  currentRatio: number; // Current Assets / Current Liabilities
  cashConversionCycle: number; // DSO + DIO - DPO in days
  receivableDays: number;
  inventoryDays: number;
  payableDays: number;
  cagr3YRevenue: number; // 3-Year Revenue CAGR %
  cagr3YProfit: number; // 3-Year Net Profit CAGR %
  cagr3YFCF: number; // 3-Year FCF CAGR %
  cagr5YRevenue: number; // 5-Year Revenue CAGR %
  cagr5YProfit: number; // 5-Year Net Profit CAGR %
}

export interface EarningsQualityAnalysis {
  cashToNetProfitRatio: number; // OCF / Net Profit (Ideal > 1.0)
  accrualsPercentage: number;
  persistentDivergence: boolean;
  divergenceSeverity: 'LOW' | 'MODERATE' | 'HIGH';
  findings: string[];
}

export interface ShariahAssessment {
  status: ShariahStatus;
  methodology: 'AAOIFI_STANDARD_21';
  methodologyVersion: '2024.1';
  screeningDate: string;
  financialDataDate: string;
  businessScreen: {
    isPermissible: boolean;
    prohibitedActivities: string[];
    prohibitedRevenuePercentage: number; // Max 5%
    status: 'PASS' | 'FAIL';
  };
  financialScreen: {
    // 1. Debt to Market Cap < 33%
    debtToMarketCapPercentage: number;
    debtScreenPass: boolean;
    // 2. Interest-bearing securities to Market Cap < 33%
    interestSecuritiesPercentage: number;
    interestSecuritiesPass: boolean;
    // 3. Receivables & Cash to Total Assets < 50%
    receivablesToAssetsPercentage: number;
    receivablesPass: boolean;
  };
  purificationPercentage: number; // % of dividend to donate to charity
  auditNotes: string[];
  reasons: string[];
}

export interface ValuationAnalysis {
  currentPE: number;
  pePercentile5Y: number; // Valuation percentile
  currentPB: number;
  evToEbitda: number;
  priceToSales: number;
  dividendYield: number;
  valuationContext: 'ATTRACTIVE' | 'FAIR' | 'ELEVATED' | 'EXTREME';
  scenarios: {
    bull: { targetPrice: number; upsidePercentage: number; assumptions: string };
    base: { targetPrice: number; upsidePercentage: number; assumptions: string };
    bear: { targetPrice: number; downsidePercentage: number; assumptions: string };
  };
}

export interface RiskItem {
  category:
    | 'BUSINESS'
    | 'FINANCIAL'
    | 'REGULATORY'
    | 'MARKET'
    | 'GOVERNANCE'
    | 'SHARIAH'
    | 'CYCLICALITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  mitigant: string;
}

export interface RedTeamAnalysis {
  whyDeservesCapital: string[];
  whyNotThisCompany: string[];
  strongestBearArgument: string;
  invalidationConditions: string[]; // Explicit thesis break triggers
  contradictoryEvidence: string[];
}

export interface PositionGuidance {
  tier: 'VERY_STRONG' | 'STRONG' | 'MEDIUM' | 'SPECULATIVE' | 'ZERO_ALLOCATION';
  suggestedAllocationRange: string; // e.g., "5 - 10%"
  maxPositionINR: number;
  rationale: string;
}

export interface EvidenceRecord {
  id: string;
  metric: string;
  value: string | number;
  period: string;
  scope: FinancialScope;
  source: string;
  sourceType: 'ANNUAL_REPORT' | 'QUARTERLY_FILING' | 'REGULATORY_DISCLOSURE' | 'FYERS_API' | 'CALCULATION';
  publicationDate: string;
  retrievalTimestamp: string;
  confidence: EvidenceQuality;
  formula?: string;
  documentHash?: string;
}

export interface AssessmentVersion {
  id: string;
  instrumentId: string;
  assessmentDate: string;
  decision: AssessmentDecision;
  holdingDecision?: HoldingDecision;
  evidenceQuality: EvidenceQuality;
  shariahStatus: ShariahStatus;
  summaryWhy: string[];
  summaryWhyNot: string[];
  invalidationTriggers: string[];
  targetAllocationRange: string;
  reproducibilityChecksum: string;
}

export interface CompleteResearchReport {
  instrument: Instrument;
  evidenceQuality: EvidenceQuality;
  statements: FinancialStatement[];
  ratios: FinancialRatios;
  earningsQuality: EarningsQualityAnalysis;
  shariah: ShariahAssessment;
  valuation: ValuationAnalysis;
  risks: RiskItem[];
  redTeam: RedTeamAnalysis;
  positionGuidance: PositionGuidance;
  finalAssessment: AssessmentDecision;
  holdingDecision?: HoldingDecision;
  evidenceSnapshot: EvidenceRecord[];
  assessmentHistory: AssessmentVersion[];
  generatedAt: string;
}

export interface PortfolioHolding {
  id: string;
  instrumentId: string;
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  weightPercentage: number;
  shariahStatus: ShariahStatus;
  assessment: AssessmentDecision;
  purificationOwedINR: number;
}

export interface PortfolioSummary {
  portfolioValue: number;
  investedAmount: number;
  availableCash: number;
  todayPnL: number;
  todayPnLPercent: number;
  overallPnL: number;
  overallReturnPercent: number;
  holdingsCount: number;
  shariahCompliantPercentage: number;
  totalPurificationDueINR: number;
  lastUpdated: string;
}

export interface MarketIndex {
  name: string; // NIFTY 50, SENSEX, NIFTY 500
  current: number;
  change: number;
  changePercent: number;
  status: 'OPEN' | 'CLOSED';
  lastUpdated: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type PriceAlertCondition = 'ABOVE' | 'BELOW';
export type PriceAlertStatus = 'ACTIVE' | 'TRIGGERED' | 'DISMISSED';

export interface PriceQuote {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  high52w?: number;
  low52w?: number;
  volume?: number;
  lastUpdated: string;
  source: 'FYERS_API_V3' | 'FYERS_SANDBOX_SIMULATOR' | 'VERIFIED_DISCLOSURE';
}

export interface PriceAlert {
  id: string;
  userId: string;
  instrumentId: string;
  symbol: string;
  name: string;
  targetPrice: number;
  currentPriceAtCreation: number;
  condition: PriceAlertCondition;
  status: PriceAlertStatus;
  notes?: string;
  createdAt: string;
  triggeredAt?: string;
  lastCheckedPrice?: number;
  triggeredPrice?: number;
  dataSource?: 'FYERS_API_V3' | 'FYERS_SANDBOX_SIMULATOR' | 'VERIFIED_DISCLOSURE';
}

export type FyersConnectionState =
  | 'NOT CONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'TOKEN EXPIRED'
  | 'REAUTHENTICATION REQUIRED'
  | 'CONNECTION ERROR'
  | 'DATA SYNCING'
  | 'DATA SYNCED'
  | 'DATA STALE';

export interface FyersAdapterStatus {
  state: FyersConnectionState;
  connected: boolean;
  accountType: 'FYERS_BROKER_ADAPTER';
  mode: 'LIVE_BROKER' | 'SANDBOX_SIMULATOR';
  isSandbox: boolean;
  serverSideConfigured: boolean;
  marketDataLive: boolean;
  autoTradingBlocked: true; // Hardcoded invariant: NO auto execution
  lastHeartbeat: string;
  lastSyncTime?: string;
  tokenExpiresAt?: string;
  appIdConfigured: boolean;
  tokenConfigured: boolean;
  verifiedAccountName?: string;
  syncMessage?: string;
}

export type DatabaseDriverType = 'POSTGRESQL' | 'TRANSACTIONAL_MEMORY';

export interface DatabaseStatus {
  driver: DatabaseDriverType;
  connected: boolean;
  host?: string;
  database?: string;
  migrationVersion: string;
  activeTableCount: number;
  lastChecked: string;
  isRealPostgres: boolean;
  statusMessage: string;
}

export interface FyersManualOrderSlip {
  symbol: string;
  exchange: 'NSE';
  transactionType: 'BUY';
  productType: 'CNC' | 'DELIVERY'; // Cash-and-carry only (no intraday/derivatives)
  suggestedQty: number;
  limitPrice: number;
  limitPriceRange: string;
  estimatedInvestmentINR: number;
  executionInstructions: string[];
}

export interface UserRules {
  monthlyBudgetINR: number;
  investedThisMonthINR: number;
  maxSinglePositionPercent: number;
  riskTolerance: 'CONSERVATIVE' | 'MODERATE';
  shariahMethodology: 'AAOIFI_STANDARD_21';
  investmentHorizon: 'LONG_TERM_WEALTH';
}

export interface ImportantEventItem {
  id: string;
  instrumentSymbol: string;
  instrumentName: string;
  eventType: 'EARNINGS_RELEASE' | 'DIVIDEND' | 'SHARIAH_REVIEW' | 'AGM' | 'VALUATION_SHIFT';
  eventDate: string;
  headline: string;
  materiality: 'HIGH' | 'MEDIUM' | 'LOW';
  impactSummary: string;
}

export interface OpportunityAlert {
  id: string;
  instrumentSymbol: string;
  instrumentName: string;
  type: 'VALUATION_ATTRACTIVE' | 'SHARIAH_MILESTONE' | 'EARNINGS_ANNOUNCED' | 'RISK_HEADWIND';
  headline: string;
  description: string;
  severity: 'ATTENTION' | 'INFO' | 'REVIEW';
  date: string;
}
