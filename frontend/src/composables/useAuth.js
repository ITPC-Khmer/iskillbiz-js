import { ref, computed, watch } from 'vue';
import { api } from './useApi';

const token = ref(localStorage.getItem('token') || '');
const user = ref(null);
const isLoading = ref(false);
const error = ref(null);
const lastAuthCheck = ref(0);

// Auto-save token to localStorage
watch(token, (val) => {
  if (val) localStorage.setItem('token', val);
  else localStorage.removeItem('token');
});

/**
 * Extract user data from API response
 */
function extractUserData(response) {
  if (!response) return null;
  if (response.user) return response.user;
  if (response.data?.user) return response.data.user;
  return null;
}

/**
 * Extract token from API response
 */
function extractToken(response) {
  if (!response) return null;
  if (response.token) return response.token;
  if (response.data?.token) return response.data.token;
  return null;
}

export function useAuth() {
  const isAuthed = computed(() => !!token.value);

  /**
   * Login user
   */
  async function login(payload) {
    error.value = null;
    isLoading.value = true;

    try {
      const res = await api.post('/auth/login', payload);

      const newToken = extractToken(res);
      const newUser = extractUserData(res);

      if (!newToken) {
        throw new Error('No token received from server');
      }

      token.value = newToken;
      user.value = newUser;
      lastAuthCheck.value = Date.now();

      return { success: true, user: newUser };
    } catch (err) {
      error.value = err.message;
      console.error('Login error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Register user
   */
  async function register(payload) {
    error.value = null;
    isLoading.value = true;

    try {
      const res = await api.post('/auth/register', payload);

      const newToken = extractToken(res);
      const newUser = extractUserData(res);

      if (!newToken) {
        throw new Error('No token received from server');
      }

      token.value = newToken;
      user.value = newUser;
      lastAuthCheck.value = Date.now();

      return { success: true, user: newUser };
    } catch (err) {
      error.value = err.message;
      console.error('Register error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch current user profile
   */
  async function fetchMe() {
    if (!token.value) {
      user.value = null;
      return null;
    }

    error.value = null;

    try {
      const res = await api.get('/auth/me', { token: token.value });
      const userData = extractUserData(res);

      if (userData) {
        user.value = userData;
        lastAuthCheck.value = Date.now();
      }

      return userData;
    } catch (err) {
      console.error('Fetch me error:', err);

      // If 401, token is invalid
      if (err.status === 401) {
        logout();
        error.value = 'Session expired. Please login again.';
      } else {
        error.value = err.message;
      }

      return null;
    }
  }

  /**
   * Verify token is still valid (with caching)
   */
  async function verifyToken(force = false) {
    if (!token.value) return false;

    // Cache verification for 5 minutes
    const timeSinceCheck = Date.now() - lastAuthCheck.value;
    if (!force && timeSinceCheck < 5 * 60 * 1000) {
      return !!user.value;
    }

    try {
      const userData = await fetchMe();
      return !!userData;
    } catch {
      return false;
    }
  }

  /**
   * Logout user
   */
  function logout() {
    token.value = '';
    user.value = null;
    error.value = null;
    lastAuthCheck.value = 0;
  }

  /**
   * Clear error
   */
  function clearError() {
    error.value = null;
  }

  // Initialize - check if token is valid on first load
  if (token.value && !user.value) {
    fetchMe().catch(() => {
      logout();
    });
  }

  return {
    // State
    token,
    user,
    isAuthed,
    isLoading,
    error,

    // Methods
    login,
    register,
    fetchMe,
    logout,
    verifyToken,
    clearError
  };
}

