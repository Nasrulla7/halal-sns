/**
 * HALAL-INVEST: Valuation & Scenario Engine
 * Computes multiple percentiles, EV/EBITDA, and explicit assumption-driven scenarios.
 * Non-negotiable: Scenarios are transparently grounded in stated parameters.
 */

import {
  Instrument,
  FinancialStatement,
  FinancialRatios,
  ValuationAnalysis,
} from '../types';

export class ValuationEngine {
  public static evaluate(
    instrument: Instrument,
    statement: FinancialStatement,
    ratios: FinancialRatios,
    historicalPEs: number[] = [24, 28, 32, 29, 35, 26, 30]
  ): ValuationAnalysis {
    const currentPrice = instrument.currentPrice;
    const eps = statement.eps > 0 ? statement.eps : 1;
    const currentPE = ratios.peRatio;
    const currentPB = ratios.pbRatio;

    // EV = Market Cap + Total Debt - Cash & Short-term Investments
    const netDebt = statement.totalDebt - (statement.cashAndEquivalents + statement.shortTermInvestments);
    const enterpriseValue = instrument.marketCap + netDebt;
    const evToEbitda =
      statement.ebitda > 0 ? Number((enterpriseValue / statement.ebitda).toFixed(2)) : 0;

    // Price-to-Sales = Market Cap / Revenue
    const priceToSales =
      statement.revenue > 0 ? Number((instrument.marketCap / statement.revenue).toFixed(2)) : 0;

    // Dividend Yield % = (Dividends / Market Cap) * 100
    const dividendYield =
      instrument.marketCap > 0
        ? Number(((statement.dividendsPaid / instrument.marketCap) * 100).toFixed(2))
        : 0;

    // 5-Year PE Percentile rank
    const sortedPEs = [...historicalPEs, currentPE].sort((a, b) => a - b);
    const rank = sortedPEs.indexOf(currentPE);
    const pePercentile5Y = Number(((rank / (sortedPEs.length - 1)) * 100).toFixed(0));

    // Valuation Context determination
    let valuationContext: 'ATTRACTIVE' | 'FAIR' | 'ELEVATED' | 'EXTREME' = 'FAIR';
    if (pePercentile5Y < 25) {
      valuationContext = 'ATTRACTIVE';
    } else if (pePercentile5Y <= 65) {
      valuationContext = 'FAIR';
    } else if (pePercentile5Y <= 85) {
      valuationContext = 'ELEVATED';
    } else {
      valuationContext = 'EXTREME';
    }

    // Scenarios (3-Year Forward Horizon)
    // Base: 12% EPS growth, exit PE at 5Y median
    const medianPE = sortedPEs[Math.floor(sortedPEs.length / 2)] || currentPE;
    const baseEPS = eps * Math.pow(1.12, 3);
    const baseTarget = Number((baseEPS * medianPE).toFixed(2));
    const baseUpside = Number((((baseTarget - currentPrice) / currentPrice) * 100).toFixed(1));

    // Bull: 18% EPS growth, exit PE at 75th percentile
    const bullPE = sortedPEs[Math.floor(sortedPEs.length * 0.75)] || currentPE * 1.1;
    const bullEPS = eps * Math.pow(1.18, 3);
    const bullTarget = Number((bullEPS * bullPE).toFixed(2));
    const bullUpside = Number((((bullTarget - currentPrice) / currentPrice) * 100).toFixed(1));

    // Bear: 6% EPS growth, exit PE compression to 25th percentile
    const bearPE = sortedPEs[Math.floor(sortedPEs.length * 0.25)] || currentPE * 0.8;
    const bearEPS = eps * Math.pow(1.06, 3);
    const bearTarget = Number((bearEPS * bearPE).toFixed(2));
    const bearDownside = Number((((bearTarget - currentPrice) / currentPrice) * 100).toFixed(1));

    return {
      currentPE,
      pePercentile5Y,
      currentPB,
      evToEbitda,
      priceToSales,
      dividendYield,
      valuationContext,
      scenarios: {
        bull: {
          targetPrice: bullTarget,
          upsidePercentage: bullUpside,
          assumptions: `18% CAGR earnings acceleration; multiple expansion to ${bullPE.toFixed(1)}x exit P/E.`,
        },
        base: {
          targetPrice: baseTarget,
          upsidePercentage: baseUpside,
          assumptions: `12% steady CAGR earnings growth; multiple reversion to 5Y historical median ${medianPE.toFixed(1)}x P/E.`,
        },
        bear: {
          targetPrice: bearTarget,
          downsidePercentage: bearDownside,
          assumptions: `Slowing earnings to 6% CAGR; multiple de-rating down to ${bearPE.toFixed(1)}x P/E.`,
        },
      },
    };
  }
}
