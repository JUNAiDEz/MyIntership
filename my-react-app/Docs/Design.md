# GT7 Motor — Design System / คู่มือการออกแบบ

> ใช้ไฟล์นี้เป็น "แหล่งความจริงเดียว" (single source of truth) ของการตกแต่ง
> เพื่อให้ทุกหน้า/ทุก component ออกมาในทิศทางเดียวกัน
> อิงจากดีไซน์ที่มีอยู่จริง (`AdminTheme.module.css`, `ProductCard`, `index.css`) + palette ที่กำหนด
> อัปเดตล่าสุด: 2026-06-21 — ใช้คู่กับ Tailwind v4

---

## 0. หลักการออกแบบ (Design Principles)

1. **คมชัด มีพลัง (Bold & High-contrast):** ดำ–ขาว–เหลือง เป็นแกนหลัก ใช้สีเหลือง `#ffc709` เป็นจุดเน้นเสมอ
2. **เหลืองคือ accent ไม่ใช่พื้นหลังใหญ่:** ใช้เหลืองกับปุ่มหลัก, จุดเน้น, เส้น highlight — ไม่ใช้เป็นพื้นหลังเต็มพื้นที่
3. **สลับ ดำ/เหลือง เพื่อเน้น (Inversion):** ปุ่มสำคัญมี 2 แบบ — เหลืองบนดำ และ ดำบนเหลือง ใช้สลับเพื่อลำดับความสำคัญ
4. **โค้งมน นุ่มนวล:** ใช้มุมโค้ง (radius) สม่ำเสมอ การ์ด 12px, ปุ่ม/อินพุต 8px
5. **ฟีดแบ็กชัดเจน:** hover ยกขึ้น (`translateY(-2px)`) + เงาเข้มขึ้น, focus มี ring เหลือง

> มี 2 บริบท: **Admin Dashboard = โทนสว่าง** (ตรงกับ palette ด้านล่าง) และ **เว็บสาธารณะ = มีสลับ Light/Dark** (ดู §8)

---

## 1. สีหลัก (Color Palette)

### 🎯 สีแบรนด์หลัก (Core — ตามที่กำหนด)
| บทบาท | ชื่อ | HEX | Tailwind token |
|-------|------|-----|----------------|
| **Brand Accent** | เหลือง GT7 | `#ffc709` | `accent` |
| **Primary & Text** | ดำ | `#000000` | `ink` / `black` |
| **Card Background** | ขาว | `#ffffff` | `card` / `white` |
| **App Background** | เทาอ่อน | `#fafafa` | `app` |
| **Text Secondary** | เทา | `#6b7280` | `secondary` (= `text-gray-500`) |

### 🎨 สีสนับสนุน (Supporting — ดึงจากดีไซน์ที่ใช้อยู่จริง)
| บทบาท | HEX | Tailwind ที่ใกล้เคียง |
|-------|-----|----------------------|
| Text เข้ม (รอง black) | `#1f2937` / `#374151` | `text-gray-800` / `text-gray-700` |
| Text จาง (placeholder/disabled) | `#9ca3af` | `text-gray-400` |
| เส้นขอบหลัก | `#e5e7eb` | `border-gray-200` |
| เส้นขอบเข้ม (input) | `#d1d5db` | `border-gray-300` |
| เส้นแบ่งจาง | `#f3f4f6` | `border-gray-100` |
| พื้น hover แถว (โทนเหลืองจาง) | `#fffbeb` | `bg-amber-50` |

### 🚦 สีสถานะ (Semantic / Status)
| สถานะ | ตัวอักษร | พื้นหลัง | ขอบ |
|-------|---------|---------|-----|
| Success (Active) | `#059669` | `#ecfdf5` | `#d1fae5` |
| Danger (ลบ/error) | `#ef4444` | `#fee2e2` | `#fca5a5` |
| Neutral (Inactive) | `#6b7280` | `#f3f4f6` | `#e5e7eb` |

### Focus ring (มาตรฐานทั้งระบบ)
```
border-color: #000000;
box-shadow: 0 0 0 3px rgba(255, 199, 9, 0.2);   /* ขอบดำ + เรืองเหลืองจาง */
```
Tailwind: `focus:border-black focus:ring-2 focus:ring-accent/20 focus:outline-none`

---

## 2. ลงทะเบียนสีใน Tailwind v4

เพิ่มใน `src/index.css` (ต่อจาก `@theme inline` ที่มีอยู่) เพื่อให้ใช้ class `bg-accent`, `text-secondary`, `bg-app` ได้:

```css
@theme {
  /* สีแบรนด์คงที่ (static — ไม่เปลี่ยนตาม light/dark) */
  --color-accent: #ffc709;
  --color-ink: #000000;
  --color-card: #ffffff;
  --color-app: #fafafa;
  --color-secondary: #6b7280;

  /* status */
  --color-success: #059669;
  --color-danger: #ef4444;
}
```
> หมายเหตุ: ตอนนี้ `index.css` ใช้ `@theme inline` map `--color-accent` ไปที่ตัวแปร `--accent-color`
> (ค่าก็ `#ffc709` อยู่แล้ว) — ใช้ `bg-accent` ได้เลย ส่วน token อื่นเพิ่มตามบล็อกนี้

---

## 3. ตัวอักษร (Typography)

| Font | การใช้งาน | Tailwind |
|------|-----------|----------|
| **Kanit** | ฟอนต์หลัก ทุก body text, ปุ่ม, ฟอร์ม | `font-sans` (default) |
| **Mitr** | หัวข้อใหญ่/แบรนด์ดิ้ง (ตามต้องการ) | `font-header` |

### ขนาด & น้ำหนัก (จากของจริง)
| ระดับ | ขนาด | น้ำหนัก | Tailwind |
|-------|------|---------|----------|
| Page title | `1.8rem` | 900 | `text-3xl font-black` |
| Modal title | `1.5rem` | 800 | `text-2xl font-extrabold` |
| หัวตาราง (th) | `0.85rem` UPPERCASE | 800 | `text-sm font-extrabold uppercase` |
| Body | `0.95rem` | 400–600 | `text-[0.95rem]` / `text-sm` |
| Label ฟอร์ม | `0.9rem` | 600 | `text-sm font-semibold` |
| ข้อความรอง/footer | `0.85–0.9rem` | 400 | `text-sm text-secondary` |

> **สี title เสมอ `#000000`** (หรือ `text-ink`), ข้อความรองใช้ `text-secondary`

---

## 4. Spacing / Radius / Shadow / Motion

### Spacing (8px grid)
| ใช้กับ | ค่า | Tailwind |
|--------|-----|----------|
| ช่องว่างเล็ก (gap ใน control) | 8px / 12px | `gap-2` / `gap-3` |
| ช่องว่างมาตรฐาน (form/section) | 16px | `gap-4` / `mb-4` |
| padding หน้า / card ใหญ่ | 24px | `p-6` |
| padding mobile | 16px | `p-4` |
| padding cell ตาราง | 16px | `p-4` |

### Border Radius
| องค์ประกอบ | ค่า | Tailwind |
|-----------|-----|----------|
| badge / chip เล็ก | 4px | `rounded` |
| รูปเล็ก, ปุ่มหน้า (page btn) | 6px | `rounded-md` |
| ปุ่ม, อินพุต, icon button | 8px | `rounded-lg` |
| การ์ด / ตาราง | 12px | `rounded-xl` |
| modal | 16px | `rounded-2xl` |
| pill (status badge) | 20px+ | `rounded-full` |

### Shadow
| ใช้กับ | ค่า | Tailwind |
|--------|-----|----------|
| การ์ดทั่วไป | `0 1px 3px rgba(0,0,0,0.1)` | `shadow-sm` |
| icon button | `0 1px 2px rgba(0,0,0,0.05)` → hover `0 4px 6px -1px rgba(0,0,0,0.15)` | `shadow-xs` → `hover:shadow-md` |
| ปุ่มเหลือง (accent) | `0 4px 6px -1px rgba(255,199,9,0.4)` | `shadow-[0_4px_6px_-1px_rgba(255,199,9,0.4)]` |
| modal | `0 20px 25px -5px rgba(0,0,0,0.1)` | `shadow-2xl` |
| การ์ดสินค้า (เว็บ dark) | `0 10px 25px rgba(0,0,0,0.5)` | `shadow-[0_10px_25px_rgba(0,0,0,0.5)]` |

### Motion (transition)
| จังหวะ | เวลา | ใช้กับ |
|--------|------|--------|
| เร็ว | `0.1s` | transform ของปุ่ม |
| มาตรฐาน | `0.2s` | hover ทั่วไป (`transition-all duration-200`) |
| theme | `0.3s` | สลับ light/dark |

**Hover มาตรฐาน:** ยกขึ้น `hover:-translate-y-0.5` (-2px) + เงาเข้มขึ้น

### Layout
- Container กว้างสุด: `max-width: 1200px` → `max-w-[1200px] mx-auto`
- Breakpoint มือถือ: `768px` (`md:` ของ Tailwind = 768px พอดี)

---

## 5. สูตร Component (คัดลอกไปใช้ได้เลย)

> เป็น Tailwind class ที่แปลงตรงจากดีไซน์เดิม — ใช้ให้ตรงกันทั้งระบบ

### ปุ่มหลัก — เหลืองบนดำ (Primary Action เช่น "เพิ่ม")
```jsx
<button className="inline-flex items-center gap-2 rounded-lg border-0 bg-accent px-5 py-2.5
  font-bold text-black shadow-[0_4px_6px_-1px_rgba(255,199,9,0.4)] transition-all duration-200
  hover:-translate-y-0.5 hover:shadow-[0_6px_8px_-1px_rgba(255,199,9,0.5)]">
  + เพิ่มรายการ
</button>
```

### ปุ่ม Submit — ดำบนเหลือง (ยืนยันใน modal)
```jsx
<button className="rounded-lg border-0 bg-black px-6 py-2.5 font-bold text-accent
  transition-opacity hover:opacity-90">บันทึก</button>
```

### ปุ่มรอง / ยกเลิก
```jsx
<button className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-semibold
  text-gray-700 transition-all hover:border-black">ยกเลิก</button>
```

### Icon Button (แก้ไข/ลบ)
```jsx
{/* ปกติ */}
<button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300
  bg-white text-gray-600 shadow-xs transition-all hover:-translate-y-0.5
  hover:border-black hover:bg-black hover:text-accent">✎</button>

{/* ปุ่มลบ (hover แดง) */}
<button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300
  bg-white text-gray-600 transition-all hover:border-red-300 hover:bg-red-100 hover:text-red-500">🗑</button>
```

### Input / Select / Textarea
```jsx
<input className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-[0.95rem]
  transition-all outline-none focus:border-black focus:ring-2 focus:ring-accent/20" />
```

### Card (กล่องเนื้อหา/ตาราง — โทนสว่าง)
```jsx
<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
  ...
</div>
```

### หัวข้อ Section (มีแถบเหลืองด้านซ้าย)
```jsx
<h2 className="relative m-0 flex items-center pl-4 text-3xl font-black text-black
  before:absolute before:left-0 before:h-[70%] before:w-1.5 before:rounded-sm before:bg-accent before:content-['']">
  จัดการสินค้า
</h2>
```

### Status Badge
```jsx
{/* Active */}
<span className="rounded-full border border-[#d1fae5] bg-[#ecfdf5] px-2.5 py-1 text-xs font-bold text-[#059669]">
  ใช้งาน
</span>
{/* Inactive */}
<span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-bold text-secondary">
  ปิด
</span>
```

### ตาราง (Admin)
```jsx
<table className="w-full border-collapse text-left">
  <thead>
    <tr className="border-b-2 border-black bg-app">
      <th className="p-4 text-sm font-extrabold uppercase text-black whitespace-nowrap">ชื่อ</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-100 transition-colors hover:bg-amber-50">
      <td className="p-4 align-middle text-[0.95rem] text-gray-700">...</td>
    </tr>
  </tbody>
</table>
```

### Modal
```jsx
{/* backdrop */}
<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
  {/* content */}
  <div className="max-h-[90vh] w-[600px] max-w-[90%] overflow-y-auto rounded-2xl border
    border-gray-200 bg-white p-8 shadow-2xl">
    {/* header — มีเส้นเหลืองหนาใต้หัวข้อ */}
    <div className="mb-5 flex items-center justify-between border-b-4 border-accent pb-2.5">
      <h3 className="m-0 text-2xl font-extrabold text-black">หัวข้อ</h3>
    </div>
    ...
    {/* actions */}
    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">...</div>
  </div>
</div>
```

### Error message
```jsx
<div className="mb-4 rounded-lg border-l-4 border-red-500 bg-red-100 p-3 text-red-500">
  เกิดข้อผิดพลาด
</div>
```

---

## 6. การ์ดสินค้า (เว็บสาธารณะ — โทนเข้ม) — อ้างอิงจาก `ProductCard.tsx`

การ์ดบนหน้าร้าน/หน้าแรกใช้**โทนเข้ม**เพื่อให้รูปสินค้าเด่น:
- พื้นการ์ด `#111`, ขอบ `#222`, ตัวอักษรขาว
- **hover:** การ์ดลอย `-translate-y-2`, ขอบเปลี่ยนเป็น `accent`, รูป zoom `scale-110`, ชื่อเป็นขาว
- ราคา = `text-accent` ตัวหนา, ราคาเก่า = `line-through text-gray`
- ป้ายส่วนลด = พื้นแดง มุมขวาบน
- ปุ่ม "VIEW DETAILS" = `bg-accent text-black` แสดงตอน hover

ดูโค้ดเต็มได้ที่ `src/components/Product/ProductCard.tsx` (ใช้เป็นแม่แบบของ card โทนเข้ม)

---

## 7. Do / Don't

✅ **ควรทำ**
- ใช้เหลือง `#ffc709` กับ **ปุ่มหลัก, จุดเน้น, เส้น highlight** เท่านั้น
- ปุ่มสำคัญใช้คู่ ดำ↔เหลือง สลับกันเพื่อลำดับความสำคัญ
- ใช้ radius/shadow/spacing ตามสเกลในเอกสาร อย่าตั้งค่ามั่ว
- text รองใช้ `text-secondary` (#6b7280), title ใช้ `text-black`

❌ **ไม่ควรทำ**
- อย่าใช้เหลืองเป็นพื้นหลังพื้นที่ใหญ่ (แสบตา)
- อย่าผสม radius หลายค่าในกล่องเดียว
- อย่าใช้สีเทา/เส้นขอบนอกเหนือจาก palette (เลี่ยงเทาสุ่มๆ)
- อย่าใส่ hover เด้งแรงเกิน (ยึด -2px เป็นมาตรฐาน)

---

## 8. หมายเหตุเรื่อง Light / Dark (เว็บสาธารณะ)

เว็บสาธารณะมีสวิตช์ธีม (class `dark-theme` บน `<html>`) ที่เปลี่ยนค่าตัวแปรใน `index.css`
(`--bg-main`, `--bg-card`, `--text-main` ฯลฯ) — palette ในเอกสารนี้คือ**ทิศทางโทนสว่าง/แบรนด์**
ซึ่งตรงกับ **Admin Dashboard** เต็มๆ

เมื่อทำ component ที่ต้องรองรับทั้ง 2 ธีม ให้ใช้ token ที่ผูกกับตัวแปร (เช่น `bg-bg-card`, `text-text-main`)
แทนการ hardcode สี เพื่อให้สลับธีมได้อัตโนมัติ ส่วนสีแบรนด์คงที่ (`accent`, `ink`) ใช้ได้ทั้งสองธีม
