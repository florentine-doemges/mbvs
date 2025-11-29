-- Insert Location (Studio Mabella)
INSERT INTO locations (id, name, created_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'Studio Mabella', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Rooms
INSERT INTO rooms (id, location_id, name, hourly_rate, active, sort_order, color, created_at, updated_at)
VALUES
    ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', 'Rot', 70.00, true, 1, '#EF4444', NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', 'Blau', 70.00, true, 2, '#3B82F6', NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111111', 'Grün', 70.00, true, 3, '#10B981', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Providers
INSERT INTO service_providers (id, location_id, name, active, sort_order, color, created_at, updated_at)
VALUES
    ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', 'Lady Lexi', true, 1, '#EC4899', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', 'Domina Sarah', true, 2, '#8B5CF6', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', 'Mistress Anna', true, 3, '#F59E0B', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Duration Options
INSERT INTO duration_options (id, location_id, minutes, label, is_variable, min_minutes, max_minutes, step_minutes, sort_order, active, created_at)
VALUES
    ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', 60, '1 Stunde', false, NULL, NULL, NULL, 1, true, NOW()),
    ('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', 90, '1,5 Stunden', false, NULL, NULL, NULL, 2, true, NOW()),
    ('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', 120, '2 Stunden', false, NULL, NULL, NULL, 3, true, NOW()),
    ('44444444-4444-4444-4444-444444444404', '11111111-1111-1111-1111-111111111111', 0, 'Variable Dauer', true, 30, 480, 30, 4, true, NOW())
ON CONFLICT (id) DO NOTHING;
