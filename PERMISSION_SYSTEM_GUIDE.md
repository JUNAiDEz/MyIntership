# Permission System Documentation

## ระบบสิทธิ์การเข้าถึง (Access Control)

ระบบตรวจสอบสิทธิ์แบบ 2 ระดับ:
1. **Role-based Permissions** - สิทธิ์ตาม Role (Admin, Manager, Staff)
2. **User-specific Permissions** - สิทธิ์เฉพาะบุคคล (ทับสิทธิ์จาก Role)

---

## 🔐 การทำงานของระบบ

### 1. ลำดับการตรวจสอบสิทธิ์
```
User Request → Token Verification → Permission Check
                                      ↓
                    1. User Permissions (ตรวจก่อน)
                    2. Role Permissions (ถ้าไม่มี User Permission)
                    3. Role JSON Permissions (Fallback)
```

### 2. Middleware ที่ใช้

#### `verifyToken`
ตรวจสอบว่า User login แล้วหรือไม่ (ตรวจ JWT Token)

#### `checkRole(['Admin', 'Manager'])`
ตรวจสอบว่า User มี Role ที่กำหนดหรือไม่

#### `checkPermission(resource, action)`
ตรวจสอบสิทธิ์แบบละเอียด เช่น:
- `checkPermission('products', 'read')` - ดูสินค้าได้ไหม
- `checkPermission('services', 'create')` - สร้างบริการได้ไหม
- `checkPermission('cars', 'delete')` - ลบรถได้ไหม

#### `checkAnyPermission([...])`
ตรวจสอบแบบ OR (มีสิทธิ์ใดสิทธิ์หนึ่งก็ผ่าน)
```javascript
checkAnyPermission([
  { resource: 'products', action: 'read' },
  { resource: 'products', action: 'update' }
])
```

---

## 📋 Permissions ที่มีในระบบ

### Products (สินค้าอะไหล่)
- `products.create` - เพิ่มสินค้าใหม่
- `products.read` - ดูรายการสินค้า
- `products.update` - แก้ไขข้อมูลสินค้า, ปรับสต็อก
- `products.delete` - ลบสินค้า

### Services (งานบริการ)
- `services.create` - เพิ่มบริการใหม่
- `services.read` - ดูรายการบริการ
- `services.update` - แก้ไขบริการ, toggle status/popular
- `services.delete` - ลบบริการ

### Cars (รุ่นรถยนต์)
- `cars.create` - เพิ่มยี่ห้อ/รุ่นรถใหม่
- `cars.read` - ดูรายการรุ่นรถ
- `cars.update` - แก้ไขข้อมูลรถ
- `cars.delete` - ลบรถ

### Customers (ลูกค้า)
- `customers.create` - เพิ่มลูกค้า/รถใหม่
- `customers.read` - ดูข้อมูลลูกค้า
- `customers.update` - แก้ไขข้อมูลลูกค้า
- `customers.delete` - ลบข้อมูลลูกค้า

### Orders (ออเดอร์/ใบงาน)
- `orders.create` - สร้างออเดอร์ใหม่
- `orders.read` - ดูออเดอร์
- `orders.update` - แก้ไขสถานะออเดอร์
- `orders.delete` - ยกเลิกออเดอร์

### Users (ผู้ใช้งาน)
- `users.create` - เพิ่มผู้ใช้ใหม่
- `users.read` - ดูรายชื่อผู้ใช้
- `users.update` - แก้ไขข้อมูลผู้ใช้
- `users.delete` - ลบผู้ใช้

### Reports (รายงาน)
- `reports.read` - ดูรายงาน
- `reports.export` - ส่งออกรายงาน

### Settings (ตั้งค่าระบบ)
- `settings.read` - ดูการตั้งค่า
- `settings.update` - แก้ไขการตั้งค่า

---

## 🛠️ การใช้งาน Backend

### ตัวอย่าง Routes

#### Products Routes
```javascript
const { verifyToken, checkPermission } = require('../../middleware/auth');

// ดูสินค้า - ต้องมีสิทธิ์ read
router.get('/products', 
  verifyToken, 
  checkPermission('products', 'read'), 
  productsController.getAllProducts
);

// เพิ่มสินค้า - ต้องมีสิทธิ์ create
router.post('/products', 
  verifyToken, 
  checkPermission('products', 'create'), 
  productsController.createProduct
);

// แก้ไขสินค้า - ต้องมีสิทธิ์ update
router.put('/products/:id', 
  verifyToken, 
  checkPermission('products', 'update'), 
  productsController.updateProduct
);

// ลบสินค้า - ต้องมีสิทธิ์ delete
router.delete('/products/:id', 
  verifyToken, 
  checkPermission('products', 'delete'), 
  productsController.deleteProduct
);
```

#### Services Routes
```javascript
// ดูบริการ
router.get('/services', 
  verifyToken, 
  checkPermission('services', 'read'), 
  servicesController.getAllServices
);

// สร้างบริการ
router.post('/services', 
  verifyToken, 
  checkPermission('services', 'create'), 
  servicesController.createService
);
```

---

## 🎯 ตัวอย่างการใช้งานจริง

### Scenario 1: Admin1 จัดการบริการอย่างเดียว

**ตั้งค่าใน Dashboard:**
1. ไป Dashboard > จัดการผู้ใช้งานและสิทธิ์
2. คลิกแท็บ "กำหนดสิทธิ์รายบุคคล"
3. เลือก Admin1
4. กด "แก้ไขสิทธิ์"
5. เลือกเฉพาะ:
   - ✅ services.create
   - ✅ services.read
   - ✅ services.update
   - ✅ services.delete
6. กดบันทึก

**ผลลัพธ์:**
- ✅ Admin1 เข้าหน้า Service Management ได้
- ❌ Admin1 เข้าหน้า Product Management ไม่ได้ (403 Forbidden)

---

### Scenario 2: Admin2 จัดการสินค้าอย่างเดียว

**ตั้งค่า:**
1. เลือก Admin2
2. เลือกเฉพาะ:
   - ✅ products.create
   - ✅ products.read
   - ✅ products.update
   - ✅ products.delete
3. บันทึก

**ผลลัพธ์:**
- ✅ Admin2 เข้าหน้า Product Management ได้
- ❌ Admin2 เข้าหน้า Service Management ไม่ได้

---

### Scenario 3: Manager เห็นทุกอย่าง แต่แก้ไขได้บางส่วน

**ตั้งค่า:**
1. เลือก Manager1
2. เลือก:
   - ✅ products.read
   - ✅ services.read
   - ✅ cars.read
   - ✅ customers.read
   - ✅ orders.read
   - ✅ orders.update (แก้ไขสถานะได้)
3. บันทึก

**ผลลัพธ์:**
- ✅ Manager1 ดูข้อมูลทุกหน้าได้
- ✅ Manager1 แก้ไขสถานะออเดอร์ได้
- ❌ Manager1 เพิ่ม/ลบสินค้าไม่ได้

---

## 🔧 การ Debug Permission Issues

### ตรวจสอบ Console Logs
Backend จะแสดง logs เมื่อตรวจสอบสิทธิ์:

```
✅ User john_doe has direct permission: products.create
✅ User jane_smith has role permission: services.read
❌ User bob_jones denied: cars.delete
```

### ตรวจสอบใน Database

```sql
-- ดูสิทธิ์ของผู้ใช้
SELECT u.username, p.resource, p.action 
FROM Users u
JOIN UserPermissions up ON u.user_id = up.user_id
JOIN Permissions p ON up.permission_id = p.permission_id
WHERE u.username = 'admin1';

-- ดูสิทธิ์ของ Role
SELECT r.role_name, p.resource, p.action
FROM Roles r
JOIN RolePermissions rp ON r.role_id = rp.role_id
JOIN Permissions p ON rp.permission_id = p.permission_id
WHERE r.role_name = 'Admin';
```

### Response Codes
- **200** - Success (มีสิทธิ์)
- **401** - Unauthorized (ไม่ได้ Login)
- **403** - Forbidden (Login แล้วแต่ไม่มีสิทธิ์)
- **404** - Not Found (ไม่พบข้อมูล)

---

## 📝 Checklist การติดตั้ง

- [x] สร้างตาราง UserPermissions
- [x] เพิ่ม Model UserPermission
- [x] เพิ่ม Controller userPermissions.controller.js
- [x] เพิ่ม Routes /api/auth/users/:userId/permissions
- [x] เพิ่ม Middleware checkPermission, checkAnyPermission
- [x] อัพเดท Routes ทั้งหมด (Products, Services, Cars, Customers)
- [x] Seed Permissions เริ่มต้น (30+ permissions)
- [x] เพิ่มแท็บ "กำหนดสิทธิ์รายบุคคล" ใน Frontend

---

## 🚀 Next Steps

1. **Restart Backend Server** เพื่อโหลด Middleware ใหม่
2. **Seed Permissions** - POST /api/auth/permissions/seed
3. **กำหนดสิทธิ์** ให้กับแต่ละคนใน Dashboard
4. **ทดสอบ** เข้าหน้าต่างๆ ด้วยผู้ใช้ที่มีสิทธิ์ต่างกัน

---

## ⚠️ หมายเหตุสำคัญ

1. **User Permission มีความสำคัญสูงกว่า Role Permission**
   - ถ้ากำหนด User Permission ไว้ → ใช้ของ User
   - ถ้าไม่มี User Permission → ใช้ของ Role

2. **ต้อง Seed Permissions ก่อนใช้งาน**
   - รัน: `POST /api/auth/permissions/seed`
   - หรือสร้างเอง: `POST /api/auth/permissions`

3. **Token ต้อง Fresh**
   - ถ้าเพิ่งเปลี่ยนสิทธิ์ → Logout แล้ว Login ใหม่
   - Token เก่ายังไม่มีข้อมูลสิทธิ์ใหม่

4. **Frontend ควรซ่อนเมนูที่ไม่มีสิทธิ์**
   - ตรวจสอบสิทธิ์ใน Frontend ก่อนแสดงเมนู
   - แต่ Backend ยังต้องตรวจสอบอยู่ดี (Security)

---

สรุป: ตอนนี้ระบบสามารถกำหนดให้ Admin แต่ละคนทำงานเฉพาะส่วนที่ได้รับมอบหมายได้แล้ว! 🎉
