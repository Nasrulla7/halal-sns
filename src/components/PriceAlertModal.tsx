import React, { useState } from 'react';
import { X, Bell, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { PriceAlertCondition } from '../types';

interface PriceAlertModalProps {
  symbol: string;
  instrumentName: string;
  currentPrice: number;
  instrumentId?: string;
  onClose: () => void;
  onSubmitAlert: (data: {
    instrumentId?: string;
    symbol: string;
    targetPrice: number;
    condition: PriceAlertCondition;
    notes?: string;
  }) => Promise<void>;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  symbol,
  instrumentName,
  currentPrice,
  instrumentId,
  onClose,
  onSubmitAlert,
}) => {
  const [targetPrice, setTargetPrice] = useState<number>(
    Number((currentPrice * 0.95).toFixed(2))
  );
  const [condition, setCondition] = useState<PriceAlertCondition>('BELOW');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const deltaPct =
    currentPrice > 0
      ? Number((((targetPrice - currentPrice) / currentPrice) * 100).toFixed(2))
      : 0;

  const handleApplyPreset = (multiplier: number, cond: PriceAlertCondition) => {
    const val = Number((currentPrice * multiplier).toFixed(2));
    setTargetPrice(val);
    setCondition(cond);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPrice <= 0) return;
    setIsSubmitting(true);
    try {
      await onSubmitAlert({
        instrumentId,
        symbol,
        targetPrice,
        condition,
        notes,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Set Price Alert for {symbol}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {instrumentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Current Price Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Current Market Price (LTP)</span>
            <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Condition Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Alert Trigger Condition
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCondition('BELOW')}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center space-x-1.5 font-medium transition-all ${
                  condition === 'BELOW'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-semibold shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Drops to or Below</span>
              </button>

              <button
                type="button"
                onClick={() => setCondition('ABOVE')}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center space-x-1.5 font-medium transition-all ${
                  condition === 'ABOVE'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Rises to or Above</span>
              </button>
            </div>
          </div>

          {/* Target Price Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Target Price (INR)
              </label>
              <span
                className={`font-mono font-medium ${
                  deltaPct >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {deltaPct >= 0 ? '+' : ''}
                {deltaPct}% vs LTP
              </span>
            </div>
            <input
              type="number"
              step="0.05"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleApplyPreset(0.95, 'BELOW')}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
              >
                -5% Dip
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(0.90, 'BELOW')}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
              >
                -10% Pullback
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(1.05, 'ABOVE')}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
              >
                +5% Breakout
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(1.10, 'ABOVE')}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
              >
                +10% Ceiling
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Research Note (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Accumulate if multiple compresses towards 5Y median..."
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Submit / Status */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            {success ? (
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Alert Created!</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Monitored against verified LTP
              </span>
            )}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : 'Set Alert'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
