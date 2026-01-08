const { User, Role, Permission } = require('../models');
const {
  hashPassword,
  comparePassword,
  createToken,
  sanitizeUser
} = require('../middleware/auth');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function registerUser(payload, session) {
  const { phone, password, email, name, photo, gender, dob, bio } = payload || {};
  if (!phone || !password) {
    throw httpError(400, 'phone and password are required');
  }

  const existing = await User.findOne({ where: { phone } });
  if (existing) {
    throw httpError(409, 'Phone already registered');
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    phone,
    passwordHash,
    email,
    name,
    photo,
    gender,
    dob: dob || null,
    bio
  });

  const defaultRole = await Role.findOne({ where: { name: 'client' } });
  if (defaultRole && user.addRole) {
    await user.addRole(defaultRole);
  }

  await user.reload({ include: [{ model: Role, include: [Permission] }] });

  if (session) {
    session.userId = user.id;
  }

  const token = createToken(user);
  return { user: sanitizeUser(user), token };
}

async function loginUser(payload, session) {
  const { phone, password } = payload || {};
  if (!phone || !password) {
    throw httpError(400, 'phone and password are required');
  }

  const user = await User.findOne({ where: { phone }, include: [{ model: Role, include: [Permission] }] });
  if (!user) {
    throw httpError(401, 'Invalid credentials');
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw httpError(401, 'Invalid credentials');
  }

  await user.reload({ include: [{ model: Role, include: [Permission] }] });

  if (session) {
    session.userId = user.id;
  }

  const token = createToken(user);
  return { user: sanitizeUser(user), token };
}

module.exports = {
  registerUser,
  loginUser
};
