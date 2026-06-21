# Glossary — ศัพท์เฉพาะของโปรเจค GT7 Motor

> รวมคำเฉพาะธุรกิจ/เทคนิค เพื่อให้ตีความ requirement และตั้งชื่อได้ตรงกัน

## หมวดบริการ (Service Categories)
ระบบแบ่งบริการของอู่เป็น 5 หมวดใหญ่ (ตรงกับโฟลเดอร์ `pages/servicePages/` และ Dashboard):

| หมวด | ความหมาย | ตัวอย่างบริการ |
|------|----------|----------------|
| **Maintenance** | บำรุงรักษาทั่วไป | ล้างท่อ (PipeClean), เปลี่ยนถ่ายของเหลว (FluidChange), สปาเครื่องยนต์ (EngineSpa), แอร์ (AirCon) |
| **Fitment** | งานช่วงล่าง/ล้อ | ตั้งศูนย์ถ่วงล้อ (Alignment), ลูกหมาก (BallJoints), โช๊ค (ShockAbsorber), ช่วงล่าง (Suspension), ล้อ/ยาง (WheelsTires) |
| **Upgrade** | เพิ่มสมรรถนะ | จูนกล่อง (Remap), ท่อแต่ง (CustomExhaust), เทอร์โบ/อินเตอร์ (TurboInter), วาล์ว (ValveService), รีโมท (RemoteControl) |
| **WrapCar** | หุ้ม/ตกแต่งภายนอก | ฟิล์มกันรอย (FilmProtect), สติกเกอร์ (Sticker), เกจ์บูสต์ (BoostGauge), ท่อ (Exhaust) |
| **Product** | สินค้า/ผลิตภัณฑ์ดูแลรถ | GT7, Mmax, Nano, Perfume (น้ำหอม), Step1 |

## คำเฉพาะงานหุ้มรถ
| คำ | ความหมาย |
|----|----------|
| **Wrap / Car Wrap** | การหุ้มสติกเกอร์/ฟิล์มเปลี่ยนสีรถทั้งคัน |
| **PPF** (Paint Protection Film) | ฟิล์มใสกันรอยสีรถ (คนละชนิดกับ wrap เปลี่ยนสี) |
| **WrapFilmSeries / WrapFilmColor** | ซีรีส์ฟิล์ม wrap และเฉดสีในซีรีส์นั้น |
| **PPFSeries / PPFServicePrice** | ซีรีส์ฟิล์ม PPF และราคาตามรุ่นรถ |
| **CarWrapProfile** | โปรไฟล์ข้อมูลการ wrap ต่อรุ่นรถ |
| **Car Colorizer / CarColorChanger** | ฟีเจอร์ให้ผู้ใช้ลองเปลี่ยนสีรถบนเว็บ |

## โดเมนสินค้า/ขาย
| คำ | ความหมาย |
|----|----------|
| **ProductTemplate** | แม่แบบสินค้า (ข้อมูลหลัก ชื่อ/แบรนด์/หมวด) |
| **ProductVariant** | ตัวเลือกย่อยของสินค้า (ขนาด/รุ่นที่มีราคา/สต็อกจริง) |
| **ProductCarModel** | ตารางผูกสินค้า ↔ รุ่นรถ (สินค้านี้ใส่รถรุ่นไหนได้) |
| **Supplier / ProductVariantSupplier** | ซัพพลายเออร์ และการผูกซัพพลายเออร์กับ variant |
| **Order / OrderProduct / OrderService** | ออเดอร์ และรายการสินค้า/บริการในออเดอร์ |
| **Promotion** | โปรโมชั่น (ผูกกับ order ผ่าน OrderPromotion) |
| **ServicePricing** | ราคาบริการ แยกตามรุ่นรถ (car_model_id) |
| **ServicePreview** | ค่า config สำหรับ render หน้าตัวอย่างของบริการ |

## โดเมนรถ/ลูกค้า
| คำ | ความหมาย |
|----|----------|
| **CarBrand → CarModel → Vehicle** | ยี่ห้อ → รุ่น → คันจริงของลูกค้า |
| **Customer / Employee** | ลูกค้า / พนักงาน (ทั้งคู่ผูกกับ User) |
| **Dealer** | ดีลเลอร์/ตัวแทนจำหน่าย |
| **Portfolio (Project/Gallery/Category)** | ผลงานที่เคยทำ + แกลเลอรีรูป + หมวดผลงาน |

## ระบบสิทธิ์ (RBAC)
| คำ | ความหมาย |
|----|----------|
| **RBAC** | Role-Based Access Control — คุมสิทธิ์ตามบทบาท |
| **Role** | บทบาท (เช่น HighestAdmin) |
| **Permission** | สิทธิ์ในรูป `resource.action` (เช่น `product.create`) |
| **RolePermission** | สิทธิ์ที่ผูกกับ role (many-to-many) |
| **UserPermission** | สิทธิ์เฉพาะรายบุคคล (override จาก role) |
| **HighestAdmin** | role พิเศษ — มีสิทธิ์ทุกอย่าง (bypass การเช็ค) |
| **AuditLog** | บันทึกการกระทำของ user ในระบบ |
> เอกสารเต็ม: `node-backend/src/docs/RBAC_ARCHITECTURE.md`

## เทคนิค / โครงสร้าง
| คำ | ความหมาย |
|----|----------|
| **DynamicRenderer / PageBuilder / ComponentMap** | ระบบ render หน้าจาก config (layout เป็น array ของ block เช่น HERO, REVIEWS, MAP) |
| **adminToken** | JWT ที่เก็บใน `localStorage` หลัง login admin |
| **VITE_API_URL** | base URL ของ backend ฝั่ง frontend (env) |
| **theme-dark** | คีย์ใน localStorage เก็บสถานะโหมดมืด |
