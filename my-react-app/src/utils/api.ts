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
  return parseResponse<T>(res);
}

export async function apiPost<T = unknown>(path: string, body: unknown, opts: RequestOpts = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { ...(opts.headers || {}), ...jsonHeaders(!!opts.auth) },
    body: opts.form ? (body as BodyInit) : JSON.stringify(body),
  });
  return parseResponse<T>(res);
}

export async function apiPut<T = unknown>(path: string, body: unknown, opts: RequestOpts = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { ...(opts.headers || {}), ...jsonHeaders(!!opts.auth) },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(res);
}

export async function apiPatch<T = unknown>(path: string, body: unknown, opts: RequestOpts = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: { ...(opts.headers || {}), ...jsonHeaders(!!opts.auth) },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(res);
}

export async function apiDelete<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: { ...(opts.headers || {}), ...getAuthHeaders() },
  });
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
