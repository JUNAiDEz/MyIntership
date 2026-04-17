-- เพิ่ม role_id column ให้ตาราง Employees

ALTER TABLE Employees 
ADD COLUMN role_id INT NULL,
ADD CONSTRAINT fk_employees_role 
  FOREIGN KEY (role_id) 
  REFERENCES Roles(role_id) 
  ON DELETE SET NULL;

-- อัพเดต role_id ให้กับ Employees ที่มีอยู่แล้ว (ดึงจาก Users table)
UPDATE Employees e
JOIN Users u ON e.user_id = u.user_id
SET e.role_id = u.role_id
WHERE e.user_id IS NOT NULL;

-- เพิ่ม Index เพื่อเพิ่มประสิทธิภาพในการ query
CREATE INDEX idx_employees_role_id ON Employees(role_id);

-- ตรวจสอบผลลัพธ์
SELECT 
  e.employee_id,
  e.first_name,
  e.last_name,
  e.position,
  e.role_id,
  r.role_name,
  u.username
FROM Employees e
LEFT JOIN Roles r ON e.role_id = r.role_id
LEFT JOIN Users u ON e.user_id = u.user_id
ORDER BY e.employee_id DESC
LIMIT 10;
