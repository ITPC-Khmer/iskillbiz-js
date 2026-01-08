import {defineStore} from 'pinia';
import {computed, ref, watch} from 'vue';
import {api} from '../composables/useApi';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '');

  // Initialize user from localStorage if available
  let storedUser = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) storedUser = JSON.parse(userStr);
  } catch (e) {
    // Ignore parse errors
  }
  const user = ref(storedUser);

  watch(token, (val) => {
    if (val) localStorage.setItem('token', val);
    else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  });

  // Persist user to localStorage
  watch(user, (val) => {
    if (val && val.id) {
      localStorage.setItem('user', JSON.stringify(val));
    } else {
      localStorage.removeItem('user');
    }
  });

  const isAuthed = computed(() => !!token.value);
  const roles = computed(() => (user.value?.roles) || []);
  const permissions = computed(() => (user.value?.permissions) || []);

  function normalizeUser(raw) {
    const u = raw || {};
    return {
      id: u.id,
      phone: u.phone || '',
      email: u.email ?? null,
      name: u.name || '',
      photo: u.photo ?? null,
      gender: u.gender ?? null,
      dob: u.dob ?? null,
      bio: u.bio ?? null,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      roles: Array.isArray(u.roles) ? u.roles : [],
      permissions: Array.isArray(u.permissions) ? u.permissions : []
    };
  }

  async function login(payload) {
    const res = await api.post('/auth/login', payload);
    token.value = res.data.token;
    user.value = normalizeUser(res.data.user);
    return user.value;
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    token.value = res.data.token;
    user.value = normalizeUser(res.data.user);
    return user.value;
  }

  async function fetchMe() {
    if (!token.value) return null;
    const res = await api.get('/auth/me', { token: token.value });
    user.value = normalizeUser(res.data.user);
    return user.value;
  }

  function logout() {
    token.value = '';
    user.value = null;
  }

  return { token, user, isAuthed, roles, permissions, login, register, fetchMe, logout, normalizeUser };
});
