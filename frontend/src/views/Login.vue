<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="welcome-icon">👋</div>
        <h2 class="login-title">Welcome Back</h2>
        <p class="login-subtitle">Sign in to continue to iSkillBiz</p>
      </div>

      <form @submit.prevent="submit" class="login-form">
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🪪</span>
            Phone, Email, or Username
          </label>
          <input
            v-model.trim="form.identifier"
            class="form-input"
            type="text"
            required
            placeholder="+10000000001 or user@example.com or username"
            autocomplete="username"
          />
          <small class="form-hint">Use your phone number, email address, or username</small>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🔒</span>
            Password
          </label>
          <div class="password-input-wrapper">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              required
              autocomplete="current-password"
              placeholder="Enter your password"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :title="showPassword ? 'Hide password' : 'Show password'"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="loading"
        >
          <span v-if="loading" class="btn-spinner"></span>
          <span v-else class="btn-icon">🚀</span>
          <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
        </button>

        <div v-if="error" class="error-alert">
          <span class="alert-icon">⚠️</span>
          <span>{{ error }}</span>
        </div>
      </form>

      <div class="login-footer">
        <div class="divider">
          <span>OR</span>
        </div>
        <p class="footer-text">
          Don't have an account?
          <RouterLink to="/register" class="footer-link">Create one</RouterLink>
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
const showPassword = ref(false);
const form = reactive({ identifier: '', password: '' });

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(form);
    router.push('/');
  } catch (err) {
    error.value = err.message || 'Failed to sign in. Please check your credentials.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.login-card {
  background: white;
  border-radius: 24px;
  padding: 3rem 2.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.welcome-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: wave 2s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-20deg); }
}

.login-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
}

.label-icon {
  font-size: 1.2rem;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-hint {
  color: #64748b;
  font-size: 0.8rem;
  margin-top: -0.25rem;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: transform 0.2s ease;
}

.password-toggle:hover {
  transform: translateY(-50%) scale(1.1);
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.9rem;
}

.alert-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.login-footer {
  margin-top: 2rem;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #94a3b8;
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider span {
  padding: 0 1rem;
  font-weight: 500;
}

.footer-text {
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.footer-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 1.75rem;
  }

  .welcome-icon {
    font-size: 3rem;
  }
}
</style>
