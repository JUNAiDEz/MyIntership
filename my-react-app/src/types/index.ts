import type { ChangeEvent } from 'react';

/**
 * Domain types สำหรับ frontend (เฟส 1)
 * --------------------------------------------------------------------------
 * เริ่มจาก type หลักที่ component ใช้บ่อย แล้วค่อยขยาย/รัดกุมขึ้นเมื่อแปลงไฟล์
 * เพิ่มเติม ตอนนี้หลาย field เป็น optional เพราะ backend ส่งโครงสร้างไม่ตายตัว
 * (เช่น `price` หรือ `unit_price`) — เป็นเหตุผลหลักที่ TypeScript ช่วยจับ bug ได้
 */

/** รูปแบบ response มาตรฐานจาก backend ที่ห่อด้วย { data, ... } */
export interface ApiEnvelope<T> {
  data: T;
  message?: string;
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface ProductImage {
  id?: number;
  image_url: string;
  is_primary?: boolean;
}

export interface Review {
  id?: number;
  rating?: number;
  comment?: string;
  author?: string;
  created_at?: string;
}

/**
 * สินค้า — รองรับหลาย field alias ที่มาจาก backend คนละ endpoint
 * (product_template / product_variant / shop list)
 */
export interface Product {
  id?: number | string;
  product_template_id?: number | string;
  slug?: string;

  // ชื่อ
  title?: string;
  product_name?: string;

  // ราคา
  price?: number | string;
  unit_price?: number | string;
  discount?: number | string;

  // รูป
  imageUrl?: string;
  image_url?: string;
  images?: ProductImage[];

  reviews?: Review[];

  // เผื่อ field อื่นๆ ที่ยังไม่ได้ map (ค่อยถอด index signature นี้ออกเมื่อ type ครบ)
  [key: string]: unknown;
}

export interface CarBrand {
  id: number;
  name: string;
  logo_url?: string;
}

export interface CarModel {
  id: number;
  brand_id: number;
  name: string;
  year?: number;
  image_url?: string;
}

export interface Promotion {
  id?: number;
  slug?: string;
  title?: string;
  description?: string;
  image_url?: string;
  start_date?: string;
  end_date?: string;
}

export interface BlogPost {
  id?: number;
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  cover_image?: string;
  created_at?: string;
}

export interface Service {
  id?: number;
  slug?: string;
  name?: string;
  title?: string;
  description?: string;
  image_url?: string;
  category?: string;
}

/**
 * ====== Service pricing (หน้า servicePages สาธารณะ) ======
 * backend คืนข้อมูลแบบจัดกลุ่มตามยี่ห้อ: [{ brand, models: [...] }]
 */
export interface ServiceModel {
  id?: number;
  car_model_id?: number;
  name?: string;
  model_name?: string;
  brand?: string;
  price?: number | string;
  note?: string;
  img?: string;
  image_url?: string;
  /** field อื่นๆ ที่ backend อาจแนบมา (ยังไม่ map ครบ) */
  [key: string]: unknown;
}

export interface ServicePricingGroup {
  brand: string;
  models: ServiceModel[];
}

/** การ์ดรีวิว (รูป/วิดีโอ) ในหน้า servicePages */
export interface ReviewItem {
  type: 'image' | 'video';
  src?: string;
  videoId?: string;
  title?: string;
  desc?: string;
}

/**
 * ====== Master data ฝั่ง admin (Dashboard) ======
 * endpoint /api/vehicles/master/* ใช้ key brand_id/brand_name, car_model_id/model_name
 */
export interface AdminBrand {
  brand_id: number;
  brand_name: string;
  [key: string]: unknown;
}

export interface AdminCarModel {
  car_model_id: number;
  model_name: string;
  brand_id?: number;
  [key: string]: unknown;
}

/** หนึ่งแถวราคาแบบ flat ในตารางจัดการ (Fitment/Maintenance/Upgrade/WrapCar) */
export interface PricingRow {
  id?: number;
  car_model_id?: number;
  brand?: string;
  name?: string;
  price?: number | string;
  note?: string;
  img?: string;
  [key: string]: unknown;
}

/** state ของ modal ที่ใช้ซ้ำในหน้า CRUD */
export interface ModalState<T = unknown> {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  item?: T | null;
}

/** alias event handler ที่ใช้บ่อย (input/select/textarea ใช้ร่วมกันได้) */
export type FormFieldEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

/** payload ที่ decode ได้จาก JWT (admin token) */
export interface JwtPayload {
  id: number;
  role?: string;
  role_id?: number;
  exp?: number;
  iat?: number;
}

/** หนึ่ง permission ในรูป resource.action */
export interface Permission {
  resource: string;
  action: string;
}
