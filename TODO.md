# TODO — งานที่เหลือต้องทำต่อ (GT7 Motor)

> อัปเดต: 2026-06-21 · branch ปัจจุบัน: **`Refactor`** (ดู [[active-branch]])
> 🟢 = ผม (AI) ทำได้ · 👤 = ต้องคุณทำเอง (browser/infra/ตัดสินใจ) · ⚙️ = infra/ภายนอก

---

## ✅ เสร็จแล้วใน session ล่าสุด (อ้างอิง)
- TS migration 100% + `strict:true` + **`any` = 0** ทั้ง frontend
- Perf: code-split, vendor chunks, React Query, WebP ตอน upload (sharp), server-side pagination หน้า **public** (Blog/FAQ) + **admin** (FAQ/Blog)
- Security backend: rate-limit login, JWT fail-fast, CORS/body-limit env, **auth ครบทุก write route** (FAQ/Blog/Contact/Dealers/Stickers/ProductCarModel)
- Frontend: รวม API ผ่าน `@/utils/api` + `authFetch` + จัดการ **401 ส่วนกลาง** (auto-logout)
- ตรวจแล้ว: backend auth smoke test 10/10 ✅, role ใน DB ตรง checkRole ✅

---

## 🔴 ต้องทำก่อน (สำคัญสุด)

### 1. 👤 ทดสอบ Admin CRUD ใน UI จริง
เพิ่ง refactor auth + API + pagination เยอะ — ยังไม่ได้กดทดสอบใน browser
- รัน `cd node-backend && npm run dev` + `cd my-react-app && npm run dev` (ต้องมี `my-react-app/.env`: `VITE_API_URL=http://localhost:5000`)
- login `/dashboard` ด้วย `admin` / `admin01` / `admin02`
- เช็ก: (a) Network tab มี `Authorization: Bearer ...` ตอน save · (b) ลบ `adminToken` ใน DevTools → กด action → เด้ง `/?login=1` · (c) หลัง CRUD list อัปเดตเอง · (d) FAQ/Blog เปลี่ยนหน้า+ค้นหายิง server, Blog เห็น draft
- จุดเสี่ยงพิเศษ: **ProductManagement** (manage-modal), **Promotion** (item picker), **Sticker** (upload+canvas)

---

## 🟡 ควรทำ

### 2. Contact admin — un-mock writes + server-side pagination
- ตอนนี้ `updateStatus`/`handleDelete` ใน `ContactManagementPage.tsx` เป็น **mock** (real API ถูก comment ไว้) — backend endpoint มี + ป้องกัน auth แล้ว
- 🟢 แก้: เปิดใช้ real call ผ่าน `authFetch` (PATCH `/api/contact/:id/status`, DELETE `/api/contact/:id`) แล้วทำ list เป็น server-side (`?status&search&limit&offset` — backend รองรับครบ) เหมือน FAQ
- ระวัง: `openModal` auto-mark-read จะยิง PATCH จริงทุกครั้งที่เปิด — ตั้งใจหรือไม่

### 3. Blog — เพิ่ม category filter ฝั่ง backend
- `BlogManagementPage` category filter ตอนนี้ทำฝั่ง client บนหน้าปัจจุบันเท่านั้น (list endpoint ไม่ include/กรอง categories)
- 🟢 แก้ backend `blog.controller.getAllPosts`: include categories + รองรับ `?category=` (join where) แล้วเปลี่ยน frontend ให้ส่ง param

### 4. ProtectedRoute ครอบไม่ครบทุก dashboard route
- ใน `App.tsx` หลาย route admin **ไม่ได้ห่อ** `ProtectedRoute` (เช่น `/dashboard/alignment-management`, `pipe-clean-management`, `*-management` ส่วนใหญ่) — เข้าตรง URL ได้โดยไม่ login (แม้ API จะกัน 401 แล้ว แต่ UX ควรเด้ง login)
- 🟢 แก้: ห่อ `<ProtectedRoute token={token}>` ให้ครบ หรือทำ layout guard ชั้นเดียวคลุม `/dashboard/*`

### 5. token → httpOnly cookie (ลดเสี่ยง XSS)
- ตอนนี้ JWT อยู่ใน `localStorage` (อ่านได้ด้วย JS = เสี่ยงถ้ามี XSS)
- ⚙️🟢 ต้องแก้ทั้ง backend (set-cookie httpOnly+secure+sameSite ตอน login, อ่าน cookie ใน verifyToken) + frontend (เลิกอ่าน localStorage) — งานใหญ่ ทำตอนใกล้ขึ้น prod

---

## 🟢 Nice to have (UX/คุณภาพ)
- แทน `alert()`/`window.confirm()` ด้วย toast + confirm dialog (มีกระจายในหน้า admin)
- Loading skeleton แทนข้อความ "กำลังโหลด..." ในหน้า list
- Error boundary ราย route (ตอนนี้มี ErrorBoundary คลุมทั้งแอปตัวเดียว)
- รูป: `srcSet`/`sizes` + lazy ให้ครบ (คู่กับ CDN)
- เปิด Tailwind preflight (ปลายทาง — ระวังชนกับ 12 `.module.css` ที่เก็บไว้ ดู `Docs/MIGRATION_STATUS.md`)
- ลด `console.log`/debug ที่ค้าง

---

## ⚙️ Infra / ต้องทำตอน deploy (ดู `node-backend/src/docs/ENV_SETUP.md`)
- 👤 ตั้ง env บน prod: `NODE_ENV=production`, `JWT_SECRET` (สุ่มยาว ≥32), `CORS_ORIGINS` (โดเมนจริง), `DB_SYNC=false`, `BODY_LIMIT`
- 👤 รัน `node node-backend/scripts/dedup-indexes.js` ลบ index ซ้ำที่ค้างจาก `alter` เก่า (BlogPosts 64 / Faqs 34) — ระบบบล็อก AI ไม่ให้ drop index บน prod
- ⚙️ ย้ายรูป/วิดีโอเก่าขึ้น CDN (S3/Cloudflare R2) + batch แปลง WebP ของเก่าใน DB (ดู `my-react-app/Docs/CDN_MEDIA_GUIDE.md`)
- ⚙️ เปลี่ยนจาก `sequelize.sync({alter})` → ระบบ **migration** จริง (กัน schema เพี้ยน)
- ⚙️ Audit logging ให้สม่ำเสมอ (มีตาราง AuditLog แต่ใช้ไม่ทั่ว), พิจารณา refresh token

---

## เปิด Pull Request
ยังไม่เปิด PR `Refactor` → `main` (รอผู้ใช้สั่ง) — เมื่อพร้อม: `gh pr create --base main --head Refactor`
