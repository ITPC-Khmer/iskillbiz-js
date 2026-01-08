<template>
  <div class="card shadow-sm mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h3 class="card-title mb-0">Users (admin / super_admin)</h3>
        <button class="btn btn-outline-secondary btn-sm" @click="load" :disabled="loading">Reload</button>
      </div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="table-responsive" v-if="users.length">
        <table class="table table-sm align-middle">
          <thead class="table-light"><tr><th>Phone</th><th>Name</th><th>Email</th><th>Roles</th><th></th></tr></thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.phone }}</td>
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td><span v-for="r in u.roles" :key="r" class="badge bg-secondary me-1">{{ r }}</span></td>
              <td><button class="btn btn-link btn-sm" @click="select(u)">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="card shadow-sm">
    <div class="card-body">
      <h4 class="card-title">{{ form.id ? 'Update User' : 'Create User' }}</h4>
      <form @submit.prevent="submit" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Phone</label>
          <input v-model="form.phone" class="form-control" required />
        </div>
        <div class="col-md-6">
          <label class="form-label">Password</label>
          <input v-model="form.password" :required="!form.id" type="password" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Name</label>
          <input v-model="form.name" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="form-control" />
        </div>
        <div class="col-12">
          <label class="form-label">Roles (comma separated)</label>
          <input v-model="rolesInput" class="form-control" placeholder="admin,client" />
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
const users = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const formError = ref('');
const msg = ref('');
const rolesInput = ref('');
const form = reactive({ id: '', phone: '', password: '', name: '', email: '' });

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get('/users', { token: auth.token.value });
    users.value = res.data.users;
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
    const roles = rolesInput.value ? rolesInput.value.split(',').map((r) => r.trim()).filter(Boolean) : undefined;
    if (form.id) {
      const res = await api.put(`/users/${form.id}`, { ...form, roles }, { token: auth.token.value });
      msg.value = 'Updated';
      users.value = users.value.map((u) => (u.id === form.id ? res.data.user : u));
    } else {
      const res = await api.post('/users', { ...form, roles }, { token: auth.token.value });
      msg.value = 'Created';
      users.value.push(res.data.user);
    }
    reset();
  } catch (err) {
    formError.value = err.message;
  } finally {
    saving.value = false;
  }
}

function select(u) {
  form.id = u.id;
  form.phone = u.phone;
  form.password = '';
  form.name = u.name || '';
  form.email = u.email || '';
  rolesInput.value = (u.roles || []).join(',');
}

function reset() {
  form.id = '';
  form.phone = '';
  form.password = '';
  form.name = '';
  form.email = '';
  rolesInput.value = '';
}

load();
</script>

