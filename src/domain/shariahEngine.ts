/**
 * HALAL-INVEST: Deterministic Shariah Compliance Engine
 * Implements AAOIFI Shariah Standard No. (21)
 *
 * Mandatory rule: Shariah screening is a HARD GATE.
 * A company CANNOT receive a normal investment recommendation if Shariah status is failed or unverified.
 */

import {
  Instrument,
  FinancialStatement,
  ShariahAssessment,
  ShariahStatus,
} from '../types';

export interface BusinessActivityProfile {
  isCoreBusinessPermissible: boolean;
  prohibitedActivitiesDetected: string[];
  prohibitedRevenuePercentage: number;
}

export class ShariahEngine {
  public static readonly AAOIFI_DEBT_THRESHOLD_PCT = 33.0;
  public static readonly AAOIFI_INTEREST_SECURITIES_THRESHOLD_PCT = 33.0;
  public static readonly AAOIFI_RECEIVABLES_ASSETS_THRESHOLD_PCT = 50.0;
  public static readonly AAOIFI_PROHIBITED_REVENUE_THRESHOLD_PCT = 5.0;

  /**
   * Deterministically screens a company against AAOIFI Standard 21.
   */
  public static evaluate(
    instrument: Instrument,
    statement: FinancialStatement,
    activityProfile: BusinessActivityProfile
  ): ShariahAssessment {
    const auditNotes: string[] = [];
    const reasons: string[] = [];

    // 1. BUSINESS ACTIVITY SCREEN (Gate 1)
    const prohibitedRevPct = Number(activityProfile.prohibitedRevenuePercentage.toFixed(2));
    const businessPermissible =
      activityProfile.isCoreBusinessPermissible &&
      prohibitedRevPct <= this.AAOIFI_PROHIBITED_REVENUE_THRESHOLD_PCT;

    if (!activityProfile.isCoreBusinessPermissible) {
      reasons.push(
        `Core business involves prohibited activity: ${activityProfile.prohibitedActivitiesDetected.join(', ')}.`
      );
      auditNotes.push('Business screen: FAIL (Core business non-permissible).');
    } else if (prohibitedRevPct > this.AAOIFI_PROHIBITED_REVENUE_THRESHOLD_PCT) {
      reasons.push(
        `Non-permissible revenue (${prohibitedRevPct}%) exceeds AAOIFI 5.0% threshold.`
      );
      auditNotes.push(`Business screen: FAIL (Prohibited revenue ${prohibitedRevPct}% > 5.0%).`);
    } else {
      auditNotes.push(
        `Business screen: PASS (Prohibited revenue ${prohibitedRevPct}% <= 5.0%).`
      );
    }

    // 2. FINANCIAL RATIO SCREENING (Gate 2)
    // Denominator: 36-month average market cap or current market cap (in Cr)
    const marketCap = instrument.marketCap;
    if (marketCap <= 0) {
      return {
        status: 'INSUFFICIENT_EVIDENCE',
        methodology: 'AAOIFI_STANDARD_21',
        methodologyVersion: '2024.1',
        screeningDate: new Date().toISOString().split('T')[0],
        financialDataDate: statement.filingDate || '2024-03-31',
        businessScreen: {
          isPermissible: businessPermissible,
          prohibitedActivities: activityProfile.prohibitedActivitiesDetected,
          prohibitedRevenuePercentage: prohibitedRevPct,
          status: businessPermissible ? 'PASS' : 'FAIL',
        },
        financialScreen: {
          debtToMarketCapPercentage: 0,
          debtScreenPass: false,
          interestSecuritiesPercentage: 0,
          interestSecuritiesPass: false,
          receivablesToAssetsPercentage: 0,
          receivablesPass: false,
        },
        purificationPercentage: prohibitedRevPct,
        auditNotes: ['Market cap unavailable: Cannot compute financial thresholds.'],
        reasons: ['Missing reliable market capitalization data.'],
      };
    }

    // Ratio 1: Total Debt / Market Cap (Threshold: < 33%)
    const debtToMarketCapPct = Number(((statement.totalDebt / marketCap) * 100).toFixed(2));
    const debtScreenPass = debtToMarketCapPct < this.AAOIFI_DEBT_THRESHOLD_PCT;
    auditNotes.push(
      `Debt screen: ${debtScreenPass ? 'PASS' : 'FAIL'} (${debtToMarketCapPct}% vs < 33.0% threshold). Total debt: ₹${statement.totalDebt} Cr, MCap: ₹${marketCap} Cr.`
    );

    // Ratio 2: Cash & Interest-bearing securities / Market Cap (Threshold: < 33%)
    const interestSecurities = statement.cashAndEquivalents + statement.shortTermInvestments;
    const interestSecuritiesPct = Number(((interestSecurities / marketCap) * 100).toFixed(2));
    const interestSecuritiesPass =
      interestSecuritiesPct < this.AAOIFI_INTEREST_SECURITIES_THRESHOLD_PCT;
    auditNotes.push(
      `Interest securities screen: ${interestSecuritiesPass ? 'PASS' : 'FAIL'} (${interestSecuritiesPct}% vs < 33.0% threshold). Cash & investments: ₹${interestSecurities} Cr.`
    );

    // Ratio 3: Receivables & Cash / Total Assets (Threshold: < 50%)
    const liquidAssets = statement.receivables + statement.cashAndEquivalents;
    const receivablesToAssetsPct =
      statement.totalAssets > 0
        ? Number(((liquidAssets / statement.totalAssets) * 100).toFixed(2))
        : 0;
    const receivablesPass = receivablesToAssetsPct < this.AAOIFI_RECEIVABLES_ASSETS_THRESHOLD_PCT;
    auditNotes.push(
      `Receivables & liquidity screen: ${receivablesPass ? 'PASS' : 'FAIL'} (${receivablesToAssetsPct}% vs < 50.0% threshold). Receivables + Cash: ₹${liquidAssets} Cr, Total assets: ₹${statement.totalAssets} Cr.`
    );

    // DETERMINATION
    let status: ShariahStatus = 'COMPLIANT';

    if (!businessPermissible) {
      status = 'NOT_COMPLIANT';
    } else if (!debtScreenPass || !interestSecuritiesPass || !receivablesPass) {
      status = 'NOT_COMPLIANT';
      if (!debtScreenPass) {
        reasons.push(
          `Total debt ratio (${debtToMarketCapPct}%) exceeds AAOIFI maximum 33.0% limit.`
        );
      }
      if (!interestSecuritiesPass) {
        reasons.push(
          `Cash and interest-bearing deposits (${interestSecuritiesPct}%) exceed AAOIFI maximum 33.0% limit.`
        );
      }
      if (!receivablesPass) {
        reasons.push(
          `Receivables and liquid assets ratio (${receivablesToAssetsPct}%) exceeds 50.0% of total assets.`
        );
      }
    } else {
      // Check for borderline conditions (within 10% of limits: debt between 28% and 33%)
      if (debtToMarketCapPct >= 28.0 || interestSecuritiesPct >= 28.0) {
        status = 'REQUIRES_REVIEW';
        reasons.push(
          'Financial ratios are compliant but close to the 33% AAOIFI boundary. Requires close monitoring.'
        );
      } else {
        reasons.push('Meets all AAOIFI Standard 21 business and financial criteria.');
      }
    }

    return {
      status,
      methodology: 'AAOIFI_STANDARD_21',
      methodologyVersion: '2024.1',
      screeningDate: new Date().toISOString().split('T')[0],
      financialDataDate: statement.filingDate || '2024-03-31',
      businessScreen: {
        isPermissible: businessPermissible,
        prohibitedActivities: activityProfile.prohibitedActivitiesDetected,
        prohibitedRevenuePercentage: prohibitedRevPct,
        status: businessPermissible ? 'PASS' : 'FAIL',
      },
      financialScreen: {
        debtToMarketCapPercentage: debtToMarketCapPct,
        debtScreenPass,
        interestSecuritiesPercentage: interestSecuritiesPct,
        interestSecuritiesPass,
        receivablesToAssetsPercentage: receivablesToAssetsPct,
        receivablesPass,
      },
      purificationPercentage: prohibitedRevPct,
      auditNotes,
      reasons,
    };
  }
}
