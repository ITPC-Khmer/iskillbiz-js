import { ref } from 'vue';
import { api } from './useApi';
import { useAuthStore } from '../stores/auth';

/**
 * Facebook API client for the frontend
 * Wraps backend Facebook endpoints with token handling and small helpers.
 */
export function useFacebook() {
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
      error.value = err?.message || 'Facebook API error';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Accounts & Pages
  const connectAccount = (accessToken) =>
    run(() => api.post('/facebook/connect', { access_token: accessToken }, withAuth()));

  const getAccounts = () => run(() => api.get('/facebook/accounts', withAuth()));

  const syncPages = (accountId) =>
    run(() => api.post(`/facebook/accounts/${accountId}/sync-pages`, null, withAuth()));

  const getPages = () => run(() => api.get('/facebook/pages', withAuth()));

  // Conversations & Messages
  const syncConversations = (pageId) =>
    run(() => api.post(`/facebook/pages/${pageId}/sync-conversations`, null, withAuth()));

  const getConversations = (pageId, { status, isAnswered } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (isAnswered !== undefined) params.set('is_answered', isAnswered);
    const query = params.toString() ? `?${params.toString()}` : '';
    return run(() => api.get(`/facebook/pages/${pageId}/conversations${query}`, withAuth()));
  };

  const getUnanswered = (pageId, hours = 24) =>
    run(() => api.get(`/facebook/pages/${pageId}/conversations/unanswered?hours=${hours}`, withAuth()));

  const syncMessages = (conversationId) =>
    run(() => api.post(`/facebook/conversations/${conversationId}/sync-messages`, null, withAuth()));

  // Note: backend expects internal conversation id for GET messages
  const getMessages = (conversationId) =>
    run(() => api.get(`/facebook/conversations/${conversationId}/messages`, withAuth()));

  const sendMessage = (pageId, { recipient_id, message }) =>
    run(() => api.post(`/facebook/pages/${pageId}/send-message`, { recipient_id, message }, withAuth()));

  // Contacts
  const getContacts = (pageId) =>
    run(() => api.get(`/facebook/pages/${pageId}/contacts`, withAuth()));

  const updateContact = (contactId, payload) =>
    run(() => api.put(`/facebook/contacts/${contactId}`, payload, withAuth()));

  // Automations / Keywords / Away messages etc. could be added similarly if needed

  // Sync utilities
  const fullSync = (pageId) =>
    run(() => api.post(`/facebook/pages/${pageId}/full-sync-from-facebook`, null, withAuth()));

  const syncStatus = (pageId) =>
    run(() => api.get(`/facebook/pages/${pageId}/sync-status`, withAuth()));

  return {
    loading,
    error,
    connectAccount,
    getAccounts,
    syncPages,
    getPages,
    syncConversations,
    getConversations,
    getUnanswered,
    syncMessages,
    getMessages,
    sendMessage,
    getContacts,
    updateContact,
    fullSync,
    syncStatus,
  };
}
