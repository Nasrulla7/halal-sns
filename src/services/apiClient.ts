/**
 * HALAL-INVEST: Client API Gateway
 * Typed interface providing frontend data fetching with graceful offline/direct repository fallback.
 */

import {
  CompleteResearchReport,
  PortfolioSummary,
  PortfolioHolding,
  MarketIndex,
  UserRules,
  ImportantEventItem,
  OpportunityAlert,
  Instrument,
  FyersManualOrderSlip,
  FyersAdapterStatus,
  PriceAlert,
  PriceAlertCondition,
  DatabaseStatus,
} from '../types';
import { AppRepository } from '../db/repository';
import { SourceRegistry, SourceMetadata } from '../adapters/sourceRegistry';

export class ApiClient {
  public static async getDashboardData(): Promise<{
    portfolioSummary: PortfolioSummary;
    marketIndices: MarketIndex[];
    opportunityAlerts: OpportunityAlert[];
    watchlist: Instrument[];
    importantEvents: ImportantEventItem[];
    userRules: UserRules;
  }> {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to direct repository access
    }

    return {
      portfolioSummary: AppRepository.getPortfolioSummary(),
      marketIndices: AppRepository.getMarketIndices(),
      opportunityAlerts: AppRepository.getOpportunityAlerts(),
      watchlist: AppRepository.getWatchlist(),
      importantEvents: AppRepository.getImportantEvents(),
      userRules: AppRepository.getUserRules(),
    };
  }

  public static async getInstruments(query: string = ''): Promise<Instrument[]> {
    try {
      const res = await fetch(`/api/instruments?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    let insts = AppRepository.getInstruments();
    if (query.trim()) {
      const q = query.toLowerCase();
      insts = insts.filter(
        (i) =>
          i.symbol.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q) ||
          i.sector.toLowerCase().includes(q)
      );
    }
    return insts;
  }

  public static async getResearch(symbol: string): Promise<CompleteResearchReport> {
    try {
      const res = await fetch(`/api/research/${encodeURIComponent(symbol)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const inst = AppRepository.getInstrumentBySymbol(symbol);
    if (!inst) {
      throw new Error(`Instrument with symbol "${symbol}" was not found.`);
    }
    return AppRepository.runCompleteResearch(inst.id);
  }

  public static async getOrderSlip(
    symbol: string,
    allocation: number
  ): Promise<FyersManualOrderSlip | null> {
    try {
      const res = await fetch(`/api/order-slip/${encodeURIComponent(symbol)}?allocation=${allocation}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    return AppRepository.generateManualOrderSlip(symbol, allocation);
  }

  public static async getPortfolio(): Promise<{
    summary: PortfolioSummary;
    holdings: PortfolioHolding[];
  }> {
    try {
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    return {
      summary: AppRepository.getPortfolioSummary(),
      holdings: AppRepository.getHoldings(),
    };
  }

  public static async getWatchlist(): Promise<Instrument[]> {
    try {
      const res = await fetch('/api/watchlist');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    return AppRepository.getWatchlist();
  }

  public static async toggleWatchlist(instrumentId: string): Promise<boolean> {
    try {
      const res = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instrumentId }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.inWatchlist;
      }
    } catch {
      // fallback
    }

    return AppRepository.toggleWatchlist(instrumentId);
  }

  public static async getSources(): Promise<SourceMetadata[]> {
    try {
      const res = await fetch('/api/sources');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    return SourceRegistry.getSources();
  }

  public static async getFyersStatus(): Promise<FyersAdapterStatus> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        return data.brokerAdapter;
      }
    } catch {
      // fallback
    }

    return AppRepository.getFyersStatus();
  }

  public static async updateRules(rules: Partial<UserRules>): Promise<UserRules> {
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    return AppRepository.updateUserRules(rules);
  }

  // Price Alerts
  public static async getPriceAlerts(): Promise<PriceAlert[]> {
    try {
      const res = await fetch('/api/alerts/price');
      if (res.ok) return await res.json();
    } catch {}
    return AppRepository.getPriceAlerts();
  }

  public static async createPriceAlert(data: {
    instrumentId?: string;
    symbol: string;
    targetPrice: number;
    condition: PriceAlertCondition;
    notes?: string;
  }): Promise<PriceAlert> {
    try {
      const res = await fetch('/api/alerts/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}
    return AppRepository.createPriceAlert(data);
  }

  public static async deletePriceAlert(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/alerts/price/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        return data.success;
      }
    } catch {}
    return AppRepository.deletePriceAlert(id);
  }

  public static async dismissPriceAlert(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/alerts/price/${id}/dismiss`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data.success;
      }
    } catch {}
    return AppRepository.dismissPriceAlert(id);
  }

  public static async checkPriceAlerts(): Promise<{
    evaluatedCount: number;
    triggeredCount: number;
    triggeredAlerts: PriceAlert[];
  }> {
    try {
      const res = await fetch('/api/alerts/price/check', { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    const triggered = AppRepository.checkPriceAlerts();
    return {
      evaluatedCount: AppRepository.getPriceAlerts().length,
      triggeredCount: triggered.length,
      triggeredAlerts: triggered,
    };
  }

  // FYERS Connection Management
  public static async getFyersAuthUrl(): Promise<string> {
    try {
      const res = await fetch('/api/fyers/auth-url');
      if (res.ok) {
        const data = await res.json();
        return data.authUrl;
      }
    } catch {}
    return 'https://api-t1.fyers.in/api/v3/generate-authcode';
  }

  public static async exchangeFyersToken(code: string): Promise<{ success: boolean; message: string; status: FyersAdapterStatus }> {
    try {
      const res = await fetch('/api/fyers/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return {
      success: false,
      message: 'Server endpoint unreachable.',
      status: AppRepository.getFyersStatus(),
    };
  }

  public static async disconnectFyers(): Promise<FyersAdapterStatus> {
    try {
      const res = await fetch('/api/fyers/disconnect', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data.status;
      }
    } catch {}
    return AppRepository.getFyersStatus();
  }

  // Database Connection Status
  public static async getDatabaseStatus(): Promise<DatabaseStatus> {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) return await res.json();
    } catch {}
    return {
      driver: 'TRANSACTIONAL_MEMORY',
      connected: false,
      host: 'localhost',
      database: 'halal_invest',
      migrationVersion: 'v1.1.0-alerts-events',
      activeTableCount: 18,
      lastChecked: new Date().toISOString(),
      isRealPostgres: false,
      statusMessage: 'Client-side fallback: Database operates via server-side PostgreSQL.',
    };
  }
}
