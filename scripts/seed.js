require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Role,
  Permission
} = require('../models');

const defaultRoles = [
  { name: 'super_admin', description: 'Highest access' },
  { name: 'admin', description: 'Administrative user' },
  { name: 'client', description: 'Standard client user' }
];

const defaultPermissions = [
  { name: 'manage_users', description: 'Create/update/delete users' },
  { name: 'view_reports', description: 'View reports' },
  { name: 'manage_content', description: 'Manage content' }
];

const defaultUsers = [
  {
    phone: '+10000000001',
    password: 'Admin@123',
    name: 'Super Admin',
    roles: ['super_admin']
  },
  {
    phone: '+10000000002',
    password: 'Admin@123',
    name: 'Admin',
    roles: ['admin']
  },
  {
    phone: '+10000000003',
    password: 'Client@123',
    name: 'Client',
    roles: ['client']
  }
];

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const roles = {};
  for (const roleData of defaultRoles) {
    const [role] = await Role.findOrCreate({ where: { name: roleData.name }, defaults: roleData });
    roles[role.name] = role;
  }

  const permissions = {};
  for (const permData of defaultPermissions) {
    const [perm] = await Permission.findOrCreate({ where: { name: permData.name }, defaults: permData });
    permissions[perm.name] = perm;
  }

  // Assign some permissions to roles
  await roles.super_admin.setPermissions(Object.values(permissions));
  await roles.admin.setPermissions([permissions.manage_users, permissions.manage_content]);
  await roles.client.setPermissions([]);

  for (const userData of defaultUsers) {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const [user] = await User.findOrCreate({
      where: { phone: userData.phone },
      defaults: {
        phone: userData.phone,
        passwordHash,
        name: userData.name
      }
    });
    const assignedRoles = userData.roles.map((r) => roles[r]).filter(Boolean);
    if (assignedRoles.length) {
      await user.setRoles(assignedRoles);
    }
  }

  console.log('Seed completed');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
