<template>
  <div class="users-page">
    <div class="users-container">
      <!-- Header Card -->
      <div class="header-card">
        <div class="header-content">
          <div class="header-text">
            <div class="header-badge">
              <span class="badge-icon">👥</span>
              <span>Users Management</span>
            </div>
            <h2 class="header-title">Manage Users</h2>
            <p class="header-subtitle">
              Create, edit, and manage user accounts and their roles
            </p>
          </div>
          <div class="header-actions">
            <button
              class="action-btn create-btn"
              @click="openCreate"
              title="Create new user"
            >
              <span class="btn-icon">➕</span>
            </button>
            <button
              class="action-btn refresh-btn"
              @click="load"
              :disabled="loading"
              title="Reload users"
            >
              <span class="btn-icon" :class="{ spinning: loading }">🔄</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="error-alert">
        <span class="alert-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>

      <!-- Users Table Card -->
      <div class="table-card">
        <div v-if="loading && !users.length" class="loading-state">
          <div class="spinner"></div>
          <p>Loading users...</p>
        </div>

        <div v-else-if="users.length" class="table-container">
          <table class="modern-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Roles</th>
                <th class="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id" class="table-row">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">
                      {{ getUserInitials(u) }}
                    </div>
                    <div class="user-info">
                      <div class="user-name">{{ u.name || "Unnamed" }}</div>
                      <div class="user-phone">{{ u.phone }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="contact-cell">
                    <span v-if="u.email" class="email-text">{{ u.email }}</span>
                    <span v-else class="no-email">—</span>
                  </div>
                </td>
                <td>
                  <div class="roles-cell">
                    <span
                      v-if="u.roles && u.roles.length"
                      v-for="r in u.roles"
                      :key="r"
                      class="role-badge"
                      >{{ r }}</span
                    >
                    <span v-else class="no-roles">No roles</span>
                  </div>
                </td>
                <td>
                  <button class="edit-btn" @click="select(u)" title="Edit user">
                    <span class="edit-icon">✏️</span>
                    <span>Edit</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No Users Yet</h3>
          <p>Get started by creating your first user account</p>
          <button class="create-first-btn" @click="openCreate">
            <span>➕</span>
            <span>Create First User</span>
          </button>
        </div>
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
          <input
            v-model="form.password"
            :required="!form.id"
            type="password"
            class="form-control"
          />
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
              <input
                class="form-check-input"
                type="checkbox"
                :id="'role_' + role.id"
                :value="role.name"
                v-model="selectedRoles"
              />
              <label class="form-check-label" :for="'role_' + role.id">{{
                role.name
              }}</label>
            </div>
          </div>
        </div>
        <div class="col-12 d-flex gap-2">
          <button class="btn btn-primary" :disabled="saving">
            {{ saving ? "Saving..." : form.id ? "Update" : "Create" }}
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="reset"
          >
            Reset
          </button>
        </div>
        <div class="col-12" v-if="msg">
          <div class="alert alert-success mb-0">{{ msg }}</div>
        </div>
        <div class="col-12" v-if="formError">
          <div class="alert alert-danger mb-0">{{ formError }}</div>
        </div>
      </form>
    </RightDrawer>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { api } from "../composables/useApi";
import { useAuthStore } from "../stores/auth";
import RightDrawer from "../components/RightDrawer.vue";

const auth = useAuthStore();
const users = ref([]);
const rolesList = ref([]);
const selectedRoles = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const formError = ref("");
const msg = ref("");
const form = reactive({ id: "", phone: "", password: "", name: "", email: "" });
const drawer = ref(null);

function getUserInitials(user) {
  if (user.name) {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }
  return user.phone ? user.phone.substring(0, 2) : "??";
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const tokenValue =
      typeof auth.token === "object" && auth.token.value
        ? auth.token.value
        : auth.token;
    const [usersRes, rolesRes] = await Promise.all([
      api.get("/users", { token: tokenValue }),
      api.get("/roles", { token: tokenValue }),
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
  formError.value = "";
  msg.value = "";
  try {
    const tokenValue =
      typeof auth.token === "object" && auth.token.value
        ? auth.token.value
        : auth.token;
    const roles = selectedRoles.value.length ? selectedRoles.value : undefined;
    if (form.id) {
      const res = await api.put(
        `/users/${form.id}`,
        { ...form, roles },
        { token: tokenValue }
      );
      msg.value = "Updated";
      users.value = users.value.map((u) =>
        u.id === form.id ? res.data.user : u
      );
    } else {
      const res = await api.post(
        "/users",
        { ...form, roles },
        { token: tokenValue }
      );
      msg.value = "Created";
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
  form.password = "";
  form.name = u.name || "";
  form.email = u.email || "";
  selectedRoles.value = u.roles || [];
  drawer.value?.open();
}

function reset() {
  form.id = "";
  form.phone = "";
  form.password = "";
  form.name = "";
  form.email = "";
  selectedRoles.value = [];
}

function openCreate() {
  reset();
  drawer.value?.open();
}

onMounted(() => {
  load();
});
</script>

<style scoped>
.users-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ===== Header Card ===== */
.header-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-text {
  flex: 1;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 1rem;
}

.badge-icon {
  font-size: 1.2rem;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.header-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.refresh-btn {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.refresh-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: #1e293b;
  transform: scale(1.05);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== Error Alert ===== */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.95rem;
  font-weight: 500;
}

.alert-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* ===== Table Card ===== */
.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

/* ===== Loading State ===== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

.loading-state p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

/* ===== Modern Table ===== */
.table-container {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.modern-table th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modern-table th.actions-column {
  text-align: center;
}

.modern-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.modern-table tbody tr:hover {
  background: #f8fafc;
}

.modern-table tbody tr:last-child {
  border-bottom: none;
}

.modern-table td {
  padding: 1.25rem 1.5rem;
  vertical-align: middle;
}

/* ===== User Cell ===== */
.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.user-phone {
  font-size: 0.875rem;
  color: #64748b;
}

/* ===== Contact Cell ===== */
.contact-cell {
  display: flex;
  align-items: center;
}

.email-text {
  color: #475569;
  font-size: 0.9rem;
}

.no-email {
  color: #94a3b8;
  font-size: 0.9rem;
}

/* ===== Roles Cell ===== */
.roles-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #5b21b6;
}

.no-roles {
  color: #94a3b8;
  font-size: 0.875rem;
}

/* ===== Edit Button ===== */
.edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  border-color: rgba(102, 126, 234, 0.3);
  color: #667eea;
  transform: translateY(-2px);
}

.edit-icon {
  font-size: 1rem;
}

/* ===== Empty State ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #64748b;
  font-size: 1rem;
  margin: 0 0 2rem 0;
}

.create-first-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.create-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* ===== Responsive Design ===== */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .modern-table {
    font-size: 0.875rem;
  }

  .modern-table th,
  .modern-table td {
    padding: 1rem;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    min-width: 40px;
    font-size: 0.9rem;
  }

  .user-name {
    font-size: 0.9rem;
  }

  .user-phone {
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .header-card {
    padding: 1.5rem;
  }

  .header-title {
    font-size: 1.5rem;
  }

  /* Stack table on very small screens */
  .modern-table thead {
    display: none;
  }

  .modern-table,
  .modern-table tbody,
  .modern-table tr,
  .modern-table td {
    display: block;
    width: 100%;
  }

  .modern-table tr {
    margin-bottom: 1rem;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    padding: 1rem;
  }

  .modern-table td {
    padding: 0.75rem 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .modern-table td:last-child {
    border-bottom: none;
  }

  .modern-table td::before {
    content: attr(data-label);
    display: block;
    font-weight: 700;
    color: #64748b;
    font-size: 0.75rem;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .edit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
