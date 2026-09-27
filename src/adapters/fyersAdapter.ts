/**
 * HALAL-INVEST: Official FYERS Broker Integration Adapter
 *
 * Strict Architecture Invariants:
 * 1. Read-Only Data Feeds: Only fetches account profile, holdings, and live market quotes.
 * 2. Dedicated Sandbox/Simulator Mode: Allows testing without requiring real credentials,
 *    clearly separated with transparent labelling (no fake credentials exposed as real).
 * 3. Never executes automated trades: executeAutomatedTrade() strictly throws an exception.
 * 4. Manual execution assistance: Only formats pre-filled CNC delivery order tickets.
 * 5. Credential security: All tokens and keys remain strictly server-side.
 */

import crypto from 'crypto';
import {
  FyersAdapterStatus,
  FyersManualOrderSlip,
  FyersConnectionState,
  PriceQuote,
} from '../types';
import { AppRepository } from '../db/repository';

export class FyersAdapter {
  private static appId: string = process.env.FYERS_APP_ID || '';
  private static secretKey: string = process.env.FYERS_SECRET_KEY || '';
  private static accessToken: string = process.env.FYERS_ACCESS_TOKEN || '';
  private static redirectUri: string =
    process.env.FYERS_REDIRECT_URI || 'https://halal-invest.internal/api/fyers/callback';

  // Sandbox Mode: Active when credentials are not configured or when explicitly enabled
  private static isSandbox: boolean =
    process.env.FYERS_SANDBOX === 'true' || !process.env.FYERS_APP_ID;

  private static connectionState: FyersConnectionState = 'NOT CONNECTED';
  private static verifiedAccountName: string | undefined = undefined;
  private static tokenExpiresAt: string | undefined = undefined;
  private static lastSyncTime: string | undefined = undefined;
  private static syncMessage: string = 'Broker adapter initialized in server environment.';

  public static initialize(): void {
    if (this.isSandbox) {
      this.syncMessage =
        'FYERS Sandbox Simulator active. Test token exchange and simulated live market quotes are available.';
      return;
    }

    if (!this.appId) {
      this.connectionState = 'NOT CONNECTED';
      this.syncMessage = 'FYERS_APP_ID not configured in server environment.';
      return;
    }

    if (this.accessToken) {
      this.verifyAccessToken();
    } else {
      this.connectionState = 'NOT CONNECTED';
      this.syncMessage = 'Access token required. Initiate FYERS v3 login to connect.';
    }
  }

  /**
   * Sets sandbox testing mode on or off.
   */
  public static setSandboxMode(enabled: boolean): void {
    this.isSandbox = enabled;
    if (enabled && this.connectionState !== 'CONNECTED') {
      this.syncMessage = 'Switched to FYERS Sandbox Testing Mode.';
    }
  }

  /**
   * Generates the FYERS API v3 OAuth login URL.
   * If in sandbox mode, returns a dedicated test simulation URL.
   */
  public static generateAuthUrl(stateParam?: string): string {
    if (this.isSandbox || !this.appId) {
      return `https://halal-invest.internal/sandbox-auth?client_id=SANDBOX_CLIENT&state=${encodeURIComponent(
        stateParam || 'sandbox_state'
      )}&test_code=SANDBOX-TEST-CODE-2026`;
    }

    const state = stateParam || crypto.randomBytes(16).toString('hex');
    const encodedRedirect = encodeURIComponent(this.redirectUri);
    return `https://api-t1.fyers.in/api/v3/generate-authcode?client_id=${encodeURIComponent(
      this.appId
    )}&redirect_uri=${encodedRedirect}&response_type=code&state=${encodeURIComponent(state)}`;
  }

  /**
   * Exchanges authorization code for an access token.
   * Supports sandbox test authorization codes without needing real broker keys.
   */
  public static async exchangeAuthCode(
    authCode: string
  ): Promise<{ success: boolean; message: string }> {
    const code = authCode.trim();

    // Check for Sandbox Test Code
    if (this.isSandbox || code.startsWith('SANDBOX') || code === 'TEST' || !this.appId) {
      this.isSandbox = true;
      this.accessToken = `sandbox_token_${Date.now()}`;
      this.connectionState = 'CONNECTED';
      this.verifiedAccountName = 'TEST_INVESTOR_SIMULATOR (Read-Only)';
      this.lastSyncTime = new Date().toISOString();
      this.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      this.syncMessage =
        'Connected in Sandbox Simulator Mode (Simulated live quotes feed & portfolio sync. Automated execution strictly blocked).';
      return {
        success: true,
        message: 'Connected to FYERS in Sandbox Simulator Mode.',
      };
    }

    if (!this.appId || !this.secretKey) {
      this.connectionState = 'CONNECTION ERROR';
      this.syncMessage = 'Server missing FYERS_APP_ID or FYERS_SECRET_KEY.';
      return { success: false, message: this.syncMessage };
    }

    this.connectionState = 'CONNECTING';

    try {
      const appIdHash = crypto
        .createHash('sha256')
        .update(`${this.appId}:${this.secretKey}`)
        .digest('hex');

      const response = await fetch('https://api-t1.fyers.in/api/v3/validate-authcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          appIdHash,
          code,
        }),
      });

      const data = await response.json();

      if (data && data.s === 'ok' && data.access_token) {
        this.isSandbox = false;
        this.accessToken = data.access_token;
        this.connectionState = 'CONNECTED';
        this.lastSyncTime = new Date().toISOString();
        this.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h
        this.syncMessage = 'Authenticated successfully with official FYERS API v3.';
        await this.verifyAccessToken();
        return { success: true, message: 'FYERS connected successfully.' };
      } else {
        this.connectionState = 'CONNECTION ERROR';
        this.syncMessage = data.message || 'Failed to validate auth code with FYERS API.';
        return { success: false, message: this.syncMessage };
      }
    } catch (err: any) {
      this.connectionState = 'CONNECTION ERROR';
      this.syncMessage = `FYERS connection error: ${err.message}`;
      return { success: false, message: this.syncMessage };
    }
  }

  /**
   * Verifies access token validity by fetching user profile from FYERS v3.
   */
  private static async verifyAccessToken(): Promise<boolean> {
    if (this.isSandbox) {
      this.connectionState = 'CONNECTED';
      this.verifiedAccountName = 'TEST_INVESTOR_SIMULATOR (Read-Only)';
      return true;
    }

    if (!this.accessToken || !this.appId) return false;

    try {
      const res = await fetch('https://api-t1.fyers.in/api/v3/profile', {
        method: 'GET',
        headers: {
          Authorization: `${this.appId}:${this.accessToken}`,
        },
      });

      if (res.ok) {
        const profile = await res.json();
        if (profile && profile.s === 'ok') {
          this.connectionState = 'CONNECTED';
          this.verifiedAccountName = profile.data?.name || profile.data?.fy_id || 'Verified Investor';
          this.lastSyncTime = new Date().toISOString();
          this.syncMessage = `FYERS connected: ${this.verifiedAccountName} (Read-Only CNC mode)`;
          return true;
        }
      }

      if (res.status === 401 || res.status === 403) {
        this.connectionState = 'TOKEN EXPIRED';
        this.syncMessage = 'FYERS session expired. Re-authentication required.';
        return false;
      }
    } catch (err: any) {
      this.connectionState = 'NOT CONNECTED';
      this.syncMessage = `FYERS verification offline: ${err.message}`;
      return false;
    }

    this.connectionState = 'NOT CONNECTED';
    return false;
  }

  /**
   * Retrieves connection health and adapter security status.
   */
  public static getStatus(): FyersAdapterStatus {
    const isConn = this.connectionState === 'CONNECTED';
    return {
      state: this.connectionState,
      connected: isConn,
      accountType: 'FYERS_BROKER_ADAPTER',
      mode: this.isSandbox ? 'SANDBOX_SIMULATOR' : 'LIVE_BROKER',
      isSandbox: this.isSandbox,
      serverSideConfigured: Boolean(this.appId && !this.isSandbox),
      marketDataLive: isConn,
      autoTradingBlocked: true, // Non-negotiable invariant
      lastHeartbeat: new Date().toISOString(),
      lastSyncTime: this.lastSyncTime,
      tokenExpiresAt: this.tokenExpiresAt,
      appIdConfigured: Boolean(this.appId),
      tokenConfigured: Boolean(this.accessToken),
      verifiedAccountName: this.verifiedAccountName,
      syncMessage: this.syncMessage,
    };
  }

  /**
   * Disconnects the FYERS session.
   */
  public static disconnect(): void {
    this.accessToken = '';
    this.verifiedAccountName = undefined;
    this.connectionState = 'NOT CONNECTED';
    this.syncMessage = 'Disconnected from FYERS.';
  }

  /**
   * Retrieves quotes for multiple symbols.
   * In LIVE_BROKER mode: queries official FYERS API v3 quotes endpoint.
   * In SANDBOX_SIMULATOR mode: simulates real-time tick variance around verified baseline disclosures.
   * Fallback: verified disclosures from AppRepository.
   */
  public static async getQuotes(symbols: string[]): Promise<Map<string, PriceQuote>> {
    const quoteMap = new Map<string, PriceQuote>();
    if (!symbols || symbols.length === 0) return quoteMap;

    const uniqueSymbols = Array.from(new Set(symbols.map((s) => s.trim().toUpperCase())));

    // 1. LIVE OFFICIAL FYERS API v3
    if (!this.isSandbox && this.connectionState === 'CONNECTED' && this.accessToken && this.appId) {
      try {
        const formattedSymbols = uniqueSymbols
          .map((s) => (s.includes(':') ? s : `NSE:${s}-EQ`))
          .join(',');

        const response = await fetch(
          `https://api-t1.fyers.in/data/quotes?symbols=${encodeURIComponent(formattedSymbols)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `${this.appId}:${this.accessToken}`,
            },
          }
        );

        if (response.ok) {
          const json = await response.json();
          if (json && json.s === 'ok' && Array.isArray(json.d)) {
            for (const item of json.d) {
              if (item.s === 'ok' && item.v) {
                const cleanSym = item.n.replace('NSE:', '').replace('-EQ', '').toUpperCase();
                const ltp = Number(item.v.lp);
                const ch = Number(item.v.ch || 0);
                const chp = Number(item.v.chp || 0);
                const quote: PriceQuote = {
                  symbol: cleanSym,
                  ltp,
                  change: ch,
                  changePercent: chp,
                  high52w: item.v.high_price,
                  low52w: item.v.low_price,
                  volume: item.v.volume,
                  lastUpdated: new Date().toISOString(),
                  source: 'FYERS_API_V3',
                };
                quoteMap.set(cleanSym, quote);
              }
            }
          }
        }
      } catch (err: any) {
        console.warn('[FyersAdapter] Live quote fetch failed, falling back to verified disclosures:', err.message);
      }
    }

    // 2. SANDBOX SIMULATOR OR VERIFIED DISCLOSURES
    for (const sym of uniqueSymbols) {
      const cleanSym = sym.replace('NSE:', '').replace('-EQ', '').toUpperCase();
      if (!quoteMap.has(cleanSym)) {
        const inst = AppRepository.getInstrumentBySymbol(cleanSym);
        if (inst) {
          if (this.isSandbox && this.connectionState === 'CONNECTED') {
            // Simulated live tick with micro-movement (+- 0.15%)
            const jitterPct = (Math.sin(Date.now() / 15000 + cleanSym.charCodeAt(0)) * 0.15) / 100;
            const simulatedLtp = Math.round((inst.currentPrice * (1 + jitterPct)) * 100) / 100;
            const simulatedChange = Math.round((inst.dayChange + (simulatedLtp - inst.currentPrice)) * 100) / 100;

            quoteMap.set(cleanSym, {
              symbol: cleanSym,
              ltp: simulatedLtp,
              change: simulatedChange,
              changePercent: Math.round(((simulatedLtp - (inst.currentPrice - inst.dayChange)) / (inst.currentPrice - inst.dayChange)) * 10000) / 100,
              high52w: inst.high52w,
              low52w: inst.low52w,
              volume: inst.volume,
              lastUpdated: new Date().toISOString(),
              source: 'FYERS_SANDBOX_SIMULATOR',
            });
          } else {
            // Verified base disclosure
            quoteMap.set(cleanSym, {
              symbol: cleanSym,
              ltp: inst.currentPrice,
              change: inst.dayChange,
              changePercent: inst.dayChangePercent,
              high52w: inst.high52w,
              low52w: inst.low52w,
              volume: inst.volume,
              lastUpdated: inst.lastPriceUpdate || new Date().toISOString(),
              source: 'VERIFIED_DISCLOSURE',
            });
          }
        }
      }
    }

    return quoteMap;
  }

  /**
   * Generates a pre-formatted manual order execution ticket.
   * Gives exact parameters so the user can enter them manually into FYERS.
   */
  public static generateManualExecutionSlip(
    symbol: string,
    allocatedINR: number
  ): FyersManualOrderSlip | null {
    return AppRepository.generateManualOrderSlip(symbol, allocatedINR);
  }

  /**
   * Hard Invariant: Blocks any attempt to programmatically execute trades.
   * Strict product safety invariant across ALL modes (Live and Sandbox).
   */
  public static executeAutomatedTrade(): never {
    throw new Error(
      'HALAL-INVEST INVARIANT VIOLATION: Automated order execution is strictly prohibited by product safety architecture. The user must manually execute through the official FYERS terminal.'
    );
  }
}
