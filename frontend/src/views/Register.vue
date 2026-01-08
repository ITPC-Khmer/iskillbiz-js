<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="welcome-icon">🎯</div>
        <h2 class="register-title">Create Account</h2>
        <p class="register-subtitle">
          Join iSkillBiz and start managing your workspace
        </p>
      </div>

      <form @submit.prevent="submit" class="register-form" novalidate>
        <div v-if="error" class="error-alert mb-3">
          <span class="alert-icon">⚠️</span>
          <span>{{ error }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="phone">
              <span class="label-icon">📱</span>
              Phone Number
            </label>
            <input
              id="phone"
              v-model.trim="form.phone"
              class="form-input"
              type="tel"
              placeholder="+10000000001"
              autocomplete="tel"
              autofocus
            />
            <div v-if="fieldErrors.phone" class="field-error">
              {{ fieldErrors.phone }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">
              <span class="label-icon">🔒</span>
              Password
              <span class="required">*</span>
            </label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                required
                autocomplete="new-password"
                placeholder="Create a password"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                {{ showPassword ? "👁️" : "👁️‍🗨️" }}
              </button>
            </div>
            <div v-if="fieldErrors.password" class="field-error">
              {{ fieldErrors.password }}
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="username">
              <span class="label-icon">🏷️</span>
              Username
            </label>
            <input
              id="username"
              v-model.trim="form.username"
              class="form-input"
              type="text"
              placeholder="username"
              autocomplete="username"
            />
            <div v-if="fieldErrors.username" class="field-error">
              {{ fieldErrors.username }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="name">
              <span class="label-icon">👤</span>
              Full Name
            </label>
            <input
              id="name"
              v-model.trim="form.name"
              class="form-input"
              type="text"
              placeholder="John Doe"
              autocomplete="name"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="email">
              <span class="label-icon">✉️</span>
              Email
            </label>
            <input
              id="email"
              v-model.trim="form.email"
              class="form-input"
              type="email"
              placeholder="john@example.com"
              autocomplete="email"
            />
            <div v-if="fieldErrors.email" class="field-error">
              {{ fieldErrors.email }}
            </div>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="btn-spinner"></span>
          <span v-else class="btn-icon">✨</span>
          <span>{{ loading ? "Creating account..." : "Create Account" }}</span>
        </button>
      </form>

      <div class="register-footer">
        <div class="divider">
          <span>OR</span>
        </div>
        <p class="footer-text">
          Already have an account?
          <RouterLink to="/login" class="footer-link">Sign In</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();
const loading = ref(false);
const error = ref("");
const showPassword = ref(false);
const fieldErrors = ref({ phone: "", email: "", username: "", password: "" });
const form = reactive({
  phone: "",
  email: "",
  username: "",
  password: "",
  name: "",
});

async function submit() {
  loading.value = true;
  error.value = "";
  fieldErrors.value = { phone: "", email: "", username: "", password: "" };

  // Basic client-side validation
  if (!form.phone && !form.email && !form.username) {
    const msg = "Please provide at least one of phone, email, or username.";
    fieldErrors.value.phone = msg;
    fieldErrors.value.email = msg;
    fieldErrors.value.username = msg;
  }

  if (!form.password || form.password.length < 6) {
    fieldErrors.value.password = "Password must be at least 6 characters.";
  }

  if (
    fieldErrors.value.phone ||
    fieldErrors.value.email ||
    fieldErrors.value.username ||
    fieldErrors.value.password
  ) {
    error.value = "Please fix the problems above.";
    loading.value = false;
    return;
  }

  try {
    await auth.register(form);
    router.push("/");
  } catch (err) {
    error.value = err.message || "Failed to create account. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  background: transparent;
}

.register-card {
  background: white;
  border-radius: 24px;
  padding: 2.25rem 1.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  overflow: visible;
}

.register-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.welcome-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.register-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.register-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(200px, 1fr));
  gap: 1rem 1.25rem;
}

/* If a row has a third field (e.g. username, name, email), make the 3rd item span full width
   so the layout becomes two columns on the first row and the last field on its own row. */
.form-row > .form-group:nth-child(3) {
  grid-column: 1 / -1;
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

.required {
  color: #ef4444;
  margin-left: 0.25rem;
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
  to {
    transform: rotate(360deg);
  }
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

.register-footer {
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
  content: "";
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

@media (max-width: 600px) {
  .register-card {
    padding: 2rem 1.5rem;
  }

  .register-title {
    font-size: 1.75rem;
  }

  .welcome-icon {
    font-size: 3rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
