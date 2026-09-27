/**
 * HALAL-INVEST: Audited Production Test Suite
 * Executes unit, integration, safety gate, price alert, and broker-invariance tests.
 */

import { FinancialCalculator } from '../domain/financialCalculator';
import { ShariahEngine } from '../domain/shariahEngine';
import { SafetyGate } from '../domain/safetyGate';
import { FyersAdapter } from '../adapters/fyersAdapter';
import { AppRepository } from '../db/repository';
import { PostgresService } from '../db/postgres';
import { PriceAlertService } from '../services/priceAlertService';
import { Instrument, FinancialStatement } from '../types';
import {
  formatUserDateTime,
  formatUserTime,
  getConvertedExchangeHours,
  getTimeZoneAbbr,
} from '../utils/dateTime';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failCount++;
  }
}

async function runTests() {
  console.log('============================================================');
  console.log('RUNNING HALAL-INVEST PRODUCTION VERIFICATION & INVARIANT TEST SUITE');
  console.log('============================================================\n');

  // -------------------------------------------------------------
  // 1. FINANCIAL CALCULATIONS UNIT TESTS
  // -------------------------------------------------------------
  console.log('[1/7] Financial Calculator & Metric Tests:');

  const cagr = FinancialCalculator.calculateCAGR(100, 200, 3);
  assert(Math.abs(cagr - 25.99) < 0.1, 'CAGR calculation: 100 to 200 in 3 years is ~25.99%', `got ${cagr}`);

  const mockStatements: FinancialStatement[] = [
    {
      period: 'FY24',
      fiscalYear: 2024,
      scope: 'CONSOLIDATED',
      revenue: 10000,
      costOfRevenue: 6000,
      grossProfit: 4000,
      operatingExpenses: 1500,
      operatingProfit: 2500,
      ebitda: 2800,
      depreciation: 300,
      interestExpense: 100,
      profitBeforeTax: 2400,
      tax: 600,
      netProfit: 1800,
      eps: 50,
      cashAndEquivalents: 800,
      shortTermInvestments: 1200,
      receivables: 1500,
      inventory: 500,
      totalCurrentAssets: 4000,
      totalAssets: 8000,
      currentLiabilities: 1600,
      totalLiabilities: 2400,
      shortTermDebt: 200,
      longTermDebt: 600,
      totalDebt: 800,
      totalEquity: 5600,
      bookValuePerShare: 155.5,
      operatingCashFlow: 1900,
      capex: 400,
      freeCashFlow: 1500,
      investingCashFlow: -500,
      financingCashFlow: -800,
      dividendsPaid: 600,
      sharesOutstanding: 36,
      sourceRef: 'Test Filing',
      filingDate: '2024-04-01',
    },
  ];

  const ratios = FinancialCalculator.computeRatios(1200, 43200, mockStatements);
  assert(ratios.peRatio === 24, 'P/E ratio: 1200 price / 50 EPS = 24.0', `got ${ratios.peRatio}`);
  assert(ratios.fcf === 1500, 'Free Cash Flow (FCF): 1900 OCF - 400 Capex = 1500 Cr', `got ${ratios.fcf}`);
  assert(ratios.roe === 32.14, 'ROE: (1800 / 5600) * 100 = 32.14%', `got ${ratios.roe}`);
  assert(ratios.roce === 39.06, 'ROCE: 2500 EBIT / (8000 - 1600 Capital Employed) = 39.06%', `got ${ratios.roce}`);
  assert(ratios.interestCoverage === 25, 'Interest Coverage: 2500 EBIT / 100 Interest = 25.0x', `got ${ratios.interestCoverage}`);

  const earningsQuality = FinancialCalculator.analyzeEarningsQuality(mockStatements);
  assert(earningsQuality.cashToNetProfitRatio > 1.0, 'Earnings Quality: OCF covers 100%+ of Net Profit', `ratio: ${earningsQuality.cashToNetProfitRatio}`);

  const divergingStatements: FinancialStatement[] = [
    {
      ...mockStatements[0],
      operatingCashFlow: 600,
      netProfit: 1800,
    },
  ];
  const badEarnings = FinancialCalculator.analyzeEarningsQuality(divergingStatements);
  assert(badEarnings.persistentDivergence === true, 'Accounting Divergence: Detects OCF < 50% Net Profit');

  // -------------------------------------------------------------
  // 2. SHARIAH HARD GATE TESTS (AAOIFI Standard 21)
  // -------------------------------------------------------------
  console.log('\n[2/7] Shariah Hard Gate Tests:');

  AppRepository.initialize();
  const tcs = AppRepository.getInstrumentById('NSE:TCS')!;
  const tcsSt = AppRepository.getStatements('NSE:TCS')[0];
  const tcsAct = AppRepository.getActivityProfile('NSE:TCS');
  const tcsShariah = ShariahEngine.evaluate(tcs, tcsSt, tcsAct);
  assert(tcsShariah.status === 'COMPLIANT', 'TCS passes AAOIFI Standard 21 as COMPLIANT', `status: ${tcsShariah.status}`);
  assert(tcsShariah.businessScreen.status === 'PASS', 'TCS business activity is permissible (IT services)');
  assert(tcsShariah.financialScreen.debtScreenPass === true, 'TCS total debt is safely under 33% market cap limit');
  assert(tcsShariah.purificationPercentage === 0.65, 'TCS dividend purification percentage computed correctly at 0.65%');

  const hdfc = AppRepository.getInstrumentById('NSE:HDFCBANK')!;
  const hdfcSt = AppRepository.getStatements('NSE:HDFCBANK')[0];
  const hdfcAct = AppRepository.getActivityProfile('NSE:HDFCBANK');
  const hdfcShariah = ShariahEngine.evaluate(hdfc, hdfcSt, hdfcAct);
  assert(hdfcShariah.status === 'NOT_COMPLIANT', 'HDFC Bank fails Shariah screening as NOT_COMPLIANT');
  assert(hdfcShariah.businessScreen.status === 'FAIL', 'HDFC Bank fails business screen due to Interest/Riba banking');

  const highDebtStatement: FinancialStatement = {
    ...tcsSt,
    totalDebt: 600000,
  };
  const debtBreachShariah = ShariahEngine.evaluate(tcs, highDebtStatement, tcsAct);
  assert(debtBreachShariah.status === 'NOT_COMPLIANT', 'Debt > 33% market cap strictly triggers NOT_COMPLIANT');

  // -------------------------------------------------------------
  // 3. FINAL SAFETY GATE TESTS
  // -------------------------------------------------------------
  console.log('\n[3/7] Safety Gate Barrier Tests:');

  const blockedHdfc = SafetyGate.determineAssessment(
    hdfc,
    [hdfcSt],
    ratios,
    hdfcShariah,
    { currentPE: 18, pePercentile5Y: 40, currentPB: 2.8, evToEbitda: 14, priceToSales: 4.2, dividendYield: 1.2, valuationContext: 'FAIR', scenarios: { bull: { targetPrice: 2000, upsidePercentage: 20, assumptions: '' }, base: { targetPrice: 1700, upsidePercentage: 5, assumptions: '' }, bear: { targetPrice: 1400, downsidePercentage: -15, assumptions: '' } } },
    earningsQuality,
    'STRONG'
  );
  assert(blockedHdfc.decision === 'AVOID / NOT A CANDIDATE', 'Safety Gate: Non-compliant stock yields AVOID / NOT A CANDIDATE');
  assert(blockedHdfc.positionGuidance.suggestedAllocationRange === '0%', 'Safety Gate: Prohibited stock receives 0% allocation');

  const unverifiedInst = AppRepository.getInstrumentById('NSE:UNVERIFIED')!;
  const unverifiedResearch = AppRepository.runCompleteResearch(unverifiedInst.id);
  assert(
    unverifiedResearch.finalAssessment === 'NO DECISION — INSUFFICIENT EVIDENCE',
    'Safety Gate: Missing financial statements strictly yields NO DECISION — INSUFFICIENT EVIDENCE'
  );

  // -------------------------------------------------------------
  // 4. FYERS BROKER ADAPTER & SAFETY INVARIANTS
  // -------------------------------------------------------------
  console.log('\n[4/7] FYERS Broker Security & Manual Execution Invariants:');

  let tradeBlockedExceptionThrown = false;
  try {
    FyersAdapter.executeAutomatedTrade();
  } catch (err: any) {
    tradeBlockedExceptionThrown = true;
  }
  assert(tradeBlockedExceptionThrown, 'Hard Invariant: executeAutomatedTrade() throws an exception (NO auto-trading)');

  const fyersStatus = FyersAdapter.getStatus();
  assert(fyersStatus.autoTradingBlocked === true, 'FYERS Adapter status confirms autoTradingBlocked is hardcoded true');

  const manualSlip = FyersAdapter.generateManualExecutionSlip('TCS', 50000);
  assert(manualSlip !== null, 'Manual order ticket generation succeeds for TCS');
  assert(manualSlip?.productType === 'CNC', 'Manual order ticket enforces CNC delivery (no intraday leverage)');
  assert(manualSlip?.suggestedQty === 12, 'Manual order ticket computes conservative share quantity (12 shares for ₹50k)');

  // -------------------------------------------------------------
  // 5. DO EVERYTHING FULL RESEARCH WORKFLOW TEST
  // -------------------------------------------------------------
  console.log('\n[5/7] DO EVERYTHING Research Pipeline Integration:');

  const fullReport = AppRepository.runCompleteResearch('NSE:TCS');
  assert(fullReport.instrument.symbol === 'TCS', 'Report contains verified company identity');
  assert(fullReport.shariah.status === 'COMPLIANT', 'Report confirms Shariah compliance');
  assert(fullReport.evidenceSnapshot.length > 0, 'Report includes traceable evidence snapshot with provenance');
  assert(fullReport.redTeam.whyNotThisCompany.length > 0, 'Report includes mandatory "Why NOT this company" red-team counter-arguments');
  assert(fullReport.redTeam.invalidationConditions.length > 0, 'Report includes explicit thesis invalidation conditions');
  assert(fullReport.assessmentHistory.length > 0, 'Report preserves immutable assessment history');

  // -------------------------------------------------------------
  // 6. PRODUCTION PRICE ALERTS & FYERS QUOTE EVALUATION
  // -------------------------------------------------------------
  console.log('\n[6/7] Production Price Alerts & Market Feed Tests:');

  // Test FYERS Quotes Feed
  const quotes = await FyersAdapter.getQuotes(['TCS', 'INFY']);
  assert(quotes.has('TCS'), 'FyersAdapter returns quote map containing TCS');
  assert(quotes.get('TCS')!.ltp > 0, 'FyersAdapter quote for TCS has positive LTP');
  assert(typeof quotes.get('TCS')!.source === 'string', 'FyersAdapter quote tracks provenance source');

  // Test Alert Creation via PriceAlertService
  const alertAbove = await PriceAlertService.createAlert({
    symbol: 'TCS',
    targetPrice: 4300.0,
    condition: 'ABOVE',
    notes: 'Resistance ceiling breakout alert',
  });
  assert(alertAbove.status === 'ACTIVE', 'New price alert initializes with ACTIVE status');
  assert(alertAbove.symbol === 'TCS', 'Price alert stores target ticker symbol');
  assert(alertAbove.targetPrice === 4300.0, 'Price alert stores numerical target price');

  // Test Alert Evaluation via PriceAlertService
  const evalResult = await PriceAlertService.evaluateAlerts();
  assert(evalResult.evaluatedCount >= 1, 'PriceAlertService evaluates active alerts');

  // Test Below Alert Trigger Boundary
  const alertBelow = await PriceAlertService.createAlert({
    symbol: 'TCS',
    targetPrice: 4200.0, // TCS LTP is ~4120.50, which is below 4200.0
    condition: 'BELOW',
    notes: 'Dip threshold trigger',
  });
  assert(alertBelow.status === 'TRIGGERED', 'Price alert triggers when condition BELOW is met (LTP <= 4200)');
  assert(alertBelow.triggeredPrice !== undefined, 'Triggered alert records exact triggeredPrice');

  // Test Dismiss Alert via Service
  const dismissed = await PriceAlertService.dismissAlert(alertBelow.id);
  assert(dismissed === true, 'Price alert is successfully dismissed via service');
  const allAlerts = await PriceAlertService.getAlerts();
  const foundDismissed = allAlerts.find((a) => a.id === alertBelow.id);
  assert(foundDismissed?.status === 'DISMISSED', 'Dismissed alert status persists as DISMISSED');

  // Test Delete Alert via Service
  const deleted = await PriceAlertService.deleteAlert(alertAbove.id);
  assert(deleted === true, 'Price alert is successfully deleted via service');
  const remainingAlerts = await PriceAlertService.getAlerts();
  assert(!remainingAlerts.some((a) => a.id === alertAbove.id), 'Deleted alert is removed from persistent state');

  // -------------------------------------------------------------
  // 7. DATABASE STATUS & CONNECTION SAFETY TESTS
  // -------------------------------------------------------------
  console.log('\n[7/8] Database & Backend Driver Safety Tests:');

  const dbStatus = PostgresService.getStatus();
  assert(typeof dbStatus.driver === 'string', 'Database service exposes driver telemetry');
  assert(typeof dbStatus.migrationVersion === 'string', 'Database service exposes migration version');
  assert(typeof dbStatus.activeTableCount === 'number', 'Database service tracks relational schema tables');

  // -------------------------------------------------------------
  // 8. DYNAMIC TIMEZONE & FYERS SANDBOX SIMULATOR TESTS
  // -------------------------------------------------------------
  console.log('\n[8/8] Timezone Localisation & FYERS Sandbox Tests:');

  // Test Timezone Engine for KSA (Asia/Riyadh)
  const sampleUtc = '2026-09-27T12:30:00.000Z';
  const riyadhFormatted = formatUserDateTime(sampleUtc, { timeZone: 'Asia/Riyadh' });
  assert(
    riyadhFormatted.includes('AST') || riyadhFormatted.includes('GMT+3') || riyadhFormatted.includes('+03'),
    'KSA (Asia/Riyadh) timezone resolves correct offset/abbreviation',
    `got: ${riyadhFormatted}`
  );
  assert(
    riyadhFormatted.includes('3:30') || riyadhFormatted.includes('15:30'),
    'KSA (Asia/Riyadh) correctly converts UTC 12:30 to 15:30 (+3h)',
    `got: ${riyadhFormatted}`
  );

  // Test Exchange Hours Conversion to KSA (Asia/Riyadh)
  const ksaExchangeHours = getConvertedExchangeHours('Asia/Riyadh');
  assert(ksaExchangeHours.isSameAsExchange === false, 'KSA timezone recognized as distinct from exchange timezone (IST)');
  assert(ksaExchangeHours.localHours.includes('06:45'), 'NSE 09:15 IST accurately converts to 06:45 local KSA time');
  assert(ksaExchangeHours.localHours.includes('13:00'), 'NSE 15:30 IST accurately converts to 13:00 local KSA time');

  // Test FYERS Sandbox Authentication Flow
  const sandboxAuthUrl = FyersAdapter.generateAuthUrl();
  assert(typeof sandboxAuthUrl === 'string' && sandboxAuthUrl.length > 0, 'FYERS adapter provides valid authorization URL in sandbox mode');

  const exchangeResult = await FyersAdapter.exchangeAuthCode('SANDBOX-TEST-CODE-2026');
  assert(exchangeResult.success === true, 'FYERS Sandbox code exchange succeeds without requiring external broker credentials');

  const connectedSandboxStatus = FyersAdapter.getStatus();
  assert(connectedSandboxStatus.connected === true, 'FYERS Sandbox status reports connected session');
  assert(connectedSandboxStatus.mode === 'SANDBOX_SIMULATOR', 'FYERS Sandbox mode explicitly identified as SANDBOX_SIMULATOR');
  assert(connectedSandboxStatus.autoTradingBlocked === true, 'FYERS Sandbox invariant: autoTradingBlocked remains strictly true');

  // Test Disconnect
  FyersAdapter.disconnect();
  const disconnectedStatus = FyersAdapter.getStatus();
  assert(disconnectedStatus.connected === false, 'FYERS disconnect cleanly resets session');

  console.log('\n============================================================');
  console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('============================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('ALL AUDITED INVARIANTS, ALERTS & FORMULAS VERIFIED SUCCESSFULLY.');
  }
}

runTests().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
