-- แก้ไข column car_size ให้เก็บค่า VARCHAR แทน ENUM
-- Migration: Fix CarModels.car_size to allow full type names

-- ถ้าเป็น ENUM ให้แปลงเป็น VARCHAR
ALTER TABLE `CarModels` 
MODIFY COLUMN `car_size` VARCHAR(50) NULL DEFAULT 'Sedan';

-- อัพเดทข้อมูลเก่าที่เป็น S, M, L ให้เป็นชื่อเต็ม
UPDATE `CarModels` SET `car_size` = 'Sedan' WHERE `car_size` IN ('S', 'Small');
UPDATE `CarModels` SET `car_size` = 'SUV' WHERE `car_size` IN ('M', 'Medium');
UPDATE `CarModels` SET `car_size` = 'Truck' WHERE `car_size` IN ('L', 'Large');

-- หรือถ้าต้องการใช้ ENUM ที่มีค่าครบทุกประเภท ให้ใช้คำสั่งนี้แทน:
-- ALTER TABLE `CarModels` 
-- MODIFY COLUMN `car_size` ENUM('Sedan', 'Hatchback', 'Coupe', 'Convertible', 'Station Wagon', 'Van', 'Sport Car', 'SUV', 'Truck') DEFAULT 'Sedan';

-- แสดงผลลัพธ์
SELECT car_model_id, model_name, car_size FROM `CarModels` ORDER BY car_model_id;
