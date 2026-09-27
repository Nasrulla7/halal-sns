import React from 'react';
import { X, ShieldAlert, Copy, Check, ExternalLink } from 'lucide-react';
import { FyersManualOrderSlip } from '../types';

interface ManualOrderModalProps {
  slip: FyersManualOrderSlip;
  onClose: () => void;
}

export const ManualOrderModal: React.FC<ManualOrderModalProps> = ({ slip, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const copyOrderSummary = () => {
    const text = `FYERS ORDER SLIP:
Symbol: ${slip.symbol} (NSE)
Action: ${slip.transactionType}
Product: ${slip.productType} (Cash & Carry Delivery)
Qty: ${slip.suggestedQty} shares
Limit Price: ₹${slip.limitPrice} (Range: ${slip.limitPriceRange})
Est. Amount: ₹${slip.estimatedInvestmentINR.toLocaleString('en-IN')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-700 text-white rounded-lg">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                FYERS Manual Order Guidance
              </h3>
              <p className="text-xs text-slate-600">
                Conservative cash delivery order ticket for manual submission.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2.5 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">No Automatic Execution:</span> Halal-Invest does not place or manage orders. You remain in complete control of your capital by executing manually inside your official FYERS account.
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-xs text-slate-500 font-medium">Instrument</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {slip.symbol} (NSE Equity)
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-xs text-slate-500 font-medium">Order Type / Product</span>
              <span className="text-sm font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-mono">
                LIMIT • {slip.productType} (Delivery)
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-xs text-slate-500 font-medium">Recommended Quantity</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {slip.suggestedQty} Shares
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-xs text-slate-500 font-medium">Target Limit Price</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                ₹{slip.limitPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-xs text-slate-500 font-medium">Execution Range</span>
              <span className="text-xs text-slate-700 font-mono">{slip.limitPriceRange}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Estimated Capital</span>
              <span className="text-base font-bold text-emerald-700 font-mono">
                ₹{slip.estimatedInvestmentINR.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Manual Execution Checklist
            </h4>
            <div className="bg-white border border-slate-100 rounded-lg p-3 space-y-1.5 text-xs text-slate-600">
              {slip.executionInstructions.map((inst, i) => (
                <div key={i} className="leading-relaxed">
                  {inst}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={copyOrderSummary}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-lg transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Parameters</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
