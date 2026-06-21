# 🛡️ Role-Based Access Control (RBAC) Architecture

> **Executive Summary:** > This document outlines the Role-Based Access Control (RBAC) architecture designed for the Garage ERP system. It features a granular, resource-action-based permission model. To balance high performance with complex authorization rules, the system utilizes a hybrid approach: relational tables act as the Single Source of Truth for mapping permissions, while a JSON column on the Role table serves as a high-speed cache for middleware validation.

## 🧠 1. Design Decisions (แนวคิดการออกแบบ)

ในการออกแบบระบบจัดการสิทธิ์ของ Garage ERP เราเลือกใช้โครงสร้างแบบ **Granular Permissions** (แยกสิทธิ์ตาม Resource และ Action) แทนการ Hard-code บทบาท (Roles) เพื่อรองรับความยืดหยุ่นในอนาคต

* **Flexibility (ความยืดหยุ่น):** ผู้ดูแลระบบสามารถสร้าง Role ใหม่ๆ (เช่น "ช่างซ่อมอาวุโส" หรือ "พนักงานบัญชี") และปรับแต่งสิทธิ์แบบละเอียดได้ผ่าน UI โดยไม่ต้องแก้ไขโค้ด Backend
* **Performance vs. Normalization:** * ระบบใช้ตาราง `RolePermissions` เป็น **Single Source of Truth** เพื่อความถูกต้องของข้อมูล
  * ใช้คอลัมน์ `permissions_json` ในตาราง `Roles` เป็น **Cache** เพื่อให้ Middleware สามารถตรวจสอบสิทธิ์ได้ในระดับ O(1) Time Complexity โดยไม่ต้อง Query ตาราง Join หลายชั้นในทุกๆ HTTP Request

---

## 🗄️ 2. Database Schema

### 2.1 ตารางหลัก (Core Tables)

```sql
-- 1. ตารางเก็บสิทธิ์แบบละเอียด (CRUD per resource)
CREATE TABLE Permissions (
  permission_id INT PRIMARY KEY AUTO_INCREMENT,
  resource VARCHAR(50) NOT NULL,          -- เช่น 'products', 'cars', 'services'
  action VARCHAR(20) NOT NULL,            -- เช่น 'create', 'read', 'update', 'delete'
  description VARCHAR(255),
  UNIQUE KEY unique_permission (resource, action)
);

-- 2. ตารางเก็บกลุ่มสิทธิ์ (Roles) พร้อม Cache JSON
CREATE TABLE Roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL,  -- เช่น 'Admin', 'Manager', 'Staff'
  description VARCHAR(255),
  permissions_json JSON,                  -- ⚠️ Cache สำหรับ Middleware เพื่อลด Database Load
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางเชื่อม Role และ Permission (Source of Truth)
CREATE TABLE RolePermissions (
  role_permission_id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES Permissions(permission_id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
);

2.2 ตารางผู้ใช้งานและประวัติ (Users & Logs)

-- 4. ตารางกำหนด Role ให้ User (รองรับ 1 User มีหลาย Role ในอนาคต)
CREATE TABLE UserRoles (
  user_role_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,                   -- อ้างอิงตาราง Users หรือ Employees
  role_id INT NOT NULL,
  assigned_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (user_id, role_id)
);

-- 5. ตารางเก็บบันทึกการกระทำ (Audit / Activity Logs)
CREATE TABLE ActivityLogs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,          -- เช่น 'products.create'
  resource_id INT,                       -- ID ของข้อมูลที่ถูกกระทำ
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

3. API Endpoints

[
  {
    "role_id": 1,
    "role_name": "Manager",
    "description": "จัดการข้อมูลและดูรายงาน",
    "permissions_json": {
      "products": ["read", "update"],
      "orders": ["read", "update"]
    }
  }
]

3. API Endpoints

[
  {
    "role_id": 1,
    "role_name": "Manager",
    "description": "จัดการข้อมูลและดูรายงาน",
    "permissions_json": {
      "products": ["read", "update"],
      "orders": ["read", "update"]
    }
  }
]

{
  "permission_ids": [1, 2, 3, 5, 7]
}

4. Middleware Implementation (Node.js)

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // ดึงสิทธิ์ระดับ JSON Cache มาจากข้อมูล User ที่แนบมากับ Token
      const userPermissions = req.user.permissions_json; 
      
      // ตรวจสอบว่ามี Resource และ Action ที่ต้องการหรือไม่
      const hasPermission = 
        userPermissions[resource] && 
        userPermissions[resource].includes(action);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          success: false,
          message: `Forbidden: ต้องการสิทธิ์ '${resource}.${action}' เพื่อดำเนินการนี้` 
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  };
};

module.exports = { checkPermission };

ตัวอย่างการเรียกใช้งานใน Routes

// หมายเหตุ: checkPermission อยู่รวมใน middleware/auth.js (ไฟล์ checkPermission.js แยกถูกลบแล้ว — เป็น dead code)
const { verifyToken, checkPermission } = require('../../middleware/auth');

// ฟังก์ชันเพิ่มข้อมูลรถ: ต้องมีสิทธิ์ 'cars' -> 'create'
router.post(
  '/cars', 
  verifyToken, 
  checkPermission('cars', 'create'), 
  carsController.createModel
);

// ฟังก์ชันลบข้อมูลรถ: ต้องมีสิทธิ์ 'cars' -> 'delete'
router.delete(
  '/cars/:id', 
  verifyToken, 
  checkPermission('cars', 'delete'), 
  carsController.deleteModel
);

---

## 5. Route Auth Coverage — สถานะจริง (อัปเดต 2026-06-21)

มี middleware 2 แบบใน `middleware/auth.js`:
- **`checkRole([...])`** — เช็คแค่ role claim ใน JWT (ไม่ query DB) เหมาะกับ content/CMS
- **`checkPermission(resource, action)`** — เช็คสิทธิ์ละเอียดจาก DB เหมาะกับ ERP core

### Modules ที่ใช้ `verifyToken + checkRole(['HighestAdmin','Admin','Manager'])` บน write
ใส่ที่ POST/PUT/PATCH/DELETE ทั้งหมด ส่วน GET ยัง **public** (ยกเว้น contact ที่ GET ก็ต้อง auth เพราะเป็น PII):
`faq`, `blog`, `contact`, `dealers`, `stickers/cars`, `stickers/colors`, `products/product-car-model`

> ก่อนหน้านี้ route เหล่านี้เปิดโล่ง (comment `// Temporary routes without auth for development`) — ปิดช่องโหว่แล้ว

### Modules ที่ใช้ `checkPermission` (ละเอียด)
`inventory`, `services`, `vehicles`, `sales`, `portfolio`, `carWrap`, `system`, `auth` (จัดการ role/permission/user)

### ⚠️ ข้อกำหนดฝั่ง Frontend
หน้า admin ต้องแนบ `Authorization: Bearer <token>` โดย token เก็บที่ `localStorage.adminToken` (ตั้งตอน login ใน `LoginModal`) — JWT payload มี `role = role.role_name` ดังนั้น **role ใน DB ต้องเป็นหนึ่งใน** `HighestAdmin` / `Admin` / `Manager` ไม่งั้นโดน 403 (ถ้าใช้ชื่อ role อื่น ต้องแก้ array ใน `checkRole([...])`)

### หมายเหตุ rate limiting
`/auth/login` และ `/auth/register` มี `express-rate-limit` (10 ครั้ง/15 นาที/IP) — ตั้ง `app.set('trust proxy', 1)` ใน `app.js` แล้วเพื่อให้ `req.ip` ถูกต้องหลัง nginx