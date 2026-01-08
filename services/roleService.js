const { Role, Permission } = require('../models');
const { Op } = require('sequelize');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function ensurePermissions(permissionNames = []) {
  if (!permissionNames.length) return [];
  const perms = await Permission.findAll({ where: { name: { [Op.in]: permissionNames } } });
  if (perms.length !== permissionNames.length) {
    throw httpError(400, 'One or more permissions not found');
  }
  return perms;
}

async function createRole(data = {}) {
  const { name, description, permissions = [] } = data;
  if (!name) throw httpError(400, 'name is required');

  const [role, created] = await Role.findOrCreate({ where: { name }, defaults: { description } });
  if (!created && description !== undefined) {
    role.description = description;
    await role.save();
  }

  const permModels = await ensurePermissions(permissions);
  if (permModels.length) await role.setPermissions(permModels);
  else if (permissions) await role.setPermissions([]);

  await role.reload({ include: [Permission] });
  return role;
}

async function updateRole(id, data = {}) {
  const role = await Role.findByPk(id, { include: [Permission] });
  if (!role) throw httpError(404, 'Role not found');

  const { name, description, permissions } = data;
  if (name) role.name = name;
  if (description !== undefined) role.description = description;
  await role.save();

  if (permissions) {
    const permModels = await ensurePermissions(permissions);
    await role.setPermissions(permModels);
    await role.reload({ include: [Permission] });
  }

  return role;
}

async function deleteRole(id) {
  const deleted = await Role.destroy({ where: { id } });
  if (!deleted) throw httpError(404, 'Role not found');
  return true;
}

async function listRoles() {
  const roles = await Role.findAll({ include: [Permission] });
  return roles;
}

async function getRole(id) {
  const role = await Role.findByPk(id, { include: [Permission] });
  if (!role) throw httpError(404, 'Role not found');
  return role;
}

module.exports = {
  createRole,
  updateRole,
  deleteRole,
  listRoles,
  getRole
};

