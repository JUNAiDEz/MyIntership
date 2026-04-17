# Role-Based Access Control (RBAC) Database Design

## 📋 ตารางที่ต้องสร้างเพิ่ม

### 1. **Roles** (บทบาท)
เก็บบทบาทต่างๆ ของผู้ใช้

```sql
CREATE TABLE Roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL,  -- 'Admin', 'Manager', 'Staff', 'Viewer'
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ข้อมูลเริ่มต้น
INSERT INTO Roles (role_name, description) VALUES
('SuperAdmin', 'สิทธิ์เต็ม ทุกอย่าง'),
('Admin', 'จัดการระบบทั่วไป'),
('Manager', 'จัดการข้อมูลและดูรายงาน'),
('Staff', 'เพิ่ม/แก้ไขข้อมูลพื้นฐาน'),
('Viewer', 'ดูข้อมูลอย่างเดียว');
```

---

### 2. **Permissions** (สิทธิ์การใช้งาน)
เก็บสิทธิ์แบบละเอียด (CRUD per resource)

```sql
CREATE TABLE Permissions (
  permission_id INT PRIMARY KEY AUTO_INCREMENT,
  resource VARCHAR(50) NOT NULL,          -- 'products', 'cars', 'services', 'orders'
  action VARCHAR(20) NOT NULL,            -- 'create', 'read', 'update', 'delete'
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_permission (resource, action)
);

-- ตัวอย่างข้อมูล
INSERT INTO Permissions (resource, action, description) VALUES
-- Products
('products', 'create', 'เพิ่มสินค้าใหม่'),
('products', 'read', 'ดูข้อมูลสินค้า'),
('products', 'update', 'แก้ไขข้อมูลสินค้า'),
('products', 'delete', 'ลบสินค้า'),

-- Cars
('cars', 'create', 'เพิ่มรุ่นรถใหม่'),
('cars', 'read', 'ดูข้อมูลรถ'),
('cars', 'update', 'แก้ไขข้อมูลรถ'),
('cars', 'delete', 'ลบรุ่นรถ'),

-- Services
('services', 'create', 'เพิ่มบริการใหม่'),
('services', 'read', 'ดูข้อมูลบริการ'),
('services', 'update', 'แก้ไขบริการ'),
('services', 'delete', 'ลบบริการ'),

-- Orders
('orders', 'create', 'สร้างออเดอร์'),
('orders', 'read', 'ดูออเดอร์'),
('orders', 'update', 'แก้ไขสถานะออเดอร์'),
('orders', 'delete', 'ยกเลิกออเดอร์'),

-- Customers
('customers', 'create', 'เพิ่มลูกค้า'),
('customers', 'read', 'ดูข้อมูลลูกค้า'),
('customers', 'update', 'แก้ไขข้อมูลลูกค้า'),
('customers', 'delete', 'ลบข้อมูลลูกค้า'),

-- Users (Admin Management)
('users', 'create', 'เพิ่มผู้ใช้ใหม่'),
('users', 'read', 'ดูรายการผู้ใช้'),
('users', 'update', 'แก้ไขข้อมูลผู้ใช้'),
('users', 'delete', 'ลบผู้ใช้'),

-- Reports
('reports', 'read', 'ดูรายงาน'),
('reports', 'export', 'ส่งออกรายงาน'),

-- Settings
('settings', 'read', 'ดูการตั้งค่า'),
('settings', 'update', 'แก้ไขการตั้งค่าระบบ');
```

---

### 3. **RolePermissions** (ความสัมพันธ์ระหว่าง Role กับ Permission)
กำหนดว่าแต่ละ Role มีสิทธิ์อะไรบ้าง

```sql
CREATE TABLE RolePermissions (
  role_permission_id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES Permissions(permission_id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- ตัวอย่าง: กำหนดสิทธิ์ให้ Admin (role_id = 2)
INSERT INTO RolePermissions (role_id, permission_id) 
SELECT 2, permission_id FROM Permissions 
WHERE resource IN ('products', 'cars', 'services', 'customers', 'orders');

-- Manager (role_id = 3): ดู + แก้ไข
INSERT INTO RolePermissions (role_id, permission_id) 
SELECT 3, permission_id FROM Permissions 
WHERE action IN ('read', 'update');

-- Viewer (role_id = 5): ดูอย่างเดียว
INSERT INTO RolePermissions (role_id, permission_id) 
SELECT 5, permission_id FROM Permissions 
WHERE action = 'read';
```

---

### 4. **UserRoles** (กำหนด Role ให้ User แต่ละคน)
User คนเดียวสามารถมีหลาย Role ได้

```sql
CREATE TABLE UserRoles (
  user_role_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_by INT,                        -- Admin คนไหนมอบหมาย
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Admins(admin_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES Admins(admin_id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_role (user_id, role_id)
);

-- ตัวอย่าง: มอบ Role Admin ให้ user_id = 1
INSERT INTO UserRoles (user_id, role_id, assigned_by) VALUES (1, 2, 1);
```

---

### 5. **ActivityLogs** (บันทึกการใช้งาน) - Optional แต่แนะนำ
ติดตามว่าใครทำอะไรเมื่อไหร่

```sql
CREATE TABLE ActivityLogs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,          -- 'products.create', 'cars.delete'
  resource_type VARCHAR(50),             -- 'products', 'cars'
  resource_id INT,                       -- ID ของข้อมูลที่ถูกกระทำ
  description TEXT,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Admins(admin_id) ON DELETE SET NULL,
  INDEX idx_user_action (user_id, action),
  INDEX idx_created_at (created_at)
);
```

---

## 🔧 แก้ไขตาราง Admins ที่มีอยู่

เพิ่มคอลัมน์ `is_active` และ `last_login`:

```sql
ALTER TABLE Admins 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN last_login TIMESTAMP NULL,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

---

## 📊 ER Diagram (ความสัมพันธ์)

```
Admins (Users)
    ↓ (1:N)
UserRoles
    ↓ (N:1)
Roles ←→ RolePermissions (N:M) ←→ Permissions
```

---

## 🎯 ตัวอย่างการใช้งาน

### ตรวจสอบสิทธิ์ใน Backend Middleware

```javascript
// middleware/checkPermission.js
const db = require('../models');

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // ดึง Permissions ของ User
      const permissions = await db.sequelize.query(`
        SELECT p.resource, p.action 
        FROM Permissions p
        JOIN RolePermissions rp ON p.permission_id = rp.permission_id
        JOIN UserRoles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = :userId
      `, {
        replacements: { userId },
        type: db.sequelize.QueryTypes.SELECT
      });
      
      // ตรวจสอบว่ามีสิทธิ์หรือไม่
      const hasPermission = permissions.some(
        p => p.resource === resource && p.action === action
      );
      
      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้' 
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = checkPermission;
```

### ใช้งานใน Routes

```javascript
const checkPermission = require('../middleware/checkPermission');

// เฉพาะคนที่มีสิทธิ์ 'products.create' เท่านั้นที่เพิ่มสินค้าได้
router.post('/products', 
  verifyToken, 
  checkPermission('products', 'create'), 
  productsController.createProduct
);

// เฉพาะคนที่มีสิทธิ์ 'cars.delete' เท่านั้นที่ลบรถได้
router.delete('/cars/:id', 
  verifyToken, 
  checkPermission('cars', 'delete'), 
  carsController.deleteModel
);
```

---

## 🚀 ข้อดีของการออกแบบแบบนี้

✅ **ยืดหยุ่น**: เพิ่ม Role / Permission ใหม่ได้ตลอด  
✅ **ละเอียด**: ควบคุมสิทธิ์แบบ Resource-level (CRUD per table)  
✅ **ปลอดภัย**: User ทำได้เฉพาะสิ่งที่ได้รับอนุญาต  
✅ **ตรวจสอบได้**: บันทึก Log ทุกการกระทำ  
✅ **Scalable**: รองรับการเติบโตของระบบ  

---

## 📝 สรุป

| ตาราง | จุดประสงค์ |
|-------|-----------|
| **Roles** | บทบาท (Admin, Manager, Staff) |
| **Permissions** | สิทธิ์แบบละเอียด (products.create, cars.delete) |
| **RolePermissions** | กำหนดว่า Role ไหนมีสิทธิ์อะไรบ้าง |
| **UserRoles** | กำหนด Role ให้ User แต่ละคน |
| **ActivityLogs** | บันทึกการใช้งาน (Optional) |

**ถ้าไม่อยากซับซ้อนมาก:**  
ใช้แค่ `Roles` + `UserRoles` + เก็บ permissions เป็น JSON ใน Roles ก็ได้ แต่จะไม่ยืดหยุ่นเท่า
