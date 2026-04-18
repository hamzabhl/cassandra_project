const express = require('express');
const router = express.Router();
const controller = require('../controller/product_crud');

router.post('/', controller.createProduct);
router.get('/:id', controller.getProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;