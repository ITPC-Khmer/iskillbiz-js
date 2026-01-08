const express = require('express');
const router = express.Router();
const { requireAuth, requireRoles } = require('../middleware/auth');
const {
  createUser,
  updateUser,
  deleteUser,
  listUsers,
  getUser
} = require('../services/userService');

const mustBeAdmin = [requireAuth, requireRoles(['admin', 'super_admin'])];

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

module.exports = router;
