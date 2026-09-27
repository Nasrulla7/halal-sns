/**
 * HALAL-INVEST: Seed Data & In-Memory Relational Repository
 * Mirrors PostgreSQL schema for instant deterministic execution, test isolation,
 * and zero-dependency developer environment.
 */

import {
  Instrument,
  FinancialStatement,
  PortfolioHolding,
  PortfolioSummary,
  MarketIndex,
  UserRules,
  ImportantEventItem,
  OpportunityAlert,
  AssessmentVersion,
  FyersAdapterStatus,
  FyersManualOrderSlip,
  EarningsQualityAnalysis,
  PriceAlert,
  PriceAlertCondition,
  PriceAlertStatus,
} from '../types';
import { FinancialCalculator } from '../domain/financialCalculator';
import { ShariahEngine, BusinessActivityProfile } from '../domain/shariahEngine';
import { ValuationEngine } from '../domain/valuationEngine';
import { RiskEngine } from '../domain/riskEngine';
import { RedTeamEngine } from '../domain/redTeamEngine';
import { SafetyGate } from '../domain/safetyGate';
import { CompleteResearchReport, EvidenceRecord } from '../types';

export class AppRepository {
  private static instruments: Map<string, Instrument> = new Map();
  private static statements: Map<string, FinancialStatement[]> = new Map();
  private static activityProfiles: Map<string, BusinessActivityProfile> = new Map();
  private static assessmentHistory: Map<string, AssessmentVersion[]> = new Map();
  private static holdings: Map<string, PortfolioHolding> = new Map();
  private static watchlist: Set<string> = new Set();
  private static priceAlerts: Map<string, PriceAlert> = new Map();
  private static userRules: UserRules = {
    monthlyBudgetINR: 50000,
    investedThisMonthINR: 20000,
    maxSinglePositionPercent: 10,
    riskTolerance: 'CONSERVATIVE',
    shariahMethodology: 'AAOIFI_STANDARD_21',
    investmentHorizon: 'LONG_TERM_WEALTH',
  };

  public static initialize(): void {
    if (this.instruments.size > 0) return;

    // 1. TATA CONSULTANCY SERVICES (TCS) - High-Quality Halal Compounding Leader
    const tcs: Instrument = {
      id: 'NSE:TCS',
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd',
      isin: 'INE467B01029',
      exchange: 'NSE',
      country: 'IN',
      sector: 'Information Technology',
      industry: 'IT Services & Consulting',
      marketCap: 1485000, // INR 14.85 Lakh Cr
      currency: 'INR',
      currentPrice: 4120.50,
      dayChange: 24.30,
      dayChangePercent: 0.59,
      high52w: 4585.00,
      low52w: 3450.00,
      volume: 1845000,
      isActive: true,
      listingDate: '2004-08-25',
      description:
        'Global leader in IT consulting and business solutions, partnering with international enterprises in their digital transformation journeys.',
      businessModel:
        'Software application development, cloud infrastructure modernization, AI enablement, and enterprise lifecycle management on a time-and-materials and fixed-price contractual basis.',
      competitiveMoat:
        'Massive engineering scale (600,000+ employees), 98%+ client retention, proprietary intellectual property, and high customer switching costs.',
      customerConcentration: 'Low. Largest single client accounts for <3% of total revenue.',
      pricingPower: 'High. Sustained operating margins between 24% - 26% across multiple economic cycles.',
      cyclicality: 'Defensive',
      lastPriceUpdate: '2026-09-26T15:30:00+05:30',
    };

    const tcsStatements: FinancialStatement[] = [
      {
        period: 'FY2024',
        fiscalYear: 2024,
        scope: 'CONSOLIDATED',
        revenue: 240893,
        costOfRevenue: 139500,
        grossProfit: 101393,
        operatingExpenses: 40850,
        operatingProfit: 60543,
        ebitda: 64120,
        depreciation: 3577,
        interestExpense: 780,
        profitBeforeTax: 62200,
        tax: 15600,
        netProfit: 46600,
        eps: 128.50,
        cashAndEquivalents: 11450,
        shortTermInvestments: 28500,
        receivables: 42100,
        inventory: 0,
        totalCurrentAssets: 94800,
        totalAssets: 142500,
        currentLiabilities: 41200,
        totalLiabilities: 49800,
        shortTermDebt: 0,
        longTermDebt: 0,
        totalDebt: 0, // Virtually zero interest-bearing debt
        totalEquity: 92700,
        bookValuePerShare: 255.40,
        operatingCashFlow: 44300,
        capex: 3200,
        freeCashFlow: 41100,
        investingCashFlow: -12000,
        financingCashFlow: -32000,
        dividendsPaid: 39500,
        sharesOutstanding: 362.8,
        sourceRef: 'TCS Annual Report FY2024 / NSE Audited Filings',
        filingDate: '2024-04-12',
      },
      {
        period: 'FY2023',
        fiscalYear: 2023,
        scope: 'CONSOLIDATED',
        revenue: 225458,
        costOfRevenue: 130200,
        grossProfit: 95258,
        operatingExpenses: 37900,
        operatingProfit: 57358,
        ebitda: 60250,
        depreciation: 2892,
        interestExpense: 650,
        profitBeforeTax: 58800,
        tax: 14700,
        netProfit: 44100,
        eps: 121.20,
        cashAndEquivalents: 9800,
        shortTermInvestments: 26000,
        receivables: 39500,
        inventory: 0,
        totalCurrentAssets: 87500,
        totalAssets: 134000,
        currentLiabilities: 38500,
        totalLiabilities: 46200,
        shortTermDebt: 0,
        longTermDebt: 0,
        totalDebt: 0,
        totalEquity: 87800,
        bookValuePerShare: 242.0,
        operatingCashFlow: 41900,
        capex: 3000,
        freeCashFlow: 38900,
        investingCashFlow: -10500,
        financingCashFlow: -31000,
        dividendsPaid: 37200,
        sharesOutstanding: 365.0,
        sourceRef: 'TCS Annual Report FY2023',
        filingDate: '2023-04-12',
      },
      {
        period: 'FY2022',
        fiscalYear: 2022,
        scope: 'CONSOLIDATED',
        revenue: 191754,
        costOfRevenue: 109800,
        grossProfit: 81954,
        operatingExpenses: 32800,
        operatingProfit: 49154,
        ebitda: 51800,
        depreciation: 2646,
        interestExpense: 520,
        profitBeforeTax: 51200,
        tax: 12800,
        netProfit: 38400,
        eps: 104.80,
        cashAndEquivalents: 8500,
        shortTermInvestments: 23000,
        receivables: 34200,
        inventory: 0,
        totalCurrentAssets: 78000,
        totalAssets: 121000,
        currentLiabilities: 34000,
        totalLiabilities: 41000,
        shortTermDebt: 0,
        longTermDebt: 0,
        totalDebt: 0,
        totalEquity: 80000,
        bookValuePerShare: 218.0,
        operatingCashFlow: 37000,
        capex: 2800,
        freeCashFlow: 34200,
        investingCashFlow: -9500,
        financingCashFlow: -27000,
        dividendsPaid: 33000,
        sharesOutstanding: 366.0,
        sourceRef: 'TCS Annual Report FY2022',
        filingDate: '2022-04-11',
      },
      {
        period: 'FY2021',
        fiscalYear: 2021,
        scope: 'CONSOLIDATED',
        revenue: 164177,
        costOfRevenue: 93500,
        grossProfit: 70677,
        operatingExpenses: 28200,
        operatingProfit: 42477,
        ebitda: 44500,
        depreciation: 2023,
        interestExpense: 480,
        profitBeforeTax: 44000,
        tax: 11000,
        netProfit: 33000,
        eps: 87.60,
        cashAndEquivalents: 7800,
        shortTermInvestments: 21000,
        receivables: 30100,
        inventory: 0,
        totalCurrentAssets: 71000,
        totalAssets: 110000,
        currentLiabilities: 31000,
        totalLiabilities: 37000,
        shortTermDebt: 0,
        longTermDebt: 0,
        totalDebt: 0,
        totalEquity: 73000,
        bookValuePerShare: 194.0,
        operatingCashFlow: 35000,
        capex: 2500,
        freeCashFlow: 32500,
        investingCashFlow: -8500,
        financingCashFlow: -26000,
        dividendsPaid: 29000,
        sharesOutstanding: 370.0,
        sourceRef: 'TCS Annual Report FY2021',
        filingDate: '2021-04-12',
      },
    ];

    const tcsActivity: BusinessActivityProfile = {
      isCoreBusinessPermissible: true,
      prohibitedActivitiesDetected: [],
      prohibitedRevenuePercentage: 0.65, // Minor interest income from high bank cash balances
    };

    // 2. INFOSYS (INFY) - Shariah Compliant IT Giant
    const infy: Instrument = {
      id: 'NSE:INFY',
      symbol: 'INFY',
      name: 'Infosys Limited',
      isin: 'INE009A01021',
      exchange: 'NSE',
      country: 'IN',
      sector: 'Information Technology',
      industry: 'IT Services & Consulting',
      marketCap: 785000,
      currency: 'INR',
      currentPrice: 1890.25,
      dayChange: -12.40,
      dayChangePercent: -0.65,
      high52w: 1990.00,
      low52w: 1360.00,
      volume: 3200000,
      isActive: true,
      listingDate: '1993-06-14',
      description: 'Global consulting and IT services provider specializing in next-generation cloud and digital services.',
      businessModel: 'IT application management, generative AI platforms, digital transformation consulting.',
      competitiveMoat: 'Deep enterprise relationships across North America and Europe, strong corporate governance reputation.',
      customerConcentration: 'Low. Top 10 clients generate ~18% of revenue.',
      pricingPower: 'Moderate to high in cloud and AI migration services.',
      cyclicality: 'Defensive',
      lastPriceUpdate: '2026-09-26T15:30:00+05:30',
    };

    const infyStatements: FinancialStatement[] = [
      {
        period: 'FY2024',
        fiscalYear: 2024,
        scope: 'CONSOLIDATED',
        revenue: 153670,
        costOfRevenue: 95000,
        grossProfit: 58670,
        operatingExpenses: 26000,
        operatingProfit: 32670,
        ebitda: 35800,
        depreciation: 3130,
        interestExpense: 420,
        profitBeforeTax: 34500,
        tax: 8250,
        netProfit: 26250,
        eps: 63.50,
        cashAndEquivalents: 14200,
        shortTermInvestments: 12500,
        receivables: 28400,
        inventory: 0,
        totalCurrentAssets: 68500,
        totalAssets: 104000,
        currentLiabilities: 27500,
        totalLiabilities: 32000,
        shortTermDebt: 0,
        longTermDebt: 0,
        totalDebt: 0,
        totalEquity: 72000,
        bookValuePerShare: 174.0,
        operatingCashFlow: 24800,
        capex: 2400,
        freeCashFlow: 22400,
        investingCashFlow: -6500,
        financingCashFlow: -18000,
        dividendsPaid: 16500,
        sharesOutstanding: 415.0,
        sourceRef: 'Infosys FY2024 Audited Financial Statement',
        filingDate: '2024-04-18',
      },
      {
        period: 'FY2023',
        fiscalYear: 2023,
        scope: 'CONSOLIDATED',
        revenue: 146767,
        costOfRevenue: 90200,
        grossProfit: 56567,
        operatingExpenses: 24500,
        operatingProfit: 32067,
        ebitda: 35000,
        depreciation: 2933,
        interestExpense: 390,
        profitBeforeTax: 33800,
        tax: 8000,
        netProfit: 25800,
        eps: 61.20,
        cashAndEquivalents: 12800,
        shortTermInvestments: 11000,
        receivables: 26500,
        inventory: 0,
        totalCurrentAssets: 62000,
        totalAssets: 98000,
        currentLiabilities: 25000,
        totalLiabilities: 29000,
        shortTermDebt: 0,
        longTermDebt: 0,
        totalDebt: 0,
        totalEquity: 69000,
        bookValuePerShare: 164.0,
        operatingCashFlow: 23200,
        capex: 2200,
        freeCashFlow: 21000,
        investingCashFlow: -5800,
        financingCashFlow: -17000,
        dividendsPaid: 15500,
        sharesOutstanding: 418.0,
        sourceRef: 'Infosys FY2023 Audited Financial Statement',
        filingDate: '2023-04-13',
      },
    ];

    const infyActivity: BusinessActivityProfile = {
      isCoreBusinessPermissible: true,
      prohibitedActivitiesDetected: [],
      prohibitedRevenuePercentage: 0.85,
    };

    // 3. HDFC BANK - Negative Control: Strictly Prohibited Conventional Bank
    const hdfcBank: Instrument = {
      id: 'NSE:HDFCBANK',
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Limited',
      isin: 'INE040A01034',
      exchange: 'NSE',
      country: 'IN',
      sector: 'Financial Services',
      industry: 'Conventional Private Banking',
      marketCap: 1250000,
      currency: 'INR',
      currentPrice: 1645.00,
      dayChange: 5.20,
      dayChangePercent: 0.32,
      high52w: 1794.00,
      low52w: 1363.00,
      volume: 8500000,
      isActive: true,
      listingDate: '1995-05-19',
      description: 'Major private sector commercial bank offering retail and corporate banking services.',
      businessModel: 'Accepting interest-bearing deposits and issuing interest-bearing loans (Riba).',
      competitiveMoat: 'Extensive branch network, low cost of funds (CASA).',
      customerConcentration: 'Low.',
      pricingPower: 'High in loan spreads.',
      cyclicality: 'Cyclical',
      lastPriceUpdate: '2026-09-26T15:30:00+05:30',
    };

    const hdfcStatements: FinancialStatement[] = [
      {
        period: 'FY2024',
        fiscalYear: 2024,
        scope: 'CONSOLIDATED',
        revenue: 285000,
        costOfRevenue: 150000,
        grossProfit: 135000,
        operatingExpenses: 55000,
        operatingProfit: 80000,
        ebitda: 82000,
        depreciation: 2000,
        interestExpense: 145000, // Core interest cost
        profitBeforeTax: 78000,
        tax: 17200,
        netProfit: 60800,
        eps: 80.50,
        cashAndEquivalents: 195000,
        shortTermInvestments: 550000,
        receivables: 2400000, // Loan book
        inventory: 0,
        totalCurrentAssets: 2800000,
        totalAssets: 3500000,
        currentLiabilities: 2900000,
        totalLiabilities: 3050000,
        shortTermDebt: 350000,
        longTermDebt: 450000,
        totalDebt: 800000, // Debt & interest-bearing borrowing
        totalEquity: 450000,
        bookValuePerShare: 590.0,
        operatingCashFlow: 35000,
        capex: 4000,
        freeCashFlow: 31000,
        investingCashFlow: -20000,
        financingCashFlow: -12000,
        dividendsPaid: 14800,
        sharesOutstanding: 760.0,
        sourceRef: 'HDFC Bank FY2024 Annual Report',
        filingDate: '2024-04-20',
      },
    ];

    const hdfcActivity: BusinessActivityProfile = {
      isCoreBusinessPermissible: false,
      prohibitedActivitiesDetected: ['Conventional Interest-based Banking (Riba)'],
      prohibitedRevenuePercentage: 94.5,
    };

    // 4. RELIANCE INDUSTRIES (RELIANCE) - Borderline / High Leverage Conglomerate
    const reliance: Instrument = {
      id: 'NSE:RELIANCE',
      symbol: 'RELIANCE',
      name: 'Reliance Industries Limited',
      isin: 'INE002A01018',
      exchange: 'NSE',
      country: 'IN',
      sector: 'Energy & Conglomerate',
      industry: 'Oil, Telecom & Retail',
      marketCap: 1980000, // INR 19.8 Lakh Cr
      currency: 'INR',
      currentPrice: 2930.00,
      dayChange: -8.50,
      dayChangePercent: -0.29,
      high52w: 3217.00,
      low52w: 2220.00,
      volume: 4500000,
      isActive: true,
      listingDate: '1977-11-29',
      description: 'Diversified conglomerate spanning petrochemicals, telecom (Jio), retail, and green energy.',
      businessModel: 'Refining margins, retail store sales, 5G wireless subscriptions, digital services.',
      competitiveMoat: 'Oligopolistic scale across Indian telecom and retail; massive infrastructure assets.',
      customerConcentration: 'Low.',
      pricingPower: 'High in telecom and refining.',
      cyclicality: 'Cyclical',
      lastPriceUpdate: '2026-09-26T15:30:00+05:30',
    };

    const relianceStatements: FinancialStatement[] = [
      {
        period: 'FY2024',
        fiscalYear: 2024,
        scope: 'CONSOLIDATED',
        revenue: 914472,
        costOfRevenue: 575000,
        grossProfit: 339472,
        operatingExpenses: 161200,
        operatingProfit: 178272,
        ebitda: 178272,
        depreciation: 50832,
        interestExpense: 23293,
        profitBeforeTax: 104147,
        tax: 24500,
        netProfit: 79647,
        eps: 117.70,
        cashAndEquivalents: 45200,
        shortTermInvestments: 85000,
        receivables: 32000,
        inventory: 145000,
        totalCurrentAssets: 345000,
        totalAssets: 1750000,
        currentLiabilities: 380000,
        totalLiabilities: 950000,
        shortTermDebt: 95000,
        longTermDebt: 228000,
        totalDebt: 323000, // ~16.3% of market cap (Compliant on debt/cap, but requires close review)
        totalEquity: 800000,
        bookValuePerShare: 1180.0,
        operatingCashFlow: 145000,
        capex: 132000, // Massive capex suppresses FCF
        freeCashFlow: 13000,
        investingCashFlow: -128000,
        financingCashFlow: -15000,
        dividendsPaid: 6500,
        sharesOutstanding: 676.0,
        sourceRef: 'Reliance Industries FY2024 Integrated Annual Report',
        filingDate: '2024-04-22',
      },
    ];

    const relianceActivity: BusinessActivityProfile = {
      isCoreBusinessPermissible: true,
      prohibitedActivitiesDetected: ['Retail entertainment/media segment'],
      prohibitedRevenuePercentage: 2.1,
    };

    // 5. UNVERIFIED / MISSING DATA TEST - Insufficient Evidence Control
    const unverified: Instrument = {
      id: 'NSE:UNVERIFIED',
      symbol: 'UNVERIFIED',
      name: 'Unverified Exploratory Corp',
      isin: 'INE999X01099',
      exchange: 'NSE',
      country: 'IN',
      sector: 'Diversified',
      industry: 'Unclassified',
      marketCap: 0, // Zero market cap = Insufficient evidence
      currency: 'INR',
      currentPrice: 0, // Zero price = Invariant check fails
      dayChange: 0,
      dayChangePercent: 0,
      high52w: 0,
      low52w: 0,
      volume: 0,
      isActive: false,
      listingDate: '2025-01-01',
      description: 'Entity lacking audited multi-year filings or reliable market depth.',
      businessModel: 'Unverified.',
      competitiveMoat: 'None.',
      customerConcentration: 'Unknown.',
      pricingPower: 'Unknown.',
      cyclicality: 'Cyclical',
      lastPriceUpdate: '2026-09-26T00:00:00+05:30',
    };

    // Register all instruments
    this.instruments.set(tcs.id, tcs);
    this.statements.set(tcs.id, tcsStatements);
    this.activityProfiles.set(tcs.id, tcsActivity);

    this.instruments.set(infy.id, infy);
    this.statements.set(infy.id, infyStatements);
    this.activityProfiles.set(infy.id, infyActivity);

    this.instruments.set(hdfcBank.id, hdfcBank);
    this.statements.set(hdfcBank.id, hdfcStatements);
    this.activityProfiles.set(hdfcBank.id, hdfcActivity);

    this.instruments.set(reliance.id, reliance);
    this.statements.set(reliance.id, relianceStatements);
    this.activityProfiles.set(reliance.id, relianceActivity);

    this.instruments.set(unverified.id, unverified);
    this.statements.set(unverified.id, []); // Empty statements to test hard safety gate
    this.activityProfiles.set(unverified.id, {
      isCoreBusinessPermissible: true,
      prohibitedActivitiesDetected: [],
      prohibitedRevenuePercentage: 0,
    });

    // Seed default watchlist
    this.watchlist.add('NSE:TCS');
    this.watchlist.add('NSE:INFY');
    this.watchlist.add('NSE:RELIANCE');

    // Seed realistic personal portfolio
    const tcsHolding: PortfolioHolding = {
      id: 'h-1',
      instrumentId: 'NSE:TCS',
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd',
      sector: 'Information Technology',
      quantity: 25,
      averageBuyPrice: 3820.0,
      currentPrice: 4120.5,
      investedValue: 95500.0,
      currentValue: 103012.5,
      unrealizedPnL: 7512.5,
      unrealizedPnLPercent: 7.87,
      weightPercentage: 58.5,
      shariahStatus: 'COMPLIANT',
      assessment: 'BUY CANDIDATE',
      purificationOwedINR: 67.0, // (TCS dividend ~₹28/share * 25 shares * 0.65% purification factor)
    };

    const infyHolding: PortfolioHolding = {
      id: 'h-2',
      instrumentId: 'NSE:INFY',
      symbol: 'INFY',
      name: 'Infosys Limited',
      sector: 'Information Technology',
      quantity: 38,
      averageBuyPrice: 1680.0,
      currentPrice: 1890.25,
      investedValue: 63840.0,
      currentValue: 71829.5,
      unrealizedPnL: 7989.5,
      unrealizedPnLPercent: 12.51,
      weightPercentage: 41.5,
      shariahStatus: 'COMPLIANT',
      assessment: 'BUY CANDIDATE',
      purificationOwedINR: 42.0,
    };

    this.holdings.set(tcsHolding.id, tcsHolding);
    this.holdings.set(infyHolding.id, infyHolding);

    // Seed realistic initial price alerts
    const tcsAlert: PriceAlert = {
      id: 'alt-tcs-1',
      userId: 'usr-default',
      instrumentId: 'NSE:TCS',
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd',
      targetPrice: 3950.0,
      currentPriceAtCreation: 4120.5,
      condition: 'BELOW',
      status: 'ACTIVE',
      notes: 'Potential accumulation level if valuation P/E compresses below 30x.',
      createdAt: '2026-09-20T10:00:00Z',
    };

    const infyAlert: PriceAlert = {
      id: 'alt-infy-1',
      userId: 'usr-default',
      instrumentId: 'NSE:INFY',
      symbol: 'INFY',
      name: 'Infosys Limited',
      targetPrice: 1950.0,
      currentPriceAtCreation: 1890.25,
      condition: 'ABOVE',
      status: 'ACTIVE',
      notes: 'Valuation ceiling review trigger.',
      createdAt: '2026-09-21T11:30:00Z',
    };

    this.priceAlerts.set(tcsAlert.id, tcsAlert);
    this.priceAlerts.set(infyAlert.id, infyAlert);
  }

  public static syncPriceAlerts(alerts: PriceAlert[]): void {
    this.initialize();
    this.priceAlerts.clear();
    for (const alert of alerts) {
      this.priceAlerts.set(alert.id, alert);
    }
  }

  public static addOrUpdatePriceAlert(alert: PriceAlert): void {
    this.initialize();
    this.priceAlerts.set(alert.id, alert);
  }

  public static getPriceAlerts(): PriceAlert[] {
    this.initialize();
    this.checkPriceAlerts();
    return Array.from(this.priceAlerts.values());
  }

  public static createPriceAlert(data: {
    instrumentId?: string;
    symbol: string;
    targetPrice: number;
    condition: PriceAlertCondition;
    notes?: string;
  }): PriceAlert {
    this.initialize();
    const inst =
      (data.instrumentId ? this.getInstrumentById(data.instrumentId) : undefined) ||
      this.getInstrumentBySymbol(data.symbol);
    const currentPrice = inst ? inst.currentPrice : data.targetPrice;
    const name = inst ? inst.name : data.symbol;

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: 'usr-default',
      instrumentId: inst ? inst.id : `NSE:${data.symbol.toUpperCase()}`,
      symbol: data.symbol.toUpperCase(),
      name,
      targetPrice: Number(data.targetPrice),
      currentPriceAtCreation: currentPrice,
      condition: data.condition,
      status: 'ACTIVE',
      notes: data.notes || '',
      lastCheckedPrice: currentPrice,
      dataSource: 'VERIFIED_DISCLOSURE',
      createdAt: new Date().toISOString(),
    };

    this.priceAlerts.set(newAlert.id, newAlert);
    this.checkPriceAlerts();
    return newAlert;
  }

  public static deletePriceAlert(id: string): boolean {
    this.initialize();
    return this.priceAlerts.delete(id);
  }

  public static dismissPriceAlert(id: string): boolean {
    this.initialize();
    const alert = this.priceAlerts.get(id);
    if (alert) {
      alert.status = 'DISMISSED';
      return true;
    }
    return false;
  }

  public static checkPriceAlerts(): PriceAlert[] {
    this.initialize();
    const triggered: PriceAlert[] = [];
    for (const alert of this.priceAlerts.values()) {
      if (alert.status !== 'ACTIVE') continue;
      const inst =
        this.getInstrumentById(alert.instrumentId) || this.getInstrumentBySymbol(alert.symbol);
      if (!inst || inst.currentPrice <= 0) continue;

      alert.lastCheckedPrice = inst.currentPrice;

      if (alert.condition === 'ABOVE' && inst.currentPrice >= alert.targetPrice) {
        alert.status = 'TRIGGERED';
        alert.triggeredAt = new Date().toISOString();
        triggered.push(alert);
      } else if (alert.condition === 'BELOW' && inst.currentPrice <= alert.targetPrice) {
        alert.status = 'TRIGGERED';
        alert.triggeredAt = new Date().toISOString();
        triggered.push(alert);
      }
    }
    return triggered;
  }

  public static getInstruments(): Instrument[] {
    this.initialize();
    return Array.from(this.instruments.values()).filter((i) => i.isActive);
  }

  public static getInstrumentById(id: string): Instrument | undefined {
    this.initialize();
    return this.instruments.get(id);
  }

  public static getInstrumentBySymbol(symbol: string): Instrument | undefined {
    this.initialize();
    const clean = symbol.trim().toUpperCase();
    for (const inst of this.instruments.values()) {
      if (inst.symbol === clean || inst.id === clean || inst.id === `NSE:${clean}`) {
        return inst;
      }
    }
    return undefined;
  }

  public static getStatements(instrumentId: string): FinancialStatement[] {
    this.initialize();
    return this.statements.get(instrumentId) || [];
  }

  public static getActivityProfile(instrumentId: string): BusinessActivityProfile {
    this.initialize();
    return (
      this.activityProfiles.get(instrumentId) || {
        isCoreBusinessPermissible: true,
        prohibitedActivitiesDetected: [],
        prohibitedRevenuePercentage: 0,
      }
    );
  }

  public static getPortfolioSummary(): PortfolioSummary {
    this.initialize();
    let invested = 0;
    let currentVal = 0;
    let todayPnL = 0;
    let totalPurification = 0;
    let compliantVal = 0;

    for (const h of this.holdings.values()) {
      invested += h.investedValue;
      currentVal += h.currentValue;
      totalPurification += h.purificationOwedINR;
      if (h.shariahStatus === 'COMPLIANT') {
        compliantVal += h.currentValue;
      }
    }

    const availableCash = 34500.0;
    const portfolioValue = currentVal + availableCash;
    const overallPnL = currentVal - invested;
    const overallReturnPercent = invested > 0 ? Number(((overallPnL / invested) * 100).toFixed(2)) : 0;
    const shariahCompliantPercentage = currentVal > 0 ? Number(((compliantVal / currentVal) * 100).toFixed(1)) : 100;

    return {
      portfolioValue: Number(portfolioValue.toFixed(2)),
      investedAmount: Number(invested.toFixed(2)),
      availableCash,
      todayPnL: 840.50,
      todayPnLPercent: 0.48,
      overallPnL: Number(overallPnL.toFixed(2)),
      overallReturnPercent,
      holdingsCount: this.holdings.size,
      shariahCompliantPercentage,
      totalPurificationDueINR: Number(totalPurification.toFixed(2)),
      lastUpdated: new Date().toISOString(),
    };
  }

  public static getHoldings(): PortfolioHolding[] {
    this.initialize();
    return Array.from(this.holdings.values());
  }

  public static getWatchlist(): Instrument[] {
    this.initialize();
    const result: Instrument[] = [];
    for (const id of this.watchlist) {
      const inst = this.instruments.get(id);
      if (inst) result.push(inst);
    }
    return result;
  }

  public static toggleWatchlist(instrumentId: string): boolean {
    this.initialize();
    if (this.watchlist.has(instrumentId)) {
      this.watchlist.delete(instrumentId);
      return false;
    } else {
      this.watchlist.add(instrumentId);
      return true;
    }
  }

  public static getMarketIndices(): MarketIndex[] {
    return [
      {
        name: 'NIFTY 50',
        current: 25810.45,
        change: 142.10,
        changePercent: 0.55,
        status: 'CLOSED',
        lastUpdated: '2026-09-26T15:30:00+05:30',
      },
      {
        name: 'BSE SENSEX',
        current: 84544.30,
        change: 410.80,
        changePercent: 0.49,
        status: 'CLOSED',
        lastUpdated: '2026-09-26T15:30:00+05:30',
      },
      {
        name: 'NIFTY 500',
        current: 24150.20,
        change: 98.40,
        changePercent: 0.41,
        status: 'CLOSED',
        lastUpdated: '2026-09-26T15:30:00+05:30',
      },
      {
        name: 'MARKET BREADTH',
        current: 1.45, // Advances / Declines ratio
        change: 0.12,
        changePercent: 9.02,
        status: 'CLOSED',
        lastUpdated: '2026-09-26T15:30:00+05:30',
      },
    ];
  }

  public static getUserRules(): UserRules {
    return this.userRules;
  }

  public static updateUserRules(rules: Partial<UserRules>): UserRules {
    this.userRules = { ...this.userRules, ...rules };
    return this.userRules;
  }

  public static getImportantEvents(): ImportantEventItem[] {
    return [
      {
        id: 'ev-1',
        instrumentSymbol: 'TCS',
        instrumentName: 'Tata Consultancy Services Ltd',
        eventType: 'EARNINGS_RELEASE',
        eventDate: '2026-10-10',
        headline: 'Q2 FY27 Earnings Board Meeting & Interim Dividend',
        materiality: 'HIGH',
        impactSummary: 'Board will consider financial results and approve second interim dividend.',
      },
      {
        id: 'ev-2',
        instrumentSymbol: 'INFY',
        instrumentName: 'Infosys Limited',
        eventType: 'EARNINGS_RELEASE',
        eventDate: '2026-10-16',
        headline: 'Q2 FY27 Financial Results & Guidance Update',
        materiality: 'HIGH',
        impactSummary: 'Management will provide revised constant-currency revenue guidance.',
      },
      {
        id: 'ev-3',
        instrumentSymbol: 'RELIANCE',
        instrumentName: 'Reliance Industries Limited',
        eventType: 'VALUATION_SHIFT',
        eventDate: '2026-09-20',
        headline: 'Retail capex moderation reported in quarterly disclosure',
        materiality: 'MEDIUM',
        impactSummary: 'Reduces projected debt borrowing, improving margin of safety under AAOIFI ratios.',
      },
    ];
  }

  public static getOpportunityAlerts(): OpportunityAlert[] {
    return [
      {
        id: 'alt-1',
        instrumentSymbol: 'TCS',
        instrumentName: 'Tata Consultancy Services Ltd',
        type: 'VALUATION_ATTRACTIVE',
        headline: 'Valuation cushion expands on healthy FCF generation',
        description: 'Trailing FCF of ₹41,100 Cr yields 2.76% FCF yield with zero net debt.',
        severity: 'INFO',
        date: '2026-09-25',
      },
      {
        id: 'alt-2',
        instrumentSymbol: 'RELIANCE',
        instrumentName: 'Reliance Industries Limited',
        type: 'SHARIAH_MILESTONE',
        headline: 'Shariah financial screen requires quarterly verification',
        description: 'Total debt to market cap is 16.3%, safely within 33% AAOIFI limit but capex pacing remains critical.',
        severity: 'REVIEW',
        date: '2026-09-24',
      },
      {
        id: 'alt-3',
        instrumentSymbol: 'INFY',
        instrumentName: 'Infosys Limited',
        type: 'EARNINGS_ANNOUNCED',
        headline: 'Audited filings confirm 0.85% purification percentage',
        description: 'Dividend purification factor confirmed from annual non-operating interest line items.',
        severity: 'ATTENTION',
        date: '2026-09-22',
      },
    ];
  }

  public static getFyersStatus(): FyersAdapterStatus {
    const isConn = Boolean(process.env.FYERS_ACCESS_TOKEN);
    const isSandbox = process.env.FYERS_SANDBOX === 'true' || !process.env.FYERS_APP_ID;
    return {
      state: isConn ? 'CONNECTED' : 'NOT CONNECTED',
      connected: isConn,
      accountType: 'FYERS_BROKER_ADAPTER',
      mode: isSandbox ? 'SANDBOX_SIMULATOR' : 'LIVE_BROKER',
      isSandbox,
      serverSideConfigured: Boolean(process.env.FYERS_APP_ID && !isSandbox),
      marketDataLive: isConn,
      autoTradingBlocked: true, // Non-negotiable invariant
      lastHeartbeat: new Date().toISOString(),
      appIdConfigured: Boolean(process.env.FYERS_APP_ID),
      tokenConfigured: isConn,
      syncMessage: isConn
        ? 'Verified active FYERS API session'
        : isSandbox
        ? 'FYERS Sandbox Simulator available for testing without credentials'
        : 'FYERS session not connected',
    };
  }

  /**
   * Generates a manual order guidance slip for the user to execute manually in FYERS.
   */
  public static generateManualOrderSlip(
    symbol: string,
    allocatedINR: number
  ): FyersManualOrderSlip | null {
    const inst = this.getInstrumentBySymbol(symbol);
    if (!inst || inst.currentPrice <= 0) return null;

    const suggestedQty = Math.max(1, Math.floor(allocatedINR / inst.currentPrice));
    const estimatedInvestmentINR = Number((suggestedQty * inst.currentPrice).toFixed(2));
    const limitLower = Number((inst.currentPrice * 0.995).toFixed(2));
    const limitUpper = Number((inst.currentPrice * 1.005).toFixed(2));

    return {
      symbol: inst.symbol,
      exchange: 'NSE',
      transactionType: 'BUY',
      productType: 'CNC',
      suggestedQty,
      limitPrice: inst.currentPrice,
      limitPriceRange: `₹${limitLower} - ₹${limitUpper}`,
      estimatedInvestmentINR,
      executionInstructions: [
        '1. Open your official FYERS mobile app or web terminal.',
        `2. Search for "${inst.symbol}" and select NSE Equity (Cash/Delivery).`,
        `3. Select Product Type: "CNC" (Cash and Carry - Long Term Delivery).`,
        `4. Set Order Type: "LIMIT" with price ₹${inst.currentPrice} (or within range ${limitLower} - ${limitUpper}).`,
        `5. Enter Quantity: ${suggestedQty} shares.`,
        '6. Review order details and manually submit. DO NOT use intraday margin or leverage.',
      ],
    };
  }

  /**
   * Complete DO EVERYTHING research pipeline.
   * Executes all domain engines deterministically and produces an immutable evidence snapshot.
   */
  public static runCompleteResearch(instrumentId: string): CompleteResearchReport {
    this.initialize();
    const inst = this.instruments.get(instrumentId);
    if (!inst) {
      throw new Error(`Instrument ${instrumentId} not found in universe.`);
    }

    const statements = this.statements.get(instrumentId) || [];
    const activity = this.getActivityProfile(instrumentId);

    // 1. Shariah Screen
    const dummyStatement: FinancialStatement = statements[0] || {
      period: 'FY2024',
      fiscalYear: 2024,
      scope: 'CONSOLIDATED',
      revenue: 0,
      costOfRevenue: 0,
      grossProfit: 0,
      operatingExpenses: 0,
      operatingProfit: 0,
      ebitda: 0,
      depreciation: 0,
      interestExpense: 0,
      profitBeforeTax: 0,
      tax: 0,
      netProfit: 0,
      eps: 0,
      cashAndEquivalents: 0,
      shortTermInvestments: 0,
      receivables: 0,
      inventory: 0,
      totalCurrentAssets: 0,
      totalAssets: 0,
      currentLiabilities: 0,
      totalLiabilities: 0,
      shortTermDebt: 0,
      longTermDebt: 0,
      totalDebt: 0,
      totalEquity: 0,
      bookValuePerShare: 0,
      operatingCashFlow: 0,
      capex: 0,
      freeCashFlow: 0,
      investingCashFlow: 0,
      financingCashFlow: 0,
      dividendsPaid: 0,
      sharesOutstanding: 0,
      sourceRef: 'None',
      filingDate: '2024-03-31',
    };

    const shariah = ShariahEngine.evaluate(inst, dummyStatement, activity);

    // 2. Financial Ratios & Cash Divergence
    let ratios = {
      peRatio: 0,
      pbRatio: 0,
      roe: 0,
      roce: 0,
      eps: 0,
      fcf: 0,
      fcfYield: 0,
      ebitdaMargin: 0,
      operatingMargin: 0,
      netMargin: 0,
      debtToEquity: 0,
      interestCoverage: 0,
      currentRatio: 0,
      cashConversionCycle: 0,
      receivableDays: 0,
      inventoryDays: 0,
      payableDays: 45,
      cagr3YRevenue: 0,
      cagr3YProfit: 0,
      cagr3YFCF: 0,
      cagr5YRevenue: 0,
      cagr5YProfit: 0,
    };
    let earningsQuality: EarningsQualityAnalysis = {
      cashToNetProfitRatio: 0,
      accrualsPercentage: 0,
      persistentDivergence: false,
      divergenceSeverity: 'LOW',
      findings: ['No statements available.'],
    };

    if (statements.length > 0) {
      ratios = FinancialCalculator.computeRatios(inst.currentPrice, inst.marketCap, statements);
      earningsQuality = FinancialCalculator.analyzeEarningsQuality(statements);
    }

    // 3. Valuation & Scenarios
    const valuation = ValuationEngine.evaluate(inst, dummyStatement, ratios);

    // 4. Risks & Red Team
    const risks = RiskEngine.evaluate(inst, dummyStatement, ratios, shariah);
    const redTeam = RedTeamEngine.execute(inst, dummyStatement, ratios, valuation, shariah, earningsQuality);

    // 5. Evidence Quality
    const evidenceQuality = statements.length >= 2 && inst.marketCap > 0 ? 'STRONG' : 'INSUFFICIENT';

    // 6. Mandatory Safety Gate Check
    const assessmentOutcome = SafetyGate.determineAssessment(
      inst,
      statements,
      ratios,
      shariah,
      valuation,
      earningsQuality,
      evidenceQuality
    );

    // 7. Evidence Snapshot with Provenance
    const evidenceSnapshot: EvidenceRecord[] = [
      {
        id: 'ev-pe',
        metric: 'Price-to-Earnings Ratio (P/E)',
        value: ratios.peRatio,
        period: statements[0]?.period || 'FY24',
        scope: statements[0]?.scope || 'CONSOLIDATED',
        source: statements[0]?.sourceRef || 'Exchange Filing',
        sourceType: 'CALCULATION',
        publicationDate: statements[0]?.filingDate || '2024-04-12',
        retrievalTimestamp: new Date().toISOString(),
        confidence: evidenceQuality,
        formula: 'Current Market Price / Basic EPS',
      },
      {
        id: 'ev-roce',
        metric: 'Return on Capital Employed (ROCE)',
        value: `${ratios.roce}%`,
        period: statements[0]?.period || 'FY24',
        scope: statements[0]?.scope || 'CONSOLIDATED',
        source: statements[0]?.sourceRef || 'Exchange Filing',
        sourceType: 'CALCULATION',
        publicationDate: statements[0]?.filingDate || '2024-04-12',
        retrievalTimestamp: new Date().toISOString(),
        confidence: evidenceQuality,
        formula: 'Operating Profit (EBIT) / (Total Assets - Current Liabilities)',
      },
      {
        id: 'ev-shariah-debt',
        metric: 'Shariah Debt Ratio',
        value: `${shariah.financialScreen.debtToMarketCapPercentage}%`,
        period: statements[0]?.period || 'FY24',
        scope: statements[0]?.scope || 'CONSOLIDATED',
        source: 'AAOIFI Standard 21 Audit / Annual Statement',
        sourceType: 'CALCULATION',
        publicationDate: statements[0]?.filingDate || '2024-04-12',
        retrievalTimestamp: new Date().toISOString(),
        confidence: evidenceQuality,
        formula: '(Total Interest-Bearing Debt / 36-Month Avg Market Cap) * 100 < 33%',
      },
      {
        id: 'ev-cash-div',
        metric: 'Cash-to-Net Profit Ratio',
        value: `${earningsQuality.cashToNetProfitRatio}x`,
        period: statements[0]?.period || 'FY24',
        scope: statements[0]?.scope || 'CONSOLIDATED',
        source: 'Cash Flow Statement Reconciliation',
        sourceType: 'CALCULATION',
        publicationDate: statements[0]?.filingDate || '2024-04-12',
        retrievalTimestamp: new Date().toISOString(),
        confidence: evidenceQuality,
        formula: 'Operating Cash Flow / Reported Net Profit',
      },
    ];

    // Maintain immutable history snapshot
    const versionItem: AssessmentVersion = {
      id: `ver-${Date.now()}`,
      instrumentId: inst.id,
      assessmentDate: new Date().toISOString().split('T')[0],
      decision: assessmentOutcome.decision,
      holdingDecision: assessmentOutcome.holdingDecision,
      evidenceQuality,
      shariahStatus: shariah.status,
      summaryWhy: assessmentOutcome.summaryWhy,
      summaryWhyNot: assessmentOutcome.summaryWhyNot,
      invalidationTriggers: redTeam.invalidationConditions,
      targetAllocationRange: assessmentOutcome.positionGuidance.suggestedAllocationRange,
      reproducibilityChecksum: `CRC32-${inst.symbol}-${statements[0]?.period || 'NIL'}-${ratios.peRatio}`,
    };

    const existingHistory = this.assessmentHistory.get(inst.id) || [];
    this.assessmentHistory.set(inst.id, [versionItem, ...existingHistory]);

    return {
      instrument: inst,
      evidenceQuality,
      statements,
      ratios,
      earningsQuality,
      shariah,
      valuation,
      risks,
      redTeam,
      positionGuidance: assessmentOutcome.positionGuidance,
      finalAssessment: assessmentOutcome.decision,
      holdingDecision: assessmentOutcome.holdingDecision,
      evidenceSnapshot,
      assessmentHistory: this.assessmentHistory.get(inst.id) || [versionItem],
      generatedAt: new Date().toISOString(),
    };
  }
}
