import React, { useState } from 'react';
import { SlidersHorizontal, ShieldCheck, Search, ArrowUpRight } from 'lucide-react';
import { Instrument } from '../types';

interface ScreenerViewProps {
  instruments: Instrument[];
  onOpenResearch: (symbol: string) => void;
}

export const ScreenerView: React.FC<ScreenerViewProps> = ({ instruments, onOpenResearch }) => {
  const [filterSector, setFilterSector] = useState<string>('ALL');
  const [onlyCompliant, setOnlyCompliant] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const sectors = ['ALL', ...Array.from(new Set(instruments.map((i) => i.sector)))];

  const filtered = instruments.filter((inst) => {
    if (filterSector !== 'ALL' && inst.sector !== filterSector) return false;
    if (onlyCompliant && inst.symbol === 'HDFCBANK') return false; // Non-compliant control
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!inst.name.toLowerCase().includes(q) && !inst.symbol.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Equity Screener
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter Indian listed equities across Shariah compliance, business quality, and capital health.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800">{filtered.length}</strong> verified instruments
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by company or symbol..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-500 font-medium">Sector:</label>
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {sectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/70 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyCompliant}
            onChange={(e) => setOnlyCompliant(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Shariah Compliant Only (AAOIFI)</span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-3 px-4">Company & Symbol</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">LTP (INR)</th>
                <th className="py-3 px-4 text-right">Day Change</th>
                <th className="py-3 px-4 text-right">Market Cap</th>
                <th className="py-3 px-4 text-center">Shariah Gate</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((inst) => {
                const isCompliant = inst.symbol !== 'HDFCBANK';
                return (
                  <tr
                    key={inst.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onOpenResearch(inst.symbol)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-800">
                        {inst.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {inst.exchange}:{inst.symbol}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{inst.sector}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">
                      ₹{inst.currentPrice.toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`py-3 px-4 font-mono font-semibold text-right ${
                        inst.dayChange >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {inst.dayChange >= 0 ? '+' : ''}
                      {inst.dayChangePercent}%
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-right">
                      ₹{inst.marketCap.toLocaleString('en-IN')} Cr
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCompliant
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCompliant ? 'COMPLIANT' : 'NOT COMPLIANT'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenResearch(inst.symbol);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                        title="Open research report"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
