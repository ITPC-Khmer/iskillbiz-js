const { Op } = require('sequelize');
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
  const { phone, email, username, password, name, photo, gender, dob, bio } = payload || {};
  if (!password) {
    throw httpError(400, 'password is required');
  }
  if (!phone && !email && !username) {
    throw httpError(400, 'phone, email, or username is required');
  }

  const matchers = [];
  if (phone) matchers.push({ phone });
  if (email) matchers.push({ email });
  if (username) matchers.push({ username });

  if (matchers.length) {
    const existing = await User.findOne({ where: { [Op.or]: matchers } });
    if (existing) {
      throw httpError(409, 'Account already exists for provided phone/email/username');
    }
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    phone: phone || null,
    email: email || null,
    username: username || null,
    passwordHash,
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
  const { identifier, phone, email, username, password } = payload || {};
  if (!password) {
    throw httpError(400, 'password is required');
  }

  const lookup = identifier || phone || email || username;
  if (!lookup) {
    throw httpError(400, 'phone, email, or username is required');
  }

  const matchers = [{ phone: lookup }, { email: lookup }, { username: lookup }];
  if (phone && phone !== lookup) matchers.push({ phone });
  if (email && email !== lookup) matchers.push({ email });
  if (username && username !== lookup) matchers.push({ username });

  const user = await User.findOne({
    where: { [Op.or]: matchers },
    include: [{ model: Role, include: [Permission] }]
  });
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
