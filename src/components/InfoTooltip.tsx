import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  term: string;
  explanation: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ term, explanation }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1 group">
      <button
        type="button"
        className="text-slate-400 hover:text-emerald-700 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Explanation for ${term}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none transition-opacity duration-200"
        >
          <div className="font-semibold text-emerald-400 mb-0.5">{term}</div>
          <div className="text-slate-300 leading-relaxed">{explanation}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </span>
  );
};
