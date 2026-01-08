<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="card-title">My Profile</h3>
        <button class="btn btn-outline-secondary btn-sm" @click="load" :disabled="loading">Refresh</button>
      </div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="user" class="row g-3">
        <div class="col-md-6">
          <p class="mb-1"><strong>Phone:</strong> {{ user.phone }}</p>
          <p class="mb-1"><strong>Name:</strong> {{ user.name }}</p>
          <p class="mb-1"><strong>Email:</strong> {{ user.email }}</p>
          <p class="mb-1"><strong>Roles:</strong>
            <span v-for="r in user.roles" :key="r" class="badge bg-secondary me-1">{{ r }}</span>
          </p>
          <p class="mb-1"><strong>Permissions:</strong>
            <span v-for="p in user.permissions" :key="p" class="badge bg-light text-dark border me-1">{{ p }}</span>
          </p>
        </div>
        <div class="col-md-6">
          <div v-if="user.photo" class="mb-3">
            <img :src="user.photo" alt="avatar" class="img-fluid rounded" style="max-height: 180px;" />
          </div>
          <form @submit.prevent="upload" class="border rounded p-3 bg-light">
            <label class="form-label">Upload photo</label>
            <input type="file" class="form-control" @change="onFile" accept="image/*" />
            <button class="btn btn-primary w-100 mt-2" type="submit" :disabled="!file || uploading">{{ uploading ? 'Uploading...' : 'Upload' }}</button>
            <div v-if="msg" class="alert alert-success mt-2">{{ msg }}</div>
            <div v-if="error" class="alert alert-danger mt-2">{{ error }}</div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { api } from '../composables/useApi';

const auth = useAuthStore();
const user = auth.user;
const loading = ref(false);
const uploading = ref(false);
const file = ref(null);
const msg = ref('');
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    await auth.fetchMe();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function onFile(e) {
  file.value = e.target.files[0];
}

async function upload() {
  if (!file.value) return;
  uploading.value = true;
  msg.value = '';
  error.value = '';
  try {
    const form = new FormData();
    form.append('photo', file.value);
    const res = await api.post(`/users/${user.value.id}/photo`, form, { token: auth.token.value });
    user.value = res.data.user;
    msg.value = 'Photo updated';
  } catch (err) {
    error.value = err.message;
  } finally {
    uploading.value = false;
  }
}

onMounted(load);
</script>

