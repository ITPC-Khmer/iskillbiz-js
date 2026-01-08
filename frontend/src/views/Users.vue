<template>
  <div class="card shadow-sm mb-3 header-card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div class="flex-grow-1">
          <div class="mb-2">
            <span class="badge bg-primary fw-semibold">👥 Users</span>
          </div>
          <h4 class="card-title mb-1 fw-bold">Users Management</h4>
          <p class="text-muted small mb-0">Admin and super_admin only — Create, edit, and manage user accounts and roles</p>
        </div>
        <div class="gap-2 d-flex ms-3">
          <button class="btn btn-primary btn-sm px-3" @click="openCreate">+ New User</button>
          <button class="btn btn-outline-secondary btn-sm" @click="load" :disabled="loading">Reload</button>
        </div>
      </div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="table-responsive" v-if="users.length">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Phone</th>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th style="width: 100px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td><strong>{{ u.phone }}</strong></td>
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td><span v-for="r in u.roles" :key="r" class="badge bg-secondary me-1">{{ r }}</span></td>
              <td><button class="btn btn-link btn-sm p-0" @click="select(u)">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-muted text-center py-4">No users yet</div>
    </div>
  </div>

  <RightDrawer ref="drawer" :title="form.id ? 'Update User' : 'Create User'">
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
        <label class="form-label">Roles</label>
        <div class="border rounded p-2">
          <div class="form-check" v-for="role in rolesList" :key="role.id">
            <input class="form-check-input" type="checkbox" :id="'role_' + role.id" :value="role.name" v-model="selectedRoles" />
            <label class="form-check-label" :for="'role_' + role.id">{{ role.name }}</label>
          </div>
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
const users = ref([]);
const rolesList = ref([]);
const selectedRoles = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const formError = ref('');
const msg = ref('');
const form = reactive({ id: '', phone: '', password: '', name: '', email: '' });
const drawer = ref(null);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [usersRes, rolesRes] = await Promise.all([
      api.get('/users', { token: auth.token.value }),
      api.get('/roles', { token: auth.token.value })
    ]);
    users.value = usersRes.data.users;
    rolesList.value = rolesRes.data.roles;
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
    const roles = selectedRoles.value.length ? selectedRoles.value : undefined;
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
  selectedRoles.value = (u.roles || []);
  drawer.value?.open();
}

function reset() {
  form.id = '';
  form.phone = '';
  form.password = '';
  form.name = '';
  form.email = '';
  selectedRoles.value = [];
}

function openCreate() {
  reset();
  drawer.value?.open();
}

load();
</script>
