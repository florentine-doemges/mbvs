-- Add quantity column to booking_upgrades join table
ALTER TABLE booking_upgrades
ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;

-- Add check constraint to ensure quantity is at least 1
ALTER TABLE booking_upgrades
ADD CONSTRAINT booking_upgrades_quantity_positive CHECK (quantity > 0);
