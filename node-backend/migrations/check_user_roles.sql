-- ตรวจสอบ Role ในฐานข้อมูล
SELECT role_id, role_name, description FROM Roles;

-- ตรวจสอบ User พร้อม Role
SELECT 
    u.user_id, 
    u.username, 
    u.role_id,
    r.role_name
FROM Users u
LEFT JOIN Roles r ON u.role_id = r.role_id
ORDER BY u.user_id DESC
LIMIT 10;

-- อัพเดต User ให้เป็น HighestAdmin (เปลี่ยน username ให้ตรง)
-- UPDATE Users 
-- SET role_id = (SELECT role_id FROM Roles WHERE role_name = 'HighestAdmin')
-- WHERE username = 'your_username_here';
