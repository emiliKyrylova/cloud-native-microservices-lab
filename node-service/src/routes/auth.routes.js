const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { loginLimiter } = require('../middleware/rate-limit.middleware');

router.post('/api/auth/register', authController.register);
router.post('/api/auth/login', loginLimiter, authController.login);
router.post('/api/auth/refresh', authController.refresh);

module.exports = router;