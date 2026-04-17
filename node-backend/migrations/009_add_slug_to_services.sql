// Migration: add_slug_to_services.sql
// เพิ่มคอลัมน์ slug ให้กับตาราง Services

ALTER TABLE "Services"
ADD COLUMN slug VARCHAR(150) UNIQUE;
