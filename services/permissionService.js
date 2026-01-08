const { Permission } = require('../models');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function createPermission(data = {}) {
  const { name, description } = data;
  if (!name) throw httpError(400, 'name is required');
  const [perm, created] = await Permission.findOrCreate({ where: { name }, defaults: { description } });
  if (!created && description !== undefined) {
    perm.description = description;
    await perm.save();
  }
  return perm;
}

async function updatePermission(id, data = {}) {
  const perm = await Permission.findByPk(id);
  if (!perm) throw httpError(404, 'Permission not found');
  const { name, description } = data;
  if (name) perm.name = name;
  if (description !== undefined) perm.description = description;
  await perm.save();
  return perm;
}

async function deletePermission(id) {
  const deleted = await Permission.destroy({ where: { id } });
  if (!deleted) throw httpError(404, 'Permission not found');
  return true;
}

async function listPermissions() {
  return Permission.findAll();
}

async function getPermission(id) {
  const perm = await Permission.findByPk(id);
  if (!perm) throw httpError(404, 'Permission not found');
  return perm;
}

module.exports = {
  createPermission,
  updatePermission,
  deletePermission,
  listPermissions,
  getPermission
};

