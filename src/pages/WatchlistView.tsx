import React from 'react';
import { BookmarkCheck, Trash2, ArrowUpRight, Search } from 'lucide-react';
import { Instrument } from '../types';

interface WatchlistViewProps {
  watchlist: Instrument[];
  onOpenResearch: (symbol: string) => void;
  onRemoveFromWatchlist: (instrumentId: string) => void;
  onNavigateToScreener: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  onOpenResearch,
  onRemoveFromWatchlist,
  onNavigateToScreener,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Watchlist
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitored equities for potential valuation entry points or research triggers.
          </p>
        </div>
        <button
          onClick={onNavigateToScreener}
          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 shadow-2xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Discover Companies</span>
        </button>
      </div>

      {watchlist.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No Companies Saved Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Track companies you are investigating to keep their valuation, Shariah status, and earnings in view.
          </p>
          <button
            onClick={onNavigateToScreener}
            className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs hover:bg-emerald-800 transition-colors"
          >
            Explore Equity Screener
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4 text-right">Current Price</th>
                  <th className="py-3 px-4 text-right">Daily Change</th>
                  <th className="py-3 px-4 text-right">Market Cap</th>
                  <th className="py-3 px-4 text-center">Shariah</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {watchlist.map((inst) => (
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        COMPLIANT
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromWatchlist(inst.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
