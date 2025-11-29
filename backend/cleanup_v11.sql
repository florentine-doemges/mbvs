-- Remove failed V11 migration from Flyway schema history
DELETE FROM flyway_schema_history WHERE version = '11';
