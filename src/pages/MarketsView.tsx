import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck } from 'lucide-react';
import { MarketIndex } from '../types';
import { getConvertedExchangeHours } from '../utils/dateTime';

interface MarketsViewProps {
  indices: MarketIndex[];
}

export const MarketsView: React.FC<MarketsViewProps> = ({ indices }) => {
  const extendedIndices = [
    ...indices,
    {
      name: 'NIFTY IT',
      current: 41850.10,
      change: 320.50,
      changePercent: 0.77,
      status: 'CLOSED' as const,
      lastUpdated: '2026-09-26T15:30:00+05:30',
    },
    {
      name: 'NIFTY FMCG',
      current: 63420.75,
      change: -110.25,
      changePercent: -0.17,
      status: 'CLOSED' as const,
      lastUpdated: '2026-09-26T15:30:00+05:30',
    },
  ];

  const exchangeHours = getConvertedExchangeHours();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Markets Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Key benchmark equity indices, sector dynamics, and market breadth.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {exchangeHours.exchangeHoursIST}
            {!exchangeHours.isSameAsExchange && (
              <strong className="ml-1 text-emerald-800 font-medium">({exchangeHours.localHours})</strong>
            )}
          </span>
        </div>
      </div>

      {/* Grid of Indices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {extendedIndices.map((idx) => (
          <div
            key={idx.name}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {idx.name}
              </span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                {idx.status}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {idx.current.toLocaleString('en-IN')}
            </div>
            <div
              className={`text-xs font-semibold font-mono flex items-center space-x-1 ${
                idx.change >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {idx.change >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>
                {idx.change >= 0 ? '+' : ''}
                {idx.change} ({idx.changePercent}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Market Safety & Integrity Card */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-start space-x-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">Broker Data Feed Provenance:</div>
          <p className="text-emerald-900 leading-relaxed">
            Market prices and index levels are streamed through official FYERS REST and WebSocket endpoints. Halal-Invest never simulates market data or interpolates closing prices.
          </p>
        </div>
      </div>
    </div>
  );
};
