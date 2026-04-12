const express = require('express');
const router = express.Router();

const { getAggregations } = require('../controller/stats');

router.get('/', getAggregations);

module.exports = router;