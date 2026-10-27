const express = require('express');
const controller = require('../controllers/product.Controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', controller.listProducts);
router.get('/:id', controller.getProduct);
router.post('/', authenticate, requireAdmin, controller.createProduct);
router.patch('/:id', authenticate, requireAdmin, controller.updateProduct);
router.delete('/:id', authenticate, requireAdmin, controller.deleteProduct);

module.exports = router;
