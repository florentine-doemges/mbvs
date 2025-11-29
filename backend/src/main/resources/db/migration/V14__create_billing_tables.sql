-- Create billing tables for invoice generation and settlement

-- Billing table (one per service provider / Domina)
CREATE TABLE billings (
    id UUID PRIMARY KEY,
    service_provider_id UUID NOT NULL REFERENCES service_providers(id),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    invoice_document_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_billing_period CHECK (period_end > period_start)
);

-- Index for queries by service provider and time period
CREATE INDEX idx_billings_provider_period ON billings(service_provider_id, period_start, period_end);
CREATE INDEX idx_billings_created ON billings(created_at DESC);

-- Billing items (frozen snapshot of each booking)
CREATE TABLE billing_items (
    id UUID PRIMARY KEY,
    billing_id UUID NOT NULL REFERENCES billings(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id),

    -- Frozen booking data
    frozen_start_time TIMESTAMPTZ NOT NULL,
    frozen_end_time TIMESTAMPTZ NOT NULL,
    frozen_duration_minutes INTEGER NOT NULL,
    frozen_resting_time_minutes INTEGER NOT NULL DEFAULT 0,
    frozen_client_alias VARCHAR(255),
    frozen_room_name VARCHAR(255) NOT NULL,

    -- Price references (link to historical prices)
    room_price_id UUID NOT NULL REFERENCES room_prices(id),
    frozen_room_price_amount DECIMAL(10, 2) NOT NULL,

    -- Calculated totals
    subtotal_room DECIMAL(10, 2) NOT NULL,
    subtotal_upgrades DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure each booking is only billed once
    CONSTRAINT unique_booking_per_billing UNIQUE (billing_id, booking_id)
);

-- Index for efficient lookup
CREATE INDEX idx_billing_items_billing ON billing_items(billing_id);
CREATE INDEX idx_billing_items_booking ON billing_items(booking_id);

-- Billing item upgrades (frozen upgrade data)
CREATE TABLE billing_item_upgrades (
    id UUID PRIMARY KEY,
    billing_item_id UUID NOT NULL REFERENCES billing_items(id) ON DELETE CASCADE,

    -- Frozen upgrade data
    frozen_upgrade_name VARCHAR(255) NOT NULL,
    frozen_quantity INTEGER NOT NULL DEFAULT 1,

    -- Price reference (link to historical price)
    upgrade_price_id UUID NOT NULL REFERENCES upgrade_prices(id),
    frozen_upgrade_price_amount DECIMAL(10, 2) NOT NULL,

    -- Calculated total
    total_amount DECIMAL(10, 2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient lookup
CREATE INDEX idx_billing_item_upgrades_item ON billing_item_upgrades(billing_item_id);
