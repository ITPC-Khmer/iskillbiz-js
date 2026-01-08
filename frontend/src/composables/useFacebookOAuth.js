import { ref } from 'vue';
import { api } from './useApi';
import { useAuthStore } from '../stores/auth';

/**
 * Facebook OAuth composable
 */
export function useFacebookOAuth() {
  const auth = useAuthStore();
  const loading = ref(false);
  const error = ref(null);

  const withAuth = (opts = {}) => ({ ...opts, token: auth.token?.value || auth.token || '' });

  const run = async (fn) => {
    loading.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (err) {
      error.value = err?.message || 'OAuth error';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get Facebook OAuth URL
   */
  const getOAuthUrl = () =>
    run(() => api.get('/facebook/oauth/url', withAuth()));

  /**
   * Handle OAuth callback with code
   */
  const handleCallback = (code, state) =>
    run(() => api.post('/facebook/oauth/callback', { code, state }, withAuth()));

  /**
   * Extend short-lived token to long-lived
   */
  const extendToken = (accessToken) =>
    run(() => api.post('/facebook/oauth/extend-token', { access_token: accessToken }, withAuth()));

  /**
   * Redirect to Facebook OAuth (full page redirect)
   */
  const redirectToOAuth = async () => {
    try {
      const res = await getOAuthUrl();
      const oauthUrl = res?.url || res?.data?.url;

      if (!oauthUrl) {
        throw new Error('Failed to get OAuth URL');
      }

      // Full page redirect to Facebook OAuth
      window.location.href = oauthUrl;
    } catch (err) {
      error.value = err?.message || 'Failed to redirect to OAuth';
      throw err;
    }
  };

  /**
   * Open Facebook OAuth in popup (alternative method)
   */
  const openOAuthPopup = async () => {
    try {
      const res = await getOAuthUrl();
      const oauthUrl = res?.url || res?.data?.url;

      if (!oauthUrl) {
        throw new Error('Failed to get OAuth URL');
      }

      // Open popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        oauthUrl,
        'Facebook OAuth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      return new Promise((resolve, reject) => {
        // Poll for popup close
        const pollTimer = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(pollTimer);
            // Check URL params for success/error after popup closes
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('success')) {
              resolve({ success: true, account_id: urlParams.get('account_id') });
            } else if (urlParams.get('error')) {
              reject(new Error(urlParams.get('error')));
            } else {
              reject(new Error('OAuth popup closed'));
            }
          }
        }, 500);
      });
    } catch (err) {
      error.value = err?.message || 'Failed to open OAuth popup';
      throw err;
    }
  };

  return {
    loading,
    error,
    getOAuthUrl,
    handleCallback,
    extendToken,
    redirectToOAuth,
    openOAuthPopup
  };
}

