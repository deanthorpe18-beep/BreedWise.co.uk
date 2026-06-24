-- Use info@ for all public contact references
UPDATE cms_content
SET value = 'info@breedwise.co.uk'
WHERE key = 'contact_email' AND value = 'help@breedwise.co.uk';

UPDATE email_templates
SET from_address = 'BreedWise <info@breedwise.co.uk>'
WHERE from_address ILIKE '%noreply@breedwise.co.uk%';

ALTER TABLE email_templates
  ALTER COLUMN from_address SET DEFAULT 'BreedWise <info@breedwise.co.uk>';
