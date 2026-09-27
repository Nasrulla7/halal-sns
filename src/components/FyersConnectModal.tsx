import React, { useState } from 'react';
import { X, Shield, Lock, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, LogOut } from 'lucide-react';
import { FyersAdapterStatus } from '../types';
import { ApiClient } from '../services/apiClient';

interface FyersConnectModalProps {
  status: FyersAdapterStatus | null;
  onClose: () => void;
  onStatusUpdated: (newStatus: FyersAdapterStatus) => void;
}

export const FyersConnectModal: React.FC<FyersConnectModalProps> = ({
  status,
  onClose,
  onStatusUpdated,
}) => {
  const [authCode, setAuthCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleLaunchLogin = async () => {
    try {
      const url = await ApiClient.getFyersAuthUrl();
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      setFeedback({ success: false, message: `Could not generate FYERS login URL: ${err.message}` });
    }
  };

  const handleExchangeCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authCode.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await ApiClient.exchangeFyersToken(authCode.trim());
      setFeedback({ success: res.success, message: res.message });
      onStatusUpdated(res.status);
      if (res.success) {
        setAuthCode('');
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Token exchange failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsSubmitting(true);
    try {
      const newStatus = await ApiClient.disconnectFyers();
      onStatusUpdated(newStatus);
      setFeedback({ success: true, message: 'FYERS broker session disconnected.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConnected = status?.connected || status?.state === 'CONNECTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                FYERS Broker Gateway (Read-Only)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official FYERS API v3 OAuth & Session Management
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

        <div className="p-5 space-y-4 text-xs">
          {/* Status Box */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Gateway Mode:</span>
              <span className="font-mono font-bold px-2 py-0.5 rounded text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {status?.isSandbox ? 'SANDBOX / TEST SIMULATOR' : 'LIVE OFFICIAL BROKER'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Gateway State:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  isConnected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : status?.state === 'TOKEN EXPIRED'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {status?.state || 'NOT CONNECTED'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Trading Execution:</span>
              <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>FORBIDDEN (Read-Only Invariant)</span>
              </span>
            </div>

            {status?.verifiedAccountName && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Account ID:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {status.verifiedAccountName}
                </span>
              </div>
            )}

            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              {status?.syncMessage || 'Awaiting connection.'}
            </div>
          </div>

          {/* Capital Safety Notice */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/60 rounded-lg text-emerald-900 dark:text-emerald-300 leading-relaxed text-[11px]">
            <strong>Zero Order Placement Authority:</strong> Halal-Invest never touches your capital directly. All equity holdings, quotes, and market feeds are ingested strictly in read-only mode. You manually execute transactions inside your FYERS app.
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${
                feedback.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {isConnected ? (
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Active FYERS v3 Session</div>
                  <div className="text-[11px] text-slate-500">
                    Live market data & portfolio sync active.
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 flex items-center space-x-1.5 font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Step 1: Launch FYERS v3 OAuth Login
                </div>
                <p className="text-[11px] text-slate-500">
                  Opens official FYERS portal to authenticate your account and generate an authorization code.
                </p>
                <button
                  type="button"
                  onClick={handleLaunchLogin}
                  className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Official FYERS Login Window</span>
                </button>
              </div>

              <form onSubmit={handleExchangeCode} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Step 2: Enter Authorization Code
                </div>
                <p className="text-[11px] text-slate-500">
                  Paste the authorization code received from the FYERS redirect URL.
                </p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="e.g. auth_code_from_fyers..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !authCode.trim()}
                    className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Verifying...' : 'Validate Code'}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 dark:text-slate-400">
                  <span>Testing without live credentials?</span>
                  <button
                    type="button"
                    onClick={() => setAuthCode('SANDBOX-TEST-CODE-2026')}
                    className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    Use Sandbox Test Code (SANDBOX-TEST-CODE-2026)
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
