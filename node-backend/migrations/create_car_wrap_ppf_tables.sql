-- ==========================================================
-- Car Wrap & PPF System Database Schema
-- วันที่: 2025-12-02
-- ==========================================================

-- ==========================================================
-- 1. ตาราง CarWrapProfiles (รุ่นรถที่ให้บริการห่อหุ้ม)
-- ==========================================================

CREATE TABLE IF NOT EXISTS CarWrapProfiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    car_model_id INT NOT NULL UNIQUE, -- 1 รุ่นรถ มี 1 Profile
    
    -- ข้อมูลสำหรับแสดงผลบนเว็บ (Marketing)
    display_name VARCHAR(100), -- ชื่อที่จะโชว์บนเว็บ เช่น "Minicooper Edition"
    description TEXT,          -- คำบรรยาย เช่น "From rapid lines..."
    
    -- รูปภาพสำหรับ Visualizer (แนะนำเป็นรูปสีขาว/เงิน ตัดพื้นหลัง)
    base_image_url VARCHAR(255) NOT NULL, 
    
    -- ข้อมูล Spec เบื้องต้น (สำหรับโชว์กราฟ)
    engine_rpm VARCHAR(50) DEFAULT '3500',
    engine_temp VARCHAR(50) DEFAULT '90°C',
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (car_model_id) REFERENCES CarModels(model_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 2. ส่วนแคตตาล็อกฟิล์มสี/สติ๊กเกอร์ (Wrap Vinyl Catalog)
-- สำหรับเปลี่ยนสีรถ (Fashion/Styling) - ใช้ PVC
-- ==========================================================

-- 2.1 ซีรีส์ของฟิล์มเปลี่ยนสี
CREATE TABLE IF NOT EXISTS WrapFilmSeries (
    series_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(50) NOT NULL, -- 3M, Avery, Oracal
    series_name VARCHAR(100) NOT NULL, -- 2080 Series, SW900
    finish_type ENUM('Gloss', 'Matte', 'Satin', 'Texture', 'Chrome', 'ColorFlip') NOT NULL,
    warranty_years INT DEFAULT 3,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2 สีที่มีให้เลือก (Color Options)
CREATE TABLE IF NOT EXISTS WrapFilmColors (
    color_id INT AUTO_INCREMENT PRIMARY KEY,
    series_id INT NOT NULL,
    
    -- ข้อมูลทั่วไป
    color_name VARCHAR(100) NOT NULL, -- Midnight Blue, Matte Black
    color_code VARCHAR(50) NOT NULL,  -- รหัสสีผู้ผลิต เช่น M12, G212
    
    -- ข้อมูลสำหรับ UI (React)
    hex_value VARCHAR(7) NOT NULL,    -- ค่าสีสำหรับปุ่มกด และ Overlay (#1A237E)
    texture_url VARCHAR(255) NULL,    -- (Optional) ถ้าเป็นลาย Carbon/Brush ให้ใส่รูป Texture ตรงนี้
    
    -- เชื่อมกับ Stock จริงในระบบหลัก (ถ้ามี)
    product_variant_id INT NULL, 
    
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (series_id) REFERENCES WrapFilmSeries(series_id) ON DELETE CASCADE,
    FOREIGN KEY (product_variant_id) REFERENCES ProductVariants(variant_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 3. ส่วนกำหนดราคา Wrap ตามรุ่นรถ (Wrap Pricing)
-- ==========================================================

CREATE TABLE IF NOT EXISTS WrapServicePrices (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    car_model_id INT NOT NULL,
    series_id INT NOT NULL, -- ราคาเปลี่ยนตามเกรดฟิล์ม
    
    -- ราคาบริการ (Labor + Material Estimate)
    full_wrap_price DECIMAL(10, 2) NOT NULL,  -- ราคาหุ้มทั้งคัน
    roof_wrap_price DECIMAL(10, 2) DEFAULT 0, -- ราคาเฉพาะหลังคา
    hood_wrap_price DECIMAL(10, 2) DEFAULT 0, -- ราคาเฉพาะฝากระโปรง
    
    estimated_days INT DEFAULT 3, -- ระยะเวลาทำโดยประมาณ
    
    UNIQUE KEY unique_car_series (car_model_id, series_id), -- ป้องกันราคาซ้ำซ้อน
    FOREIGN KEY (car_model_id) REFERENCES CarModels(model_id) ON DELETE CASCADE,
    FOREIGN KEY (series_id) REFERENCES WrapFilmSeries(series_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 4. ส่วนจัดการฟิล์มใสกันรอย (PPF System)
-- แยกออกมาเพราะเน้นเรื่องการป้องกัน (Protection) และวัสดุ TPU/TPH
-- ==========================================================

-- 4.1 ซีรีส์ของฟิล์มกันรอย (PPF Series)
CREATE TABLE IF NOT EXISTS PPFSeries (
    ppf_series_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(50) NOT NULL, -- Stek, 3M, Suntek, Magnus Pro
    series_name VARCHAR(100) NOT NULL, -- DynoShield, Scotchgard Pro
    
    -- คุณสมบัติเฉพาะของ PPF ที่ลูกค้าสนใจ
    material_type ENUM('TPU', 'TPH', 'PVC', 'PU') NOT NULL DEFAULT 'TPU', -- วัสดุ (TPU แพงสุด ดีสุด)
    thickness_mil DECIMAL(4, 1) DEFAULT 7.5, -- ความหนาหน่วยเป็น mil (เช่น 6.5, 7.5, 8, 10)
    finish_type ENUM('Clear Gloss', 'Clear Matte', 'Colored', 'Black High Gloss') DEFAULT 'Clear Gloss',
    
    -- Feature ขายของ
    self_healing BOOLEAN DEFAULT TRUE, -- ฟื้นฟูริ้วรอยด้วยความร้อน
    hydrophobic BOOLEAN DEFAULT TRUE,  -- ไล่น้ำ (Glass Coating Effect)
    
    warranty_years INT DEFAULT 5,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.2 ราคา PPF ตามรุ่นรถ (PPF Pricing)
-- โครงสร้างราคา PPF มักจะขายเป็น Package ตามพื้นที่ติดตั้ง
CREATE TABLE IF NOT EXISTS PPFServicePrices (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    car_model_id INT NOT NULL,
    ppf_series_id INT NOT NULL,
    
    -- ราคาแพ็กเกจยอดนิยม
    full_car_price DECIMAL(10, 2),       -- ทั้งคัน
    full_front_price DECIMAL(10, 2),     -- ชุดหน้าเต็ม (กันชน+ฝากระโปรง+แก้ม+กระจก)
    standard_front_price DECIMAL(10, 2), -- ชุดหน้ามาตรฐาน (กันชน+ฝากระโปรงครึ่ง+แก้มครึ่ง)
    bumper_price DECIMAL(10, 2),         -- เฉพาะกันชน
    
    estimated_days INT DEFAULT 3,
    
    UNIQUE KEY unique_car_ppf (car_model_id, ppf_series_id),
    FOREIGN KEY (car_model_id) REFERENCES CarModels(model_id) ON DELETE CASCADE,
    FOREIGN KEY (ppf_series_id) REFERENCES PPFSeries(ppf_series_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 5. ข้อมูลตัวอย่าง (Seed Data)
-- ==========================================================

-- 5.1 เพิ่มหมวดหมู่ฟิล์ม Wrap (เปลี่ยนสี)
INSERT IGNORE INTO WrapFilmSeries (brand_name, series_name, finish_type, warranty_years, description) VALUES 
('3M', '2080 Gloss Series', 'Gloss', 7, 'High-gloss vinyl wrap with superior durability'),
('3M', '2080 Matte Series', 'Matte', 7, 'Premium matte finish with scratch resistance'),
('Avery', 'Dennison SW900', 'Satin', 5, 'Satin finish with easy application'),
('Oracal', '970RA Premium', 'Gloss', 5, 'Cost-effective glossy wrap solution');

-- เพิ่มสีตัวอย่าง Wrap
INSERT IGNORE INTO WrapFilmColors (series_id, color_name, color_code, hex_value, is_active) VALUES 
(1, 'Gloss Dragon Fire Red', 'G363', '#D32F2F', TRUE), -- แดง
(1, 'Gloss White', 'G10', '#FFFFFF', TRUE),           -- ขาว
(1, 'Gloss Black', 'G12', '#000000', TRUE),           -- ดำ
(2, 'Matte Black', 'M12', '#212121', TRUE),           -- ดำด้าน
(2, 'Matte Military Green', 'M206', '#2E7D32', TRUE), -- เขียวทหาร
(3, 'Satin Pearl White', 'SW900-100', '#F5F5F5', TRUE),
(3, 'Satin Chrome Blue', 'SW900-197', '#1976D2', TRUE);

-- 5.2 เพิ่มหมวดหมู่ฟิล์ม PPF (กันรอย)
INSERT IGNORE INTO PPFSeries (brand_name, series_name, material_type, thickness_mil, self_healing, hydrophobic, warranty_years, description) VALUES 
('Stek', 'DynoShield', 'TPU', 8.0, TRUE, TRUE, 10, 'Premium TPU film with 10-year warranty'),
('3M', 'Scotchgard Pro', 'TPU', 7.5, TRUE, TRUE, 7, 'Professional-grade protection film'),
('Suntek', 'Ultra', 'TPU', 8.5, TRUE, TRUE, 10, 'Ultra-thick protection with self-healing'),
('Local Brand', 'Budget Guard', 'TPH', 6.5, FALSE, FALSE, 3, 'Economical protection solution');

-- ตัวอย่างข้อมูลราคา (สมมติว่ามี car_model_id = 1 คือ Mini Cooper)
-- INSERT IGNORE INTO WrapServicePrices (car_model_id, series_id, full_wrap_price, roof_wrap_price, hood_wrap_price, estimated_days)
-- VALUES 
-- (1, 1, 35000.00, 8000.00, 6000.00, 3),  -- 3M Gloss
-- (1, 2, 38000.00, 9000.00, 6500.00, 3);  -- 3M Matte

-- INSERT IGNORE INTO PPFServicePrices (car_model_id, ppf_series_id, full_car_price, full_front_price, standard_front_price, bumper_price, estimated_days)
-- VALUES 
-- (1, 1, 85000.00, 35000.00, 25000.00, 8000.00, 3),  -- Stek DynoShield
-- (1, 2, 75000.00, 30000.00, 22000.00, 7000.00, 3);  -- 3M Scotchgard Pro

-- ==========================================================
-- สิ้นสุด Schema
-- ==========================================================
