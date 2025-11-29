-- Create price history tables for audit and billing purposes

-- Room Prices with temporal validity
CREATE TABLE room_prices (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (valid_to IS NULL OR valid_to > valid_from)
);

-- Index for efficient price lookups at a specific point in time
CREATE INDEX idx_room_prices_room_validity ON room_prices(room_id, valid_from, valid_to);

-- Upgrade Prices with temporal validity
CREATE TABLE upgrade_prices (
    id UUID PRIMARY KEY,
    upgrade_id UUID NOT NULL REFERENCES upgrades(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_date_range_upgrade CHECK (valid_to IS NULL OR valid_to > valid_from)
);

-- Index for efficient price lookups at a specific point in time
CREATE INDEX idx_upgrade_prices_upgrade_validity ON upgrade_prices(upgrade_id, valid_from, valid_to);

-- Migrate existing room prices to price history
-- Each room gets its current hourly_rate as a price valid from creation date with no end date
INSERT INTO room_prices (id, room_id, price, valid_from, valid_to, created_at)
SELECT
    gen_random_uuid(),
    id,
    hourly_rate,
    COALESCE(created_at, NOW()),
    NULL,
    NOW()
FROM rooms;

-- Migrate existing upgrade prices to price history
-- Each upgrade gets its current price as a price valid from creation with no end date
INSERT INTO upgrade_prices (id, upgrade_id, price, valid_from, valid_to, created_at)
SELECT
    gen_random_uuid(),
    id,
    price,
    NOW() - INTERVAL '1 year', -- Assume upgrades have been at this price for 1 year
    NULL,
    NOW()
FROM upgrades;
