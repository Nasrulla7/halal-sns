import React, { useState } from 'react';
import { Calendar, AlertCircle, ArrowUpRight, Filter } from 'lucide-react';
import { ImportantEventItem } from '../types';

interface EventsViewProps {
  events: ImportantEventItem[];
  onOpenResearch: (symbol: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ events, onOpenResearch }) => {
  const [filterMateriality, setFilterMateriality] = useState<string>('ALL');

  const filtered = events.filter((ev) => {
    if (filterMateriality !== 'ALL' && ev.materiality !== filterMateriality) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Important Corporate Events
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quarterly earnings releases, dividend board meetings, and regulatory filings.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterMateriality}
            onChange={(e) => setFilterMateriality(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-xs py-1 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
          >
            <option value="ALL">All Materiality Levels</option>
            <option value="HIGH">High Materiality Only</option>
            <option value="MEDIUM">Medium Materiality</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">
            No important events to review
          </h3>
          <p className="text-xs text-slate-400">
            There are no material corporate disclosures or earnings releases scheduled in this period.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ev) => (
            <div
              key={ev.id}
              onClick={() => onOpenResearch(ev.instrumentSymbol)}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-200/80 hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                    {ev.instrumentSymbol}
                  </span>
                  <span className="text-[11px] text-slate-500 font-sans">
                    {ev.instrumentName}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    ev.materiality === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {ev.materiality} Materiality
                </span>
              </div>

              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 flex items-center justify-between">
                <span>{ev.headline}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0" />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {ev.impactSummary}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Scheduled Date: {ev.eventDate}</span>
                <span className="capitalize">{ev.eventType.replace('_', ' ').toLowerCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
