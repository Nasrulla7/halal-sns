/**
 * HALAL-INVEST: Deterministic Red-Team Engine
 * Actively stress-tests the investment thesis, formulates counter-arguments,
 * and sets explicit, testable thesis invalidation conditions.
 */

import {
  Instrument,
  FinancialStatement,
  FinancialRatios,
  ValuationAnalysis,
  ShariahAssessment,
  EarningsQualityAnalysis,
  RedTeamAnalysis,
} from '../types';

export class RedTeamEngine {
  public static execute(
    instrument: Instrument,
    statement: FinancialStatement,
    ratios: FinancialRatios,
    valuation: ValuationAnalysis,
    shariah: ShariahAssessment,
    earningsQuality: EarningsQualityAnalysis
  ): RedTeamAnalysis {
    const whyDeservesCapital: string[] = [];
    const whyNotThisCompany: string[] = [];
    const invalidationConditions: string[] = [];
    const contradictoryEvidence: string[] = [];

    // Why Deserves Capital
    if (ratios.roce >= 20) {
      whyDeservesCapital.push(
        `High Capital Efficiency: Return on Capital Employed (ROCE) of ${ratios.roce}% indicates a formidable economic moat.`
      );
    }
    if (ratios.debtToEquity <= 0.3) {
      whyDeservesCapital.push('Conservative Balance Sheet: Virtually zero net debt protects equity holders in crises.');
    }
    if (ratios.cagr3YRevenue >= 10) {
      whyDeservesCapital.push(
        `Proven Compounding: 3-Year revenue CAGR of ${ratios.cagr3YRevenue}% demonstrates consistent enterprise scale.`
      );
    }
    if (shariah.status === 'COMPLIANT') {
      whyDeservesCapital.push(
        `Fully Shariah Compliant: Clean core operations with debt ratio (${shariah.financialScreen.debtToMarketCapPercentage}%) well below the 33% AAOIFI ceiling.`
      );
    }

    // Why NOT This Company (Stress Testing)
    if (valuation.valuationContext === 'ELEVATED' || valuation.valuationContext === 'EXTREME') {
      whyNotThisCompany.push(
        `Valuation Multiple Risk: Trading at ${valuation.currentPE.toFixed(1)}x P/E (${valuation.pePercentile5Y}th percentile), leaving little margin for error if growth decelerates.`
      );
    }
    if (earningsQuality.persistentDivergence) {
      whyNotThisCompany.push(
        `Cash Flow Lag: Operating cash flow is lagging reported net profit (${earningsQuality.cashToNetProfitRatio}x conversion ratio), suggesting working capital build-up.`
      );
      contradictoryEvidence.push('Reported accounting net profit is growing faster than realized cash collections.');
    }
    if (ratios.cashConversionCycle > 90) {
      whyNotThisCompany.push(
        `Working Capital Drag: Cash Conversion Cycle of ${ratios.cashConversionCycle} days ties up liquidity in receivables/inventory.`
      );
    }
    if (shariah.status === 'REQUIRES_REVIEW') {
      whyNotThisCompany.push('Shariah metrics are borderline; approaching maximum regulatory debt thresholds.');
    }

    // Strongest Bear Argument
    let strongestBearArgument =
      'If broader industry capex slows and operating margins compress by 200 bps, earnings growth will stall while the elevated P/E multiple de-rates, causing a prolonged drawdown.';
    if (shariah.status === 'NOT_COMPLIANT') {
      strongestBearArgument =
        'The company is non-compliant under AAOIFI rules due to non-permissible activities or excessive debt. Capital must not be allocated.';
    } else if (valuation.valuationContext === 'EXTREME') {
      strongestBearArgument =
        'Peak valuation risk: Expectations are priced for perfection. Any marginal quarterly miss will trigger severe multiple compression towards the historical median.';
    }

    // Explicit Invalidation Conditions (Thesis Kill-Switches)
    invalidationConditions.push('ROCE drops below 15% for two consecutive fiscal quarters.');
    invalidationConditions.push('Total debt expands beyond 28% of market cap, putting Shariah compliance in jeopardy.');
    invalidationConditions.push('Operating cash flow conversion drops below 70% of net income across trailing twelve months.');
    invalidationConditions.push('Material promoter share pledging or resignation of independent audit committee members.');

    return {
      whyDeservesCapital,
      whyNotThisCompany:
        whyNotThisCompany.length > 0
          ? whyNotThisCompany
          : ['Valuation multiple is fair, but opportunity cost must be assessed against other high-ROCE peers.'],
      strongestBearArgument,
      invalidationConditions,
      contradictoryEvidence,
    };
  }
}
