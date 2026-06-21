# GT7 Motor — Project Overview / เอกสารอธิบายโปรเจค

> เอกสารนี้ใช้เป็น "ความจำ" ของโปรเจค อธิบายว่าโปรเจคนี้คืออะไร โครงสร้างเป็นยังไง
> และรันยังไง — อัปเดตล่าสุด: 2026-06-21

---

## 1. โปรเจคนี้คืออะไร

**GT7 Motor** เป็นเว็บแอปของ **ร้าน/อู่บริการรถยนต์และแต่งรถ** (car service & tuning garage)
ประกอบด้วย 2 ฝั่งหลักในแอปเดียว:

1. **เว็บไซต์สาธารณะ (Public Site)** — ให้ลูกค้าดู
   - หน้าร้านขายสินค้า (Shop), รายละเอียดสินค้า
   - บริการต่างๆ ของอู่ (Maintenance, Fitment, Upgrade, Car Wrap/PPF, สติกเกอร์ ฯลฯ)
   - โปรโมชั่น, บทความ (Blog), FAQ, ผลงาน (Portfolio), รุ่นรถ (Vehicle models), ติดต่อเรา
   - ลูกเล่น เช่น เปลี่ยนสีรถ (Car Colorizer), แผนที่ร้าน, แชตบอท, Live stream

2. **ระบบหลังบ้าน (Admin Dashboard)** — `/dashboard/*` (ต้อง login)
   - จัดการสินค้า/คลัง, บริการ + ราคา, โปรโมชั่น, บทความ, FAQ, Portfolio
   - จัดการรถ/ลูกค้า, ดีลเลอร์, ผู้ใช้ + สิทธิ์ (RBAC), สติกเกอร์, ราคางาน wrap/PPF
   - มีระบบ **สิทธิ์การเข้าถึงแบบละเอียด (Role-Based Access Control)**

**กลุ่มเป้าหมาย/ภาษา:** เนื้อหาเป็นภาษาไทยเป็นหลัก ใช้ฟอนต์ Kanit/Mitr, สี accent หลักคือเหลือง `#ffc709`

---

## 2. Tech Stack

### Frontend — `my-react-app/`
| รายการ | เทคโนโลยี |
|--------|-----------|
| Framework | **React 19** |
| Build tool | **Vite** (ใช้ `rolldown-vite`) |
| ภาษา | กำลัง migrate **JSX → TypeScript** (ดู §7) |
| Routing | `react-router-dom` v7 |
| Styling | กำลัง migrate **CSS Modules → Tailwind v4** (ดู §7) |
| UI/อื่นๆ | `lucide-react`, `react-icons`, `react-slick` (carousel), `hls.js` (live stream), `react-helmet-async` (SEO) |

### Backend — `node-backend/`
| รายการ | เทคโนโลยี |
|--------|-----------|
| Runtime | Node.js + **Express 5** |
| ภาษา | JavaScript (CommonJS, `require`) |
| ORM / DB | **Sequelize** + **MySQL** (โปรดักชันใช้ AWS RDS) |
| Auth | **JWT** (`jsonwebtoken`) + `bcryptjs` |
| Security/Utils | `helmet`, `cors`, `morgan`, `multer` (อัปโหลดไฟล์), `dotenv` |

---

## 3. โครงสร้างโปรเจค (ภาพรวม)

```
MyIntership/                  ← repo root (monorepo แบบ 2 โฟลเดอร์)
├─ my-react-app/              ← FRONTEND (React + Vite)
├─ node-backend/              ← BACKEND (Express + Sequelize)
├─ PROJECT_OVERVIEW.md        ← เอกสารนี้
└─ .gitignore
```

> หมายเหตุ: ไม่ได้ใช้ workspace tool (npm/pnpm workspaces) — เป็นแค่ 2 โปรเจคแยกอยู่ในโฟลเดอร์เดียวกัน ต่างคนต่างมี `package.json`

---

## 4. โครงสร้าง Frontend (`my-react-app/src/`)

```
src/
├─ main.jsx                   ← entry point (BrowserRouter + HelmetProvider)
├─ App.jsx                    ← ศูนย์รวม <Routes> ทั้งหมด + จัดการ token/login
├─ index.css                  ← global styles + ตัวแปร theme (light/dark) + Tailwind import
│
├─ pages/                     ← หน้าเว็บ (1 ไฟล์ = 1 หน้า)
│  ├─ HomePage, ShopPage, ProductDetailPage, PromotionPage, BlogPage,
│  │  FAQPage, PortfolioPage, ContactPage, VehicleModelsPage ...
│  ├─ servicePages/           ← หน้าบริการ แยกตามหมวด
│  │  ├─ Maintenance/  (PipeClean, FluidChange, EngineSpa, AirCon ...)
│  │  ├─ Fitment/      (Alignment, BallJoints, ShockAbsorber, Suspension, WheelsTires)
│  │  ├─ Upgrade/      (Remap, CustomExhaust, TurboInter, ValveService, RemoteControl)
│  │  ├─ WrapCar/      (FilmProtect, Sticker, BoostGauge, Exhaust)
│  │  └─ Product/      (Gt7, Mmax, Nano, Perfume, Step1)
│  └─ Dashboard/              ← หน้า admin หลังบ้าน (ไฟล์ใหญ่ 400–770 บรรทัด)
│     ├─ DashboardPage, DashboardHome
│     ├─ ProductManagementPage, ServiceManagementPage, PromotionManagementPage,
│     │  BlogManagementPage, UserManagementPage, CarManagementPage, DealerManagementPage ...
│     └─ (โฟลเดอร์ย่อย) FitmentManagement/, MaintenanceManagement/,
│        UpgradeManagement/, WrapCarManagement/   ← จัดการราคา/เนื้อหาแต่ละบริการ
│
├─ components/                ← UI components ที่ใช้ซ้ำ
│  ├─ Layout/        (Header, Footer, YellowNavbar, SearchInput, ThemeSwitch)
│  ├─ Product/       (ProductCard ✅TSX, ProductCarousel)
│  ├─ PageSections/  (HeroSection, CarColorizer, PosterCarousel, ServiceBanner ...)
│  ├─ ServicePage/   (HeroSection, PriceSelector, ServiceCatalog, ReviewGallery ...)
│  ├─ Auth/          (LoginModal, ProtectedRoute)
│  ├─ Blog/, Promotion/, Map/, Loading/, ScrollToTop/
│  └─ DynamicRenderer/ (PageBuilder + ComponentMap — render หน้าจาก config/JSON)
│
├─ hooks/                     ← custom hooks (TS แล้ว ✅)
│  ├─ useFetch.ts, useDebounce.ts, useCarModelsByBrand.ts
│
├─ utils/                     ← helper กลาง
│  ├─ api.ts ✅               ← API layer (apiGet/apiPost/apiPut/apiPatch/apiDelete)
│  ├─ productHelpers.ts ✅    ← getImageUrl, calculatePrices
│  ├─ usePermissions.ts ✅    ← hook เช็คสิทธิ์ RBAC ฝั่ง client
│  └─ ProtectedRoute.jsx
│
├─ types/                     ← TypeScript types กลาง ✅ (Product, Service, Promotion ...)
└─ styles/                    ← AdminTheme.module.css (ใช้ร่วมหลายหน้า dashboard)
```

**Flow การ render:** `main.jsx` → `App.jsx` (กำหนด route ทั้งหมด) → แต่ละ `pages/*` ประกอบจาก `components/*`
**Flow ข้อมูล:** component เรียก `utils/api.ts` → ยิงไป backend (`VITE_API_URL`) → ได้ JSON กลับมา

---

## 5. โครงสร้าง Backend (`node-backend/src/`)

```
src/
├─ server.js                  ← entry point (โหลด env, เชื่อม DB, app.listen)
├─ app.js                     ← ตั้งค่า Express (cors, helmet, morgan, routes, error handler)
│
├─ config/
│  └─ database.js             ← อ่าน DB credentials จาก env
│
├─ models/                    ← Sequelize models (~50+ ตาราง) + index.js (associations)
│
├─ modules/                   ← จัดเป็น feature module: controller + routes แยกตามโดเมน
│  ├─ index.js                ← ศูนย์รวม mount routes ทั้งหมดไว้ใต้ /api
│  ├─ auth/        (auth, users, roles, permissions, employees, userPermissions)
│  ├─ inventory/   (products, brands, categories, suppliers, productTypes, auditlog)
│  ├─ services/    (services, categories, pricing)
│  ├─ vehicles/    (vehicles, customers, carMaster)
│  ├─ sales/       (orders, promotions)
│  ├─ portfolio/   (projects, categories, reviews)
│  ├─ blog/, faq/, contact/, carWrap/, stickers/, dealers/
│  ├─ servicePreview/  (ระบบ preview หน้าบริการ)
│  ├─ products/        (productCarModel — ผูกสินค้ากับรุ่นรถ)
│  └─ system/      (upload ไฟล์ + audit log)
│
├─ middleware/
│  ├─ auth.js                 ← ตรวจ JWT
│  └─ checkPermission.js      ← ตรวจสิทธิ์ RBAC
│
└─ docs/
   └─ RBAC_ARCHITECTURE.md    ← เอกสารระบบสิทธิ์
```

### API Route Map (prefix `/api`)
| Prefix | โดเมน |
|--------|-------|
| `/api/auth` | Auth, Users, Roles, Permissions, Employees |
| `/api/inventory` | สินค้า, แบรนด์, หมวดหมู่, ซัพพลายเออร์ |
| `/api/services` | บริการ + หมวด + ราคา |
| `/api/vehicles` | รถ, ลูกค้า, ข้อมูลรุ่นรถกลาง (car master) |
| `/api/sales` | ออเดอร์, โปรโมชั่น |
| `/api/portfolio` | ผลงาน + รีวิว |
| `/api/blog`, `/api/faq`, `/api/contact` | บทความ, คำถามพบบ่อย, ข้อความติดต่อ |
| `/api/car-wrap` | งาน wrap รถ + PPF |
| `/api/stickers` | จัดการสติกเกอร์ |
| `/api/products` | ผูกสินค้า ↔ รุ่นรถ (ProductCarModel) |
| `/api/service-preview` | ตั้งค่า preview หน้าบริการ |
| `/api/dealers` | ดีลเลอร์ |
| `/api/system` | อัปโหลดไฟล์ (`/uploads`) + audit log |

---

## 6. โดเมนของฐานข้อมูล (จาก Sequelize associations)

จัดกลุ่มความสัมพันธ์หลักได้ดังนี้:

- **Auth & Users:** `User` ↔ `Role` ↔ `Permission` (RBAC แบบ many-to-many), `User` → `Customer`/`Employee`, `UserPermission` (สิทธิ์เฉพาะคน)
- **Inventory:** `ProductTemplate` → `ProductVariant` → `Supplier`, มี `ProductImage`, `ProductCategory` (มี parent/child), `ProductBrand`, `ProductType`
- **Services:** `Service` → `ServiceImage`/`ServicePricing`(ตามรุ่นรถ)/`ServiceProduct`/`ServicePreview`
- **Vehicles:** `CarBrand` → `CarModel` → `Vehicle` (ผูกกับ `Customer`)
- **Sales:** `Order` ผูก `Customer`/`Vehicle`/`Employee` มี `OrderProduct`/`OrderService`/`OrderPromotion`
- **Portfolio & Reviews:** `PortfolioProject` → `PortfolioGallery` + `PortfolioCategory`(m2m), `ProductReview`, `ServiceReview`
- **Car Wrap & PPF:** `CarWrapProfile`, `WrapFilmSeries` → `WrapFilmColor`, `WrapServicePrice`, `PPFSeries` → `PPFServicePrice`
- **System:** `AuditLog` ผูกกับ `User`
- **Stickers:** ตารางเดี่ยว (ไม่มี association)

---

## 7. สถานะการ Migrate เป็น TypeScript + Tailwind (สำคัญ)

กำลัง migrate **เฉพาะ frontend** (`my-react-app`) จาก JSX+CSS Modules → **TypeScript + Tailwind v4**
แบบค่อยเป็นค่อยไป **3 เฟส** (backend คงเป็น JS เหมือนเดิม)

- **เฟส 1 — เสร็จแล้ว ✅:** ตั้งค่า `tsconfig` (`allowJs:true`, `strict:false`), path alias `@/`,
  Tailwind v4 ผ่าน `@tailwindcss/vite` (ตั้งค่าแบบ **ไม่มี preflight** เพื่อไม่ให้ CSS เดิมพัง),
  map theme tokens เดิม (`--accent-color` ฯลฯ) เข้า Tailwind ผ่าน `@theme inline`,
  แปลง `utils/*`, `hooks/*` เป็น TS, สร้าง `src/types/`
- **เฟส 2:** Tailwind อยู่คู่กับ CSS Modules เดิมได้ (tokens ย้ายแล้ว)
- **เฟส 3:** แปลง component ทีละตัว `.jsx + .module.css → .tsx + Tailwind`
  แล้วลบ `.module.css` (ไฟล์ที่ใช้ร่วมหลายที่ เช่น `AdminTheme.module.css`, `ServicePageLayout.module.css` → ลบท้ายสุด),
  สุดท้ายเปิด `strict:true` + preflight
  - ✅ ตัวอย่างที่แปลงแล้ว: `components/Product/ProductCard.tsx`

> รายละเอียดอยู่ในไฟล์ memory `ts-tailwind-migration.md`

---

## 8. การรันโปรเจคแบบ Local

### ความต้องการ
- Node.js, npm
- MySQL (โปรเจคนี้ชี้ไป AWS RDS — ดู `node-backend/.env`)

### Backend
```bash
cd node-backend
npm install
# สร้าง .env (ดูตัวอย่างจาก .env.example) ใส่ค่า DB_*, JWT_SECRET, PORT
npm run dev            # nodemon, default PORT=5000
```
ตัวแปร env ที่ใช้: `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_DIALECT`, `JWT_SECRET`
> ⚠️ quirk: `server.js` โหลด env จากไฟล์ `.env.example` (ไม่ใช่ `.env`) — แนะนำให้มีค่าตรงกันทั้งสองไฟล์

### Frontend
```bash
cd my-react-app
npm install            # ครั้งแรกอาจต้องใช้ --legacy-peer-deps (react-helmet-async peer React 18)
# สร้าง .env: VITE_API_URL=http://localhost:5000
npm run dev            # Vite, http://localhost:5173
```

### คำสั่งที่มี (Frontend)
| คำสั่ง | ทำอะไร |
|--------|--------|
| `npm run dev` | รัน dev server |
| `npm run build` | `tsc -b && vite build` (typecheck + build) |
| `npm run typecheck` | `tsc -b` เช็ค type อย่างเดียว |
| `npm run lint` | ESLint (รองรับ js/jsx/ts/tsx) |
| `npm run preview` | preview production build |

---

## 9. หมายเหตุ / ข้อควรรู้

- **รูปภาพในฐานข้อมูลเก็บเป็น absolute URL** ชี้ไปโดเมน production (`apigame.gt7dev.com`)
  ถ้าโดเมนนั้น resolve ไม่ได้ (เช่นรัน local ที่ไม่อยู่ในเน็ตเวิร์ก/DNS เดียวกัน) รูปจะโหลดไม่ขึ้น
  (`ERR_NAME_NOT_RESOLVED`) — **ไม่ใช่บั๊กของโค้ด** ข้อมูลอื่นยังโหลดปกติ
- **Theme light/dark** ทำผ่าน class `dark-theme` บน `<html>` (สคริปต์ใน `index.html` อ่านจาก
  `localStorage['theme-dark']`) + ตัวแปร CSS ใน `index.css`
- ไฟล์ `.env` ทั้งสองฝั่งถูก gitignore (ไม่ขึ้น git)
