const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

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

  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, bodyOrOpts, maybeOpts) => {
    if (bodyOrOpts instanceof FormData) return request('POST', path, { ...maybeOpts, formData: bodyOrOpts });
    if (maybeOpts) return request('POST', path, { ...maybeOpts, body: bodyOrOpts });
    return request('POST', path, { body: bodyOrOpts });
  },
  put: (path, bodyOrOpts, maybeOpts) => request('PUT', path, { ...(maybeOpts || {}), body: bodyOrOpts }),
  del: (path, opts) => request('DELETE', path, opts)
};

