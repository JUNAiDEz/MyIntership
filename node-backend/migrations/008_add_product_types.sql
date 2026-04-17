-- Migration: Add ProductTypes table and link to ProductTemplates

-- 1. Create ProductTypes table
CREATE TABLE IF NOT EXISTS ProductTypes (
    product_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add product_type_id to ProductTemplates
ALTER TABLE ProductTemplates
    ADD COLUMN product_type_id INT NULL AFTER brand_id,
    ADD INDEX idx_product_type_id (product_type_id),
    ADD CONSTRAINT fk_product_type_id FOREIGN KEY (product_type_id) REFERENCES ProductTypes(product_type_id) ON DELETE SET NULL;

-- 3. (Optional) Insert some default types
INSERT IGNORE INTO ProductTypes (type_name, description) VALUES
    ('อะไหล่', 'อะไหล่รถยนต์'),
    ('น้ำมันเครื่อง', 'น้ำมันเครื่องและของเหลว'),
    ('อุปกรณ์ตกแต่ง', 'อุปกรณ์ตกแต่งรถ'),
    ('ยาง', 'ยางรถยนต์'),
    ('แบตเตอรี่', 'แบตเตอรี่รถยนต์');
