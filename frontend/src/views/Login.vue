<template>
  <div class="container" style="max-width: 420px;">
    <div class="card shadow-sm">
      <div class="card-body">
        <h3 class="card-title mb-3">Login</h3>
        <form @submit.prevent="submit">
          <div class="mb-3">
            <label class="form-label">Phone</label>
            <input v-model="form.phone" class="form-control" required placeholder="+10000000001" />
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input v-model="form.password" class="form-control" type="password" required />
          </div>
          <button class="btn btn-primary w-100" :disabled="loading">{{ loading ? 'Loading...' : 'Login' }}</button>
          <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
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

