# คู่มือติดตั้งระบบ User Permissions

## 1. สร้างตาราง UserPermissions ในฐานข้อมูล

เลือกวิธีใดวิธีหนึ่ง:

### วิธีที่ 1: ใช้ SQL โดยตรง (แนะนำ)
เปิด MySQL Client หรือ phpMyAdmin แล้วรันคำสั่ง:

```sql
CREATE TABLE IF NOT EXISTS UserPermissions (
  user_permission_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  permission_id INT NOT NULL,
  UNIQUE KEY unique_user_permission (user_id, permission_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES Permissions(permission_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### วิธีที่ 2: ใช้ Node.js Migration Script
```bash
cd node-backend
node migrations/run_user_permissions_migration.js
```

## 2. ตรวจสอบว่าสร้างตารางสำเร็จ

```sql
SHOW TABLES LIKE 'UserPermissions';
DESCRIBE UserPermissions;
SELECT * FROM UserPermissions;
```

## 3. Restart Backend Server

```bash
cd node-backend
npm start
```

## 4. ทดสอบ API Endpoints

### ดึงสิทธิ์ของผู้ใช้
```
GET /api/auth/users/:userId/permissions
```

### กำหนดสิทธิ์ให้ผู้ใช้
```
POST /api/auth/users/:userId/permissions
Body: {
  "permission_ids": [1, 2, 3, 4]
}
```

### เพิ่มสิทธิ์เดียว
```
POST /api/auth/users/:userId/permissions/add
Body: {
  "permission_id": 5
}
```

### ลบสิทธิ์เดียว
```
DELETE /api/auth/users/:userId/permissions/:permissionId
```

### ลบสิทธิ์ทั้งหมด
```
DELETE /api/auth/users/:userId/permissions
```

## 5. ใช้งานในหน้า Frontend

1. เข้าหน้า Dashboard > จัดการผู้ใช้งานและสิทธิ์
2. คลิกแท็บ "กำหนดสิทธิ์รายบุคคล"
3. เลือกผู้ใช้จากรายการด้านซ้าย
4. กดปุ่ม "แก้ไขสิทธิ์"
5. เลือก/ยกเลิก Permissions ที่ต้องการ
6. กดบันทึก

## โครงสร้าง Files ที่สร้าง

```
node-backend/
├── src/
│   ├── models/
│   │   ├── userPermission.model.js (NEW)
│   │   └── index.js (UPDATED - เพิ่ม associations)
│   └── modules/
│       └── auth/
│           ├── userPermissions.controller.js (NEW)
│           └── auth.routes.js (UPDATED - เพิ่ม routes)
└── migrations/
    ├── create_user_permissions_table.sql (NEW)
    └── run_user_permissions_migration.js (NEW)

my-react-app/
└── src/
    └── pages/
        └── Dashboard/
            └── UserManagementPage.jsx (UPDATED - เพิ่มแท็บใหม่)
```

## การทำงานของระบบ

1. **Role Permissions** - สิทธิ์ตาม Role (Admin, Manager, Staff)
2. **User Permissions** - สิทธิ์เฉพาะบุคคล (ทับสิทธิ์จาก Role)

ตัวอย่าง:
- Admin1 (Role: Admin) + User Permissions: services.* → จัดการบริการได้อย่างเดียว
- Admin2 (Role: Admin) + User Permissions: products.* → จัดการสินค้าได้อย่างเดียว
- Admin3 (Role: Admin) + ไม่มี User Permissions → ใช้สิทธิ์จาก Role Admin ทั้งหมด

## สิทธิ์ที่มีในระบบ (หลังจาก Seed)

- products: create, read, update, delete
- cars: create, read, update, delete
- services: create, read, update, delete
- orders: create, read, update, delete
- customers: create, read, update, delete
- users: create, read, update, delete
- reports: read, export
- settings: read, update

---

ถ้ามีปัญหาติดต่อ: เช็ค Console logs หรือ Network tab ใน Browser
