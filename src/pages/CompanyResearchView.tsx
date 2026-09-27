import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCheck,
  TrendingUp,
  Layers,
  HelpCircle,
  Clock,
  Briefcase,
  Sliders,
  DollarSign,
  History,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Bell,
} from 'lucide-react';
import { CompleteResearchReport, AssessmentDecision, PriceAlert } from '../types';
import { InfoTooltip } from '../components/InfoTooltip';
import { EvidenceModal } from '../components/EvidenceModal';
import { ManualOrderModal } from '../components/ManualOrderModal';
import { ApiClient } from '../services/apiClient';

interface CompanyResearchViewProps {
  report: CompleteResearchReport | null;
  isLoading: boolean;
  onRefreshResearch: (symbol: string) => void;
  onSearchSymbol: (symbol: string) => void;
  onOpenPriceAlertModal?: (symbol: string, currentPrice: number, name: string) => void;
  priceAlerts?: PriceAlert[];
}

export const CompanyResearchView: React.FC<CompanyResearchViewProps> = ({
  report,
  isLoading,
  onRefreshResearch,
  onSearchSymbol,
  onOpenPriceAlertModal,
  priceAlerts = [],
}) => {
  const [viewMode, setViewMode] = useState<'QUICK_DECISION' | 'DEEP_RESEARCH'>('QUICK_DECISION');
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderSlip, setOrderSlip] = useState<any>(null);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [activePipelineStep, setActivePipelineStep] = useState<string>('');

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="text-sm font-semibold text-slate-700">
          Gathering and Verifying Disclosures...
        </div>
        <p className="text-xs text-slate-400">
          Calculating deterministic ratios and evaluating AAOIFI Shariah criteria.
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-20 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-4">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          No Company Selected for Research
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Search for an Indian listed equity in the header bar or select a recommended benchmark company below.
        </p>
        <div className="flex justify-center gap-2 pt-2">
          {['TCS', 'INFY', 'RELIANCE', 'HDFCBANK'].map((sym) => (
            <button
              key={sym}
              onClick={() => onSearchSymbol(sym)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-xs font-semibold text-slate-700 rounded-lg transition-colors border border-slate-200"
            >
              {sym}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const { instrument, ratios, shariah, valuation, risks, redTeam, positionGuidance, finalAssessment, statements } = report;

  const handleRunDoEverything = async () => {
    setIsPipelineRunning(true);
    const steps = [
      '1. Verifying Security Identity & ISIN...',
      '2. Ingesting Consolidated 5-Year Filings...',
      '3. Auditing Business Activity for Non-Permissible Segments...',
      '4. Deterministically Screening AAOIFI Standard 21 Debt & Liquidity Ratios...',
      '5. Reconciling Operating Cash Flow vs Net Profit (Accruals Audit)...',
      '6. Computing P/E, P/B, ROE, ROCE & Working Capital Cycles...',
      '7. Modeling Bull / Base / Bear Valuation Scenarios...',
      '8. Stress-Testing Thesis in Red-Team Engine...',
      '9. Passing Final Pre-Assessment Safety Gate...',
    ];

    for (const step of steps) {
      setActivePipelineStep(step);
      await new Promise((r) => setTimeout(r, 180));
    }
    setIsPipelineRunning(false);
    onRefreshResearch(instrument.symbol);
  };

  const handleOpenOrderSlip = async () => {
    const slip = await ApiClient.getOrderSlip(instrument.symbol, 50000);
    setOrderSlip(slip);
    setIsOrderModalOpen(true);
  };

  const getDecisionBadge = (decision: AssessmentDecision) => {
    switch (decision) {
      case 'BUY CANDIDATE':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-600',
          label: 'BUY CANDIDATE',
        };
      case 'WAIT / INVESTIGATE':
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          dot: 'bg-blue-600',
          label: 'WAIT / INVESTIGATE',
        };
      case 'HIGHER RISK / SPECULATIVE':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-600',
          label: 'HIGHER RISK / SPECULATIVE',
        };
      case 'AVOID / NOT A CANDIDATE':
        return {
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          dot: 'bg-rose-600',
          label: 'AVOID / NOT A CANDIDATE',
        };
      case 'REQUIRES REVIEW':
        return {
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
          dot: 'bg-purple-600',
          label: 'REQUIRES REVIEW',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          dot: 'bg-slate-500',
          label: 'NO DECISION — INSUFFICIENT EVIDENCE',
        };
    }
  };

  const badge = getDecisionBadge(finalAssessment);

  return (
    <div className="space-y-6">
      {/* Evidence & Order Modals */}
      {isEvidenceOpen && (
        <EvidenceModal
          evidence={report.evidenceSnapshot}
          onClose={() => setIsEvidenceOpen(false)}
        />
      )}
      {isOrderModalOpen && orderSlip && (
        <ManualOrderModal
          slip={orderSlip}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}

      {/* TOP HEADER: Company Title, Exchange Identity, Real-Time Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {instrument.name}
              </h1>
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                {instrument.exchange}:{instrument.symbol}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center space-x-3">
              <span>ISIN: {instrument.isin}</span>
              <span>•</span>
              <span>{instrument.sector} ({instrument.industry})</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">{instrument.cyclicality}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs font-medium">
              <button
                onClick={() => setViewMode('QUICK_DECISION')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'QUICK_DECISION'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quick Decision
              </button>
              <button
                onClick={() => setViewMode('DEEP_RESEARCH')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'DEEP_RESEARCH'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Deep Research
              </button>
            </div>

            {/* DO EVERYTHING Action Button */}
            <button
              onClick={handleRunDoEverything}
              disabled={isPipelineRunning}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPipelineRunning ? 'Running Pipeline...' : 'DO EVERYTHING'}</span>
            </button>

            {/* Inspect Evidence Button */}
            <button
              onClick={() => setIsEvidenceOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Provenance</span>
            </button>
          </div>
        </div>

        {/* Live Pipeline Running Indicator */}
        {isPipelineRunning && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-900 flex items-center space-x-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            <span>{activePipelineStep}</span>
          </div>
        )}

        {/* Price & Market Cap Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Current Price (LTP)</span>
              {onOpenPriceAlertModal && (
                <button
                  onClick={() =>
                    onOpenPriceAlertModal(
                      instrument.symbol,
                      instrument.currentPrice,
                      instrument.name
                    )
                  }
                  className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                  title="Set price threshold alert"
                >
                  <Bell className="w-2.5 h-2.5" />
                  <span>Alert</span>
                </button>
              )}
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
              ₹{instrument.currentPrice.toLocaleString('en-IN')}
            </div>
            <div
              className={`text-[11px] font-mono font-medium ${
                instrument.dayChange >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {instrument.dayChange >= 0 ? '+' : ''}₹{instrument.dayChange} ({instrument.dayChangePercent}%)
            </div>
            {priceAlerts.filter((a) => a.symbol === instrument.symbol).length > 0 && (
              <div className="mt-1 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950 px-1.5 py-0.5 rounded inline-flex items-center space-x-1">
                <Bell className="w-2.5 h-2.5" />
                <span>
                  {priceAlerts.filter((a) => a.symbol === instrument.symbol).length} Alert Active
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="text-slate-400">Market Capitalization</div>
            <div className="text-base font-bold text-slate-800 font-mono mt-0.5">
              ₹{instrument.marketCap.toLocaleString('en-IN')} Cr
            </div>
            <div className="text-[11px] text-slate-400">NSE Listed Equity</div>
          </div>

          <div>
            <div className="text-slate-400">52-Week Range</div>
            <div className="text-xs font-medium text-slate-700 font-mono mt-0.5">
              ₹{instrument.low52w} — ₹{instrument.high52w}
            </div>
            <div className="text-[11px] text-slate-400">Audited Price High/Low</div>
          </div>

          <div>
            <div className="text-slate-400">Statement Scope</div>
            <div className="text-xs font-semibold text-emerald-800 font-mono mt-0.5">
              {statements[0]?.scope || 'CONSOLIDATED'}
            </div>
            <div className="text-[11px] text-slate-400">Audited Annual Group Filings</div>
          </div>
        </div>
      </div>

      {/* FINAL INVESTMENT ASSESSMENT CARD (Always visible) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border flex items-center space-x-2 ${badge.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
              <span>{badge.label}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Evidence Quality: <strong className="text-slate-800">{report.evidenceQuality}</strong>
            </span>
          </div>

          {/* Position Sizing Guidance Box */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-500 font-medium">Position Sizing:</span>
            <span className="font-bold text-emerald-800 font-mono">
              {positionGuidance.suggestedAllocationRange}
            </span>
            <span className="text-slate-400">({positionGuidance.tier})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Top Reasons WHY */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3.5 space-y-1.5">
            <div className="font-bold text-emerald-900 flex items-center space-x-1.5 uppercase tracking-wider text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Supporting Evidence (Why Deserves Capital)</span>
            </div>
            <ul className="space-y-1 text-slate-700 leading-relaxed">
              {redTeam.whyDeservesCapital.slice(0, 3).map((w, idx) => (
                <li key={idx}>• {w}</li>
              ))}
            </ul>
          </div>

          {/* Major Concerns & Stress Test (WHY NOT) */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3.5 space-y-1.5">
            <div className="font-bold text-amber-900 flex items-center space-x-1.5 uppercase tracking-wider text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Red-Team Stress Test (Why NOT This Company)</span>
            </div>
            <ul className="space-y-1 text-slate-700 leading-relaxed">
              {redTeam.whyNotThisCompany.slice(0, 3).map((wn, idx) => (
                <li key={idx}>• {wn}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Manual FYERS Order Slip Generator Button */}
        {finalAssessment === 'BUY CANDIDATE' && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleOpenOrderSlip}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Generate FYERS Manual Execution Slip</span>
            </button>
          </div>
        )}
      </div>

      {/* SHARIAH HARD GATE SCREENING CARD */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div
              className={`p-1.5 rounded-lg ${
                shariah.status === 'COMPLIANT'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Shariah Screening (Hard Gate)
              </h2>
              <p className="text-[11px] text-slate-500">
                Deterministic AAOIFI Standard No. (21) Evaluation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${
                shariah.status === 'COMPLIANT'
                  ? 'bg-emerald-100 text-emerald-800'
                  : shariah.status === 'REQUIRES_REVIEW'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {shariah.status}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Ver: {shariah.methodologyVersion}
            </span>
          </div>
        </div>

        {/* Business Activity & Financial Ratios Screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Gate 1: Business Activity Screen */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>Gate 1: Business Activity Screen</span>
              <span
                className={`font-mono text-[11px] font-bold ${
                  shariah.businessScreen.status === 'PASS'
                    ? 'text-emerald-700'
                    : 'text-rose-600'
                }`}
              >
                [{shariah.businessScreen.status}]
              </span>
            </div>
            <div className="text-slate-600">
              Prohibited Revenue: <strong className="font-mono">{shariah.businessScreen.prohibitedRevenuePercentage}%</strong> (AAOIFI limit &le; 5.0%)
            </div>
            <div className="text-[11px] text-slate-500">
              {shariah.businessScreen.prohibitedActivities.length > 0
                ? `Activities detected: ${shariah.businessScreen.prohibitedActivities.join(', ')}`
                : 'Zero prohibited activities detected in primary operations.'}
            </div>
          </div>

          {/* Gate 2: Financial Thresholds */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>Gate 2: Financial Ratios (AAOIFI)</span>
              <span className="text-[11px] text-emerald-700 font-mono font-bold">[PASS]</span>
            </div>
            <div className="space-y-1 text-slate-600 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Debt / Market Cap:</span>
                <span className="font-bold text-slate-800">
                  {shariah.financialScreen.debtToMarketCapPercentage}% (&lt; 33.0%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cash & Securities / MCap:</span>
                <span className="font-bold text-slate-800">
                  {shariah.financialScreen.interestSecuritiesPercentage}% (&lt; 33.0%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Liquid Assets / Total Assets:</span>
                <span className="font-bold text-slate-800">
                  {shariah.financialScreen.receivablesToAssetsPercentage}% (&lt; 50.0%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dividend Purification Calculator */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-bold text-emerald-950">Dividend Purification Factor:</span>{' '}
            <span className="font-mono font-bold text-emerald-800">
              {shariah.purificationPercentage}%
            </span>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Donate {shariah.purificationPercentage}% of dividend receipts to charity without expectation of reward.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Audit Date: {shariah.screeningDate}
          </div>
        </div>
      </section>

      {/* DETERMINISTIC FINANCIAL RATIOS GRID */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Audited Financial Ratios
            </h2>
          </div>
          <span className="text-xs text-slate-400">Deterministic Calculations</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {/* P/E Ratio */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 flex items-center justify-between">
              <span>Price-to-Earnings (P/E)</span>
              <InfoTooltip
                term="Price-to-Earnings Ratio (P/E)"
                explanation="Current share price divided by Earnings Per Share. Indicates how many rupees investors pay per rupee of annual earnings."
              />
            </div>
            <div className="text-base font-bold text-slate-900 font-mono mt-1">
              {ratios.peRatio}x
            </div>
            <div className="text-[10px] text-slate-400">EPS: ₹{ratios.eps}</div>
          </div>

          {/* P/B Ratio */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 flex items-center justify-between">
              <span>Price-to-Book (P/B)</span>
              <InfoTooltip
                term="Price-to-Book Ratio (P/B)"
                explanation="Current share price divided by audited book value per share."
              />
            </div>
            <div className="text-base font-bold text-slate-900 font-mono mt-1">
              {ratios.pbRatio}x
            </div>
            <div className="text-[10px] text-slate-400">Book Value: ₹{statements[0]?.bookValuePerShare}</div>
          </div>

          {/* Return on Capital Employed (ROCE) */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 flex items-center justify-between">
              <span>Return on Capital (ROCE)</span>
              <InfoTooltip
                term="Return on Capital Employed (ROCE)"
                explanation="Operating Profit (EBIT) divided by total capital employed. Measures the efficiency of operating capital allocation."
              />
            </div>
            <div className="text-base font-bold text-emerald-700 font-mono mt-1">
              {ratios.roce}%
            </div>
            <div className="text-[10px] text-slate-400">Benchmark &gt; 20%</div>
          </div>

          {/* Return on Equity (ROE) */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 flex items-center justify-between">
              <span>Return on Equity (ROE)</span>
              <InfoTooltip
                term="Return on Equity (ROE)"
                explanation="Net profit divided by total shareholders equity."
              />
            </div>
            <div className="text-base font-bold text-emerald-700 font-mono mt-1">
              {ratios.roe}%
            </div>
            <div className="text-[10px] text-slate-400">Net equity return</div>
          </div>

          {/* Free Cash Flow (FCF) */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 flex items-center justify-between">
              <span>Free Cash Flow (FCF)</span>
              <InfoTooltip
                term="Free Cash Flow (FCF)"
                explanation="Operating cash flow minus capital expenditures. Real cash generated for shareholders."
              />
            </div>
            <div className="text-base font-bold text-slate-900 font-mono mt-1">
              ₹{ratios.fcf.toLocaleString('en-IN')} Cr
            </div>
            <div className="text-[10px] text-slate-400">Yield: {ratios.fcfYield}%</div>
          </div>

          {/* Operating Margin */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 flex items-center justify-between">
              <span>Operating Margin</span>
              <InfoTooltip
                term="Operating Margin"
                explanation="Operating profit as a percentage of gross revenues."
              />
            </div>
            <div className="text-base font-bold text-slate-900 font-mono mt-1">
              {ratios.operatingMargin}%
            </div>
            <div className="text-[10px] text-slate-400">EBITDA: {ratios.ebitdaMargin}%</div>
          </div>

          {/* Debt-to-Equity */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 flex items-center justify-between">
              <span>Debt / Equity</span>
              <InfoTooltip
                term="Debt to Equity"
                explanation="Total interest-bearing debt divided by total shareholders equity."
              />
            </div>
            <div className="text-base font-bold text-slate-900 font-mono mt-1">
              {ratios.debtToEquity}x
            </div>
            <div className="text-[10px] text-slate-400">Interest Coverage: {ratios.interestCoverage}x</div>
          </div>

          {/* Cash Conversion Cycle */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 flex items-center justify-between">
              <span>Cash Cycle (CCC)</span>
              <InfoTooltip
                term="Cash Conversion Cycle (CCC)"
                explanation="Days required to turn business investments in inventory and receivables back into cash."
              />
            </div>
            <div className="text-base font-bold text-slate-900 font-mono mt-1">
              {ratios.cashConversionCycle} Days
            </div>
            <div className="text-[10px] text-slate-400">Receivable Days: {ratios.receivableDays}d</div>
          </div>
        </div>
      </section>

      {/* EARNINGS QUALITY & CASH VS PROFIT DIVERGENCE */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Earnings Quality & Accruals Audit
            </h2>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              report.earningsQuality.persistentDivergence
                ? 'bg-rose-100 text-rose-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {report.earningsQuality.persistentDivergence ? 'Divergence Detected' : 'Clean Cash Flow'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500">Operating Cash / Net Profit</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">
              {report.earningsQuality.cashToNetProfitRatio}x
            </div>
            <div className="text-[11px] text-slate-400">Target &ge; 0.85x conversion</div>
          </div>

          <div className="md:col-span-2 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <div className="font-semibold text-slate-800">Accrual Findings:</div>
            <ul className="text-slate-600 text-[11px] space-y-1">
              {report.earningsQuality.findings.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* VALUATION & SCENARIOS PLANNER */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Valuation Scenarios (3-Year Horizon)
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Current Multiple Percentile: <strong className="text-slate-900">{valuation.pePercentile5Y}th</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Bull Scenario */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/60 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">
                Bull Case
              </span>
              <span className="font-mono font-bold text-emerald-700">
                +{valuation.scenarios.bull.upsidePercentage}%
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-900">
              ₹{valuation.scenarios.bull.targetPrice}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {valuation.scenarios.bull.assumptions}
            </p>
          </div>

          {/* Base Scenario */}
          <div className="p-4 bg-blue-50/60 border border-blue-200/60 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
                Base Case
              </span>
              <span className="font-mono font-bold text-blue-700">
                +{valuation.scenarios.base.upsidePercentage}%
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-900">
              ₹{valuation.scenarios.base.targetPrice}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {valuation.scenarios.base.assumptions}
            </p>
          </div>

          {/* Bear Scenario */}
          <div className="p-4 bg-rose-50/60 border border-rose-200/60 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-rose-900 uppercase tracking-wider text-[11px]">
                Bear Case
              </span>
              <span className="font-mono font-bold text-rose-700">
                {valuation.scenarios.bear.downsidePercentage}%
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-900">
              ₹{valuation.scenarios.bear.targetPrice}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {valuation.scenarios.bear.assumptions}
            </p>
          </div>
        </div>
      </section>

      {/* THESIS INVALIDATION & RED-TEAM KILL-SWITCHES */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Thesis Invalidation Triggers (Kill-Switches)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Strict Exit Conditions</span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-2 text-slate-700">
          <p className="text-[11px] font-semibold text-slate-900">
            If any of these verifiable events materialize, the thesis is broken and position must be reviewed or liquidated:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600 text-[11px] leading-relaxed">
            {redTeam.invalidationConditions.map((cond, i) => (
              <li key={i}>{cond}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* MULTI-YEAR STATEMENTS TABLE (DEEP RESEARCH MODE) */}
      {viewMode === 'DEEP_RESEARCH' && statements.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Audited 4-Year Statement History (Consolidated INR Cr)
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Scope: CONSOLIDATED</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Metric (INR Crores)</th>
                  {statements.map((s) => (
                    <th key={s.period} className="py-2.5 px-3 font-mono text-right">
                      {s.period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2 px-3 font-medium">Revenues</td>
                  {statements.map((s) => (
                    <td key={s.period} className="py-2 px-3 font-mono text-right">
                      ₹{s.revenue.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Operating Profit (EBIT)</td>
                  {statements.map((s) => (
                    <td key={s.period} className="py-2 px-3 font-mono text-right">
                      ₹{s.operatingProfit.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Net Profit (PAT)</td>
                  {statements.map((s) => (
                    <td key={s.period} className="py-2 px-3 font-mono text-right font-semibold text-slate-900">
                      ₹{s.netProfit.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Operating Cash Flow (OCF)</td>
                  {statements.map((s) => (
                    <td key={s.period} className="py-2 px-3 font-mono text-right text-emerald-800 font-medium">
                      ₹{s.operatingCashFlow.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Free Cash Flow (FCF)</td>
                  {statements.map((s) => (
                    <td key={s.period} className="py-2 px-3 font-mono text-right font-bold text-emerald-700">
                      ₹{s.freeCashFlow.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Total Debt</td>
                  {statements.map((s) => (
                    <td key={s.period} className="py-2 px-3 font-mono text-right">
                      ₹{s.totalDebt.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Total Shareholders Equity</td>
                  {statements.map((s) => (
                    <td key={s.period} className="py-2 px-3 font-mono text-right">
                      ₹{s.totalEquity.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ASSESSMENT HISTORY (IMMUTABLE LOG) */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Assessment Version History (Investment Memory)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Append-Only / Immutable</span>
        </div>

        <div className="space-y-2 text-xs">
          {report.assessmentHistory.map((hist) => (
            <div
              key={hist.id}
              className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="font-semibold text-slate-900 flex items-center space-x-2">
                  <span>{hist.decision}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    [{hist.assessmentDate}]
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Allocation: {hist.targetAllocationRange} • Shariah: {hist.shariahStatus}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Checksum: {hist.reproducibilityChecksum}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
