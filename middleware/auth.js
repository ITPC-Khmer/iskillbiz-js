require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function sanitizeUser(userInstance) {
  if (!userInstance) return null;
  const user = userInstance.toJSON();
  delete user.passwordHash;
  return user;
}

module.exports = {
  createToken,
  verifyToken,
  requireAuth,
  hashPassword,
  comparePassword,
  sanitizeUser
};
