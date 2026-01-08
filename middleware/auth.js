require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Role, Permission } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

function createToken(user) {
  const tokenOptions = JWT_EXPIRES_IN === 'never' ? {} : { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, tokenOptions);
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function loadUserWithRoles(userId) {
  if (!userId) return null;
  return User.findByPk(userId, {
    include: [{ model: Role, include: [Permission] }]
  });
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let userId = req.session && req.session.userId;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(authHeader.replace('Bearer ', ''));
      userId = payload.id;
    } catch (err) {
      return res.error('Invalid or expired token', 401);
    }
  }

  if (!userId) {
    return res.error('Unauthorized', 401);
  }

  loadUserWithRoles(userId)
    .then((user) => {
      if (!user) return res.error('Unauthorized', 401);
      req.authUser = user;
      req.user = sanitizeUser(user);
      next();
    })
    .catch((err) => next(err));
}

function requireRoles(allowed = []) {
  return function roleGuard(req, res, next) {
    const roles = (req.user && req.user.roles) || [];
    const ok = allowed.some((r) => roles.includes(r));
    if (!ok) return res.error('Forbidden', 403);
    next();
  };
}

function sanitizeUser(userInstance) {
  if (!userInstance) return null;
  const user = userInstance.toJSON();
  delete user.passwordHash;
  const roles = (userInstance.Roles || user.roles || []).map((r) => r.name || r);
  const permissions = new Set();
  (userInstance.Roles || []).forEach((role) => {
    (role.Permissions || []).forEach((p) => permissions.add(p.name));
  });
  user.roles = roles;
  user.permissions = Array.from(permissions);
  return user;
}

module.exports = {
  createToken,
  verifyToken,
  requireAuth,
  requireRoles,
  hashPassword,
  comparePassword,
  sanitizeUser
};
