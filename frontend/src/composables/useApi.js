export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

function buildUrl(path) {
  if (!path) return API_BASE;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
}

/**
 * Check if response is a redirect (e.g., to /cdn-cgi/rum)
 */
function isRedirectResponse(text) {
  if (!text) return false;
  // Check for HTML redirect content
  if (text.includes('cdn-cgi') || text.includes('cloudflare') || text.includes('<!DOCTYPE')) {
    return true;
  }
  return false;
}

/**
 * Fetch with timeout
 */
function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

/**
 * Retry logic for failed requests
 */
async function requestWithRetry(method, path, options, retries = MAX_RETRIES) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await request(method, path, options);
    } catch (err) {
      lastError = err;

      // Don't retry on 4xx errors (except 408, 429, 503, 504)
      if (err.status && err.status >= 400 && err.status < 500) {
        if (![408, 429].includes(err.status)) {
          throw err;
        }
      }

      // Don't retry on last attempt
      if (attempt === retries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

async function request(method, path, { token, body, formData, retries = true } = {}) {
  const url = buildUrl(path);
  const headers = {
    'Accept': 'application/json'
  };

  let payload;
  if (formData) {
    payload = formData;
    // Don't set Content-Type for FormData - browser will set it with boundary
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetchWithTimeout(url, {
      method,
      headers,
      body: payload,
      credentials: 'include',
      redirect: 'error' // Don't follow redirects automatically
    });
  } catch (err) {
    if (err.message === 'Request timeout') {
      const error = new Error('Request timeout. The server is not responding.');
      error.code = 'TIMEOUT';
      error.retryable = true;
      throw error;
    }
    const error = new Error('Network error. Please check your connection.');
    error.code = 'NETWORK_ERROR';
    error.retryable = true;
    throw error;
  }

  let data;
  const text = await res.text();

  // Check for redirect responses
  if (isRedirectResponse(text)) {
    const error = new Error('Server connection issue. Please try again.');
    error.code = 'REDIRECT_ERROR';
    error.status = res.status;
    error.retryable = true;
    throw error;
  }

  try {
    data = text ? JSON.parse(text) : {};
  } catch (parseErr) {
    console.error('Failed to parse response:', text);
    const error = new Error('Invalid response from server');
    error.code = 'PARSE_ERROR';
    error.status = res.status;
    error.retryable = false;
    throw error;
  }

  // Handle error responses
  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.code = data?.code || 'API_ERROR';
    error.data = data;
    error.retryable = res.status >= 500 || res.status === 408 || res.status === 429;
    throw error;
  }

  // Check if API response indicates failure
  if (data.success === false) {
    const error = new Error(data.message || 'Request failed');
    error.status = data.status || 400;
    error.code = data.code || 'API_ERROR';
    error.data = data;
    error.retryable = data.status >= 500;
    throw error;
  }

  return data;
}

export const api = {
  buildUrl,

  get: (path, opts = {}) => {
    const shouldRetry = opts.retries !== false;
    return shouldRetry
      ? requestWithRetry('GET', path, opts)
      : request('GET', path, opts);
  },

  post: (path, bodyOrOpts, maybeOpts) => {
    const opts = maybeOpts || {};
    const shouldRetry = opts.retries !== false;

    if (bodyOrOpts instanceof FormData) {
      return shouldRetry
        ? requestWithRetry('POST', path, { ...opts, formData: bodyOrOpts })
        : request('POST', path, { ...opts, formData: bodyOrOpts });
    }

    if (maybeOpts) {
      return shouldRetry
        ? requestWithRetry('POST', path, { ...maybeOpts, body: bodyOrOpts })
        : request('POST', path, { ...maybeOpts, body: bodyOrOpts });
    }

    return shouldRetry
      ? requestWithRetry('POST', path, { body: bodyOrOpts })
      : request('POST', path, { body: bodyOrOpts });
  },

  put: (path, bodyOrOpts, maybeOpts = {}) => {
    const shouldRetry = maybeOpts.retries !== false;
    return shouldRetry
      ? requestWithRetry('PUT', path, { ...maybeOpts, body: bodyOrOpts })
      : request('PUT', path, { ...maybeOpts, body: bodyOrOpts });
  },

  del: (path, opts = {}) => {
    const shouldRetry = opts.retries !== false;
    return shouldRetry
      ? requestWithRetry('DELETE', path, opts)
      : request('DELETE', path, opts);
  }
};
