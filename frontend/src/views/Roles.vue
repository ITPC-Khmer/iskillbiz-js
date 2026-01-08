<template>
  <div class="card shadow-sm mb-3 header-card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div class="flex-grow-1">
          <div class="mb-2">
            <span class="badge bg-primary fw-semibold">🔑 Roles</span>
          </div>
          <h4 class="card-title mb-1 fw-bold">Roles Management</h4>
          <p class="text-muted small mb-0">Super_admin only — Define roles and assign permissions to control access levels</p>
        </div>
        <div class="gap-2 d-flex ms-3">
          <button class="btn btn-primary btn-sm" @click="openCreate" title="Create new role" style="width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px;">
            <span style="font-size: 1.2rem;">➕</span>
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="load" :disabled="loading" title="Reload roles" style="width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px;">
            <span style="font-size: 1rem;">🔄</span>
          </button>
        </div>
      </div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="table-responsive" v-if="roles.length">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Permissions</th>
              <th style="width: 100px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in roles" :key="r.id">
              <td><strong>{{ r.name }}</strong></td>
              <td>{{ r.description }}</td>
              <td><span v-for="p in r.Permissions || []" :key="p.id" class="badge bg-secondary me-1">{{ p.name }}</span></td>
              <td><button class="btn btn-link btn-sm p-0" @click="select(r)">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-muted text-center py-4">No roles yet</div>
    </div>
  </div>

  <RightDrawer ref="drawer" :title="form.id ? 'Update Role' : 'Create Role'">
    <form @submit.prevent="submit" class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Name</label>
        <input v-model="form.name" class="form-control" required />
      </div>
      <div class="col-md-6">
        <label class="form-label">Description</label>
        <input v-model="form.description" class="form-control" />
      </div>
      <div class="col-12">
        <label class="form-label">Permissions</label>
        <div class="table-responsive border rounded">
          <table class="table table-sm align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Action</th>
                <th class="text-center">Read</th>
                <th class="text-center">Create</th>
                <th class="text-center">Update</th>
                <th class="text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in permissionRows" :key="row.base">
                <td class="fw-semibold">{{ row.label }}</td>
                <td class="text-center"><input class="form-check-input" type="checkbox" :value="row.base + '_read'" v-model="selectedPerms" /></td>
                <td class="text-center"><input class="form-check-input" type="checkbox" :value="row.base + '_create'" v-model="selectedPerms" /></td>
                <td class="text-center"><input class="form-check-input" type="checkbox" :value="row.base + '_update'" v-model="selectedPerms" /></td>
                <td class="text-center"><input class="form-check-input" type="checkbox" :value="row.base + '_delete'" v-model="selectedPerms" /></td>
              </tr>
            </tbody>
          </table>
        </div>
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
const roles = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const formError = ref('');
const msg = ref('');
const form = reactive({ id: '', name: '', description: '' });
const drawer = ref(null);
const selectedPerms = ref([]);

const permissionRows = [
  { base: 'users', label: 'Users' },
  { base: 'roles', label: 'Roles' },
  { base: 'permissions', label: 'Permissions' },
  { base: 'content', label: 'Content' },
  { base: 'reports', label: 'Reports' }
];

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get('/roles', { token: auth.token.value });
    roles.value = res.data.roles;
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
    const permissions = selectedPerms.value.length ? selectedPerms.value : undefined;
    if (form.id) {
      const res = await api.put(`/roles/${form.id}`, { ...form, permissions }, { token: auth.token.value });
      roles.value = roles.value.map((r) => (r.id === form.id ? res.data.role : r));
      msg.value = 'Updated';
    } else {
      const res = await api.post('/roles', { ...form, permissions }, { token: auth.token.value });
      roles.value.push(res.data.role);
      msg.value = 'Created';
    }
    reset();
  } catch (err) {
    formError.value = err.message;
  } finally {
    saving.value = false;
  }
}

function select(r) {
  form.id = r.id;
  form.name = r.name;
  form.description = r.description || '';
  selectedPerms.value = (r.Permissions || []).map((p) => p.name);
  drawer.value?.open();
}

function reset() {
  form.id = '';
  form.name = '';
  form.description = '';
  selectedPerms.value = [];
}

function openCreate() {
  reset();
  drawer.value?.open();
}

load();
</script>
