<template>
  <div class="container" style="max-width: 420px;">
    <div class="card shadow-sm border-0">
      <div class="card-body p-4">
        <h4 class="card-title mb-1">Welcome Back</h4>
        <p class="text-muted small mb-4">Sign in to your iSkillBiz account</p>
        <form @submit.prevent="submit" novalidate>
          <div class="mb-3">
            <label class="form-label">Phone</label>
            <input v-model.trim="form.phone" class="form-control" required placeholder="+10000000001" />
            <small class="form-text text-muted">e.g., +10000000001</small>
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input v-model="form.password" class="form-control" type="password" required />
          </div>
          <button class="btn btn-primary w-100" :disabled="loading">{{ loading ? 'Signing in…' : 'Sign In' }}</button>
          <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
        </form>
        <hr />
        <p class="text-center mb-0">
          Don't have an account? <RouterLink to="/register" class="link-primary">Create one</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const form = reactive({ phone: '', password: '' });

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(form);
    router.push('/');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>
