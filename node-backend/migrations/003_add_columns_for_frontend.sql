-- ==========================================================
-- Migration: เพิ่ม Columns สำหรับ Frontend Features
-- ==========================================================
-- วันที่: 2024-12-04
-- วัตถุประสงค์: เพิ่มรูปภาพรถ, Note ราคา, และ Category Code

USE gt7_info;

-- ==========================================================
-- 1. เพิ่มรูปภาพให้กับตารางรุ่นรถ (CarModels)
-- ==========================================================
-- เพราะใน React เรามีรูป Vios, Camry, Revo ฯลฯ โชว์ใน Catalog
ALTER TABLE CarModels 
ADD COLUMN image_url VARCHAR(255) DEFAULT NULL
COMMENT 'URL รูปภาพรุ่นรถ สำหรับแสดงใน Frontend Catalog';

-- ==========================================================
-- 2. ปรับปรุงตารางราคาบริการ (ServicePricing)
-- ==========================================================
-- เพิ่ม Note (เช่น "แถมอบโอโซนฟรี") และแยกประเภทราคาถ้าจำเป็น
ALTER TABLE ServicePricing 
ADD COLUMN note TEXT DEFAULT NULL
COMMENT 'ข้อความหมายเหตุ เช่น "แถมอบโอโซนฟรี", "รวมอะไหล่"',
ADD COLUMN is_active BOOLEAN DEFAULT TRUE
COMMENT 'เปิด/ปิดราคาบางรุ่นชั่วคราว';

-- ==========================================================
-- 3. เพิ่ม Slug/Code ให้ Service Categories
-- ==========================================================
-- เพื่อให้เรียกใช้ง่ายใน Code เช่น 'AIR_CON' แทนที่จะจำ ID=5
ALTER TABLE ServiceCategories
ADD COLUMN category_code VARCHAR(50) UNIQUE
COMMENT 'Code สำหรับเรียกใช้ใน Code เช่น AIR_CON, NANO_CERAMIC';

-- ==========================================================
-- อัพเดตข้อมูล Service Categories ที่มีอยู่แล้ว
-- ==========================================================
-- กำหนด category_code ให้กับหมวดหมู่ที่มีอยู่แล้ว
UPDATE ServiceCategories SET category_code = 'PRODUCT' WHERE category_id = 1;
UPDATE ServiceCategories SET category_code = 'FITMENT' WHERE category_id = 2;
UPDATE ServiceCategories SET category_code = 'UPGRADE' WHERE category_id = 3;

-- ==========================================================
-- ตัวอย่างการใส่รูปภาพรถ (Optional)
-- ==========================================================
-- UPDATE CarModels SET image_url = '/images/cars/vios.webp' WHERE model_name = 'Vios';
-- UPDATE CarModels SET image_url = '/images/cars/camry.webp' WHERE model_name = 'Camry';
-- UPDATE CarModels SET image_url = '/images/cars/fortuner.webp' WHERE model_name = 'Fortuner';

-- ==========================================================
-- ตัวอย่างการใส่ Note ในราคาบริการ (Optional)
-- ==========================================================
-- UPDATE ServicePricing 
-- SET note = 'แถมอบโอโซนฟรี' 
-- WHERE service_id = 1 AND car_model_id IN (1, 2, 3);

-- ==========================================================
-- จบ Migration
-- ==========================================================
