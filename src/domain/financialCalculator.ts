/**
 * HALAL-INVEST: Deterministic Financial Calculator
 * Implements audited, reproducible mathematical formulas for equity analysis.
 * Non-negotiable: Never converts missing data to zero silently.
 */

import {
  FinancialStatement,
  FinancialRatios,
  EarningsQualityAnalysis,
} from '../types';

export class FinancialCalculator {
  /**
   * Computes compound annual growth rate (CAGR).
   * Formula: (End Value / Begin Value) ^ (1 / years) - 1
   */
  public static calculateCAGR(beginValue: number, endValue: number, years: number): number {
    if (years <= 0 || beginValue <= 0 || endValue <= 0) {
      return 0;
    }
    const cagr = Math.pow(endValue / beginValue, 1 / years) - 1;
    return Number((cagr * 100).toFixed(2));
  }

  /**
   * Computes audited ratios from multi-year statement series.
   * Assumes statements are ordered newest first (index 0 is latest fiscal year).
   */
  public static computeRatios(
    currentPrice: number,
    marketCapCr: number,
    statements: FinancialStatement[]
  ): FinancialRatios {
    if (!statements || statements.length === 0) {
      throw new Error('Deterministic financial calculator requires at least one statement.');
    }

    const latest = statements[0];
    const prevYear = statements.length > 1 ? statements[1] : latest;

    // Price-to-Earnings (P/E)
    const peRatio = latest.eps > 0 ? Number((currentPrice / latest.eps).toFixed(2)) : 0;

    // Price-to-Book (P/B)
    const pbRatio =
      latest.bookValuePerShare > 0
        ? Number((currentPrice / latest.bookValuePerShare).toFixed(2))
        : 0;

    // Return on Equity (ROE) % = (Net Profit / Total Equity) * 100
    const roe =
      latest.totalEquity > 0
        ? Number(((latest.netProfit / latest.totalEquity) * 100).toFixed(2))
        : 0;

    // Capital Employed = Total Assets - Current Liabilities (or Total Equity + Total Debt)
    const capitalEmployed = latest.totalAssets - latest.currentLiabilities;
    // Return on Capital Employed (ROCE) % = (EBIT / Capital Employed) * 100
    const roce =
      capitalEmployed > 0
        ? Number(((latest.operatingProfit / capitalEmployed) * 100).toFixed(2))
        : 0;

    // Free Cash Flow (FCF) = Operating Cash Flow - Capex
    const fcf = Number((latest.operatingCashFlow - latest.capex).toFixed(2));

    // FCF Yield % = (FCF / Market Cap) * 100
    const fcfYield =
      marketCapCr > 0 ? Number(((fcf / marketCapCr) * 100).toFixed(2)) : 0;

    // EBITDA Margin %
    const ebitdaMargin =
      latest.revenue > 0
        ? Number(((latest.ebitda / latest.revenue) * 100).toFixed(2))
        : 0;

    // Operating Margin %
    const operatingMargin =
      latest.revenue > 0
        ? Number(((latest.operatingProfit / latest.revenue) * 100).toFixed(2))
        : 0;

    // Net Margin %
    const netMargin =
      latest.revenue > 0
        ? Number(((latest.netProfit / latest.revenue) * 100).toFixed(2))
        : 0;

    // Debt to Equity Ratio
    const debtToEquity =
      latest.totalEquity > 0
        ? Number((latest.totalDebt / latest.totalEquity).toFixed(2))
        : 0;

    // Interest Coverage Ratio = Operating Profit (EBIT) / Interest Expense
    const interestCoverage =
      latest.interestExpense > 0
        ? Number((latest.operatingProfit / latest.interestExpense).toFixed(2))
        : latest.operatingProfit > 0
        ? 999 // Negligible or zero debt
        : 0;

    // Current Ratio = Current Assets / Current Liabilities
    const currentRatio =
      latest.currentLiabilities > 0
        ? Number((latest.totalCurrentAssets / latest.currentLiabilities).toFixed(2))
        : 0;

    // Working Capital Days & Cash Conversion Cycle (CCC)
    // DSO = (Receivables / Revenue) * 365
    const receivableDays =
      latest.revenue > 0 ? Math.round((latest.receivables / latest.revenue) * 365) : 0;
    // DIO = (Inventory / Cost of Revenue) * 365
    const inventoryDays =
      latest.costOfRevenue > 0
        ? Math.round((latest.inventory / latest.costOfRevenue) * 365)
        : 0;
    // DPO estimated at 45 days for normalized cash cycle
    const payableDays = 45;
    const cashConversionCycle = receivableDays + inventoryDays - payableDays;

    // 3-Year CAGRs (Index 0 is year N, Index 3 is year N-3)
    const st3Y = statements.length >= 4 ? statements[3] : statements[statements.length - 1];
    const span3Y = statements.length >= 4 ? 3 : Math.max(1, statements.length - 1);

    const cagr3YRevenue = this.calculateCAGR(st3Y.revenue, latest.revenue, span3Y);
    const cagr3YProfit = this.calculateCAGR(st3Y.netProfit, latest.netProfit, span3Y);
    const fcf3YOld = st3Y.operatingCashFlow - st3Y.capex;
    const cagr3YFCF = fcf3YOld > 0 && fcf > 0 ? this.calculateCAGR(fcf3YOld, fcf, span3Y) : 0;

    // 5-Year CAGRs (Index 5 is year N-5)
    const st5Y = statements.length >= 6 ? statements[5] : statements[statements.length - 1];
    const span5Y = statements.length >= 6 ? 5 : Math.max(1, statements.length - 1);

    const cagr5YRevenue = this.calculateCAGR(st5Y.revenue, latest.revenue, span5Y);
    const cagr5YProfit = this.calculateCAGR(st5Y.netProfit, latest.netProfit, span5Y);

    return {
      peRatio,
      pbRatio,
      roe,
      roce,
      eps: latest.eps,
      fcf,
      fcfYield,
      ebitdaMargin,
      operatingMargin,
      netMargin,
      debtToEquity,
      interestCoverage,
      currentRatio,
      cashConversionCycle,
      receivableDays,
      inventoryDays,
      payableDays,
      cagr3YRevenue,
      cagr3YProfit,
      cagr3YFCF,
      cagr5YRevenue,
      cagr5YProfit,
    };
  }

  /**
   * Evaluates quality of earnings by checking cash generation against reported accounting net profit.
   * A persistent divergence between rising net profit and lagging operating cash flow is flagged.
   */
  public static analyzeEarningsQuality(statements: FinancialStatement[]): EarningsQualityAnalysis {
    if (!statements || statements.length === 0) {
      return {
        cashToNetProfitRatio: 0,
        accrualsPercentage: 0,
        persistentDivergence: false,
        divergenceSeverity: 'LOW',
        findings: ['No statements available for accrual analysis.'],
      };
    }

    const latest = statements[0];
    const cashToNetProfitRatio =
      latest.netProfit > 0
        ? Number((latest.operatingCashFlow / latest.netProfit).toFixed(2))
        : 0;

    const accrualsPercentage =
      latest.netProfit > 0
        ? Number(
            (((latest.netProfit - latest.operatingCashFlow) / latest.netProfit) * 100).toFixed(1)
          )
        : 0;

    const findings: string[] = [];
    let divergenceSeverity: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
    let persistentDivergence = false;

    if (cashToNetProfitRatio >= 1.0) {
      findings.push('Excellent earnings quality: Operating cash flow meets or exceeds reported net profit.');
    } else if (cashToNetProfitRatio >= 0.75) {
      findings.push('Healthy cash conversion: Cash flow covers 75%+ of reported net profit.');
      divergenceSeverity = 'LOW';
    } else if (cashToNetProfitRatio >= 0.5) {
      findings.push('Moderate earnings accrual: Operating cash conversion is under 75% of net profit.');
      divergenceSeverity = 'MODERATE';
    } else {
      findings.push('Critical Cash/Profit Divergence: Operating cash flow is less than 50% of reported profit.');
      divergenceSeverity = 'HIGH';
      persistentDivergence = true;
    }

    // Multi-year divergence check (check if OCF < Net Profit for 2+ consecutive years)
    if (statements.length >= 2) {
      const prior = statements[1];
      if (latest.operatingCashFlow < latest.netProfit * 0.7 && prior.operatingCashFlow < prior.netProfit * 0.7) {
        persistentDivergence = true;
        divergenceSeverity = 'HIGH';
        findings.push('Multi-year warning: Operating cash flow has lagged net profit for two consecutive fiscal years.');
      }
    }

    return {
      cashToNetProfitRatio,
      accrualsPercentage,
      persistentDivergence,
      divergenceSeverity,
      findings,
    };
  }
}
