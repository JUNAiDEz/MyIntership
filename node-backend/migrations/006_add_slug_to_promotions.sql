-- เพิ่มคอลัมน์ slug ให้ Promotions
ALTER TABLE Promotions
ADD COLUMN slug VARCHAR(255) UNIQUE AFTER promotion_name;
