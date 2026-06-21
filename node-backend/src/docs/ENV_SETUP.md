# Environment Setup — node-backend

> รายการ env ทั้งหมด + เช็กลิสต์ก่อนขึ้น production
> อัปเดต: 2026-06-21

## ⚠️ Quirk สำคัญ
`src/server.js` โหลด env จากไฟล์ **`.env.example`** (ไม่ใช่ `.env`):
```js
dotenv.config({ path: path.resolve(__dirname, '../.env.example') });
```
ดังนั้น **ค่าที่ใช้รันจริงต้องอยู่ใน `.env.example`** ทั้งคู่ถูก gitignore (ไม่ขึ้น git)
แนะนำ: ตั้งค่าให้ตรงกันทั้ง `.env` และ `.env.example` กันสับสน

## ตัวแปรทั้งหมด

| ตัวแปร | จำเป็น | default | คำอธิบาย |
|--------|--------|---------|----------|
| `PORT` | - | 4000 | พอร์ต server (โปรเจคใช้ 5000 ใน .env.example) |
| `NODE_ENV` | แนะนำ | development | `production` = ซ่อน error stack + เปิด JWT fail-fast |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` / `DB_DIALECT` | ✅ | - | การเชื่อมต่อ MySQL (AWS RDS) |
| `DB_SYNC` | - | false | `true` = `sequelize.sync({alter})` ตอน boot — **prod ควร false** (ใช้ migration) |
| `JWT_SECRET` | ✅ (prod) | - | คีย์เซ็น JWT — **ไม่ตั้ง = boot ไม่ขึ้นบน production** (กัน token ปลอม) |
| `CORS_ORIGINS` | แนะนำ (prod) | `*` | โดเมน frontend ที่อนุญาต คั่นด้วย comma เช่น `https://front.gt7dev.com,https://www.gt7dev.com` — ไม่ตั้ง = อนุญาตทุกโดเมน (มี warning) |
| `BODY_LIMIT` | - | 25mb | ขนาด body สูงสุด (JSON/urlencoded) — เพิ่มถ้าต้องรับรูป base64 ใหญ่ |

## ✅ เช็กลิสต์ก่อนขึ้น Production
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` = ค่าสุ่มยาว ≥ 32 ตัวอักษร (อย่าใช้ `your-super-secret-key`)
- [ ] `CORS_ORIGINS` = โดเมน frontend จริง (ไม่ปล่อย `*`)
- [ ] `DB_SYNC=false` (ใช้ migration จัดการ schema)
- [ ] ตรวจว่า role ใน DB เป็น `HighestAdmin` / `Admin` / `Manager` (ตรงกับ `checkRole` — ดู `RBAC_ARCHITECTURE.md`)
- [ ] ทดสอบ login `/dashboard` + CRUD ทุกหน้า admin ว่าแนบ token ถูก (ไม่ 401/403)
- [ ] รัน `node scripts/dedup-indexes.js` ลบ index ซ้ำที่ค้างจาก alter เก่า (ดู `Docs/COST_OPTIMIZATION.md`)

## ตัวอย่าง .env.example (production)
```env
PORT=5000
NODE_ENV=production
DB_NAME=gt7_info
DB_USER=...
DB_PASSWORD=...
DB_HOST=...rds.amazonaws.com
DB_PORT=3306
DB_DIALECT=mysql
DB_SYNC=false
JWT_SECRET=<random-64-hex>
CORS_ORIGINS=https://front.gt7dev.com
BODY_LIMIT=25mb
```
