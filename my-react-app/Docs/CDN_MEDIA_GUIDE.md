# CDN & Media Optimization Guide

> วิธีย้ายไฟล์สื่อ (วิดีโอ/รูป) ไป CDN + แปลง WebP เพื่อลด bandwidth และให้โหลดเร็วขึ้น
> ส่วนที่ทำในโค้ดแล้ว = ✅ / ส่วนที่ต้องทำบน infra (ต้องมี account) = ⬜

## ✅ ทำในโค้ดแล้ว
- ย้าย `car-video.mp4` (16MB) จาก `src/` → `public/video/car-video.mp4` (ไม่ฝังใน JS bundle อีก, เสิร์ฟเป็น static)
- `<video>` ใน HeroSection ใส่ `preload="metadata"` + `poster="/images/cars/gtr.png"` → โชว์รูปทันที ไม่บล็อกการ render ระหว่างวิดีโอโหลด

## ⬜ ขั้นตอนย้ายไป CDN (ทำบน AWS / Cloudflare)

### ตัวเลือก A — Cloudflare R2 + CDN (ถูก, egress ฟรี) — แนะนำ
1. สมัคร Cloudflare → สร้าง R2 bucket (เช่น `gt7-media`)
2. อัปโหลด `public/video/car-video.mp4` + รูปใน `public/images/` ขึ้น bucket
3. เปิด public access / ผูก custom domain (เช่น `cdn.gt7motor.com`)
4. ในโค้ด: เปลี่ยน path สื่อให้ชี้ CDN ผ่าน env
   ```
   # .env
   VITE_CDN_URL=https://cdn.gt7motor.com
   ```
   ```ts
   const CDN = import.meta.env.VITE_CDN_URL || '';
   const CAR_VIDEO = `${CDN}/video/car-video.mp4`;
   ```

### ตัวเลือก B — AWS S3 + CloudFront
1. สร้าง S3 bucket → อัปโหลดไฟล์สื่อ
2. สร้าง CloudFront distribution ชี้ไป bucket (เปิด gzip/brotli + cache)
3. ใช้ env `VITE_CDN_URL` แบบเดียวกับ A

## ⬜ รูปภาพ → WebP + responsive
ปัจจุบันรูปเก็บเป็น absolute URL ใน DB (`apigame.gt7dev.com/uploads/...`) เป็น JPG/PNG
1. ตอน **upload** (backend `upload.controller.js`): แปลงเป็น WebP ด้วย `sharp`
   ```js
   const sharp = require('sharp');
   await sharp(file.buffer).webp({ quality: 80 }).toFile(outPath);
   ```
   ลดขนาดรูป 50-70%
2. สร้างหลายขนาด (เช่น 400/800/1600px) แล้วใช้ `srcSet` + `sizes` ที่ `<img>` → browser โหลดขนาดเหมาะกับจอ
3. ใส่ `loading="lazy"` + `width`/`height` ที่ `<img>` ทุกตัว (ลด CLS) — ส่วนใหญ่ใส่แล้วตอน migrate
4. ของเก่าใน DB: เขียน script แปลง batch แล้วอัปเดต URL (หรือทำ on-the-fly ผ่าน image CDN เช่น Cloudflare Images / imgix)

## ผลที่คาดหวัง
- วิดีโอ/รูปโหลดจาก edge ใกล้ผู้ใช้ → เร็วขึ้น + ลดโหลด origin server
- WebP ลดขนาดรูป ~50-70% → ประหยัด bandwidth (เชื่อมโยงกับ `COST_OPTIMIZATION.md`)
