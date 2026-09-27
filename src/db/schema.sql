-- ============================================================
-- HALAL-INVEST: PostgreSQL Production Schema
-- Stage 1 -> Stage 5 Architecture Compliant
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS instruments (
    id VARCHAR(50) PRIMARY KEY, -- e.g. NSE:TCS
    symbol VARCHAR(30) NOT NULL,
    name VARCHAR(255) NOT NULL,
    isin VARCHAR(20) UNIQUE NOT NULL,
    exchange VARCHAR(20) NOT NULL,
    country VARCHAR(10) NOT NULL DEFAULT 'IN',
    sector VARCHAR(100) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    market_cap NUMERIC(20, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    current_price NUMERIC(15, 2) NOT NULL,
    day_change NUMERIC(15, 2) DEFAULT 0,
    day_change_percent NUMERIC(8, 4) DEFAULT 0,
    high_52w NUMERIC(15, 2),
    low_52w NUMERIC(15, 2),
    volume BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id VARCHAR(50) REFERENCES instruments(id) ON DELETE CASCADE,
    period_label VARCHAR(20) NOT NULL, -- e.g. FY2024, FY2023
    fiscal_year INT NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- ANNUAL, TTM, QUARTERLY
    scope VARCHAR(20) NOT NULL DEFAULT 'CONSOLIDATED', -- CONSOLIDATED, STANDALONE
    revenue NUMERIC(20, 2) NOT NULL,
    cost_of_revenue NUMERIC(20, 2) NOT NULL,
    gross_profit NUMERIC(20, 2) NOT NULL,
    operating_expenses NUMERIC(20, 2) NOT NULL,
    operating_profit NUMERIC(20, 2) NOT NULL,
    ebitda NUMERIC(20, 2) NOT NULL,
    depreciation NUMERIC(20, 2) NOT NULL,
    interest_expense NUMERIC(20, 2) NOT NULL,
    pbt NUMERIC(20, 2) NOT NULL,
    tax NUMERIC(20, 2) NOT NULL,
    net_profit NUMERIC(20, 2) NOT NULL,
    eps NUMERIC(10, 2) NOT NULL,
    cash_and_equivalents NUMERIC(20, 2) NOT NULL,
    short_term_investments NUMERIC(20, 2) NOT NULL,
    receivables NUMERIC(20, 2) NOT NULL,
    inventory NUMERIC(20, 2) NOT NULL,
    total_current_assets NUMERIC(20, 2) NOT NULL,
    total_assets NUMERIC(20, 2) NOT NULL,
    current_liabilities NUMERIC(20, 2) NOT NULL,
    total_liabilities NUMERIC(20, 2) NOT NULL,
    short_term_debt NUMERIC(20, 2) NOT NULL,
    long_term_debt NUMERIC(20, 2) NOT NULL,
    total_debt NUMERIC(20, 2) NOT NULL,
    total_equity NUMERIC(20, 2) NOT NULL,
    operating_cash_flow NUMERIC(20, 2) NOT NULL,
    capex NUMERIC(20, 2) NOT NULL,
    free_cash_flow NUMERIC(20, 2) NOT NULL,
    dividends_paid NUMERIC(20, 2) NOT NULL,
    source_filing_ref VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shariah_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id VARCHAR(50) REFERENCES instruments(id) ON DELETE CASCADE,
    methodology VARCHAR(50) NOT NULL DEFAULT 'AAOIFI_STANDARD_21',
    methodology_version VARCHAR(20) NOT NULL DEFAULT '2024.1',
    status VARCHAR(30) NOT NULL, -- COMPLIANT, REQUIRES_REVIEW, NOT_COMPLIANT, INSUFFICIENT_EVIDENCE
    is_business_permissible BOOLEAN NOT NULL,
    prohibited_revenue_pct NUMERIC(6, 3) NOT NULL DEFAULT 0,
    debt_to_market_cap_pct NUMERIC(6, 3) NOT NULL,
    interest_securities_pct NUMERIC(6, 3) NOT NULL,
    receivables_to_assets_pct NUMERIC(6, 3) NOT NULL,
    purification_percentage NUMERIC(6, 3) NOT NULL DEFAULT 0,
    screening_date DATE NOT NULL,
    financial_data_date DATE NOT NULL,
    audit_notes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id VARCHAR(50) REFERENCES instruments(id) ON DELETE CASCADE,
    pe_ratio NUMERIC(10, 2),
    pb_ratio NUMERIC(10, 2),
    ev_to_ebitda NUMERIC(10, 2),
    fcf_yield_pct NUMERIC(6, 2),
    pe_percentile_5y NUMERIC(5, 2),
    bull_target_price NUMERIC(15, 2),
    base_target_price NUMERIC(15, 2),
    bear_target_price NUMERIC(15, 2),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id VARCHAR(50) REFERENCES instruments(id) ON DELETE CASCADE,
    decision VARCHAR(50) NOT NULL, -- BUY_CANDIDATE, WAIT_INVESTIGATE, HIGHER_RISK_SPECULATIVE, AVOID_NOT_A_CANDIDATE, REQUIRES_REVIEW, NO_DECISION_INSUFFICIENT_EVIDENCE
    holding_decision VARCHAR(50), -- HOLD, REVIEW, CONSIDER_REDUCING, SELL_EXIT_CANDIDATE
    confidence_level VARCHAR(20) NOT NULL, -- STRONG, MODERATE, LIMITED, INSUFFICIENT
    summary_why TEXT NOT NULL,
    summary_why_not TEXT NOT NULL,
    invalidation_triggers JSONB NOT NULL,
    evidence_snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    instrument_id VARCHAR(50) REFERENCES instruments(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    average_buy_price NUMERIC(15, 2) NOT NULL,
    purification_paid NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_rules (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    monthly_budget_inr NUMERIC(15, 2) NOT NULL DEFAULT 50000,
    invested_this_month_inr NUMERIC(15, 2) NOT NULL DEFAULT 20000,
    max_single_position_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
    risk_tolerance VARCHAR(30) NOT NULL DEFAULT 'CONSERVATIVE',
    shariah_methodology VARCHAR(50) NOT NULL DEFAULT 'AAOIFI_STANDARD_21',
    investment_horizon VARCHAR(50) NOT NULL DEFAULT 'LONG_TERM_WEALTH',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_alerts (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    instrument_id VARCHAR(50),
    symbol VARCHAR(30) NOT NULL,
    target_price NUMERIC(15, 2) NOT NULL,
    current_price_at_creation NUMERIC(15, 2) NOT NULL,
    condition VARCHAR(10) NOT NULL, -- ABOVE, BELOW
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, TRIGGERED, DISMISSED
    notes TEXT,
    last_checked_price NUMERIC(15, 2),
    triggered_price NUMERIC(15, 2),
    data_source VARCHAR(50) DEFAULT 'FYERS_API_V3',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    triggered_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_status ON price_alerts(status);
CREATE INDEX IF NOT EXISTS idx_price_alerts_symbol ON price_alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);

-- Seed default user for personal investment workspace
INSERT INTO users (id, email) 
VALUES ('00000000-0000-0000-0000-000000000001', 'personal@halal-invest.internal') 
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    payload JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    attempt_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    next_attempt_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
