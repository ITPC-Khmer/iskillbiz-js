export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function buildUrl(path) {
  if (!path) return API_BASE;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
}

async function request(method, path, { token, body, formData } = {}) {
  const headers = {};
  let payload;
  if (formData) {
    payload = formData;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(buildUrl(path), { method, headers, body: payload, credentials: 'include' });
  } catch (err) {
    throw new Error('Network error. Please check your connection.');
  }
  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { success: res.ok, message: text || 'Unexpected response' };
  }
  if (!res.ok || data.success === false) {
    const msg = data.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  buildUrl,
  get: (path, opts) => request('GET', path, opts),
  post: (path, bodyOrOpts, maybeOpts) => {
    if (bodyOrOpts instanceof FormData) return request('POST', path, { ...maybeOpts, formData: bodyOrOpts });
    if (maybeOpts) return request('POST', path, { ...maybeOpts, body: bodyOrOpts });
    return request('POST', path, { body: bodyOrOpts });
  },
  put: (path, bodyOrOpts, maybeOpts) => request('PUT', path, { ...(maybeOpts || {}), body: bodyOrOpts }),
  del: (path, opts) => request('DELETE', path, opts)
};
