-- ==========================================================
-- ตัวอย่างการใช้งาน Columns ใหม่
-- ==========================================================

USE gt7_info;

-- ==========================================================
-- 1. เพิ่มรูปภาพให้กับรุ่นรถ
-- ==========================================================

-- Toyota
UPDATE CarModels SET image_url = '/images/cars/vios.webp' WHERE model_name = 'Vios';
UPDATE CarModels SET image_url = '/images/cars/camry.webp' WHERE model_name = 'Camry';
UPDATE CarModels SET image_url = '/images/cars/fortuner.webp' WHERE model_name = 'Fortuner';

-- Honda
UPDATE CarModels SET image_url = '/images/cars/civic.webp' WHERE model_name = 'Civic';
UPDATE CarModels SET image_url = '/images/cars/crv.webp' WHERE model_name = 'CR-V';

-- Mazda
UPDATE CarModels SET image_url = '/images/cars/cx5.webp' WHERE model_name = 'CX-5';

-- BMW
UPDATE CarModels SET image_url = '/images/cars/bmw-320i.webp' WHERE model_name = '320i';

-- Mercedes
UPDATE CarModels SET image_url = '/images/cars/c-class.webp' WHERE model_name = 'C-Class';

-- ==========================================================
-- 2. เพิ่ม Note สำหรับราคาบริการ
-- ==========================================================

-- บริการซ่อมแอร์ (service_id = 1)
-- แถมอบโอโซนฟรี สำหรับรถเก๋งขนาด S-M
UPDATE ServicePricing 
SET note = 'แถมอบโอโซนฟรี' 
WHERE service_id = 1 AND car_model_id IN (1, 2); -- Camry, Vios

-- แถมอบโอโซนฟรี + ตรวจสอบระบบฟรี สำหรับรถ SUV
UPDATE ServicePricing 
SET note = 'แถมอบโอโซนฟรี + ตรวจสอบระบบฟรี' 
WHERE service_id = 1 AND car_model_id = 3; -- Fortuner

-- บริการฟิล์ม Nano Ceramic (service_id = 2)
-- รวมฟิล์มกระจกข้างแล้ว
UPDATE ServicePricing 
SET note = 'รวมฟิล์มกระจกข้าง 4 บาน' 
WHERE service_id = 2;

-- บริการตั้งศูนย์ล้อ (service_id = 4)
-- รวมถ่วงล้อฟรี
UPDATE ServicePricing 
SET note = 'รวมถ่วงล้อฟรี' 
WHERE service_id = 4;

-- บริการ Remap ECU (service_id = 6)
-- รับประกัน 1 ปี
UPDATE ServicePricing 
SET note = 'รับประกัน 1 ปี, เพิ่มแรงม้าประมาณ 15-20%' 
WHERE service_id = 6;

-- ==========================================================
-- 3. กำหนด Category Code ให้กับหมวดหมู่บริการ
-- ==========================================================

-- หมวดหมู่หลัก
UPDATE ServiceCategories SET category_code = 'PRODUCT' WHERE category_id = 1 AND category_code IS NULL;
UPDATE ServiceCategories SET category_code = 'FITMENT' WHERE category_id = 2 AND category_code IS NULL;
UPDATE ServiceCategories SET category_code = 'UPGRADE' WHERE category_id = 3 AND category_code IS NULL;

-- ==========================================================
-- 4. ตัวอย่างการ Query ข้อมูลใหม่
-- ==========================================================

-- ดึงรายการรถพร้อมรูปภาพ
SELECT 
    cm.car_model_id,
    cb.brand_name,
    cm.model_name,
    cm.model_year,
    cm.car_size,
    cm.image_url
FROM CarModels cm
JOIN CarBrands cb ON cm.brand_id = cb.brand_id
WHERE cm.image_url IS NOT NULL
ORDER BY cb.brand_name, cm.model_name;

-- ดึงราคาบริการพร้อม Note
SELECT 
    s.service_name,
    cm.model_name AS car_model,
    sp.price,
    sp.note,
    sp.is_active
FROM ServicePricing sp
JOIN Services s ON sp.service_id = s.service_id
JOIN CarModels cm ON sp.car_model_id = cm.car_model_id
WHERE sp.is_active = TRUE
ORDER BY s.service_name, cm.model_name;

-- ดึงหมวดหมู่บริการพร้อม Code
SELECT 
    category_id,
    category_name,
    category_code,
    parent_category_id
FROM ServiceCategories
WHERE category_code IS NOT NULL
ORDER BY category_id;

-- ==========================================================
-- 5. ตัวอย่างการสร้างบริการใหม่พร้อมราคาและ Note
-- ==========================================================

-- สมมติว่าเพิ่มบริการ "ล้างแอร์" (service_id = 8)
INSERT INTO Services (service_name, description, category_id, base_labor_cost, is_active)
VALUES ('ล้างแอร์ Deep Clean', 'ล้างแอร์ทำความสะอาดระบบทั้งหมด', 1, 1500, TRUE);

-- กำหนดราคาตามรุ่นรถ พร้อม Note
SET @new_service_id = LAST_INSERT_ID();

INSERT INTO ServicePricing (service_id, car_model_id, price, note, is_active)
VALUES 
(@new_service_id, 1, 1800, 'แถมน้ำยาปรับอากาศฟรี', TRUE),  -- Camry
(@new_service_id, 2, 1500, 'แถมน้ำยาปรับอากาศฟรี', TRUE),  -- Vios
(@new_service_id, 3, 2200, 'แถมน้ำยาปรับอากาศฟรี + ตรวจสอบระบบ', TRUE); -- Fortuner

-- ==========================================================
-- 6. ตัวอย่างการปิดราคาบางรุ่นชั่วคราว
-- ==========================================================

-- ปิดราคาบริการแอร์สำหรับ BMW ชั่วคราว (ไม่มีอะไหล่)
UPDATE ServicePricing 
SET is_active = FALSE 
WHERE service_id = 1 AND car_model_id = 7; -- BMW 320i

-- ==========================================================
-- จบไฟล์ตัวอย่าง
-- ==========================================================
