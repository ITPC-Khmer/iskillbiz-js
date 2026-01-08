import { ref, computed, watch } from 'vue';
import { api } from './useApi';

const token = ref(localStorage.getItem('token') || '');
const user = ref(null);

watch(token, (val) => {
  if (val) localStorage.setItem('token', val);
  else localStorage.removeItem('token');
});

export function useAuth() {
  const isAuthed = computed(() => !!token.value);
  async function login(payload) {
    const res = await api.post('/auth/login', payload);
    token.value = res.data.token;
    user.value = res.data.user;
  }
  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    token.value = res.data.token;
    user.value = res.data.user;
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
  return { token, user, isAuthed, login, register, fetchMe, logout };
}

