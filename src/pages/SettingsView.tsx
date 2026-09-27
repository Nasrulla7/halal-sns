import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Shield,
  Database,
  CheckCircle2,
  Lock,
  FileText,
  AlertTriangle,
  Save,
  Sun,
  Moon,
  Laptop,
  ExternalLink,
  Clock,
  Globe,
} from 'lucide-react';
import { UserRules, FyersAdapterStatus, DatabaseStatus, ThemeMode } from '../types';
import { SourceMetadata } from '../adapters/sourceRegistry';
import { ApiClient } from '../services/apiClient';
import {
  COMMON_TIMEZONES,
  getUserTimeZone,
  setUserTimeZone,
  formatUserDateTime,
  getTimeZoneAbbr,
} from '../utils/dateTime';

interface SettingsViewProps {
  userRules: UserRules;
  onUpdateRules: (rules: Partial<UserRules>) => void;
  theme: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
  fyersStatus: FyersAdapterStatus | null;
  onOpenFyersModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userRules,
  onUpdateRules,
  theme,
  onSelectTheme,
  fyersStatus,
  onOpenFyersModal,
}) => {
  const [budget, setBudget] = useState(userRules.monthlyBudgetINR);
  const [maxPosition, setMaxPosition] = useState(userRules.maxSinglePositionPercent);
  const [riskTolerance, setRiskTolerance] = useState(userRules.riskTolerance);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [sources, setSources] = useState<SourceMetadata[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [currentTimeZone, setCurrentTimeZone] = useState(getUserTimeZone());
  const [selectedTzOption, setSelectedTzOption] = useState(() => {
    try {
      const stored = localStorage.getItem('halal_invest_user_timezone');
      return stored || 'AUTO';
    } catch {
      return 'AUTO';
    }
  });

  const handleTimezoneChange = (val: string) => {
    setSelectedTzOption(val);
    setUserTimeZone(val);
    setCurrentTimeZone(getUserTimeZone());
  };

  useEffect(() => {
    ApiClient.getSources().then(setSources);
    ApiClient.getDatabaseStatus().then(setDbStatus);
  }, []);

  const handleSave = () => {
    onUpdateRules({
      monthlyBudgetINR: Number(budget),
      maxSinglePositionPercent: Number(maxPosition),
      riskTolerance,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const isFyersConnected = fyersStatus?.connected || fyersStatus?.state === 'CONNECTED';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Settings & Governance Rules
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure capital discipline boundaries, broker adapter parameters, visual theme, and inspect source licensing.
        </p>
      </div>

      {/* 1. VISUAL THEME PREFERENCE */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sun className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Appearance & Theme
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <button
            type="button"
            onClick={() => onSelectTheme('light')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
              theme === 'light'
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900 font-semibold shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTheme('dark')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
              theme === 'dark'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Moon className="w-5 h-5 text-blue-400" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTheme('system')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
              theme === 'system'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-semibold shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Laptop className="w-5 h-5 text-slate-400" />
            <span>System</span>
          </button>
        </div>
      </section>

      {/* 2. REGIONAL TIMEZONE & LOCALISATION */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Regional Timezone & Localisation
            </h2>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium">
            Active: {currentTimeZone} ({getTimeZoneAbbr(new Date(), currentTimeZone)})
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            All prices, alerts, and audit logs are recorded in immutable UTC. Choose how dates and times are displayed. By default, your browser timezone (such as <strong>Asia/Riyadh (AST)</strong> in Saudi Arabia or <strong>Asia/Kolkata (IST)</strong> in India) is detected automatically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Display Timezone
              </label>
              <select
                value={selectedTzOption}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Live Sample Output
              </label>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{formatUserDateTime(new Date(), { timeZone: currentTimeZone })}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. USER INVESTMENT RULES */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Capital Allocation & Discipline Rules
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Monthly Investment Budget (INR)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400">
              Paces long-term monthly capital deployment without emotional timing.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Maximum Single Position Size (%)
            </label>
            <input
              type="number"
              value={maxPosition}
              onChange={(e) => setMaxPosition(Number(e.target.value))}
              max={15}
              min={2}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400">
              Hard portfolio concentration ceiling (recommended: 5% - 10%).
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Risk Profile</label>
            <select
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="CONSERVATIVE">Conservative (Moats, Low Leverage, High ROCE)</option>
              <option value="MODERATE">Moderate (Disciplined Quality + Selected Cyclicals)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Shariah Standard</label>
            <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs font-mono font-medium">
              AAOIFI Shariah Standard No. (21)
            </div>
            <p className="text-[11px] text-slate-400">
              Strict deterministic benchmark version 2024.1.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Investment rules updated successfully!</span>
            </span>
          ) : (
            <span></span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Rules</span>
          </button>
        </div>
      </section>

      {/* 3. FYERS BROKER ADAPTER SECURITY */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              FYERS Broker Adapter (Server-Side Isolated)
            </h2>
          </div>
          <button
            onClick={onOpenFyersModal}
            className={`text-xs font-bold px-2.5 py-1 rounded flex items-center space-x-1 transition-colors ${
              isFyersConnected
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>{fyersStatus?.state || 'NOT CONNECTED'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Broker Gateway Mode:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                FYERS API v3 (REST & WebSockets)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Credential Security:</span>
              <span className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Server-Side Only (Never in Browser)</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Automatic Trading Status:</span>
              <span className="font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                STRICTLY FORBIDDEN (Air-Gapped)
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg flex items-start space-x-2 text-[11px] text-amber-950 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Capital Safety Guarantee:</strong> Halal-Invest does not hold broker execution authority. All orders must be reviewed and manually submitted through the official FYERS trading application by the user.
            </p>
          </div>
        </div>
      </section>

      {/* 4. REAL DATABASE & PERSISTENCE TELEMETRY */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Database & Storage Engine
            </h2>
          </div>
          <span
            className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
              dbStatus?.isRealPostgres
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {dbStatus?.driver || 'POSTGRESQL'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Database Driver:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {dbStatus?.driver} ({dbStatus?.isRealPostgres ? 'PostgreSQL Live' : 'Embedded Transactional Engine'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Migration Version:</span>
              <span className="text-slate-800 dark:text-slate-200">{dbStatus?.migrationVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Active Tables:</span>
              <span className="text-slate-800 dark:text-slate-200">
                {dbStatus?.activeTableCount} Relational Tables
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {dbStatus?.statusMessage}
          </p>
        </div>
      </section>

      {/* 5. DATA LICENSING & SOURCE REGISTRY */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Data Licensing & Source Registry
            </h2>
          </div>
          <span className="text-xs text-emerald-800 dark:text-emerald-400 font-bold font-mono">
            ₹0 Recurring Data Fee Target Met
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800/40">
                <th className="py-2.5 px-3">Data Source</th>
                <th className="py-2.5 px-3">Access Protocol</th>
                <th className="py-2.5 px-3">Recurring Cost</th>
                <th className="py-2.5 px-3">Automation</th>
                <th className="py-2.5 px-3">Last Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    {src.sourceName}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                    {src.accessMethod}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    ₹{src.costINR}/mo
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        src.automationAllowed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {src.automationAllowed ? 'Permitted' : 'Compliant Ingestion'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                    {src.lastVerifiedDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
