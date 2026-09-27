import React, { useState, useEffect } from 'react';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './pages/DashboardView';
import { CompanyResearchView } from './pages/CompanyResearchView';
import { ScreenerView } from './pages/ScreenerView';
import { MarketsView } from './pages/MarketsView';
import { PortfolioView } from './pages/PortfolioView';
import { WatchlistView } from './pages/WatchlistView';
import { EventsView } from './pages/EventsView';
import { SettingsView } from './pages/SettingsView';
import { PriceAlertModal } from './components/PriceAlertModal';
import { PriceAlertsDrawer } from './components/PriceAlertsDrawer';
import { FyersConnectModal } from './components/FyersConnectModal';
import { useTheme } from './hooks/useTheme';
import { ApiClient } from './services/apiClient';
import {
  PortfolioSummary,
  MarketIndex,
  OpportunityAlert,
  Instrument,
  ImportantEventItem,
  UserRules,
  CompleteResearchReport,
  PortfolioHolding,
  PriceAlert,
  PriceAlertCondition,
  FyersAdapterStatus,
} from './types';

export default function App() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<NavItemKey>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Core App State
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [markets, setMarkets] = useState<MarketIndex[]>([]);
  const [alerts, setAlerts] = useState<OpportunityAlert[]>([]);
  const [watchlist, setWatchlist] = useState<Instrument[]>([]);
  const [events, setEvents] = useState<ImportantEventItem[]>([]);
  const [userRules, setUserRules] = useState<UserRules | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [allInstruments, setAllInstruments] = useState<Instrument[]>([]);

  // Price Alerts State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [isPriceAlertModalOpen, setIsPriceAlertModalOpen] = useState(false);
  const [isPriceAlertsDrawerOpen, setIsPriceAlertsDrawerOpen] = useState(false);
  const [alertTargetInstrument, setAlertTargetInstrument] = useState<{
    symbol: string;
    currentPrice: number;
    name: string;
    instrumentId?: string;
  } | null>(null);

  // FYERS Connection State
  const [fyersStatus, setFyersStatus] = useState<FyersAdapterStatus | null>(null);
  const [isFyersModalOpen, setIsFyersModalOpen] = useState(false);

  // Company Research State
  const [selectedSymbol, setSelectedSymbol] = useState<string>('TCS');
  const [currentReport, setCurrentReport] = useState<CompleteResearchReport | null>(null);
  const [isResearchLoading, setIsResearchLoading] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [dash, port, insts, pAlerts, fStatus] = await Promise.all([
        ApiClient.getDashboardData(),
        ApiClient.getPortfolio(),
        ApiClient.getInstruments(),
        ApiClient.getPriceAlerts(),
        ApiClient.getFyersStatus(),
      ]);

      setSummary(dash.portfolioSummary);
      setMarkets(dash.marketIndices);
      setAlerts(dash.opportunityAlerts);
      setWatchlist(dash.watchlist);
      setEvents(dash.importantEvents);
      setUserRules(dash.userRules);
      setHoldings(port.holdings);
      setAllInstruments(insts);
      setPriceAlerts(pAlerts);
      setFyersStatus(fStatus);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadResearch = async (symbol: string) => {
    setSelectedSymbol(symbol);
    setIsResearchLoading(true);
    try {
      const report = await ApiClient.getResearch(symbol);
      setCurrentReport(report);
    } catch (err) {
      console.error(`Failed to load research for ${symbol}:`, err);
    } finally {
      setIsResearchLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadResearch('TCS');
  }, []);

  const handleOpenResearch = (symbol: string) => {
    loadResearch(symbol);
    setActiveTab('research');
  };

  const handleToggleWatchlist = async (instrumentId: string) => {
    await ApiClient.toggleWatchlist(instrumentId);
    const updated = await ApiClient.getWatchlist();
    setWatchlist(updated);
  };

  const handleUpdateRules = async (rules: Partial<UserRules>) => {
    const updated = await ApiClient.updateRules(rules);
    setUserRules(updated);
  };

  // Price Alert Handlers
  const handleOpenPriceAlertModal = (
    symbol: string,
    currentPrice: number,
    name: string,
    instrumentId?: string
  ) => {
    setAlertTargetInstrument({ symbol, currentPrice, name, instrumentId });
    setIsPriceAlertModalOpen(true);
  };

  const handleCreatePriceAlert = async (data: {
    instrumentId?: string;
    symbol: string;
    targetPrice: number;
    condition: PriceAlertCondition;
    notes?: string;
  }) => {
    await ApiClient.createPriceAlert(data);
    const updated = await ApiClient.getPriceAlerts();
    setPriceAlerts(updated);
  };

  const handleDeletePriceAlert = async (id: string) => {
    await ApiClient.deletePriceAlert(id);
    const updated = await ApiClient.getPriceAlerts();
    setPriceAlerts(updated);
  };

  const handleDismissPriceAlert = async (id: string) => {
    await ApiClient.dismissPriceAlert(id);
    const updated = await ApiClient.getPriceAlerts();
    setPriceAlerts(updated);
  };

  const handleCheckPriceAlerts = async () => {
    await ApiClient.checkPriceAlerts();
    const updated = await ApiClient.getPriceAlerts();
    setPriceAlerts(updated);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased overflow-hidden transition-colors">
      {/* Primary Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Global Header */}
        <Header
          onSelectInstrument={handleOpenResearch}
          onRefresh={() => {
            loadData();
            if (selectedSymbol) loadResearch(selectedSymbol);
          }}
          isRefreshing={isRefreshing}
          theme={theme}
          onSelectTheme={setTheme}
          fyersStatus={fyersStatus}
          onOpenFyersModal={() => setIsFyersModalOpen(true)}
          priceAlerts={priceAlerts}
          onOpenPriceAlerts={() => setIsPriceAlertsDrawerOpen(true)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && summary && userRules && (
            <DashboardView
              summary={summary}
              markets={markets}
              alerts={alerts}
              watchlist={watchlist}
              events={events}
              userRules={userRules}
              priceAlerts={priceAlerts}
              onOpenPriceAlerts={() => setIsPriceAlertsDrawerOpen(true)}
              onOpenResearch={handleOpenResearch}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'research' && (
            <CompanyResearchView
              report={currentReport}
              isLoading={isResearchLoading}
              onRefreshResearch={loadResearch}
              onSearchSymbol={handleOpenResearch}
              onOpenPriceAlertModal={(symbol, price, name) =>
                handleOpenPriceAlertModal(symbol, price, name, currentReport?.instrument.id)
              }
              priceAlerts={priceAlerts}
            />
          )}

          {activeTab === 'screener' && (
            <ScreenerView
              instruments={allInstruments}
              onOpenResearch={handleOpenResearch}
            />
          )}

          {activeTab === 'markets' && <MarketsView indices={markets} />}

          {activeTab === 'portfolio' && summary && (
            <PortfolioView
              summary={summary}
              holdings={holdings}
              onOpenResearch={handleOpenResearch}
            />
          )}

          {activeTab === 'watchlist' && (
            <WatchlistView
              watchlist={watchlist}
              onOpenResearch={handleOpenResearch}
              onRemoveFromWatchlist={handleToggleWatchlist}
              onNavigateToScreener={() => setActiveTab('screener')}
            />
          )}

          {activeTab === 'events' && (
            <EventsView events={events} onOpenResearch={handleOpenResearch} />
          )}

          {activeTab === 'settings' && userRules && (
            <SettingsView
              userRules={userRules}
              onUpdateRules={handleUpdateRules}
              theme={theme}
              onSelectTheme={setTheme}
              fyersStatus={fyersStatus}
              onOpenFyersModal={() => setIsFyersModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Price Alert Creation Modal */}
      {isPriceAlertModalOpen && alertTargetInstrument && (
        <PriceAlertModal
          symbol={alertTargetInstrument.symbol}
          instrumentName={alertTargetInstrument.name}
          currentPrice={alertTargetInstrument.currentPrice}
          instrumentId={alertTargetInstrument.instrumentId}
          onClose={() => {
            setIsPriceAlertModalOpen(false);
            setAlertTargetInstrument(null);
          }}
          onSubmitAlert={handleCreatePriceAlert}
        />
      )}

      {/* Price Alerts Manager Drawer */}
      <PriceAlertsDrawer
        alerts={priceAlerts}
        isOpen={isPriceAlertsDrawerOpen}
        onClose={() => setIsPriceAlertsDrawerOpen(false)}
        onOpenCreate={() => {
          setIsPriceAlertsDrawerOpen(false);
          const inst = currentReport ? currentReport.instrument : allInstruments[0];
          if (inst) {
            handleOpenPriceAlertModal(inst.symbol, inst.currentPrice, inst.name, inst.id);
          }
        }}
        onDeleteAlert={handleDeletePriceAlert}
        onDismissAlert={handleDismissPriceAlert}
        onOpenResearch={handleOpenResearch}
        onCheckAlerts={handleCheckPriceAlerts}
      />

      {/* FYERS Connection Modal */}
      {isFyersModalOpen && (
        <FyersConnectModal
          status={fyersStatus}
          onClose={() => setIsFyersModalOpen(false)}
          onStatusUpdated={(newStatus) => setFyersStatus(newStatus)}
        />
      )}
    </div>
  );
}
