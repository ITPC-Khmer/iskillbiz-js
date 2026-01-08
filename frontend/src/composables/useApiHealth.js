/**
 * Global API Interceptor & Health Monitor
 * Handles Cloudflare redirects, server health checks, and connection recovery
 */

import { ref } from 'vue';
import { api } from './useApi';

const isApiHealthy = ref(true);
const lastHealthCheck = ref(null);
const healthCheckInterval = ref(null);
const connectionAttempts = ref(0);

/**
 * Check API health and detect Cloudflare issues
 */
async function checkApiHealth() {
  try {
    // Try a simple GET request to verify API is working
    const response = await fetch(`${api.buildUrl('/health')}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });

    const text = await response.text();

    // Check if we got HTML response (Cloudflare redirect)
    if (text.includes('<!DOCTYPE') || text.includes('cdn-cgi')) {
      isApiHealthy.value = false;
      console.warn('[API Health] Cloudflare/redirect detected');
      return false;
    }

    // Try to parse as JSON
    try {
      JSON.parse(text);
      isApiHealthy.value = true;
      connectionAttempts.value = 0;
      lastHealthCheck.value = new Date();
      return true;
    } catch {
      isApiHealthy.value = false;
      console.warn('[API Health] Invalid JSON response');
      return false;
    }
  } catch (err) {
    isApiHealthy.value = false;
    console.warn('[API Health] Health check failed:', err.message);
    return false;
  }
}

/**
 * Start periodic health monitoring
 */
function startHealthMonitoring(intervalMs = 30000) {
  // Clear existing interval
  if (healthCheckInterval.value) {
    clearInterval(healthCheckInterval.value);
  }

  // Run initial check
  checkApiHealth();

  // Set up periodic checks
  healthCheckInterval.value = setInterval(() => {
    checkApiHealth();
  }, intervalMs);
}

/**
 * Stop health monitoring
 */
function stopHealthMonitoring() {
  if (healthCheckInterval.value) {
    clearInterval(healthCheckInterval.value);
    healthCheckInterval.value = null;
  }
}

/**
 * Setup global request interceptor
 */
function setupInterceptors() {
  // Monkey-patch fetch to intercept all requests
  const originalFetch = window.fetch;

  window.fetch = async function(...args) {
    const [resource, options] = args;

    try {
      const response = await originalFetch.apply(this, args);

      // Check for Cloudflare redirects
      const contentType = response.headers.get('content-type');
      const isHtml = contentType?.includes('text/html');

      if (response.status === 200 && isHtml) {
        // Likely a Cloudflare error page
        console.warn('[Fetch Interceptor] Detected potential Cloudflare redirect');
        isApiHealthy.value = false;
      } else if (response.ok) {
        // Request succeeded
        isApiHealthy.value = true;
        connectionAttempts.value = 0;
      }

      return response;
    } catch (err) {
      // Network error
      connectionAttempts.value++;
      isApiHealthy.value = false;
      console.error('[Fetch Interceptor] Network error:', err.message);
      throw err;
    }
  };
}

/**
 * Wait for API to become healthy with exponential backoff
 */
async function waitForApiHealth(maxWaitMs = 30000) {
  const startTime = Date.now();
  let backoffMs = 1000;

  while (Date.now() - startTime < maxWaitMs) {
    const healthy = await checkApiHealth();

    if (healthy) {
      return true;
    }

    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, backoffMs));
    backoffMs = Math.min(backoffMs * 2, 5000); // Max 5 seconds
  }

  return false;
}

/**
 * Get API status info
 */
function getApiStatus() {
  return {
    healthy: isApiHealthy.value,
    lastCheck: lastHealthCheck.value,
    connectionAttempts: connectionAttempts.value,
    isMonitoring: !!healthCheckInterval.value
  };
}

/**
 * Reset API health status
 */
function resetApiHealth() {
  isApiHealthy.value = true;
  connectionAttempts.value = 0;
  lastHealthCheck.value = null;
}

export {
  isApiHealthy,
  lastHealthCheck,
  connectionAttempts,
  checkApiHealth,
  startHealthMonitoring,
  stopHealthMonitoring,
  setupInterceptors,
  waitForApiHealth,
  getApiStatus,
  resetApiHealth
};

