<template>
  <div class="card shadow-sm mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h3 class="card-title mb-0">Roles (super_admin)</h3>
        <button class="btn btn-outline-secondary btn-sm" @click="load" :disabled="loading">Reload</button>
      </div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="table-responsive" v-if="roles.length">
        <table class="table table-sm align-middle">
          <thead class="table-light"><tr><th>Name</th><th>Description</th><th>Permissions</th><th></th></tr></thead>
          <tbody>
            <tr v-for="r in roles" :key="r.id">
              <td>{{ r.name }}</td>
              <td>{{ r.description }}</td>
              <td><span v-for="p in r.Permissions || []" :key="p.id" class="badge bg-secondary me-1">{{ p.name }}</span></td>
              <td><button class="btn btn-link btn-sm" @click="select(r)">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="card shadow-sm">
    <div class="card-body">
      <h4 class="card-title">{{ form.id ? 'Update Role' : 'Create Role' }}</h4>
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
          <label class="form-label">Permissions (comma names)</label>
          <input v-model="permsInput" class="form-control" />
        </div>
        <div class="col-12">
          <button class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving...' : (form.id ? 'Update' : 'Create') }}</button>
          <button type="button" class="btn btn-link" @click="reset">Reset</button>
        </div>
        <div class="col-12" v-if="msg">
          <div class="alert alert-success mb-0">{{ msg }}</div>
        </div>
        <div class="col-12" v-if="formError">
          <div class="alert alert-danger mb-0">{{ formError }}</div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { api } from '../composables/useApi';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const roles = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const formError = ref('');
const msg = ref('');
const permsInput = ref('');
const form = reactive({ id: '', name: '', description: '' });

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
    const permissions = permsInput.value ? permsInput.value.split(',').map((r) => r.trim()).filter(Boolean) : undefined;
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
  permsInput.value = (r.Permissions || []).map((p) => p.name).join(',');
}

function reset() {
  form.id = '';
  form.name = '';
  form.description = '';
  permsInput.value = '';
}

load();
</script>

