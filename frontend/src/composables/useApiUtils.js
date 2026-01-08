/**
 * Frontend API Utilities & Interceptors
 * Handles: Error recovery, Cloudflare redirects, Request queuing
 */

import { API_BASE, api } from './useApi';

/**
 * Request queue to prevent race conditions
 */
class RequestQueue {
  constructor() {
    this.queue = new Map();
  }

  /**
   * Get cached request (avoid duplicate concurrent requests)
   */
  getKey(method, path, token) {
    return `${method}:${path}:${token || 'anon'}`;
  }

  /**
   * Queue a request (deduplicate if already in flight)
   */
  async execute(method, path, options) {
    const key = this.getKey(method, path, options?.token);

    // If already queued, return that promise
    if (this.queue.has(key)) {
      return this.queue.get(key);
    }

    // Create new request promise
    let resolveRequest, rejectRequest;
    const promise = new Promise((resolve, reject) => {
      resolveRequest = resolve;
      rejectRequest = reject;
    });

    // Store in queue
    this.queue.set(key, promise);

    try {
      const result = await executeRequest(method, path, options);
      resolveRequest(result);
      return result;
    } catch (err) {
      rejectRequest(err);
      throw err;
    } finally {
      // Remove from queue after completion
      this.queue.delete(key);
    }
  }
}

const requestQueue = new RequestQueue();

/**
 * Execute request with error recovery
 */
async function executeRequest(method, path, options) {
  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      let result;

      switch (method.toUpperCase()) {
        case 'GET':
          result = await api.get(path, options);
          break;
        case 'POST':
          if (options.formData) {
            result = await api.post(path, options.formData, options);
          } else {
            result = await api.post(path, options.body, options);
          }
          break;
        case 'PUT':
          result = await api.put(path, options.body, options);
          break;
        case 'DELETE':
          result = await api.del(path, options);
          break;
        default:
          throw new Error(`Unknown method: ${method}`);
      }

      return result;
    } catch (err) {
      lastError = err;

      // Check if error is retryable
      if (!isRetryableError(err)) {
        throw err;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        throw err;
      }

      // Wait before retrying (exponential backoff)
      const delay = 1000 * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Check if error is retryable
 */
function isRetryableError(error) {
  // Network errors are retryable
  if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
    return true;
  }

  // Cloudflare/redirect errors are retryable
  if (error.code === 'REDIRECT_ERROR') {
    return true;
  }

  // 5xx server errors are retryable
  if (error.status >= 500) {
    return true;
  }

  // Rate limit (429) and unavailable (503) are retryable
  if ([408, 429, 503, 504].includes(error.status)) {
    return true;
  }

  return false;
}

/**
 * Format error message for display
 */
function formatErrorMessage(error) {
  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  if (error.data?.message) {
    return error.data.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Get error type for UI handling
 */
function getErrorType(error) {
  if (error.code === 'REDIRECT_ERROR') {
    return 'redirect';
  }
  if (error.code === 'NETWORK_ERROR') {
    return 'network';
  }
  if (error.code === 'TIMEOUT') {
    return 'timeout';
  }
  if (error.status === 401) {
    return 'unauthorized';
  }
  if (error.status === 403) {
    return 'forbidden';
  }
  if (error.status === 404) {
    return 'not_found';
  }
  if (error.status >= 500) {
    return 'server_error';
  }
  return 'client_error';
}

/**
 * Check if API is healthy
 */
async function checkApiHealth() {
  try {
    const result = await api.get('/health', { retries: false });
    return {
      healthy: result.success !== false,
      timestamp: new Date()
    };
  } catch (err) {
    return {
      healthy: false,
      error: formatErrorMessage(err),
      timestamp: new Date()
    };
  }
}

export {
  requestQueue,
  executeRequest,
  isRetryableError,
  formatErrorMessage,
  getErrorType,
  checkApiHealth
};

