# Permission System - API Documentation

## 📚 ตารางที่เพิ่มเข้ามา

### 1. Permissions
เก็บสิทธิ์แบบละเอียด (CRUD per resource)

```sql
CREATE TABLE Permissions (
  permission_id INT PRIMARY KEY AUTO_INCREMENT,
  resource VARCHAR(50) NOT NULL,       -- 'products', 'cars', 'services'
  action VARCHAR(20) NOT NULL,         -- 'create', 'read', 'update', 'delete'
  description VARCHAR(255),
  UNIQUE KEY (resource, action)
);
```

### 2. RolePermissions
เชื่อม Roles กับ Permissions (Many-to-Many)

```sql
CREATE TABLE RolePermissions (
  role_permission_id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES Permissions(permission_id) ON DELETE CASCADE,
  UNIQUE KEY (role_id, permission_id)
);
```

### 3. Roles (แก้ไข)
เพิ่ม columns: `permissions` (JSON), `description`

```sql
ALTER TABLE Roles 
ADD COLUMN permissions JSON,
ADD COLUMN description VARCHAR(255);
```

---

## 🔌 API Endpoints

### Permissions Management

#### 1. ดึง Permissions ทั้งหมด
```http
GET /api/auth/permissions
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "permission_id": 1,
      "resource": "products",
      "action": "create",
      "description": "เพิ่มสินค้าใหม่"
    },
    {
      "permission_id": 2,
      "resource": "products",
      "action": "read",
      "description": "ดูข้อมูลสินค้า"
    }
  ]
}
```

#### 2. สร้าง Permission ใหม่
```http
POST /api/auth/permissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "resource": "blog",
  "action": "create",
  "description": "เพิ่มบทความใหม่"
}
```

#### 3. เพิ่ม Permissions เริ่มต้น (Seed)
```http
POST /api/auth/permissions/seed
Authorization: Bearer {token}
```

เพิ่ม 30+ permissions พื้นฐาน (products, cars, services, orders, customers, users, reports, settings)

---

### Roles Management

#### 4. ดึง Roles ทั้งหมด
```http
GET /api/auth/roles
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "role_id": 1,
    "role_name": "Admin",
    "description": "สิทธิ์เต็มทุกฟังก์ชัน",
    "permissions": {
      "products": ["create", "read", "update", "delete"],
      "cars": ["create", "read", "update", "delete"],
      "services": ["create", "read", "update", "delete"]
    }
  },
  {
    "role_id": 2,
    "role_name": "Manager",
    "description": "จัดการข้อมูลและดูรายงาน",
    "permissions": {
      "products": ["read", "update"],
      "orders": ["read", "update"]
    }
  }
]
```

#### 5. ดึง Role พร้อม Permissions (แบบละเอียด)
```http
GET /api/auth/roles/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "role_id": 1,
  "role_name": "Admin",
  "description": "สิทธิ์เต็ม",
  "permissions": { "products": ["create","read","update","delete"] },
  "permissionsList": [
    { "permission_id": 1, "resource": "products", "action": "create" },
    { "permission_id": 2, "resource": "products", "action": "read" }
  ]
}
```

#### 6. สร้าง Role ใหม่
```http
POST /api/auth/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_name": "Viewer",
  "description": "ดูข้อมูลอย่างเดียว",
  "permissions": {
    "products": ["read"],
    "cars": ["read"],
    "services": ["read"]
  }
}
```

#### 7. อัพเดต Role
```http
PUT /api/auth/roles/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_name": "Super Admin",
  "description": "สิทธิ์เต็มทุกอย่าง",
  "permissions": {
    "products": ["create","read","update","delete"],
    "users": ["create","read","update","delete"]
  }
}
```

---

### Role Permissions (แบบ Table - ละเอียดกว่า)

#### 8. ดึง Permissions ของ Role
```http
GET /api/auth/roles/1/permissions
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "role_id": 1,
    "role_name": "Admin",
    "description": "สิทธิ์เต็ม",
    "permissions_json": { "products": ["create","read"] },
    "permissions_table": [
      { "permission_id": 1, "resource": "products", "action": "create" },
      { "permission_id": 2, "resource": "products", "action": "read" }
    ]
  }
}
```

#### 9. กำหนด Permissions ให้ Role (แบบ Table)
```http
POST /api/auth/roles/1/permissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "permission_ids": [1, 2, 3, 5, 7, 9]
}
```

ระบบจะ:
1. ลบ Permissions เก่าทั้งหมดของ Role
2. เพิ่ม Permissions ใหม่ตาม IDs ที่ส่งมา

#### 10. อัพเดต Permissions (แบบ JSON)
```http
PUT /api/auth/roles/1/permissions-json
Authorization: Bearer {token}
Content-Type: application/json

{
  "permissions": {
    "products": ["create", "read", "update"],
    "cars": ["read"],
    "orders": ["read", "update"]
  },
  "description": "จัดการสินค้าและออเดอร์"
}
```

---

## 🛡️ การใช้งาน Middleware

### ตัวอย่าง 1: ตรวจสอบสิทธิ์แบบเดี่ยว

```javascript
const { verifyToken } = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/checkPermission');

// เฉพาะคนที่มีสิทธิ์ 'products.create' เท่านั้น
router.post('/products', 
  verifyToken, 
  checkPermission('products', 'create'), 
  productsController.createProduct
);

// เฉพาะคนที่มีสิทธิ์ 'cars.delete' เท่านั้น
router.delete('/cars/:id', 
  verifyToken, 
  checkPermission('cars', 'delete'), 
  carsController.deleteModel
);
```

### ตัวอย่าง 2: ตรวจสอบสิทธิ์แบบหลายตัวเลือก

```javascript
const { checkAnyPermission } = require('../../middleware/checkPermission');

// มีสิทธิ์อย่างใดอย่างหนึ่งก็ผ่าน
router.get('/reports', 
  verifyToken, 
  checkAnyPermission([
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'export' }
  ]), 
  reportsController.getReports
);
```

---

## 📊 ตัวอย่าง Permissions JSON

### Admin (สิทธิ์เต็ม)
```json
{
  "products": ["create", "read", "update", "delete"],
  "cars": ["create", "read", "update", "delete"],
  "services": ["create", "read", "update", "delete"],
  "orders": ["create", "read", "update", "delete"],
  "customers": ["create", "read", "update", "delete"],
  "users": ["create", "read", "update", "delete"],
  "reports": ["read", "export"],
  "settings": ["read", "update"]
}
```

### Manager (จัดการ + ดูรายงาน)
```json
{
  "products": ["read", "update"],
  "cars": ["read", "update"],
  "services": ["read", "update"],
  "orders": ["read", "update"],
  "customers": ["read", "update"],
  "reports": ["read"]
}
```

### Staff (พนักงานทั่วไป)
```json
{
  "products": ["read"],
  "orders": ["create", "read", "update"],
  "customers": ["create", "read", "update"]
}
```

### Viewer (ดูอย่างเดียว)
```json
{
  "products": ["read"],
  "cars": ["read"],
  "services": ["read"],
  "orders": ["read"]
}
```

---

## 🚀 ขั้นตอนการ Setup

### 1. Run SQL
```sql
-- สร้างตาราง
CREATE TABLE Permissions (...);
CREATE TABLE RolePermissions (...);

-- แก้ไขตาราง Roles
ALTER TABLE Roles 
ADD COLUMN permissions JSON,
ADD COLUMN description VARCHAR(255);
```

### 2. เพิ่ม Permissions เริ่มต้น
```bash
POST /api/auth/permissions/seed
```

### 3. อัพเดต Permissions ให้ Role ที่มีอยู่
```sql
-- แบบ JSON (ง่ายกว่า)
UPDATE Roles SET 
  permissions = '{"products": ["create","read","update","delete"], "cars": ["create","read","update","delete"]}',
  description = 'สิทธิ์เต็ม'
WHERE role_name = 'Admin';

-- หรือใช้ API
PUT /api/auth/roles/1/permissions-json
{
  "permissions": { "products": ["create","read","update","delete"] },
  "description": "สิทธิ์เต็ม"
}
```

### 4. ใช้ Middleware ในการป้องกัน Routes
```javascript
const { checkPermission } = require('../middleware/checkPermission');

router.post('/products', verifyToken, checkPermission('products', 'create'), ...);
```

---

## 🔍 ตรวจสอบ Permissions

Middleware จะตรวจสอบจาก **2 แหล่ง**:

1. **JSON Column** (`roles.permissions`) - เร็วกว่า, เหมาะกับระบบขนาดกลาง
2. **RolePermissions Table** - ละเอียดกว่า, query ได้ยืดหยุ่นกว่า

ถ้ามีสิทธิ์จากแหล่งใดแหล่งหนึ่ง → ✅ ผ่าน  
ถ้าไม่มีทั้ง 2 แหล่ง → ❌ 403 Forbidden

---

## 💡 Best Practices

✅ ใช้ **JSON Column** สำหรับ Roles พื้นฐาน (Admin, Manager, Staff)  
✅ ใช้ **RolePermissions Table** สำหรับกรณีพิเศษที่ต้องการปรับแต่งละเอียด  
✅ เก็บ Log การเปลี่ยนแปลงสิทธิ์ใน `AuditLog` table  
✅ อัพเดต Permissions ผ่าน API แทนการแก้ SQL โดยตรง  
