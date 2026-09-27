import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Shield,
  RefreshCw,
  Building2,
  Bell,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { Instrument, FyersAdapterStatus, PriceAlert, ThemeMode } from '../types';
import { ApiClient } from '../services/apiClient';

interface HeaderProps {
  onSelectInstrument: (symbol: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  theme: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
  fyersStatus: FyersAdapterStatus | null;
  onOpenFyersModal: () => void;
  priceAlerts: PriceAlert[];
  onOpenPriceAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectInstrument,
  onRefresh,
  isRefreshing = false,
  theme,
  onSelectTheme,
  fyersStatus,
  onOpenFyersModal,
  priceAlerts,
  onOpenPriceAlerts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Instrument[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const triggeredCount = priceAlerts.filter((a) => a.status === 'TRIGGERED').length;

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      ApiClient.getInstruments(searchQuery).then((results) => {
        setSuggestions(results);
        setIsDropdownOpen(true);
      });
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(event.target as Node)
      ) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    onSelectInstrument(symbol);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const isFyersConnected = fyersStatus?.connected || fyersStatus?.state === 'CONNECTED';

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Workspace Indicator & Quick Search */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 max-w-xl">
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Personal</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setIsDropdownOpen(true);
              }}
              placeholder="Search ticker (e.g. TCS, INFY, RELIANCE)..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-800"
            >
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Instruments in Universe
              </div>
              {suggestions.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => handleSelect(inst.symbol)}
                  className="w-full text-left px-3.5 py-2 hover:bg-emerald-50/70 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors group"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                      {inst.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {inst.exchange}:{inst.symbol} • {inst.sector}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-medium text-slate-800 dark:text-slate-200">
                      ₹{inst.currentPrice.toLocaleString('en-IN')}
                    </div>
                    <div
                      className={`text-[10px] font-medium font-mono ${
                        inst.dayChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {inst.dayChange >= 0 ? '+' : ''}
                      {inst.dayChangePercent}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Action Items & Status Pills */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Price Alerts Bell Button */}
        <button
          onClick={onOpenPriceAlerts}
          className="relative p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Price Alerts Manager"
          aria-label="Price Alerts"
        >
          <Bell className="w-4 h-4" />
          {triggeredCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
              {triggeredCount}
            </span>
          )}
        </button>

        {/* Theme Selector Dropdown */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center"
            title={`Current Theme: ${theme}`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Laptop className="w-4 h-4" />
            )}
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50 text-xs">
              <button
                onClick={() => {
                  onSelectTheme('light');
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-left flex items-center space-x-2 ${
                  theme === 'light'
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-slate-50 dark:bg-slate-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => {
                  onSelectTheme('dark');
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-left flex items-center space-x-2 ${
                  theme === 'dark'
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-slate-50 dark:bg-slate-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => {
                  onSelectTheme('system');
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-left flex items-center space-x-2 ${
                  theme === 'system'
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-slate-50 dark:bg-slate-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>System</span>
              </button>
            </div>
          )}
        </div>

        {/* FYERS Interactive Status Pill */}
        <button
          onClick={onOpenFyersModal}
          className={`hidden sm:flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md border transition-all ${
            isFyersConnected
              ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
          }`}
          title="Click to manage FYERS API v3 session"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span className="font-semibold">
            {isFyersConnected ? 'FYERS: Connected' : 'FYERS: Connect'}
          </span>
          <span className="text-[11px] opacity-70">• Read-Only</span>
        </button>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
          title="Refresh verified data"
          aria-label="Refresh data"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`}
          />
        </button>

        {/* User Avatar */}
        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
          HI
        </div>
      </div>
    </header>
  );
};
