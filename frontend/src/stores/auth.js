import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { api } from '../composables/useApi';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '');
  const user = ref(null);

  watch(token, (val) => {
    if (val) localStorage.setItem('token', val);
    else localStorage.removeItem('token');
  });

  const isAuthed = computed(() => !!token.value);
  const roles = computed(() => (user.value?.roles) || []);
  const permissions = computed(() => (user.value?.permissions) || []);

  async function login(payload) {
    const res = await api.post('/auth/login', payload);
    token.value = res.data.token;
    user.value = res.data.user;
    return user.value;
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    token.value = res.data.token;
    user.value = res.data.user;
    return user.value;
  }

  async function fetchMe() {
    if (!token.value) return null;
    const res = await api.get('/auth/me', { token: token.value });
    user.value = res.data.user;
    return user.value;
  }

  function logout() {
    token.value = '';
    user.value = null;
  }

  return { token, user, isAuthed, roles, permissions, login, register, fetchMe, logout };
});

