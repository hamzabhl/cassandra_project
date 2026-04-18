const express = require('express');
const router = express.Router();
const controller = require('../controller/organization_crud');

router.post('/', controller.createOrganization);
router.get('/:id', controller.getOrganization);
router.put('/:id', controller.updateOrganization);
router.delete('/:id', controller.deleteOrganization);

module.exports = router;