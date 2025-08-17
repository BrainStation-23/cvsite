
-- Allow null values for description in achievements table
ALTER TABLE achievements ALTER COLUMN description DROP NOT NULL;

-- Also update other description columns that should allow null
ALTER TABLE experiences ALTER COLUMN description DROP NOT NULL;
ALTER TABLE trainings ALTER COLUMN description DROP NOT NULL;
