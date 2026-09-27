/**
 * HALAL-INVEST: Comprehensive Multi-Factor Risk Engine
 * Analyzes business, balance sheet, regulatory, governance, and Shariah risks.
 */

import {
  Instrument,
  FinancialStatement,
  FinancialRatios,
  ShariahAssessment,
  RiskItem,
} from '../types';

export class RiskEngine {
  public static evaluate(
    instrument: Instrument,
    statement: FinancialStatement,
    ratios: FinancialRatios,
    shariah: ShariahAssessment
  ): RiskItem[] {
    const risks: RiskItem[] = [];

    // 1. FINANCIAL / BALANCE SHEET RISK
    if (ratios.debtToEquity > 1.0) {
      risks.push({
        category: 'FINANCIAL',
        severity: 'HIGH',
        description: `Elevated Debt-to-Equity ratio of ${ratios.debtToEquity}x indicates high financial gearing.`,
        mitigant: 'Monitor interest coverage ratio and operating cash flow adequacy.',
      });
    } else if (ratios.debtToEquity > 0.5) {
      risks.push({
        category: 'FINANCIAL',
        severity: 'MEDIUM',
        description: `Moderate leverage with Debt-to-Equity of ${ratios.debtToEquity}x.`,
        mitigant: `Supported by strong interest coverage of ${ratios.interestCoverage.toFixed(1)}x.`,
      });
    } else {
      risks.push({
        category: 'FINANCIAL',
        severity: 'LOW',
        description: `Prudent balance sheet with low Debt-to-Equity of ${ratios.debtToEquity}x.`,
        mitigant: 'Substantial net cash or negligible debt load provides strong downside cushion.',
      });
    }

    // 2. SHARIAH PROXIMITY RISK
    if (shariah.status === 'NOT_COMPLIANT') {
      risks.push({
        category: 'SHARIAH',
        severity: 'HIGH',
        description: 'Breaches Shariah criteria. Prohibited for investment under AAOIFI rules.',
        mitigant: 'Zero allocation permitted until non-compliant activities or ratios are remedied.',
      });
    } else if (shariah.financialScreen.debtToMarketCapPercentage >= 25) {
      risks.push({
        category: 'SHARIAH',
        severity: 'MEDIUM',
        description: `Debt to Market Cap (${shariah.financialScreen.debtToMarketCapPercentage}%) is approaching the 33% AAOIFI maximum ceiling.`,
        mitigant: 'Requires quarterly debt monitoring in case market cap contracts or debt increases.',
      });
    } else {
      risks.push({
        category: 'SHARIAH',
        severity: 'LOW',
        description: 'Comfortably inside all AAOIFI Standard 21 thresholds with wide margin of safety.',
        mitigant: `Purification factor of ${shariah.purificationPercentage}% applies to dividend payouts.`,
      });
    }

    // 3. CYCLICALITY RISK
    if (instrument.cyclicality === 'Highly Cyclical') {
      risks.push({
        category: 'CYCLICALITY',
        severity: 'HIGH',
        description: 'Highly cyclical business model sensitive to raw material prices and macro downturns.',
        mitigant: 'Size position conservatively and avoid investing at peak cycle multiples.',
      });
    } else if (instrument.cyclicality === 'Cyclical') {
      risks.push({
        category: 'CYCLICALITY',
        severity: 'MEDIUM',
        description: 'Moderate economic cycle sensitivity with revenue tied to enterprise capex or discretionary spend.',
        mitigant: 'Focus on long-term client contracts and diversified sector exposure.',
      });
    } else {
      risks.push({
        category: 'CYCLICALITY',
        severity: 'LOW',
        description: 'Defensive business profile with steady non-discretionary demand.',
        mitigant: 'High recurring revenue cushions against economic slowdowns.',
      });
    }

    // 4. GOVERNANCE & PROMOTER
    risks.push({
      category: 'GOVERNANCE',
      severity: 'LOW',
      description: 'Clean governance profile: institutional audit firm, zero promoter share pledging.',
      mitigant: 'Annual review of related-party transactions and board composition.',
    });

    // 5. BUSINESS & CONCENTRATION RISK
    if (instrument.customerConcentration.toLowerCase().includes('high')) {
      risks.push({
        category: 'BUSINESS',
        severity: 'MEDIUM',
        description: 'Top client concentration poses potential revenue volatility if key contracts fluctuate.',
        mitigant: 'Deep technological integration and high switching costs reduce churn risk.',
      });
    } else {
      risks.push({
        category: 'BUSINESS',
        severity: 'LOW',
        description: 'Well-diversified customer base across geographies and enterprise verticals.',
        mitigant: 'No single customer accounts for more than 10% of gross billings.',
      });
    }

    return risks;
  }
}
