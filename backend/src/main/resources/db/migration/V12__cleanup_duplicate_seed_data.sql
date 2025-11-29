-- Remove old test/seed data that was duplicated
-- Keep only the production seed data from V10 (IDs starting with 33333333-, 44444444-)

-- Delete old test bookings first (to avoid foreign key constraints)
DELETE FROM booking_upgrades WHERE booking_id IN (
    SELECT id FROM bookings WHERE room_id::text LIKE '22222222-%'
);

DELETE FROM bookings WHERE room_id::text LIKE '22222222-%';

-- Delete old test rooms (IDs starting with 22222222-)
DELETE FROM rooms WHERE id::text LIKE '22222222-%';

-- Delete old test service providers (IDs starting with 33333333-)
-- Keep only providers with IDs 22222222-...2201, 22222222-...2202, 22222222-...2203 from V10
DELETE FROM service_providers WHERE id IN (
    '33333333-3333-3333-3333-333333333301'::uuid,
    '33333333-3333-3333-3333-333333333302'::uuid,
    '33333333-3333-3333-3333-333333333303'::uuid,
    '33333333-3333-3333-3333-333333333304'::uuid
);

-- Delete old duration options (keep V10 ones with IDs 44444444-)
DELETE FROM duration_options WHERE id::text LIKE '55555555-%';
