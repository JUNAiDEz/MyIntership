# CLAUDE.md

คู่มือสั้นสำหรับ Claude Code เวลาทำงานในโปรเจคนี้ (โหลดอัตโนมัติทุก session)

## โปรเจคนี้คืออะไร
**GT7 Motor** — เว็บแอปร้าน/อู่บริการและแต่งรถ (ภาษาไทย) มี 2 ฝั่งในแอปเดียว:
- เว็บสาธารณะ (Shop, บริการ, โปรโมชั่น, Blog, FAQ, Portfolio ฯลฯ)
- Admin Dashboard `/dashboard/*` (ต้อง login, มี RBAC)

Monorepo 2 โฟลเดอร์: `my-react-app/` (frontend) + `node-backend/` (backend)
รายละเอียดเต็ม: `my-react-app/Docs/PROJECT_OVERVIEW.md`

## Stack
- **Frontend:** React 19 + Vite (rolldown-vite), react-router v7 — กำลัง migrate JSX→TS, CSS Modules→Tailwind v4
- **Backend:** Express 5 + Sequelize + MySQL (AWS RDS), CommonJS, JWT auth — **คงเป็น JS** (ไม่ migrate)

## คำสั่ง
```bash
# Frontend (cd my-react-app)
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build  (ต้องผ่านก่อน commit งาน migrate)
npm run typecheck    # tsc -b
npm run lint

# Backend (cd node-backend)
npm run dev          # http://localhost:5000 (nodemon)
```

## ⚠️ Gotchas (อ่านก่อนเริ่ม — กันพลาดซ้ำ)
1. **npm install ฝั่ง frontend ต้องใช้ `--legacy-peer-deps`** (react-helmet-async peer แค่ React 18 แต่โปรเจคใช้ 19)
2. **env ของ backend มี quirk:** `server.js` โหลดจากไฟล์ `.env.example` (ไม่ใช่ `.env`) — ต้องมีค่าตรงกันทั้งสองไฟล์ ทั้งคู่ถูก gitignore
3. **รูปใน DB เก็บเป็น absolute URL ชี้ prod** (`apigame.gt7dev.com`) — รัน local รูปอาจไม่ขึ้น (`ERR_NAME_NOT_RESOLVED`) ไม่ใช่บั๊กของโค้ด
4. **ตอนแปลง component:** ต้องลบไฟล์ `.jsx` เก่าก่อน build เสมอ ไม่งั้น import กำกวม (มี `.jsx` กับ `.tsx` ชื่อซ้ำ)
5. Frontend ต้องมี `.env`: `VITE_API_URL=http://localhost:5000` ถึงจะยิง API ติด

## กฎการ migrate TS + Tailwind (เฉพาะ frontend)
- ทำ **incremental ทีละไฟล์** build ต้องเขียวเสมอ — ห้าม rewrite ทีเดียว
- เฟส 1 เสร็จแล้ว (tsconfig, alias `@/`, Tailwind v4 แบบ no-preflight, แปลง utils/hooks/types)
- เฟส 3 = แปลง component: ทำตาม `my-react-app/Docs/MIGRATION_PLAYBOOK.md`
- หน้าตา/สไตล์ใหม่ ยึดตาม `my-react-app/Docs/Design.md` (สูตร Tailwind class พร้อมใช้)
- ความคืบหน้าอัปเดตที่ `my-react-app/Docs/MIGRATION_STATUS.md`

## Convention
- TypeScript: types กลางอยู่ `src/types/`, import ด้วย alias `@/` (เช่น `@/utils/api`)
- ตอนนี้ `strict:false` (เฟส 1) — จะเปิด `strict:true` ตอนใกล้จบเฟส 3
- API เรียกผ่าน `@/utils/api` (apiGet/apiPost/...) เท่านั้น อย่า fetch ดิบกระจาย
- ภาษาในโค้ด/คอมเมนต์เป็นไทยได้ (โปรเจคนี้ใช้ไทยเป็นหลัก)

## เอกสารอ้างอิง
| ไฟล์ | เนื้อหา |
|------|---------|
| `my-react-app/Docs/PROJECT_OVERVIEW.md` | โครงสร้าง, API map, โดเมน DB |
| `my-react-app/Docs/Design.md` | Design system + สูตร Tailwind |
| `my-react-app/Docs/MIGRATION_PLAYBOOK.md` | วิธีแปลง component ทีละตัว |
| `my-react-app/Docs/MIGRATION_STATUS.md` | เช็กลิสต์ความคืบหน้า |
| `my-react-app/Docs/GLOSSARY.md` | ศัพท์เฉพาะธุรกิจ |
| `my-react-app/Docs/COST_OPTIMIZATION.md` | แนวทางประหยัดงบ (infra + dev) |
| `node-backend/src/docs/RBAC_ARCHITECTURE.md` | ระบบสิทธิ์ + route auth coverage |
| `node-backend/src/docs/ENV_SETUP.md` | env vars ทั้งหมด + เช็กลิสต์ก่อนขึ้น prod |
| `TODO.md` (root) | งานที่เหลือต้องทำต่อ (FE/BE/infra) จัดลำดับแล้ว |
