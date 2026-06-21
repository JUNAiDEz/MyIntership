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
