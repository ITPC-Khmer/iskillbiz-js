const express = require('express');
const router = express.Router();
const { requireAuth, requireRoles } = require('../middleware/auth');
const {
  createPermission,
  updatePermission,
  deletePermission,
  listPermissions,
  getPermission
} = require('../services/permissionService');

const mustBeSuperAdmin = [requireAuth, requireRoles(['super_admin'])];

router.get('/', mustBeSuperAdmin, async (req, res, next) => {
  try {
    const permissions = await listPermissions();
    res.success({ permissions }, 'permissions');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.get('/:id', mustBeSuperAdmin, async (req, res, next) => {
  try {
    const permission = await getPermission(req.params.id);
    res.success({ permission }, 'permission');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.post('/', mustBeSuperAdmin, async (req, res, next) => {
  try {
    const permission = await createPermission(req.body);
    res.success({ permission }, 'created', 201);
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.put('/:id', mustBeSuperAdmin, async (req, res, next) => {
  try {
    const permission = await updatePermission(req.params.id, req.body);
    res.success({ permission }, 'updated');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.delete('/:id', mustBeSuperAdmin, async (req, res, next) => {
  try {
    await deletePermission(req.params.id);
    res.success(null, 'deleted');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

module.exports = router;

