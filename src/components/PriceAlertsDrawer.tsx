import React, { useState } from 'react';
import {
  X,
  Bell,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Check,
  Plus,
  RefreshCw,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { PriceAlert } from '../types';
import { formatUserDateTime } from '../utils/dateTime';

interface PriceAlertsDrawerProps {
  alerts: PriceAlert[];
  isOpen: boolean;
  onClose: () => void;
  onOpenCreate: () => void;
  onDeleteAlert: (id: string) => Promise<void>;
  onDismissAlert: (id: string) => Promise<void>;
  onOpenResearch: (symbol: string) => void;
  onCheckAlerts?: () => Promise<void>;
}

export const PriceAlertsDrawer: React.FC<PriceAlertsDrawerProps> = ({
  alerts,
  isOpen,
  onClose,
  onOpenCreate,
  onDeleteAlert,
  onDismissAlert,
  onOpenResearch,
  onCheckAlerts,
}) => {
  const [isChecking, setIsChecking] = useState(false);

  if (!isOpen) return null;

  const triggeredAlerts = alerts.filter((a) => a.status === 'TRIGGERED');
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  const handleManualCheck = async () => {
    if (!onCheckAlerts || isChecking) return;
    setIsChecking(true);
    try {
      await onCheckAlerts();
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Price Alerts Manager
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PostgreSQL Persisted • Real FYERS Quote Driven
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {alerts.length} Total Alerts Configured
            </span>
            <div className="flex items-center space-x-2">
              {onCheckAlerts && (
                <button
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
                  title="Force evaluation against authentic market feed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>Check Feed</span>
                </button>
              )}
              <button
                onClick={onOpenCreate}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Alert</span>
              </button>
            </div>
          </div>

          {/* Triggered Alerts Section */}
          {triggeredAlerts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4" />
                <span>Triggered Price Alerts ({triggeredAlerts.length})</span>
              </div>
              <div className="space-y-2">
                {triggeredAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          onOpenResearch(alt.symbol);
                          onClose();
                        }}
                        className="text-xs font-bold text-slate-900 dark:text-white font-mono hover:text-emerald-700 flex items-center space-x-1"
                      >
                        <span>{alt.symbol}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                      <div className="flex items-center space-x-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
                          TRIGGERED
                        </span>
                        {alt.dataSource && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {alt.dataSource === 'FYERS_API_V3' ? 'FYERS v3' : 'Verified Ref'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      Target of <strong className="font-mono">₹{alt.targetPrice}</strong> ({alt.condition === 'ABOVE' ? 'above' : 'below'}) was breached.
                      {(alt.triggeredPrice || alt.lastCheckedPrice) && (
                        <span className="block text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                          Trigger Price: ₹{alt.triggeredPrice || alt.lastCheckedPrice}
                        </span>
                      )}
                    </div>

                    {alt.notes && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                        "{alt.notes}"
                      </p>
                    )}

                    <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatUserDateTime(alt.triggeredAt)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onDismissAlert(alt.id)}
                          className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Dismiss</span>
                        </button>
                        <button
                          onClick={() => onDeleteAlert(alt.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Alerts Section */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Watch Alerts ({activeAlerts.length})
            </div>

            {activeAlerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                No active price alerts. Click "Create Alert" to set entry or exit targets.
              </div>
            ) : (
              <div className="space-y-2">
                {activeAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          onOpenResearch(alt.symbol);
                          onClose();
                        }}
                        className="text-xs font-bold text-slate-900 dark:text-white font-mono hover:text-emerald-700 flex items-center space-x-1"
                      >
                        <span>{alt.symbol}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <div className="flex items-center space-x-1 font-mono text-xs font-semibold">
                        {alt.condition === 'ABOVE' ? (
                          <span className="flex items-center text-emerald-700 dark:text-emerald-400">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>&ge; ₹{alt.targetPrice}</span>
                          </span>
                        ) : (
                          <span className="flex items-center text-rose-600 dark:text-rose-400">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span>&le; ₹{alt.targetPrice}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Created at: ₹{alt.currentPriceAtCreation}</span>
                      {alt.lastCheckedPrice && (
                        <span>LTP: ₹{alt.lastCheckedPrice}</span>
                      )}
                    </div>

                    {alt.dataSource && (
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Feed: {alt.dataSource === 'FYERS_API_V3' ? 'FYERS v3 Official' : 'Exchange Verified Reference'}</span>
                      </div>
                    )}

                    {alt.notes && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700/60">
                        {alt.notes}
                      </div>
                    )}

                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => onDeleteAlert(alt.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs">
          <span className="text-slate-400 text-[11px] flex items-center space-x-1">
            <Database className="w-3 h-3 text-slate-500" />
            <span>PostgreSQL Synchronized</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
