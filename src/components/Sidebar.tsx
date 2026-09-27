import React from 'react';
import {
  LayoutDashboard,
  Search,
  SlidersHorizontal,
  TrendingUp,
  BookmarkCheck,
  Briefcase,
  Bell,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export type NavItemKey =
  | 'dashboard'
  | 'research'
  | 'screener'
  | 'markets'
  | 'watchlist'
  | 'portfolio'
  | 'events'
  | 'settings';

interface SidebarProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const sections = [
    {
      group: 'YOUR MONEY',
      items: [
        { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'RESEARCH',
      items: [
        { key: 'research' as NavItemKey, label: 'Company Research', icon: Search },
        { key: 'screener' as NavItemKey, label: 'Screener', icon: SlidersHorizontal },
      ],
    },
    {
      group: 'MARKET',
      items: [
        { key: 'markets' as NavItemKey, label: 'Markets Today', icon: TrendingUp },
      ],
    },
    {
      group: 'MY INVESTMENTS',
      items: [
        { key: 'watchlist' as NavItemKey, label: 'Watchlist', icon: BookmarkCheck },
        { key: 'portfolio' as NavItemKey, label: 'Portfolio', icon: Briefcase },
      ],
    },
    {
      group: 'KEEP IN VIEW',
      items: [
        { key: 'events' as NavItemKey, label: 'Important Events', icon: Bell },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { key: 'settings' as NavItemKey, label: 'Settings & Rules', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/40">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-wider flex items-center space-x-1.5">
            <span>HALAL-INVEST</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-medium tracking-tight">
            Investing, with evidence.
          </p>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {sections.map((sec) => (
          <div key={sec.group}>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-1.5">
              {sec.group}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectTab(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600/90 text-white shadow-xs font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info & Disclaimers */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="font-semibold text-slate-300">AAOIFI Std 21</span>
          <span className="text-emerald-400 font-medium">Deterministic</span>
        </div>
        <div className="text-[10px] text-slate-400 leading-tight">
          Strict hard-gate screening. User manually executes via FYERS.
        </div>
      </div>
    </aside>
  );
};
