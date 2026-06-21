export const API_URL: string = import.meta.env.VITE_API_URL || '';

type HeaderMap = Record<string, string>;

interface RequestOpts {
  /** header เพิ่มเติม */
  headers?: HeaderMap;
  /** แนบ Authorization header (สำหรับ POST/PUT/PATCH) */
  auth?: boolean;
  /** ส่ง body เป็น FormData ดิบ (ไม่ JSON.stringify) — ใช้ตอน upload ไฟล์ */
  form?: boolean;
}

const getAuthHeaders = (): HeaderMap => {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * จัดการ 401 ส่วนกลาง: token หมดอายุ/ไม่ถูกต้อง → ล้าง token แล้วเด้งไปหน้า login
 * (ProtectedRoute เปิด LoginModal เมื่อเจอ ?login=1)
 */
function handleUnauthorized(res: Response): void {
  if (res.status !== 401) return;
  localStorage.removeItem('adminToken');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined' && !window.location.search.includes('login=1')) {
    window.location.href = '/?login=1';
  }
}

/**
 * fetch ที่แนบ Authorization อัตโนมัติ + จัดการ 401 ส่วนกลาง และคืน Response ตามเดิม
 * (drop-in แทน fetch ในหน้า admin — โค้ดที่เช็ค res.ok / res.json() ใช้ต่อได้เลย)
 * รับได้ทั้ง path ('/api/x') และ URL เต็ม (`${API_URL}/api/x`)
 */
export async function authFetch(input: string, opts: RequestInit = {}): Promise<Response> {
  const url = input.startsWith('http') ? input : `${API_URL}${input}`;
  const res = await fetch(url, {
    ...opts,
    headers: { ...(opts.headers as HeaderMap || {}), ...getAuthHeaders() },
  });
  handleUnauthorized(res);
  return res;
}

const jsonHeaders = (includeAuth = false): HeaderMap => ({
  'Content-Type': 'application/json',
  ...(includeAuth ? getAuthHeaders() : {}),
});

/** parse เป็น JSON ถ้าทำได้ ไม่งั้นคืน text ดิบ (พฤติกรรมเดิม) */
async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export async function apiGet<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: { ...(opts.headers || {}), ...getAuthHeaders() },
  });
  handleUnauthorized(res);
  return parseResponse<T>(res);
}

export async function apiPost<T = unknown>(path: string, body: unknown, opts: RequestOpts = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { ...(opts.headers || {}), ...jsonHeaders(!!opts.auth) },
    body: opts.form ? (body as BodyInit) : JSON.stringify(body),
  });
  handleUnauthorized(res);
  return parseResponse<T>(res);
}

export async function apiPut<T = unknown>(path: string, body: unknown, opts: RequestOpts = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { ...(opts.headers || {}), ...jsonHeaders(!!opts.auth) },
    body: JSON.stringify(body),
  });
  handleUnauthorized(res);
  return parseResponse<T>(res);
}

export async function apiPatch<T = unknown>(path: string, body: unknown, opts: RequestOpts = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: { ...(opts.headers || {}), ...jsonHeaders(!!opts.auth) },
    body: JSON.stringify(body),
  });
  handleUnauthorized(res);
  return parseResponse<T>(res);
}

export async function apiDelete<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: { ...(opts.headers || {}), ...getAuthHeaders() },
  });
  handleUnauthorized(res);
  return parseResponse<T>(res);
}

export default {
  API_URL,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
};
