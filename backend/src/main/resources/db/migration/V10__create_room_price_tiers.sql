-- Create room_price_tiers table for tiered pricing
CREATE TABLE room_price_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_price_id UUID NOT NULL REFERENCES room_prices(id) ON DELETE CASCADE,
    from_minutes INT NOT NULL,
    to_minutes INT,
    price_type VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT check_from_minutes_non_negative CHECK (from_minutes >= 0),
    CONSTRAINT check_to_minutes_greater CHECK (to_minutes IS NULL OR to_minutes > from_minutes),
    CONSTRAINT check_price_positive CHECK (price > 0),
    CONSTRAINT check_price_type CHECK (price_type IN ('FIXED', 'HOURLY'))
);

-- Indexes for performance
CREATE INDEX idx_room_price_tiers_price_id ON room_price_tiers(room_price_id);
CREATE INDEX idx_room_price_tiers_minutes ON room_price_tiers(from_minutes, to_minutes);
CREATE INDEX idx_room_price_tiers_sort_order ON room_price_tiers(room_price_id, sort_order);

-- Comments
COMMENT ON TABLE room_price_tiers IS 'Defines tiered pricing for rooms based on booking duration';
COMMENT ON COLUMN room_price_tiers.from_minutes IS 'Start of price tier in minutes (inclusive)';
COMMENT ON COLUMN room_price_tiers.to_minutes IS 'End of price tier in minutes (exclusive), NULL = unlimited';
COMMENT ON COLUMN room_price_tiers.price_type IS 'FIXED = fixed price for duration, HOURLY = price per hour';
COMMENT ON COLUMN room_price_tiers.price IS 'Price amount (interpretation depends on price_type)';
COMMENT ON COLUMN room_price_tiers.sort_order IS 'Display order in UI';
