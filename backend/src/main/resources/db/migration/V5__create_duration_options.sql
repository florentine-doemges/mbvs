-- Create duration_options table
CREATE TABLE duration_options (
    id UUID PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES locations(id),
    minutes INT NOT NULL,
    label VARCHAR(50) NOT NULL,
    is_variable BOOLEAN DEFAULT FALSE,
    min_minutes INT,
    max_minutes INT,
    step_minutes INT,
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default duration options for Studio Mabella
INSERT INTO duration_options (id, location_id, minutes, label, sort_order) VALUES
    ('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111111', 60, '1 Stunde', 1),
    ('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111111', 120, '2 Stunden', 2),
    ('55555555-5555-5555-5555-555555555503', '11111111-1111-1111-1111-111111111111', 180, '3 Stunden', 3);

INSERT INTO duration_options (id, location_id, minutes, label, is_variable, min_minutes, max_minutes, step_minutes, sort_order) VALUES
    ('55555555-5555-5555-5555-555555555504', '11111111-1111-1111-1111-111111111111', 0, 'Variable', true, 30, 480, 30, 4);
