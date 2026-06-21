# Migration Playbook — แปลง component เป็น TypeScript + Tailwind

> คู่มือขั้นตอนแบบตายตัว สำหรับเฟส 3 (แปลง `.jsx + .module.css` → `.tsx + Tailwind`)
> ใช้คู่กับ `Design.md` (สูตร class) และ `MIGRATION_STATUS.md` (เช็กลิสต์)

---

## ลำดับการเลือกไฟล์ (ทำจากง่าย → ยาก)
1. **Components เล็ก ใช้บ่อย** — `Layout/*` (Header, Footer, ThemeSwitch), การ์ดต่างๆ
2. **Components หน้าเว็บสาธารณะ** — `PageSections/*`, `ServicePage/*`, `Product/*`
3. **Pages สาธารณะ** — `pages/*.jsx`, `pages/servicePages/*`
4. **Dashboard ใหญ่สุดท้าย** — `pages/Dashboard/*` (400–770 บรรทัด, เสี่ยงสูง)

> เหตุผล: component เล็กเป็น dependency ของหน้าใหญ่ ถ้าฐานมั่นแล้วค่อยขยับขึ้นจะปลอดภัยกว่า

---

## ขั้นตอน 5 สเต็ป (ต่อ 1 ไฟล์)

### 1. เช็คก่อนแปลง
- หาว่าใคร import component นี้: `grep -rn "from.*ComponentName" src`
- ยืนยันว่า import แบบ **ไม่ระบุนามสกุล** (ถ้าระบุ `.jsx` ต้องแก้ผู้เรียกด้วย)
- เปิดไฟล์ `.module.css` ดูว่ามี `:global`, `@keyframes`, `::-webkit` ไหม (ดู §พิเศษ ด้านล่าง)

### 2. สร้าง `.tsx`
- ก๊อปโครงจาก `.jsx` → ตั้ง type ให้ props (`interface XProps { ... }`)
- ดึง type จาก `@/types` ถ้ามี (เช่น `Product`, `Service`) — ถ้ายังไม่มีให้เพิ่มใน `src/types/index.ts`
- แปลงทุก `className={styles.x}` → Tailwind class โดย **คัดลอกสูตรจาก `Design.md` §5**
- ใช้ alias `@/` แทน path ยาว (`@/utils/api`, `@/types`)

### 3. เอา import CSS ออก
- ลบบรรทัด `import styles from './X.module.css'`

### 4. build ให้เขียว
```bash
cd my-react-app && npm run build
```
- ถ้า error เรื่อง type → แก้ก่อน อย่าปล่อยผ่าน
- ถ้ามีไฟล์ชื่อซ้ำ (`.jsx` + `.tsx`) → ไปสเต็ป 5

### 5. ลบไฟล์เก่า
```bash
rm src/.../X.jsx src/.../X.module.css
npm run build   # build ซ้ำยืนยัน
```
- อัปเดต `MIGRATION_STATUS.md` ติ๊กว่าเสร็จ

---

## เคสพิเศษ (CSS ที่แปลงเป็น utility ตรงๆ ไม่ได้)
| เจออะไรใน .module.css | ทำยังไง |
|----------------------|---------|
| `::-webkit-line-clamp` | ใช้ utility `line-clamp-2` แทน |
| `@keyframes` / `animation` | ใช้ `animate-*` ถ้าได้ ไม่งั้น **ย้าย keyframes ไป `index.css`** (อย่าลบทิ้ง) |
| `:global(...)` (มัก override slick-carousel) | **ย้ายไป `index.css`** — utility แทนไม่ได้ |
| selector ซับซ้อน (`.a .b:hover .c`) | ใช้ pattern `group`/`peer` ของ Tailwind |
| hover ของลูกตอน hover แม่ | `group` + `group-hover:` (ดูตัวอย่าง `ProductCard.tsx`) |

## ไฟล์ .module.css ที่ใช้ร่วมกันหลายที่ — ลบท้ายสุด
| ไฟล์ | ถูก import จาก |
|------|---------------|
| `styles/AdminTheme.module.css` | ~29 ไฟล์ (ทุกหน้า Dashboard) |
| `components/ServicePage/ServicePageLayout.module.css` | ~25 ไฟล์ |
| `pages/Dashboard/Dashboard.module.css` | 3 ไฟล์ |
> ลบได้ก็ต่อเมื่อ **ทุกไฟล์ที่ import มันถูกแปลงครบแล้ว**

---

## Convention (สรุป)
- types กลาง → `src/types/index.ts`
- import ด้วย alias `@/...`
- API ผ่าน `@/utils/api` เท่านั้น
- สี/spacing/radius → ใช้ token + สูตรจาก `Design.md` ห้าม hardcode มั่ว
- ปุ่มหลัก = เหลืองบนดำ, ปุ่ม submit = ดำบนเหลือง (ตาม Design.md)
- build ต้องเขียวก่อนถือว่าเสร็จ 1 ไฟล์

## ห้ามทำ
- ❌ rewrite หลายไฟล์พร้อมกันโดยไม่ build คั่น
- ❌ ลบ `.module.css` ก่อนเอา import ออก / ก่อน build เขียว
- ❌ ลบไฟล์ shared (AdminTheme ฯลฯ) ทั้งที่ยังมีคนใช้
- ❌ แตะ backend (อยู่นอก scope การ migrate)
- ❌ เปิด `strict:true` กลางคัน (รอใกล้จบเฟส 3)
