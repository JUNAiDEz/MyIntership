-- สร้างตาราง UserPermissions สำหรับกำหนดสิทธิ์เฉพาะบุคคล
-- รันคำสั่งนี้ใน MySQL Database

CREATE TABLE IF NOT EXISTS UserPermissions (
  user_permission_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  permission_id INT NOT NULL,
  UNIQUE KEY unique_user_permission (user_id, permission_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES Permissions(permission_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตรวจสอบตาราง
SELECT * FROM UserPermissions LIMIT 10;
