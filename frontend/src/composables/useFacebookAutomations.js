import { ref } from 'vue';
import { api } from './useApi';
import { useAuthStore } from '../stores/auth';

/**
 * Facebook Automations composable
 * Supports: create/list/update/delete automations, keywords, unanswered checks
 */
export function useFacebookAutomations() {
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
      error.value = err?.message || 'Automation error';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getAutomations = (pageId) =>
    run(() => api.get(`/facebook/pages/${pageId}/automations`, withAuth()));

  const createAutomation = (pageId, payload) =>
    run(() => api.post(`/facebook/pages/${pageId}/automations`, payload, withAuth()));

  const updateAutomation = (automationId, payload) =>
    run(() => api.put(`/facebook/automations/${automationId}`, payload, withAuth()));

  const deleteAutomation = (automationId) =>
    run(() => api.del(`/facebook/automations/${automationId}`, withAuth()));

  // Keywords
  const createKeyword = (automationId, payload) =>
    run(() => api.post(`/facebook/automations/${automationId}/keywords`, payload, withAuth()));

  const getKeywords = (automationId) =>
    run(() => api.get(`/facebook/automations/${automationId}/keywords`, withAuth()));

  const updateKeyword = (keywordId, payload) =>
    run(() => api.put(`/facebook/keywords/${keywordId}`, payload, withAuth()));

  const deleteKeyword = (keywordId) =>
    run(() => api.del(`/facebook/keywords/${keywordId}`, withAuth()));

  // Unanswered check
  const checkUnanswered = (pageId, hours = 24) =>
    run(() => api.get(`/facebook/pages/${pageId}/unanswered-check?hours=${hours}`, withAuth()));

  return {
    loading,
    error,
    getAutomations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    createKeyword,
    getKeywords,
    updateKeyword,
    deleteKeyword,
    checkUnanswered,
  };
}

