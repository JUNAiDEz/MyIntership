# Migration Status — TS + Tailwind

> เช็กลิสต์ความคืบหน้า อัปเดตทุกครั้งที่แปลงไฟล์เสร็จ
> อัปเดตล่าสุด: 2026-06-21

## 🎉 สถานะ: TypeScript migration เสร็จสมบูรณ์ 100%
| | จำนวน |
|--|------|
| `.tsx` | **114** |
| `.ts` | 8 |
| **`.jsx` ที่เหลือ** | **0** ✅ |
| **`.js` ที่เหลือ** | **0** ✅ |
| `.module.css` ที่เหลือ | **12** (ตั้งใจเก็บ — shared/animation, ดูด้านล่าง) |
| **`any` ที่เหลือ** | **0** ✅ (จาก ~1257) |

- `npm run typecheck` ✅ ผ่านสะอาด | `npm run build` ✅ เขียว | `strict: true`
- ทุกไฟล์ใน `src/` เป็น TypeScript แล้ว (รวม `App.tsx`, `main.tsx`, `index.html` ชี้ `main.tsx`)
- **`any` = 0 ทั้ง frontend** — แทนด้วย type จริง/local interface/`unknown`+guard (+ type กลางใน `@/types`, `@types/google.maps`)
- งานหลังจากนี้ commit ลง branch **`Refactor`** (ไม่ใช่ `main`)

### เฟส 3 — Tailwind cleanup (เสร็จตามขอบเขตที่ตกลง)
- ลบ **dead CSS 4 ไฟล์** (LiveStream/ProductSupplier/ServicePricing/StickerDashboard)
- แปลง single-importer เป็น Tailwind + ลบ css: OurService, ServiceMenuPage, Sticker, ProductDetailPage, VehicleDetailPage(ServiceCards), Remap, **ShopPage, PromotionPage, Header**
- **`.module.css`: 58 → 12 ไฟล์** (ลด ~79%)

**12 ไฟล์ที่เหลือ = ตั้งใจเก็บเป็น CSS (ถูกต้องตามหลัก):**
- **Shared design-system (6):** `AdminTheme`(29 importers), `ServicePageLayout`(25), `Dashboard`, `ManagementPage`×2, `ProductManagementPage` → ไม่ควรกระจายเป็น utility ใน 50+ ไฟล์
- **Animation/effect (5):** `Loader`, `ThemeSwitch`, `AgentChatBot`, `ServiceBanner`(slick), `CarColorChanger`(mask+parentStyles) → keyframes/effect เหมาะกับ CSS
- **(1):** `VehicleModelsPage` → light-mode dual-theme system แยกต่างหาก (เก็บตามที่ตกลง)

slick `:global` ที่ย้ายเข้า `index.css`: `.product-carousel`, `.poster-carousel`, `.shop-banner-slider`, `.promo-flash-slider`
keyframes ใน `index.css @theme`: slide-down(+20), modal-in, slide-in-left/right, zoom-in, fade-in(+down/header), slide-up, fade-in-left

### 12 `.module.css` ที่เหลือ = ตัดสินใจ "เก็บไว้ถาวร" (2026-06-21)
ทบทวนแล้วตัดสินใจ **ไม่แปลง** เพราะแปลงแล้วแย่กว่าเดิม:
- **shared design-system (6):** `AdminTheme`(29 importers), `ServicePageLayout`(25), `Dashboard`, `ManagementPage`×2, `ProductManagementPage` → แปลง = inline utility ลง 50+ ไฟล์ เสีย single source of truth
- **animation/effect (5):** `Loader`, `ThemeSwitch`, `AgentChatBot`, `ServiceBanner`(slick), `CarColorChanger`(CSS mask) → keyframes/mask ไม่เหมาะเป็น utility
- **(1):** `VehicleModelsPage` → ระบบ dual light/dark theme
> ไม่ใช่ "ยังไม่ได้แปลง" แต่เป็นสถาปัตยกรรมที่ตั้งใจ — Tailwind ครอบคลุมส่วนที่เหมาะสมครบแล้ว

> 🎉 **`components/` = TS 100%** | **หน้าสาธารณะ (pages/ root) = TS 100% (14/14)** ✅
> ✅ Tailwind: Home, FAQ(+Detail), Contact, Blog(+Detail), Promotion**Detail**, Portfolio(+Detail)
> ✅ TS only (คง css): PromotionPage, VehicleModelsPage, ShopPage, ProductDetailPage, VehicleDetailPage (slick/light-mode/หน้าใหญ่ซับซ้อน)
> ⬜ เหลือ: **servicePages (25)**, **Dashboard (37)**, App.jsx/main.jsx

> หมายเหตุ: บาง component ที่เป็น animation widget (Loader, ThemeSwitch) แปลงเป็น `.tsx` แล้วแต่ **คงไฟล์ `.module.css` ไว้** เพราะ keyframes/CSS-var ไม่เหมาะกับ utility — ตาม playbook

## เฟส
- [x] **เฟส 1 — Setup** (tsconfig, alias `@/`, Tailwind v4 no-preflight, @theme tokens, แปลง utils/hooks, สร้าง types) ✅
- [ ] **เฟส 3 — แปลง component ทีละตัว** (กำลังทำ)
- [ ] เปิด `strict:true` + Tailwind preflight (ปลายทาง)

---

## ✅ เสร็จแล้ว
### Infra / non-component
- [x] `utils/api.ts`
- [x] `utils/productHelpers.ts`
- [x] `utils/usePermissions.ts`
- [x] `hooks/useFetch.ts`
- [x] `hooks/useDebounce.ts`
- [x] `hooks/useCarModelsByBrand.ts`
- [x] `types/index.ts` (สร้างใหม่)
- [x] `vite.config.ts`

### Components
- [x] `components/Product/ProductCard.tsx` (+ ลบ `.module.css` แล้ว) — ใช้เป็นแม่แบบ card โทนเข้ม
- [x] `components/ScrollToTop/ScrollToTop.tsx` (logic ล้วน ไม่มี css)
- [x] `components/Layout/Footer.tsx` (+ ลบ `.module.css`) — แปลง Tailwind เต็มตัว, แม่แบบ footer/grid
- [x] `components/Loading/Loader.tsx` (คง `.module.css` — animation)
- [x] `components/Layout/ThemeSwitch.tsx` (คง `.module.css` — animation widget)
- [x] `components/Layout/SearchInput.tsx` (+ ลบ `.module.css`) — Tailwind เต็มตัว
- [x] `components/Layout/YellowNavbar.tsx` (+ ลบ `.module.css`) — Tailwind เต็ม (ใช้ `animate-slide-down`)
- [x] `components/Layout/Header.tsx` (คง `.module.css` — เมนู responsive ซับซ้อน, แปลง TS only)
- [x] เพิ่ม keyframe `slide-down` ใน `index.css` (`@theme --animate-slide-down`)

> **Layout/ folder = TypeScript ครบแล้ว** (Header รอแปลง Tailwind รอบหลัง)
- [x] `components/Product/ProductCarousel.tsx` (+ ลบ `.module.css`) — Tailwind; ย้าย slick `:global` ไป `index.css` (`.product-carousel`)
- [x] `components/Auth/ProtectedRoute.tsx` (TS)
- [x] `utils/ProtectedRoute.tsx` (TS — มี ProtectedRoute/HasPermission/HasAnyPermission, คง inline style)
- [x] `components/Blog/BlogCard.tsx` (+ ลบ `.module.css`) — Tailwind
- [x] `components/Blog/BlogSection.tsx` (+ ลบ `.module.css`) — Tailwind (มือถือเลื่อนแนวนอน snap)
- [x] `components/Promotion/PromotionCard.tsx` (+ ลบ `.module.css`) — Tailwind
- [x] `components/Map/ShopMap.tsx` (+ ลบ `.module.css`) — Tailwind
- [x] `components/FloatingMenu.tsx` (+ ลบ `.module.css`) — Tailwind (accordion ด้วย max-height transition)
- [x] `components/DashboardHeader.tsx` (TS only — ใช้ `Dashboard.module.css` ที่ shared)

---

## ⬜ ยังไม่แปลง (จัดกลุ่มตามลำดับที่แนะนำ)

### กลุ่ม 1 — Components เล็ก/ใช้บ่อย (เกือบครบ)
- [x] `components/Layout/` — ครบทั้งโฟลเดอร์ ✅
- [x] `components/Product/` — ProductCard, ProductCarousel ✅
- [x] `components/Promotion/PromotionCard` ✅
- [x] `components/Blog/` — BlogCard, BlogSection ✅
- [x] `components/Map/ShopMap` ✅
- [x] `components/ScrollToTop`, `components/Loading/Loader` ✅
- [x] `components/Auth/ProtectedRoute` ✅ (เหลือ LoginModal)
- [x] `components/DashboardHeader`, `components/FloatingMenu` ✅
- [x] `components/Auth/LoginModal` ✅ (Tailwind + `animate-modal-in`)
- [x] `components/AgentChatBot` ✅ (TS only — คง `.module.css` animation)

> **กลุ่ม 1 = ครบแล้ว ✅** (component เล็ก/ใช้บ่อยทั้งหมด)

### กลุ่ม 2 — Section/ServicePage components
- [x] `components/PageSections/` (9) ✅ — Tailwind ทั้งหมด ยกเว้น ServiceBanner (TS only คง css เพราะ align variants + slick arrows ซับซ้อน)
  - keyframes ที่ย้ายเข้า `index.css`: `slide-in-right/left`; slick `:global` → `.poster-carousel`, `.product-carousel`
- [x] `components/ServicePage/` (6) ✅ — Tailwind (HeroSection/PriceSelector/ServiceCatalog/ReviewGallery/ServiceModal); CarColorChanger = TS only (คง css — mask layering + parentStyles API)
  - keyframes เพิ่ม: `zoom-in`, `fade-in`, `slide-up`
  - **เก็บ `ServicePageLayout.module.css`** (shared 25 หน้า — ลบหลังแปลง servicePages ครบ)
- [x] `components/DynamicRenderer/` (2) ✅ — ComponentMap, PageBuilder (TS, logic ล้วน)

> 🎉 **กลุ่ม 2 = ครบแล้ว — `components/` เป็น TS 100%**

### กลุ่ม 3 — Pages สาธารณะ
- [ ] `pages/` (14) — HomePage, ShopPage, ProductDetailPage, PromotionPage(+Detail), BlogPage(+Detail), FAQPage(+Detail), PortfolioPage(+Detail), ContactPage, VehicleModelsPage, VehicleDetailPage
- [ ] `pages/servicePages/Maintenance/` (5)
- [ ] `pages/servicePages/Fitment/` (5)
- [ ] `pages/servicePages/Upgrade/` (5)
- [ ] `pages/servicePages/WrapCar/` (4)
- [ ] `pages/servicePages/Product/` (5)
- [ ] `pages/servicePages/OurService`
- [ ] `utils/ProtectedRoute.jsx`
- [ ] `App.jsx` → `App.tsx`, `main.jsx` → `main.tsx`

### กลุ่ม 4 — Dashboard (ใหญ่/เสี่ยงสูง — ทำท้ายสุด)
- [ ] `pages/Dashboard/` (19 ไฟล์หลัก) — ProductManagementPage (770), PromotionManagementPage (757), PortfolioManagementPage (690), ServiceManagementPage (660), BlogManagementPage (627), UserManagementPage (613), CarManagementPage (586) ฯลฯ
- [ ] `pages/Dashboard/FitmentManagement/` (5)
- [ ] `pages/Dashboard/MaintenanceManagement/` (4)
- [ ] `pages/Dashboard/UpgradeManagement/` (5)
- [ ] `pages/Dashboard/WrapCarManagement/` (4)

### ไฟล์ .module.css ที่ใช้ร่วม — ลบท้ายสุด
- [ ] `styles/AdminTheme.module.css` (หลังแปลง Dashboard ครบ)
- [ ] `components/ServicePage/ServicePageLayout.module.css` (หลังแปลง servicePages ครบ)
- [ ] `pages/Dashboard/Dashboard.module.css`
