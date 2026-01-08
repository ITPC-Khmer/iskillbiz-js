const express = require('express');
const router = express.Router();
const { requireAuth, requireRoles } = require('../middleware/auth');
const {
  createRole,
  updateRole,
  deleteRole,
  listRoles,
  getRole
} = require('../services/roleService');

const mustBeSuperAdmin = [requireAuth, requireRoles(['super_admin'])];

router.get('/', mustBeSuperAdmin, async (req, res, next) => {
  try {
    const roles = await listRoles();
    res.success({ roles }, 'roles');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.get('/:id', mustBeSuperAdmin, async (req, res, next) => {
  try {
    const role = await getRole(req.params.id);
    res.success({ role }, 'role');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.post('/', mustBeSuperAdmin, async (req, res, next) => {
  try {
    const role = await createRole(req.body);
    res.success({ role }, 'created', 201);
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.put('/:id', mustBeSuperAdmin, async (req, res, next) => {
  try {
    const role = await updateRole(req.params.id, req.body);
    res.success({ role }, 'updated');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.delete('/:id', mustBeSuperAdmin, async (req, res, next) => {
  try {
    await deleteRole(req.params.id);
    res.success(null, 'deleted');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

module.exports = router;

