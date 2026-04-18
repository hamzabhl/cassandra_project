const express = require('express');
const router = express.Router();
const controller = require('../controller/customer_crud');

router.post('/', controller.createCustomer);
router.get('/:id', controller.getCustomer);
router.put('/:id', controller.updateCustomer);
router.delete('/:id', controller.deleteCustomer);

module.exports = router;