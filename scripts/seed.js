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
  { name: 'client', description: 'Standard client user' },
  { name: 'editor', description: 'Content editor' }
];

const defaultPermissions = [
  { name: 'manage_users', description: 'Create/update/delete users' },
  { name: 'view_reports', description: 'View reports' },
  { name: 'manage_content', description: 'Manage content' },
  { name: 'manage_roles', description: 'Create/update/delete roles' },
  { name: 'manage_permissions', description: 'Create/update/delete permissions' }
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
  },
  {
    phone: '+10000000004',
    password: 'Hybrid@123',
    name: 'Hybrid Admin',
    roles: ['admin', 'editor']
  }
];

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const tx = await sequelize.transaction();
  try {
    if (process.env.SEED_RESET === '1') {
      console.log('Reset mode: truncating tables...');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction: tx });
      // Truncate join tables first, then main tables
      await sequelize.query('TRUNCATE TABLE role_permissions', { transaction: tx });
      await sequelize.query('TRUNCATE TABLE user_roles', { transaction: tx });
      await sequelize.query('TRUNCATE TABLE permissions', { transaction: tx });
      await sequelize.query('TRUNCATE TABLE roles', { transaction: tx });
      await sequelize.query('TRUNCATE TABLE users', { transaction: tx });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction: tx });
    }

    const roles = {};
    for (const roleData of defaultRoles) {
      const [role] = await Role.findOrCreate({ where: { name: roleData.name }, defaults: roleData, transaction: tx });
      // If description changed, update gently
      if (role.description !== roleData.description) {
        role.description = roleData.description;
        await role.save({ transaction: tx });
      }
      roles[role.name] = role;
    }

    const permissions = {};
    for (const permData of defaultPermissions) {
      const [perm] = await Permission.findOrCreate({ where: { name: permData.name }, defaults: permData, transaction: tx });
      if (perm.description !== permData.description) {
        perm.description = permData.description;
        await perm.save({ transaction: tx });
      }
      permissions[perm.name] = perm;
    }

    // Assign permissions to roles
    await roles.super_admin.setPermissions(Object.values(permissions), { transaction: tx });
    await roles.admin.setPermissions([permissions.manage_users, permissions.view_reports], { transaction: tx });
    await roles.editor.setPermissions([permissions.manage_content, permissions.view_reports], { transaction: tx });
    await roles.client.setPermissions([], { transaction: tx });

    // Seed users and attach roles
    const seededUsers = [];
    for (const userData of defaultUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const [user] = await User.findOrCreate({
        where: { phone: userData.phone },
        defaults: {
          phone: userData.phone,
          passwordHash,
          name: userData.name
        },
        transaction: tx
      });
      if (!user.passwordHash || userData.password) {
        // Ensure password is set in case existing user had placeholder
        user.passwordHash = passwordHash;
        await user.save({ transaction: tx });
      }
      const assignedRoles = userData.roles.map((r) => roles[r]).filter(Boolean);
      if (assignedRoles.length) {
        await user.setRoles(assignedRoles, { transaction: tx });
      }
      seededUsers.push(user);
    }

    await tx.commit();

    // Print a summary
    console.log('Seed completed');
    console.log('Roles:', Object.keys(roles));
    console.log('Permissions:', Object.keys(permissions));
    console.log('Users:', seededUsers.map(u => `${u.name || ''} ${u.phone}`));
    process.exit(0);
  } catch (err) {
    await tx.rollback();
    console.error('Seed failed', err);
    process.exit(1);
  }
}

seed();
