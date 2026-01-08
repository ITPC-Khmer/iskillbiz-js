import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Me from '../views/Me.vue';
import Users from '../views/Users.vue';
import Roles from '../views/Roles.vue';
import Permissions from '../views/Permissions.vue';
import Dashboard from '../views/Dashboard.vue';
import Facebook from '../views/Facebook.vue';

const routes = [
  { path: '/', component: Dashboard, meta: { layout: 'app' } },
  { path: '/login', component: Login, meta: { layout: 'auth' } },
  { path: '/register', component: Register, meta: { layout: 'auth' } },
  { path: '/me', component: Me, meta: { layout: 'app' } },
  { path: '/admin/users', component: Users, meta: { layout: 'app' } },
  { path: '/admin/roles', component: Roles, meta: { layout: 'app' } },
  { path: '/admin/permissions', component: Permissions, meta: { layout: 'app' } },
  { path: '/facebook', component: Facebook, meta: { layout: 'app' } },
];

export default routes;
