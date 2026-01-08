const { User, Role, Permission } = require('../models');
const { hashPassword, sanitizeUser } = require('../middleware/auth');
const { Op } = require('sequelize');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function ensureRoles(roleNames = []) {
  if (!roleNames.length) return [];
  const roles = await Role.findAll({ where: { name: { [Op.in]: roleNames } } });
  if (roles.length !== roleNames.length) {
    throw httpError(400, 'One or more roles not found');
  }
  return roles;
}

async function createUser(data = {}) {
  const { phone, password, email, name, photo, gender, dob, bio, roles = [] } = data;
  if (!phone || !password) throw httpError(400, 'phone and password are required');

  const exists = await User.findOne({ where: { phone } });
  if (exists) throw httpError(409, 'Phone already registered');

  const passwordHash = await hashPassword(password);
  const user = await User.create({ phone, passwordHash, email, name, photo, gender, dob: dob || null, bio });

  const roleModels = await ensureRoles(roles);
  if (roleModels.length) await user.setRoles(roleModels);

  await user.reload({ include: [{ model: Role, include: [Permission] }] });
  return sanitizeUser(user);
}

async function updateUser(id, data = {}) {
  const user = await User.findByPk(id, { include: [{ model: Role, include: [Permission] }] });
  if (!user) throw httpError(404, 'User not found');

  const { phone, password, email, name, photo, gender, dob, bio, roles } = data;
  if (phone) user.phone = phone;
  if (email !== undefined) user.email = email;
  if (name !== undefined) user.name = name;
  if (photo !== undefined) user.photo = photo;
  if (gender !== undefined) user.gender = gender;
  if (dob !== undefined) user.dob = dob;
  if (bio !== undefined) user.bio = bio;
  if (password) user.passwordHash = await hashPassword(password);

  await user.save();

  if (roles) {
    const roleModels = await ensureRoles(roles);
    await user.setRoles(roleModels);
    await user.reload({ include: [{ model: Role, include: [Permission] }] });
  }

  return sanitizeUser(user);
}

async function deleteUser(id) {
  const deleted = await User.destroy({ where: { id } });
  if (!deleted) throw httpError(404, 'User not found');
  return true;
}

async function listUsers() {
  const users = await User.findAll({ include: [{ model: Role, include: [Permission] }] });
  return users.map(sanitizeUser);
}

async function getUser(id) {
  const user = await User.findByPk(id, { include: [{ model: Role, include: [Permission] }] });
  if (!user) throw httpError(404, 'User not found');
  return sanitizeUser(user);
}

async function setUserPhoto(id, photoPath) {
  const user = await User.findByPk(id, { include: [{ model: Role, include: [Permission] }] });
  if (!user) throw httpError(404, 'User not found');
  user.photo = photoPath;
  await user.save();
  await user.reload({ include: [{ model: Role, include: [Permission] }] });
  return sanitizeUser(user);
}

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  listUsers,
  getUser,
  setUserPhoto
};
