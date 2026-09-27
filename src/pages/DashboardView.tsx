import React from 'react';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  BookmarkCheck,
  Calendar,
  PiggyBank,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Bell,
} from 'lucide-react';
import {
  PortfolioSummary,
  MarketIndex,
  OpportunityAlert,
  Instrument,
  ImportantEventItem,
  UserRules,
  PriceAlert,
} from '../types';
import { InfoTooltip } from '../components/InfoTooltip';
import { formatUserTime } from '../utils/dateTime';

interface DashboardViewProps {
  summary: PortfolioSummary;
  markets: MarketIndex[];
  alerts: OpportunityAlert[];
  watchlist: Instrument[];
  events: ImportantEventItem[];
  userRules: UserRules;
  priceAlerts?: PriceAlert[];
  onOpenPriceAlerts?: () => void;
  onOpenResearch: (symbol: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  markets,
  alerts,
  watchlist,
  events,
  userRules,
  priceAlerts = [],
  onOpenPriceAlerts,
  onOpenResearch,
  onNavigateTab,
}) => {
  const budgetProgress =
    userRules.monthlyBudgetINR > 0
      ? Math.min(100, Math.round((userRules.investedThisMonthINR / userRules.monthlyBudgetINR) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Page Title & Positioning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            What is happening with your capital, the market, and what deserves review.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Freshness:</span>
          <span className="font-mono text-slate-700 font-medium bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
            {formatUserTime(summary.lastUpdated)}
          </span>
        </div>
      </div>

      {/* 1. MY MONEY */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              My Money
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('portfolio')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>View Full Portfolio</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Portfolio Value */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Total Portfolio Value</span>
              <InfoTooltip
                term="Total Portfolio Value"
                explanation="Combined value of your current equities plus idle liquid cash in your account."
              />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">
              ₹{summary.portfolioValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Invested: ₹{summary.investedAmount.toLocaleString('en-IN')}</span>
              <span className="text-emerald-700 font-medium">
                Cash: ₹{summary.availableCash.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Today's Profit / Loss */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Today's Profit / Loss</span>
              <InfoTooltip
                term="Today's P&L"
                explanation="Daily mark-to-market gain or loss based on verified exchange closing prices."
              />
            </div>
            <div
              className={`text-xl font-bold font-mono tracking-tight flex items-baseline space-x-1.5 ${
                summary.todayPnL >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              <span>{summary.todayPnL >= 0 ? '+' : ''}₹{summary.todayPnL.toLocaleString('en-IN')}</span>
              <span className="text-xs font-medium">({summary.todayPnLPercent}%)</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Daily mark-to-market</div>
          </div>

          {/* Overall Return */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Overall Profit / Return</span>
              <InfoTooltip
                term="Overall Return"
                explanation="Cumulative unrealized capital return across all active holdings against average buy price."
              />
            </div>
            <div
              className={`text-xl font-bold font-mono tracking-tight flex items-baseline space-x-1.5 ${
                summary.overallPnL >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              <span>{summary.overallPnL >= 0 ? '+' : ''}₹{summary.overallPnL.toLocaleString('en-IN')}</span>
              <span className="text-xs font-medium">({summary.overallReturnPercent}%)</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Unrealized holding returns</div>
          </div>

          {/* Shariah Health & Purification */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Shariah Health</span>
              <InfoTooltip
                term="Purification Due"
                explanation="Accrued non-permissible dividend portions that must be cleansed by donating to charity without expectation of reward under AAOIFI rules."
              />
            </div>
            <div className="text-xl font-bold text-emerald-800 font-mono tracking-tight flex items-center space-x-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>{summary.shariahCompliantPercentage}% Halal</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Purification Due:</span>
              <span className="font-semibold font-mono text-amber-700">
                ₹{summary.totalPurificationDueINR.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MARKET TODAY */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Market Today
            </h2>
          </div>
          <span className="text-xs text-slate-400">Source: FYERS Broker Feeds</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {markets.map((idx) => (
            <div
              key={idx.name}
              className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs"
            >
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {idx.name}
              </div>
              <div className="text-base font-bold text-slate-900 font-mono mt-1">
                {idx.name === 'MARKET BREADTH'
                  ? `${idx.current} (Adv/Dec)`
                  : idx.current.toLocaleString('en-IN')}
              </div>
              <div
                className={`text-[11px] font-medium font-mono flex items-center space-x-1 mt-0.5 ${
                  idx.change >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {idx.change >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                <span>
                  {idx.change >= 0 ? '+' : ''}
                  {idx.change} ({idx.changePercent}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TWO-COLUMN GRID: OPPORTUNITIES & ALERTS + MONTHLY PLAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investment Opportunities & Alerts (replaces Research Inbox) */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Investment Opportunities & Alerts
              </h2>
            </div>
            {onOpenPriceAlerts && (
              <button
                onClick={onOpenPriceAlerts}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Price Alerts ({priceAlerts.length})</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Highlighted Triggered Price Alerts */}
            {priceAlerts
              .filter((a) => a.status === 'TRIGGERED')
              .map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => onOpenResearch(alt.symbol)}
                  className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100/60 transition-all cursor-pointer group space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {alt.symbol}
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">
                        PRICE ALERT TRIGGERED
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-rose-700 shrink-0" />
                  </div>
                  <div className="text-xs font-semibold text-slate-900">
                    Target Price of ₹{alt.targetPrice} breached!
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {alt.notes || `Price alert condition (${alt.condition.toLowerCase()}) reached.`}
                  </div>
                </div>
              ))}
            {alerts.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">
                No active investment alerts at this time.
              </div>
            ) : (
              alerts.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => onOpenResearch(alt.instrumentSymbol)}
                  className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-emerald-50/40 hover:border-emerald-200/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 font-mono">
                          {alt.instrumentSymbol}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                            alt.severity === 'REVIEW'
                              ? 'bg-amber-100 text-amber-800'
                              : alt.severity === 'ATTENTION'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {alt.severity}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-1">
                        {alt.headline}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {alt.description}
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Monthly Investment Plan */}
        <section className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <PiggyBank className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Monthly Plan
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Capital Discipline</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>Monthly Allocation Progress</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {budgetProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${budgetProgress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Budget:</span>
                <span className="font-mono font-semibold text-slate-800">
                  ₹{userRules.monthlyBudgetINR.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deployed This Month:</span>
                <span className="font-mono font-semibold text-emerald-700">
                  ₹{userRules.investedThisMonthINR.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2">
                <span className="text-slate-500">Remaining to Deploy:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{(userRules.monthlyBudgetINR - userRules.investedThisMonthINR).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-lg text-[11px] text-emerald-900 leading-relaxed">
              <strong>Planning Rule:</strong> Never deploy capital in haste. When good businesses trade at high multiples, accumulating dry cash is a position.
            </div>
          </div>
        </section>
      </div>

      {/* 4. TWO-COLUMN GRID: WATCHLIST + IMPORTANT EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watchlist */}
        <section className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <BookmarkCheck className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Watchlist
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('watchlist')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Manage Watchlist
            </button>
          </div>

          {watchlist.length === 0 ? (
            <div className="text-xs text-slate-400 py-6 text-center">
              No companies saved to watchlist yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {watchlist.map((inst) => (
                <div
                  key={inst.id}
                  onClick={() => onOpenResearch(inst.symbol)}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-mono flex items-center space-x-2">
                      <span>{inst.symbol}</span>
                      <span className="text-[10px] font-normal text-slate-500 font-sans">
                        {inst.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{inst.sector}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 font-mono">
                      ₹{inst.currentPrice.toLocaleString('en-IN')}
                    </div>
                    <div
                      className={`text-[10px] font-semibold font-mono ${
                        inst.dayChange >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {inst.dayChange >= 0 ? '+' : ''}
                      {inst.dayChangePercent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Important Events */}
        <section className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Important Events
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('events')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Full Calendar
            </button>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">
                No upcoming corporate events to review.
              </div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {ev.instrumentSymbol}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {ev.eventDate}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-800">
                    {ev.headline}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    {ev.impactSummary}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
