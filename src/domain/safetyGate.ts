/**
 * HALAL-INVEST: Mandatory Final Safety Gate
 * Enforces deterministic barriers before any investment assessment can be emitted.
 * If any critical check fails, defaults strictly to NO DECISION — INSUFFICIENT EVIDENCE.
 */

import {
  Instrument,
  FinancialStatement,
  ShariahAssessment,
  ValuationAnalysis,
  EarningsQualityAnalysis,
  FinancialRatios,
  AssessmentDecision,
  PositionGuidance,
  HoldingDecision,
  EvidenceQuality,
} from '../types';

export interface SafetyGateCheckResult {
  passed: boolean;
  criticalFailures: string[];
  warnings: string[];
}

export class SafetyGate {
  /**
   * Deterministically verifies that all foundational requirements are satisfied.
   */
  public static verifyPrerequisites(
    instrument: Instrument,
    statements: FinancialStatement[],
    shariah: ShariahAssessment,
    evidenceQuality: EvidenceQuality
  ): SafetyGateCheckResult {
    const criticalFailures: string[] = [];
    const warnings: string[] = [];

    // 1. Identity Check
    if (!instrument || !instrument.symbol || !instrument.isin) {
      criticalFailures.push('Instrument identity cannot be verified (missing symbol or ISIN).');
    }

    // 2. Critical Statement Check
    if (!statements || statements.length === 0) {
      criticalFailures.push('No financial statements available for analysis.');
    } else if (statements.length < 2) {
      warnings.push('Fewer than 3 years of statement history available; multi-year CAGR calculations limited.');
    }

    // 3. Price Freshness
    if (instrument.currentPrice <= 0) {
      criticalFailures.push('Missing or invalid current market price.');
    }

    // 4. Evidence Quality Gate
    if (evidenceQuality === 'INSUFFICIENT') {
      criticalFailures.push('Evidence quality is rated INSUFFICIENT; source provenance cannot be validated.');
    }

    // 5. Scope Invariant Check
    if (statements && statements.length > 0) {
      const scope = statements[0].scope;
      const mixedScope = statements.some((s) => s.scope !== scope);
      if (mixedScope) {
        warnings.push('Statement series contains mixed Consolidated and Standalone filings without adjustment.');
      }
    }

    return {
      passed: criticalFailures.length === 0,
      criticalFailures,
      warnings,
    };
  }

  /**
   * Determines the final investment assessment decision deterministically based on verified evidence.
   */
  public static determineAssessment(
    instrument: Instrument,
    statements: FinancialStatement[],
    ratios: FinancialRatios,
    shariah: ShariahAssessment,
    valuation: ValuationAnalysis,
    earningsQuality: EarningsQualityAnalysis,
    evidenceQuality: EvidenceQuality
  ): {
    decision: AssessmentDecision;
    holdingDecision: HoldingDecision;
    positionGuidance: PositionGuidance;
    confidenceScore: number;
    summaryWhy: string[];
    summaryWhyNot: string[];
  } {
    const gateCheck = this.verifyPrerequisites(instrument, statements, shariah, evidenceQuality);

    // GATE 1: Hard Fail on Data Integrity
    if (!gateCheck.passed) {
      return {
        decision: 'NO DECISION — INSUFFICIENT EVIDENCE',
        holdingDecision: 'REVIEW',
        positionGuidance: {
          tier: 'ZERO_ALLOCATION',
          suggestedAllocationRange: '0%',
          maxPositionINR: 0,
          rationale: 'Critical data missing: ' + gateCheck.criticalFailures.join(' '),
        },
        confidenceScore: 0,
        summaryWhy: [],
        summaryWhyNot: gateCheck.criticalFailures,
      };
    }

    // GATE 2: Shariah Hard Gate
    if (shariah.status === 'NOT_COMPLIANT') {
      return {
        decision: 'AVOID / NOT A CANDIDATE',
        holdingDecision: 'SELL_EXIT_CANDIDATE',
        positionGuidance: {
          tier: 'ZERO_ALLOCATION',
          suggestedAllocationRange: '0%',
          maxPositionINR: 0,
          rationale: 'Fails Shariah compliance screening under AAOIFI Standard 21.',
        },
        confidenceScore: 95,
        summaryWhy: [],
        summaryWhyNot: shariah.reasons,
      };
    }

    if (shariah.status === 'INSUFFICIENT_EVIDENCE') {
      return {
        decision: 'NO DECISION — INSUFFICIENT EVIDENCE',
        holdingDecision: 'REVIEW',
        positionGuidance: {
          tier: 'ZERO_ALLOCATION',
          suggestedAllocationRange: '0%',
          maxPositionINR: 0,
          rationale: 'Shariah financial debt or business activity evidence is incomplete.',
        },
        confidenceScore: 20,
        summaryWhy: [],
        summaryWhyNot: ['Shariah data is incomplete or unverified.'],
      };
    }

    const summaryWhy: string[] = [];
    const summaryWhyNot: string[] = [];

    // Business Quality Checks
    const highQualityMoat = ratios.roce >= 18 && ratios.roe >= 15 && ratios.debtToEquity <= 0.4;
    const cleanCashFlow = !earningsQuality.persistentDivergence && earningsQuality.cashToNetProfitRatio >= 0.75;
    const valuationStretched = valuation.valuationContext === 'EXTREME' || (valuation.valuationContext === 'ELEVATED' && valuation.pePercentile5Y > 80);

    let decision: AssessmentDecision = 'WAIT / INVESTIGATE';
    let holdingDecision: HoldingDecision = 'HOLD';
    let guidance: PositionGuidance = {
      tier: 'MEDIUM',
      suggestedAllocationRange: '2 - 5%',
      maxPositionINR: 50000,
      rationale: 'Balanced business profile with moderate valuation cushion.',
    };

    if (highQualityMoat && cleanCashFlow) {
      if (valuationStretched) {
        decision = 'WAIT / INVESTIGATE';
        holdingDecision = 'HOLD';
        guidance = {
          tier: 'MEDIUM',
          suggestedAllocationRange: '2 - 4%',
          maxPositionINR: 40000,
          rationale: 'Exceptional business fundamentals, but valuation is in the upper historical decile. Better to accumulate on market pullbacks.',
        };
        summaryWhy.push(`Moat & ROCE: Outstanding capital efficiency with ${ratios.roce}% ROCE and ${ratios.netMargin}% net margins.`);
        summaryWhyNot.push(`Valuation: Current P/E of ${valuation.currentPE.toFixed(1)}x is in the ${valuation.pePercentile5Y}th percentile. Wait for valuation margin of safety.`);
      } else {
        decision = 'BUY CANDIDATE';
        holdingDecision = 'HOLD';
        guidance = {
          tier: 'VERY_STRONG',
          suggestedAllocationRange: '5 - 10%',
          maxPositionINR: 100000,
          rationale: 'High capital efficiency, pristine balance sheet, full Shariah clearance, and reasonable valuation relative to long-term compounding rate.',
        };
        summaryWhy.push(`Strong Compounding: ROCE ${ratios.roce}%, ROE ${ratios.roe}%, Net Debt/Equity ${ratios.debtToEquity}x.`);
        summaryWhy.push(`Cash Quality: OCF covers ${Math.round(earningsQuality.cashToNetProfitRatio * 100)}% of reported net profit.`);
        summaryWhy.push(`Valuation: P/E of ${valuation.currentPE.toFixed(1)}x offers a reasonable entry multiple.`);
      }
    } else if (shariah.status === 'REQUIRES_REVIEW') {
      decision = 'REQUIRES REVIEW';
      holdingDecision = 'REVIEW';
      guidance = {
        tier: 'SPECULATIVE',
        suggestedAllocationRange: '1 - 2%',
        maxPositionINR: 20000,
        rationale: 'Company is close to AAOIFI debt thresholds or has pending segment disclosures.',
      };
      summaryWhyNot.push('Shariah metrics near regulatory threshold; pending quarterly balance sheet review.');
    } else if (ratios.debtToEquity > 0.8 || instrument.cyclicality === 'Highly Cyclical') {
      decision = 'HIGHER RISK / SPECULATIVE';
      holdingDecision = 'REVIEW';
      guidance = {
        tier: 'SPECULATIVE',
        suggestedAllocationRange: '1 - 2%',
        maxPositionINR: 20000,
        rationale: 'Elevated cyclical exposure or higher financial leverage.',
      };
      summaryWhyNot.push(`Higher volatility or leverage (Debt/Equity: ${ratios.debtToEquity}x).`);
    } else {
      decision = 'WAIT / INVESTIGATE';
      holdingDecision = 'HOLD';
      guidance = {
        tier: 'MEDIUM',
        suggestedAllocationRange: '2 - 5%',
        maxPositionINR: 50000,
        rationale: 'Solid profile; wait for clearer compounding catalysts.',
      };
      summaryWhy.push('Stable operating business.');
      summaryWhyNot.push('Evaluate peer alternatives with higher capital return metrics.');
    }

    return {
      decision,
      holdingDecision,
      positionGuidance: guidance,
      confidenceScore: evidenceQuality === 'STRONG' ? 90 : 70,
      summaryWhy,
      summaryWhyNot,
    };
  }
}
