-- Add slug column to Faqs table
ALTER TABLE `Faqs`
ADD COLUMN `slug` VARCHAR(255) UNIQUE NULL COMMENT 'SEO-friendly URL slug for FAQ' AFTER `answer`;
