const express = require('express');
const router = express.Router();
const { requireAuth, requireRoles } = require('../middleware/auth');
const {
  createUser,
  updateUser,
  deleteUser,
  listUsers,
  getUser,
  setUserPhoto
} = require('../services/userService');
const { uploadUserPhoto } = require('../middleware/upload');

const mustBeAdmin = [requireAuth, requireRoles(['admin', 'super_admin'])];

function isSelfOrAdmin(req, res, next) {
  const isSelf = req.user && req.user.id === req.params.id;
  const roles = (req.user && req.user.roles) || [];
  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  if (isSelf || isAdmin) return next();
  return res.error('Forbidden', 403);
}

router.get('/', mustBeAdmin, async (req, res, next) => {
  try {
    const users = await listUsers();
    res.success({ users }, 'users');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.get('/:id', mustBeAdmin, async (req, res, next) => {
  try {
    const user = await getUser(req.params.id);
    res.success({ user }, 'user');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.post('/', mustBeAdmin, async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.success({ user }, 'created', 201);
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.put('/:id', mustBeAdmin, async (req, res, next) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    res.success({ user }, 'updated');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.delete('/:id', mustBeAdmin, async (req, res, next) => {
  try {
    await deleteUser(req.params.id);
    res.success(null, 'deleted');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.post('/:id/photo', requireAuth, isSelfOrAdmin, (req, res, next) => {
  uploadUserPhoto(req, res, async (err) => {
    if (err) return res.error(err.message || 'Upload failed', 400);
    try {
      const relativePath = req.file.path.replace(process.cwd() + '/', '').replace(/\\/g, '/');
      const user = await setUserPhoto(req.params.id, '/' + relativePath);
      res.success({ user, photo: user.photo }, 'photo updated');
    } catch (error) {
      if (error.status) return res.error(error.message, error.status);
      next(error);
    }
  });
});

module.exports = router;
