<template>
  <div class="card shadow-sm mb-3 header-card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div class="flex-grow-1">
          <div class="mb-2">
            <span class="badge bg-primary fw-semibold">🔐 Permissions</span>
          </div>
          <h4 class="card-title mb-1 fw-bold">Permissions Management</h4>
          <p class="text-muted small mb-0">Super_admin only — Create and manage permissions to define what users can do</p>
        </div>
        <div class="gap-2 d-flex ms-3">
          <button class="btn btn-primary btn-sm" @click="openCreate" title="Create new permission" style="width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px;">
            <span style="font-size: 1.2rem;">➕</span>
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="load" :disabled="loading" title="Reload permissions" style="width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px;">
            <span style="font-size: 1rem;">🔄</span>
          </button>
        </div>
      </div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="table-responsive" v-if="permissions.length">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th style="width: 100px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in permissions" :key="p.id">
              <td><strong>{{ p.name }}</strong></td>
              <td>{{ p.description }}</td>
              <td><button class="btn btn-link btn-sm p-0" @click="select(p)">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-muted text-center py-4">No permissions yet</div>
    </div>
  </div>

  <RightDrawer ref="drawer" :title="form.id ? 'Update Permission' : 'Create Permission'">
    <form @submit.prevent="submit" class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Name</label>
        <input v-model="form.name" class="form-control" required />
      </div>
      <div class="col-md-6">
        <label class="form-label">Description</label>
        <input v-model="form.description" class="form-control" />
      </div>
      <div class="col-12 d-flex gap-2">
        <button class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving...' : (form.id ? 'Update' : 'Create') }}</button>
        <button type="button" class="btn btn-outline-secondary" @click="reset">Reset</button>
      </div>
      <div class="col-12" v-if="msg">
        <div class="alert alert-success mb-0">{{ msg }}</div>
      </div>
      <div class="col-12" v-if="formError">
        <div class="alert alert-danger mb-0">{{ formError }}</div>
      </div>
    </form>
  </RightDrawer>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { api } from '../composables/useApi';
import { useAuthStore } from '../stores/auth';
import RightDrawer from '../components/RightDrawer.vue';

const auth = useAuthStore();
const permissions = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const formError = ref('');
const msg = ref('');
const form = reactive({ id: '', name: '', description: '' });
const drawer = ref(null);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get('/permissions', { token: auth.token.value });
    permissions.value = res.data.permissions;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function submit() {
  saving.value = true;
  formError.value = '';
  msg.value = '';
  try {
    if (form.id) {
      const res = await api.put(`/permissions/${form.id}`, form, { token: auth.token.value });
      permissions.value = permissions.value.map((p) => (p.id === form.id ? res.data.permission : p));
      msg.value = 'Updated';
    } else {
      const res = await api.post('/permissions', form, { token: auth.token.value });
      permissions.value.push(res.data.permission);
      msg.value = 'Created';
    }
    reset();
  } catch (err) {
    formError.value = err.message;
  } finally {
    saving.value = false;
  }
}

function select(p) {
  form.id = p.id;
  form.name = p.name;
  form.description = p.description || '';
  drawer.value?.open();
}

function reset() {
  form.id = '';
  form.name = '';
  form.description = '';
}

load();
</script>
