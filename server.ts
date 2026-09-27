/**
 * HALAL-INVEST: Full-Stack Express Server Entry Point
 * Mounts Vite dev middlewares in development and serves static assets in production.
 * API-First backend hosting deterministic investment research endpoints.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { AppRepository } from './src/db/repository';
import { PostgresService } from './src/db/postgres';
import { FyersAdapter } from './src/adapters/fyersAdapter';
import { SourceRegistry } from './src/adapters/sourceRegistry';
import { PriceAlertService } from './src/services/priceAlertService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize repository, broker adapter, and database
  AppRepository.initialize();
  FyersAdapter.initialize();
  await PostgresService.initialize();
  await PriceAlertService.initialize();

  // Periodic background evaluation of price alerts against authentic quotes
  setInterval(async () => {
    try {
      await PriceAlertService.evaluateAlerts();
    } catch (err: any) {
      console.warn('[Background Worker] Price alert evaluation tick error:', err.message);
    }
  }, 30000);

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health & Adapter Status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      brokerAdapter: FyersAdapter.getStatus(),
      database: PostgresService.getStatus(),
    });
  });

  // Database Connection Status
  app.get('/api/db/status', (req, res) => {
    res.json(PostgresService.getStatus());
  });

  // FYERS Connection Management Endpoints
  app.get('/api/fyers/auth-url', (req, res) => {
    try {
      const url = FyersAdapter.generateAuthUrl(req.query.state as string);
      res.json({ authUrl: url });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/fyers/exchange-token', async (req, res) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Auth code is required.' });
    }
    const result = await FyersAdapter.exchangeAuthCode(code);
    res.json({ ...result, status: FyersAdapter.getStatus() });
  });

  app.post('/api/fyers/disconnect', (req, res) => {
    FyersAdapter.disconnect();
    res.json({ success: true, status: FyersAdapter.getStatus() });
  });

  // Price Alerts Endpoints (PostgreSQL + Real FYERS Data-Driven)
  app.get('/api/alerts/price', async (req, res) => {
    try {
      const alerts = await PriceAlertService.getAlerts();
      res.json(alerts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/alerts/price', async (req, res) => {
    const { instrumentId, symbol, targetPrice, condition, notes } = req.body;
    if (!symbol || !targetPrice || !condition) {
      return res.status(400).json({ error: 'symbol, targetPrice, and condition (ABOVE/BELOW) are required.' });
    }
    try {
      const alert = await PriceAlertService.createAlert({
        instrumentId,
        symbol,
        targetPrice: Number(targetPrice),
        condition,
        notes,
      });
      res.status(201).json(alert);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/alerts/price/:id', async (req, res) => {
    try {
      const success = await PriceAlertService.deleteAlert(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/alerts/price/:id/dismiss', async (req, res) => {
    try {
      const success = await PriceAlertService.dismissAlert(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/alerts/price/check', async (req, res) => {
    try {
      const result = await PriceAlertService.evaluateAlerts();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Real-Time Quotes Feed Endpoint
  app.get('/api/quotes', async (req, res) => {
    const symbolsParam = req.query.symbols as string;
    if (!symbolsParam) {
      return res.status(400).json({ error: 'symbols query parameter required.' });
    }
    const symbols = symbolsParam.split(',').map((s) => s.trim());
    const quotes = await FyersAdapter.getQuotes(symbols);
    const result: Record<string, any> = {};
    quotes.forEach((val, key) => {
      result[key] = val;
    });
    res.json(result);
  });

  // Dashboard Aggregation
  app.get('/api/dashboard', (req, res) => {
    res.json({
      portfolioSummary: AppRepository.getPortfolioSummary(),
      marketIndices: AppRepository.getMarketIndices(),
      opportunityAlerts: AppRepository.getOpportunityAlerts(),
      watchlist: AppRepository.getWatchlist(),
      importantEvents: AppRepository.getImportantEvents(),
      userRules: AppRepository.getUserRules(),
    });
  });

  // Instruments search & list
  app.get('/api/instruments', (req, res) => {
    const query = (req.query.q as string) || '';
    let instruments = AppRepository.getInstruments();
    if (query.trim()) {
      const q = query.toLowerCase();
      instruments = instruments.filter(
        (i) =>
          i.symbol.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q) ||
          i.sector.toLowerCase().includes(q)
      );
    }
    res.json(instruments);
  });

  // Research Report (Deterministic DO EVERYTHING pipeline)
  app.get('/api/research/:symbol', (req, res) => {
    try {
      const symbol = req.params.symbol;
      const inst = AppRepository.getInstrumentBySymbol(symbol);
      if (!inst) {
        return res.status(404).json({ error: `Instrument ${symbol} not found.` });
      }
      const report = AppRepository.runCompleteResearch(inst.id);
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate research report.' });
    }
  });

  // Manual Order Guidance Slip (Strictly manual execution)
  app.get('/api/order-slip/:symbol', (req, res) => {
    const symbol = req.params.symbol;
    const allocation = Number(req.query.allocation) || 50000;
    const slip = FyersAdapter.generateManualExecutionSlip(symbol, allocation);
    if (!slip) {
      return res.status(404).json({ error: 'Cannot generate order slip for this instrument.' });
    }
    res.json(slip);
  });

  // Portfolio
  app.get('/api/portfolio', (req, res) => {
    res.json({
      summary: AppRepository.getPortfolioSummary(),
      holdings: AppRepository.getHoldings(),
    });
  });

  // Watchlist
  app.get('/api/watchlist', (req, res) => {
    res.json(AppRepository.getWatchlist());
  });

  app.post('/api/watchlist/toggle', (req, res) => {
    const { instrumentId } = req.body;
    if (!instrumentId) {
      return res.status(400).json({ error: 'instrumentId is required.' });
    }
    const isNowInWatchlist = AppRepository.toggleWatchlist(instrumentId);
    res.json({ inWatchlist: isNowInWatchlist });
  });

  // Sources & Licensing
  app.get('/api/sources', (req, res) => {
    res.json(SourceRegistry.getSources());
  });

  // User Rules
  app.get('/api/rules', async (req, res) => {
    try {
      const pgRules = await PostgresService.getUserRules();
      if (pgRules) {
        return res.json(pgRules);
      }
    } catch {}
    res.json(AppRepository.getUserRules());
  });

  app.post('/api/rules', async (req, res) => {
    const updated = AppRepository.updateUserRules(req.body);
    try {
      await PostgresService.saveUserRules(updated);
    } catch {}
    res.json(updated);
  });

  // -------------------------------------------------------------
  // VITE CLIENT MIDDLEWARE OR STATIC SERVING
  // -------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[HALAL-INVEST] Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[HALAL-INVEST] Failed to start server:', err);
  process.exit(1);
});
