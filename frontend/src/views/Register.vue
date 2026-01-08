<template>
  <div class="container" style="max-width: 560px;">
    <div class="card shadow-sm border-0">
      <div class="card-body p-4">
        <h4 class="card-title mb-1">Create Account</h4>
        <p class="text-muted small mb-4">Join iSkillBiz and start managing your workspace</p>
        <form @submit.prevent="submit" novalidate>
          <div class="row g-2">
            <div class="col-md-6">
              <label class="form-label">Phone *</label>
              <input v-model="form.phone" class="form-control" required placeholder="+10000000001" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Password *</label>
              <input v-model="form.password" type="password" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Full Name</label>
              <input v-model="form.name" class="form-control" placeholder="John Doe" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-control" placeholder="john@example.com" />
            </div>
          </div>
          <button class="btn btn-primary w-100 mt-3" :disabled="loading">{{ loading ? 'Creating…' : 'Create Account' }}</button>
          <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
        </form>
        <hr />
        <p class="text-center mb-0">
          Already have an account? <RouterLink to="/login" class="link-primary">Sign In</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { RouterLink } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const form = reactive({ phone: '', password: '', name: '', email: '' });

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    await auth.register(form);
    router.push('/');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>
