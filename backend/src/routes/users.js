const express = require('express');
const controller = require('../controllers/user.Controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', authenticate, controller.getProfile);

module.exports = router;
