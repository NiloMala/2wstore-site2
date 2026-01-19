-- =============================================
-- PAYMENT & SHIPPING INTEGRATION TABLES
-- =============================================

-- Create update_updated_at_column function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add 'processing' status to order_status enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'processing'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
  ) THEN
    ALTER TYPE order_status ADD VALUE 'processing' AFTER 'pending';
  END IF;
END$$;

-- Payment Settings (Mercado Pago, etc.)
CREATE TABLE IF NOT EXISTS payment_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway TEXT NOT NULL DEFAULT 'mercado_pago',
    access_token TEXT,
    public_key TEXT,
    is_sandbox BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    webhook_secret TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gateway)
);

-- Shipping Settings (Melhor Envio, etc.)
CREATE TABLE IF NOT EXISTS shipping_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'melhor_envio',
    api_token TEXT,
    client_id TEXT,
    client_secret TEXT,
    is_sandbox BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    -- Origin address (store address)
    origin_name TEXT,
    origin_email TEXT,
    origin_phone TEXT,
    origin_document TEXT,
    origin_postal_code TEXT,
    origin_address TEXT,
    origin_number TEXT,
    origin_complement TEXT,
    origin_neighborhood TEXT,
    origin_city TEXT,
    origin_state TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider)
);

-- Payments (transaction records)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    gateway TEXT NOT NULL DEFAULT 'mercado_pago',
    transaction_id TEXT UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Melhor Envio columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS melhor_envio_shipment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS melhor_envio_protocol TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Order Status Notifications (for WhatsApp/SMS)
CREATE TABLE IF NOT EXISTS order_status_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    notified_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_notifications ENABLE ROW LEVEL SECURITY;

-- Payment Settings (admin only - using user_roles table)
CREATE POLICY "Admin full access to payment_settings"
    ON payment_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Allow anon read for Edge Functions
CREATE POLICY "Allow anon read payment_settings"
    ON payment_settings FOR SELECT
    USING (true);

-- Shipping Settings (admin only)
CREATE POLICY "Admin full access to shipping_settings"
    ON shipping_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Allow anon read for Edge Functions
CREATE POLICY "Allow anon read shipping_settings"
    ON shipping_settings FOR SELECT
    USING (true);

-- Payments
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = payments.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admin full access to payments"
    ON payments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Allow service role insert/update for webhooks
CREATE POLICY "Allow insert payments"
    ON payments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update payments"
    ON payments FOR UPDATE
    USING (true);

-- Order Status Notifications
CREATE POLICY "Admin full access to order_status_notifications"
    ON order_status_notifications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY "Allow insert order_status_notifications"
    ON order_status_notifications FOR INSERT
    WITH CHECK (true);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_order_status_notifications_order_id ON order_status_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_notifications_notified_at ON order_status_notifications(notified_at);

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated_at trigger for payment_settings
CREATE OR REPLACE TRIGGER update_payment_settings_updated_at
    BEFORE UPDATE ON payment_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Updated_at trigger for shipping_settings
CREATE OR REPLACE TRIGGER update_shipping_settings_updated_at
    BEFORE UPDATE ON shipping_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Updated_at trigger for payments
CREATE OR REPLACE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INSERT DEFAULT SETTINGS
-- =============================================

-- Insert default Mercado Pago settings (placeholder for token)
INSERT INTO payment_settings (gateway, is_sandbox, is_active)
VALUES ('mercado_pago', true, false)
ON CONFLICT (gateway) DO NOTHING;

-- Insert Melhor Envio settings with provided credentials
INSERT INTO shipping_settings (
    provider,
    client_id,
    client_secret,
    is_sandbox,
    is_active,
    origin_name
)
VALUES (
    'melhor_envio',
    '21835',
    'GIaprQz3LuSYxi0pdRqK7RAIqCxto6eysuJLjspfY',
    true,
    true,
    '2WL Store'
)
ON CONFLICT (provider) DO NOTHING;
