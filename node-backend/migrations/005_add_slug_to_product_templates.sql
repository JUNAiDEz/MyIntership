-- เพิ่มคอลัมน์ slug ให้ ProductTemplates
ALTER TABLE ProductTemplates
ADD COLUMN slug VARCHAR(255) UNIQUE AFTER product_name;
