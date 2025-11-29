-- Remove failed V11 migration entry from Flyway schema history
-- This allows V12 to run properly
DELETE FROM flyway_schema_history WHERE version = '11' AND success = false;
