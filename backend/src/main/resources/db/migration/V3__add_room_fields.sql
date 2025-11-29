-- Add new fields to rooms table
ALTER TABLE rooms ADD COLUMN sort_order INT DEFAULT 0;
ALTER TABLE rooms ADD COLUMN color VARCHAR(7) DEFAULT '#3B82F6';
ALTER TABLE rooms ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE rooms ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing rooms with distinct colors
UPDATE rooms SET color = '#EF4444', sort_order = 1 WHERE name = 'Rot';
UPDATE rooms SET color = '#3B82F6', sort_order = 2 WHERE name = 'Blau';
UPDATE rooms SET color = '#EAB308', sort_order = 3 WHERE name = 'Gelb';
UPDATE rooms SET color = '#8B5CF6', sort_order = 4 WHERE name = 'Klinik';
UPDATE rooms SET color = '#22C55E', sort_order = 5 WHERE name = 'Outdoor';
