# Cost Optimization — แนวทางประหยัดงบโปรเจค GT7 Motor

> รวมแนวทางลดค่าใช้จ่าย (infra + ต้นทุนพัฒนา) โดยคงคุณภาพ
> เรียงตาม ผลกระทบต่องบ × ความง่าย — อัปเดต: 2026-06-21

---

## 🔴 ผลกระทบสูง — ทำก่อน

### 1. ย้ายรูป/วิดีโอออกจากเซิร์ฟเวอร์ไป CDN / Object Storage
**ปัญหาปัจจุบัน:**
- รูปเสิร์ฟผ่าน backend `/uploads` (กิน bandwidth + CPU ของ app server)
- `src/components/Video/car-video.mp4` ขนาด **~16MB ถูกฝังเข้า bundle** (เห็นตอน `vite build`)
- DB เก็บรูปเป็น base64 ได้ (body limit ตั้งไว้ 100MB) → เปลือง storage + bandwidth มาก

**แนวทาง:**
- ย้ายไฟล์สื่อไป **S3 + CloudFront** หรือ **Cloudflare R2/Pages** (มี free tier)
- เอา `car-video.mp4` ออกจาก bundle → โหลดจาก CDN/stream แทน
- แปลงรูปเป็น **WebP** + บีบอัด (ลดขนาด 50-70%), คง `loading="lazy"` ที่มีอยู่
- เลิกเก็บรูปเป็น base64 ใน DB → เก็บเป็นไฟล์/URL

### 2. แยก hosting — Frontend เป็น static
**หลักการ:** Vite build = ไฟล์ static ล้วน ไม่ต้องจ่ายค่า Node server มาเสิร์ฟ
- Frontend → **Cloudflare Pages / Netlify / Vercel** (free tier) หรือ S3+CloudFront
- Backend Node → **VPS เล็ก** (Lightsail/DigitalOcean ~$5-10/เดือน) พอ ไม่ต้อง managed แพง

### 3. จัดการ AWS RDS (ค่าใช้จ่ายประจำที่แพงสุด)
- ใช้ instance **burstable (db.t4g)** ตามโหลดจริง อย่า over-provision
- **Dev ไม่ต้องต่อ RDS prod** (ตอนนี้ต่อตรง = เสี่ยง + เปลือง) → ใช้ MySQL local หรือ DB dev เล็กแยก
- โหลดนิ่ง → ซื้อ **Reserved Instance / Savings Plan** ลด ~40-60%
- ลด backup retention, ปิด Multi-AZ ถ้าไม่ critical, เปิด storage autoscaling แบบมีเพดาน

---

## 🟡 ผลกระทบกลาง

### 4. Code-split bundle
**ปัญหา:** `index.js` ~1MB, `hls.js` ~509KB โหลดรวดเดียวทุก user
- **lazy-load หน้า Dashboard** ด้วย `React.lazy()` + `Suspense` → user สาธารณะไม่ต้องโหลดโค้ด admin
- **lazy-load `hls.js`** เฉพาะหน้าที่มี live stream
- พิจารณา `build.rollupOptions.output.manualChunks` แยก vendor
- ผล: ลด egress + เว็บเร็วขึ้น (ดีต่อ SEO/conversion)

### 5. ปิด `sequelize.sync({ alter: true })` บน production
- `app.js` รัน `alter:true` ทุกครั้งที่ boot → ช้า + เสี่ยงแก้ schema ไม่ตั้งใจ = เสี่ยง incident (แพง)
- prod ควรใช้ **migration** (สร้าง/แก้ schema อย่างมีระเบียบ) แทน auto-sync

---

## 🟢 ประหยัด "ต้นทุนพัฒนา" (เวลา = เงิน)

### 6. สิ่งที่กำลังทำอยู่ = ประหยัดงบ
- Migrate แบบ **incremental** (ไม่ rewrite) → ไม่เสียเวลาทำใหม่ + ไม่พังของเดิม
- Tailwind รวม **57 ไฟล์ CSS → utility** → ดูแลรักษาง่าย = ชั่วโมง dev อนาคตน้อยลง
- **Docs** (ชุดนี้) → ลดเวลา onboarding + ลดเวลา AI ไล่อ่านโค้ดทุก session
- **TypeScript** จับบั๊กตั้งแต่ compile → bug หลุด prod น้อยลง (bug บน prod แพงกว่าหลายเท่า)

---

## ✅ ทำไปแล้ว (2026-06-21)
- **Route code-splitting** (`React.lazy` ทุกหน้าใน `App.tsx`) → index bundle 1,046KB → 267KB
- **Vendor chunk splitting** (`manualChunks` ใน vite.config) → แยก react/slick/icons; index โค้ดแอปเหลือ ~25KB, vendor cache ข้าม deploy
- **ErrorBoundary** ครอบทั้งแอป (`src/components/ErrorBoundary.tsx`) กันจอขาว
- **API over-fetching หน้ารถ: 18 req → 1** — endpoint รวม `GET /api/services/pricing/by-car-model/:carModelId` (query เดียว) ใช้ใน VehicleModelsPage/VehicleDetailPage
- **Backend: gzip** (`compression`) + **DB sync ขึ้นกับ `DB_SYNC` env** (เลิก `alter:true` ตายตัว → boot เร็ว/ปลอดภัยบน prod)
- **TanStack Query** (`@tanstack/react-query`) — provider ใน main.tsx (staleTime 60s, no refetch on focus); migrate fetch: HomePage(products/services), ShopPage, BlogSection, PartnerSection → cache + dedupe (สลับหน้าไป-กลับไม่ refetch)
- **Resource hints** ใน index.html — preconnect fonts/api domain, dns-prefetch unsplash
- **TanStack Query → servicePages** (19 ไฟล์) ใช้ `useQuery` สำหรับ pricing
- **DB index** เพิ่ม `ServicePricing(car_model_id,is_active)`, `ProductTemplates(is_active)`, `Faqs(is_active)` (รันผ่าน `scripts/add-indexes.js`)
- **car-video 16MB → public/video/** (ออกจาก JS bundle) + `<video poster + preload=metadata>`; CDN guide → `Docs/CDN_MEDIA_GUIDE.md`
- **TS `strict: true`** เปิดเต็มแล้ว (แก้ 27 errors) — typecheck/build เขียว
- **Dashboard → React Query (ครบ)**: ~30 หน้า CRUD ใช้ `useQuery` + `useMutation` + `invalidateQueries` (ต้นแบบ `FAQManagementPage.tsx`) — list refresh อัตโนมัติหลัง create/edit/delete/toggle ไม่ stale; ปุ่ม save disable ระหว่าง pending
  - ข้าม (ไม่ใช่ list CRUD): `ServiceMenuPage` (static), `ServicePreviewManagementPage` (config object), `ContactManagementPage` (writes เป็น mock)
  - ⚠️ ต้องทดสอบใน admin UI จริง (login /dashboard → กดเพิ่ม/แก้/ลบ/toggle) ว่า list อัปเดตถูก โดยเฉพาะ ProductManagement (manage-modal), Promotion (item picker), Sticker (upload+canvas)

## ✅ ทำไปแล้ว (2026-06-21 รอบสอง — branch `Refactor`)
- **TypeScript `any` = 0 ทั้ง frontend** (จาก ~1257 จุด) — แทนด้วย type จริง/local interface/`unknown`+guard; เพิ่ม type กลางใน `@/types` (ServicePricingGroup, AdminBrand, PricingRow ฯลฯ) + `@types/google.maps`; strict:true จับบั๊กได้เต็ม ไม่มีรูรั่ว type
- **WebP ตอน upload** — `upload.middleware` ใช้ multer memoryStorage, `upload.controller` แปลงด้วย `sharp().webp({quality:80})` (animated:true รองรับ gif) เขียน `.webp` ลง public/uploads (response shape เดิม) → ลดขนาดรูป ~50-70%
- **Server-side pagination + search (หน้า public)** — `BlogPage` (debounce search + page, limit 9), `FAQPage` (category + offset, limit 12) ใช้ React Query `keepPreviousData`; เลิกโหลด `limit=1000` แล้ว filter client-side (backend รองรับ param อยู่แล้ว)

## ยังเหลือ (ต้องตัดสินใจ/ใช้ทรัพยากรภายนอก)
- **ลบ index ซ้ำ** BlogPosts(64)/Faqs(34) จาก alter:true เก่า → `scripts/dedup-indexes.js` (รันเอง: `! node node-backend/scripts/dedup-indexes.js` — ระบบบล็อกไม่ให้ AI drop index บน prod)
- **car-video/รูป → S3/CloudFront จริง** (ดู CDN_MEDIA_GUIDE) — WebP ตอน upload ✅ แล้ว (เหลือ batch แปลงของเก่าใน DB + ย้ายขึ้น CDN)
- **Server-side pagination หน้า admin** (FAQ/Blog management ยัง paginate client-side `limit=1000`) — ควรทดสอบ CRUD จริงก่อนแปลง; blog admin ต้องเห็น draft (controller กรอง is_published สำหรับ non-admin ต้องปรับ)

## ลำดับแนะนำให้เริ่ม
1. **ข้อ 4 (code-split)** — ทำได้ทันทีในโค้ดปัจจุบัน เห็นผลเร็ว ไม่ต้องแตะ infra
2. **ข้อ 1 + 2** — ย้ายสื่อไป CDN + แยก static hosting (ประหยัด bandwidth/hosting มากสุด)
3. **ข้อ 5** — ปิด auto-sync บน prod (ลดความเสี่ยง)
4. **ข้อ 3** — รีวิว/right-size RDS (ประหยัดรายเดือนระยะยาว)

> หมายเหตุ: ตัวเลข bundle (1MB/509KB/16MB) อ้างอิงจากผล `vite build` วันที่ทำเอกสาร — ตรวจซ้ำได้ด้วย `npm run build`
