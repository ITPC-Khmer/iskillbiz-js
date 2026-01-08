const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../services/authService');

router.post('/register', async (req, res, next) => {
  try {
    const result = await registerUser(req.body, req.session);
    res.success(result, 'registered', 201);
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const result = await loginUser(req.body, req.session);
    res.success(result, 'logged in');
  } catch (err) {
    if (err.status) return res.error(err.message, err.status);
    next(err);
  }
});

module.exports = router;
