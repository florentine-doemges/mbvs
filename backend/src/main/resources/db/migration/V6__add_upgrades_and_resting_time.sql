-- Create upgrades table
CREATE TABLE upgrades (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add resting_time_minutes to bookings
ALTER TABLE bookings
ADD COLUMN resting_time_minutes INTEGER NOT NULL DEFAULT 0;

-- Create booking_upgrades join table
CREATE TABLE booking_upgrades (
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    upgrade_id UUID NOT NULL REFERENCES upgrades(id) ON DELETE CASCADE,
    PRIMARY KEY (booking_id, upgrade_id)
);

-- Add some example upgrades
INSERT INTO upgrades (id, name, price, active) VALUES
('55555555-5555-5555-5555-555555555501', 'Champagner', 50.00, true),
('55555555-5555-5555-5555-555555555502', 'Kaviar', 80.00, true),
('55555555-5555-5555-5555-555555555503', 'Massage (30 min)', 40.00, true),
('55555555-5555-5555-5555-555555555504', 'Premium-Dessous', 30.00, true);
