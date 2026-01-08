<template>
  <div class="row g-3">
    <!-- Header Card -->
    <div class="col-12">
      <div class="card border-0 shadow-sm bg-light p-4 header-card">
        <div class="mb-2">
          <span class="badge bg-primary fw-semibold">👤 Profile</span>
        </div>
        <h2 class="mb-1 fw-bold">My Profile</h2>
        <p class="text-muted mb-0">Manage your account, view permissions, and upload your photo</p>
      </div>
    </div>

    <div v-if="loadError" class="col-12">
      <div class="alert alert-danger">{{ loadError }}</div>
    </div>

    <div v-if="loading" class="col-12">
      <div class="text-center text-muted py-5">
        <div class="spinner-border spinner-border-sm mb-2" role="status">
          <span class="visually-hidden">Loading…</span>
        </div>
        <p>Loading your profile…</p>
      </div>
    </div>

    <template v-else-if="hasUser">
      <!-- Profile Info Card -->
      <div class="col-md-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-sm-6">
                <p class="text-muted small mb-1">Full Name</p>
                <p class="mb-2"><strong>{{ user.name || '—' }}</strong></p>
                <p class="text-muted small mb-1">Phone</p>
                <p class="mb-2"><strong>{{ user.phone }}</strong></p>
                <p class="text-muted small mb-1">Email</p>
                <p class="mb-2"><strong>{{ user.email || '—' }}</strong></p>
              </div>
              <div class="col-sm-6">
                <p class="text-muted small mb-1">Gender</p>
                <p class="mb-2"><strong>{{ user.gender || '—' }}</strong></p>
                <p class="text-muted small mb-1">Date of Birth</p>
                <p class="mb-2"><strong>{{ user.dob || '—' }}</strong></p>
                <p class="text-muted small mb-1">Bio</p>
                <p class="mb-0"><strong class="text-break">{{ user.bio || '—' }}</strong></p>
              </div>
            </div>
          </div>
        </div>

        <!-- Roles & Permissions -->
        <div class="card border-0 shadow-sm mt-3">
          <div class="card-body">
            <h5 class="card-title">🔐 Roles & Permissions</h5>
            <p class="mb-2"><strong>Roles:</strong></p>
            <div class="mb-3">
              <span v-for="r in user.roles" :key="r" class="badge bg-secondary me-1 mb-1">{{ r }}</span>
            </div>
            <p class="mb-2"><strong>Permissions:</strong></p>
            <div>
              <span v-for="p in user.permissions" :key="p" class="badge bg-light text-dark border me-1 mb-1">{{ p }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Photo Upload Card -->
      <div class="col-md-4">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <h5 class="card-title mb-3">📸 Photo</h5>
            <div v-if="photoUrl" class="mb-3">
              <img :src="photoUrl" alt="avatar" class="img-fluid rounded" style="max-height: 200px; object-fit: cover;" />
            </div>
            <div v-else class="mb-3">
              <div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 200px;">
                <div class="text-muted">
                  <p class="mb-1">📷</p>
                  <small>No photo yet</small>
                </div>
              </div>
            </div>
            <form @submit.prevent="upload" class="mt-3">
              <input type="file" class="form-control form-control-sm mb-2" @change="onFile" accept="image/*" />
              <button class="btn btn-primary w-100 btn-sm" type="submit" :disabled="!file || uploading">
                {{ uploading ? 'Uploading…' : 'Upload Photo' }}
              </button>
              <div v-if="msg" class="alert alert-success alert-sm mt-2 mb-0">{{ msg }}</div>
              <div v-if="uploadError" class="alert alert-danger alert-sm mt-2 mb-0">{{ uploadError }}</div>
            </form>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="col-12">
      <div class="alert alert-info">Profile is not loaded yet. Click Refresh to load your details.</div>
    </div>
  </div>
</template>

<script setup>
import { API_BASE } from '../composables/useApi';
import { onMounted, ref, computed, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { api } from '../composables/useApi';

const auth = useAuthStore();
const loading = ref(false);
const uploading = ref(false);
const file = ref(null);
const msg = ref('');
const loadError = ref('');
const uploadError = ref('');

// Direct use of store user without double-wrapping
const hasUser = computed(() => !!(auth.user && auth.user.id));
const user = computed(() => auth.user || {});

const photoUrl = computed(() => {
  if (!auth.user || !auth.user.photo) return '';
  if (auth.user.photo.startsWith('http')) return auth.user.photo;
  return API_BASE.replace(/\/$/, '') + auth.user.photo;
});

async function load() {
  loading.value = true;
  loadError.value = '';
  try {
    console.log('[Me] load() calling fetchMe...');
    await auth.fetchMe();
    console.log('[Me] load() complete, user:', auth.user);
  } catch (err) {
    console.error('[Me] load() error:', err);
    loadError.value = err.message;
    if (auth.token.value) {
      try {
        await auth.fetchMe();
        loadError.value = '';
      } catch {}
    }
  } finally {
    loading.value = false;
  }
}

function onFile(e) {
  file.value = e.target.files[0] || null;
}

async function upload() {
  if (!file.value) return;
  if (!hasUser.value) {
    uploadError.value = 'User not loaded yet. Please refresh and try again.';
    return;
  }
  uploading.value = true;
  msg.value = '';
  uploadError.value = '';
  try {
    const form = new FormData();
    form.append('photo', file.value);
    const res = await api.post(`/users/${auth.user.id}/photo`, form, { token: auth.token.value });
    // Normalize and assign to the ref value
    auth.user.value = auth.normalizeUser ? auth.normalizeUser(res.data.user) : res.data.user;
    msg.value = 'Photo updated';
  } catch (err) {
    uploadError.value = err.message;
  } finally {
    uploading.value = false;
  }
}

onMounted(async () => {
  console.log('[Me] onMounted, token:', auth.token.value, 'user:', auth.user);
  if (auth.token.value && !hasUser.value) {
    await load();
  }
});

watch(() => auth.token.value, async (val, oldVal) => {
  console.log('[Me] token watch changed from', oldVal, 'to', val);
  if (val && !hasUser.value) {
    await load();
  }
});
</script>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 400% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
}
@keyframes shimmer {
  0% { background-position: 0% 0; }
  100% { background-position: -135% 0; }
}

.header-card {
  border-radius: 10px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
}

.header-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06) !important;
}

.btn-outline-secondary:hover {
  transform: scale(1.05);
  transition: all 0.2s ease;
}
</style>
