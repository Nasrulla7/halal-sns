import React from 'react';
import {
  Briefcase,
  ShieldCheck,
  HeartHandshake,
  AlertCircle,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { PortfolioSummary, PortfolioHolding } from '../types';
import { InfoTooltip } from '../components/InfoTooltip';

interface PortfolioViewProps {
  summary: PortfolioSummary;
  holdings: PortfolioHolding[];
  onOpenResearch: (symbol: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  summary,
  holdings,
  onOpenResearch,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active holdings, position concentrations, Shariah compliance health, and dividend purification ledger.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-lg">
          Holdings: <strong className="text-slate-900">{holdings.length}</strong> Positions
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500">Portfolio Value</div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
            ₹{summary.portfolioValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Invested: ₹{summary.investedAmount.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500">Idle Cash (INR)</div>
          <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
            ₹{summary.availableCash.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Available for deployment</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500">Unrealized P&L</div>
          <div
            className={`text-lg font-bold font-mono mt-0.5 ${
              summary.overallPnL >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {summary.overallPnL >= 0 ? '+' : ''}₹{summary.overallPnL.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Return: {summary.overallReturnPercent}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500">Shariah Health</div>
          <div className="text-lg font-bold text-emerald-800 font-mono mt-0.5 flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{summary.shariahCompliantPercentage}% Halal</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">AAOIFI Std 21 Screened</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Purification Due</span>
            <InfoTooltip
              term="Dividend Purification"
              explanation="Portion of dividend proceeds attributed to non-permissible interest income on corporate bank deposits that must be given away to charity."
            />
          </div>
          <div className="text-lg font-bold text-amber-700 font-mono mt-0.5">
            ₹{summary.totalPurificationDueINR.toFixed(2)}
          </div>
          <div className="text-[11px] text-amber-800/80 mt-0.5">To donate to charity</div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Active Holdings Ledger
          </h2>
          <span className="text-xs text-slate-400">Manual Execution via FYERS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-right">Avg Cost</th>
                <th className="py-3 px-4 text-right">LTP (INR)</th>
                <th className="py-3 px-4 text-right">Current Value</th>
                <th className="py-3 px-4 text-right">P&L</th>
                <th className="py-3 px-4 text-right">Weight</th>
                <th className="py-3 px-4 text-center">Shariah</th>
                <th className="py-3 px-4 text-right">Purification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {holdings.map((h) => (
                <tr
                  key={h.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => onOpenResearch(h.symbol)}
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-800">
                      {h.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {h.symbol} • {h.sector}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-800 text-right">{h.quantity}</td>
                  <td className="py-3 px-4 font-mono text-slate-700 text-right">
                    ₹{h.averageBuyPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">
                    ₹{h.currentPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">
                    ₹{h.currentValue.toLocaleString('en-IN')}
                  </td>
                  <td
                    className={`py-3 px-4 font-mono font-semibold text-right ${
                      h.unrealizedPnL >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {h.unrealizedPnL >= 0 ? '+' : ''}₹{h.unrealizedPnL.toLocaleString('en-IN')}{' '}
                    ({h.unrealizedPnLPercent}%)
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 text-right">
                    {h.weightPercentage}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {h.shariahStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-700 font-semibold text-right">
                    ₹{h.purificationOwedINR.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purification & Charity Guidance Box */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-5 space-y-3">
        <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
          <HeartHandshake className="w-4 h-4 text-amber-700" />
          <span>Dividend Purification Obligation</span>
        </div>
        <p className="text-xs text-amber-950 leading-relaxed">
          Under AAOIFI rules, companies with incidental non-operating interest income (such as treasury yields on operating bank deposits) require investors to cleanse that exact percentage from dividend distributions. You have <strong className="font-mono">₹{summary.totalPurificationDueINR.toFixed(2)}</strong> due for donation to public charity.
        </p>
      </div>
    </div>
  );
};
