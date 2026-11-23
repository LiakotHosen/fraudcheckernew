-- ==============================================================================
-- FRAUDCHECKER BD - ENTERPRISE SUPABASE DATABASE SCHEMA
-- Multi-Courier Delivery Verification & E-commerce Fraud Screening Architecture
-- Target: Supabase (PostgreSQL 15+) with Row Level Security (RLS)
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Merchant Accounts & Subscription Quotas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT,
    contact_phone VARCHAR(20),
    website_url TEXT,
    tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
    monthly_quota INT DEFAULT 100,
    used_quota INT DEFAULT 0,
    quota_resets_at TIMESTAMPTZ DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. MERCHANT API KEYS (For WooCommerce Plugin & External POS Integrations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.merchant_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Default Store API Key',
    key_prefix VARCHAR(16) NOT NULL, -- e.g. "fc_live_9a7b..."
    key_hash TEXT NOT NULL UNIQUE,   -- SHA-256 of the actual secret token
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_api_keys_hash ON public.merchant_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_merchant_api_keys_user ON public.merchant_api_keys(user_id);

-- ------------------------------------------------------------------------------
-- 3. MERCHANT COURIER CREDENTIALS (Encrypted BYOK Vault)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.merchant_courier_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    courier_code VARCHAR(30) NOT NULL CHECK (courier_code IN ('steadfast', 'pathao', 'redx', 'carrybee', 'paperfly')),
    api_key_encrypted TEXT NOT NULL,       -- AES-256-GCM encrypted
    api_secret_encrypted TEXT,             -- AES-256-GCM encrypted
    additional_config JSONB DEFAULT '{}'::jsonb, -- store_id, client_id, webhook_url
    status VARCHAR(20) DEFAULT 'connected' CHECK (status IN ('connected', 'failed', 'pending')),
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_courier UNIQUE (user_id, courier_code)
);

CREATE INDEX IF NOT EXISTS idx_courier_creds_user ON public.merchant_courier_credentials(user_id);

-- ------------------------------------------------------------------------------
-- 4. PHONE RECORDS (Crowdsourced E-Commerce Delivery Intelligence Cache)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.phone_records (
    phone VARCHAR(15) PRIMARY KEY, -- Standardized 11-digit e.g. "017XXXXXXXX"
    total_orders INT NOT NULL DEFAULT 0,
    delivered_orders INT NOT NULL DEFAULT 0,
    cancelled_orders INT NOT NULL DEFAULT 0,
    unresolved_reports INT NOT NULL DEFAULT 0,
    calculated_score NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    risk_level VARCHAR(30) NOT NULL DEFAULT 'Safe' CHECK (risk_level IN ('Safe', 'Moderate Risk', 'High Risk', 'New Customer')),
    courier_breakdown JSONB DEFAULT '{}'::jsonb,
    last_queried_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phone_records_score ON public.phone_records(calculated_score);
CREATE INDEX IF NOT EXISTS idx_phone_records_risk ON public.phone_records(risk_level);

-- ------------------------------------------------------------------------------
-- 5. FRAUD REPORTS (Merchant Incident Reports & Proof Submissions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fraud_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_code VARCHAR(12) NOT NULL UNIQUE,
    reporter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    phone VARCHAR(15) NOT NULL,
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('fake_order', 'refused_delivery', 'harassment', 'parcel_damage', 'other')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    order_amount NUMERIC(10,2) DEFAULT 0.00,
    courier_name VARCHAR(50),
    tracking_code VARCHAR(100),
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'verified' CHECK (status IN ('pending', 'verified', 'disputed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_reports_phone ON public.fraud_reports(phone);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_status ON public.fraud_reports(status);

-- ------------------------------------------------------------------------------
-- 6. SEARCH LOGS & TELEMETRY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    phone VARCHAR(15) NOT NULL,
    score NUMERIC(5,2),
    status VARCHAR(30),
    source VARCHAR(30) DEFAULT 'web' CHECK (source IN ('web', 'api', 'woocommerce', 'bulk_excel')),
    ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_user ON public.search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created ON public.search_logs(created_at);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_courier_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- API Keys: Users manage their own keys
CREATE POLICY "Users manage own api keys" ON public.merchant_api_keys
    FOR ALL USING (auth.uid() = user_id);

-- Courier Credentials: Users manage their own courier vault
CREATE POLICY "Users manage own courier credentials" ON public.merchant_courier_credentials
    FOR ALL USING (auth.uid() = user_id);

-- Phone Records: Authenticated users can read phone records
CREATE POLICY "Allow authenticated read on phone records" ON public.phone_records
    FOR SELECT TO authenticated USING (true);

-- Fraud Reports: Authenticated users can read verified reports
CREATE POLICY "Allow public read verified reports" ON public.fraud_reports
    FOR SELECT USING (status = 'verified');

CREATE POLICY "Authenticated users can create reports" ON public.fraud_reports
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_user_id);

-- Search Logs: Users can view their own search history
CREATE POLICY "Users view own search logs" ON public.search_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert search logs" ON public.search_logs
    FOR INSERT WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, company_name, tier, monthly_quota)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'company_name', 'My Merchant Store'), 'free', 100);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
