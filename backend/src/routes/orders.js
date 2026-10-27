const express = require('express');
const controller = require('../controllers/order.Controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.post('/', controller.createOrder);
router.get('/', controller.listOrders);
router.get('/:id', controller.getOrder);
router.patch('/:id/status', requireAdmin, controller.updateOrderStatus);

module.exports = router;
