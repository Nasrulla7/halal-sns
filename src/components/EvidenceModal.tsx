import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { EvidenceRecord } from '../types';
import { formatUserDateTime } from '../utils/dateTime';

interface EvidenceModalProps {
  evidence: EvidenceRecord[];
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ evidence, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Evidence Provenance & Audit Registry
              </h3>
              <p className="text-xs text-slate-500">
                Verifiable sources, formulas, and filing dates for all calculated metrics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-lg flex items-start space-x-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              <strong>Zero-Hallucination Guarantee:</strong> Numbers are calculated deterministically from primary regulatory disclosures or broker APIs. No synthetic data.
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {evidence.map((item) => (
              <div key={item.id} className="py-3.5 space-y-1.5 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>{item.metric}</span>
                  </span>
                  <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    {item.value}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400">Source:</span>{' '}
                    <span className="font-medium text-slate-700">{item.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Statement Scope:</span>{' '}
                    <span className="font-medium text-slate-700">{item.scope}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Publication Date:</span>{' '}
                    <span className="text-slate-700">{item.publicationDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Retrieved At:</span>{' '}
                    <span className="text-slate-700 font-mono">
                      {formatUserDateTime(item.retrievalTimestamp)}
                    </span>
                  </div>
                  {item.formula && (
                    <div className="col-span-full">
                      <span className="text-slate-400">Audited Formula:</span>{' '}
                      <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                        {item.formula}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Quality: <strong className="text-emerald-700">{item.confidence}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Close Provenance Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
