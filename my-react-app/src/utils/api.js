export const API_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const jsonHeaders = (includeAuth = false) => ({
  'Content-Type': 'application/json',
  ...(includeAuth ? getAuthHeaders() : {})
});

export async function apiGet(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, { method: 'GET', headers: { ...(opts.headers || {}), ...getAuthHeaders() } });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

export async function apiPost(path, body, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers: { ...(opts.headers || {}), ...jsonHeaders(!!opts.auth) }, body: opts.form ? body : JSON.stringify(body) });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

export async function apiPut(path, body, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, { method: 'PUT', headers: { ...(opts.headers || {}), ...jsonHeaders(!!opts.auth) }, body: JSON.stringify(body) });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

export async function apiPatch(path, body, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, { method: 'PATCH', headers: { ...(opts.headers || {}), ...jsonHeaders(!!opts.auth) }, body: JSON.stringify(body) });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

export async function apiDelete(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, { method: 'DELETE', headers: { ...(opts.headers || {}), ...getAuthHeaders() } });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

export default {
  API_URL,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete
};
