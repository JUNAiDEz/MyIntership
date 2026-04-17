ALTER TABLE "CarModels"
ADD COLUMN slug VARCHAR(120) UNIQUE;

-- Optional: Fill slug for existing rows
UPDATE "CarModels"
SET slug = LOWER(REPLACE(model_name, ' ', '-'))
WHERE slug IS NULL AND model_name IS NOT NULL;