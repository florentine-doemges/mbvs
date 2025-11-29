-- Add location reference and new fields to service_providers table
ALTER TABLE service_providers ADD COLUMN location_id UUID;
ALTER TABLE service_providers ADD COLUMN sort_order INT DEFAULT 0;
ALTER TABLE service_providers ADD COLUMN color VARCHAR(7) DEFAULT '#10B981';
ALTER TABLE service_providers ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE service_providers ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Assign existing providers to the first location
UPDATE service_providers SET location_id = '11111111-1111-1111-1111-111111111111';

-- Make location_id NOT NULL after data migration
ALTER TABLE service_providers ALTER COLUMN location_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE service_providers ADD CONSTRAINT fk_provider_location
    FOREIGN KEY (location_id) REFERENCES locations(id);

-- Update existing providers with distinct colors and sort order
UPDATE service_providers SET color = '#EC4899', sort_order = 1 WHERE name = 'Lady Lexi';
UPDATE service_providers SET color = '#F97316', sort_order = 2 WHERE name = 'Mistress Bella';
UPDATE service_providers SET color = '#06B6D4', sort_order = 3 WHERE name = 'Domina Katja';
UPDATE service_providers SET color = '#A855F7', sort_order = 4 WHERE name = 'Lady Sarah';
