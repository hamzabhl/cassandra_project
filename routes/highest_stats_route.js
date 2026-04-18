const express = require('express');
const router = express.Router();

const { getTopKPIs } = require('../controller/highest_stats');

router.get('/', getTopKPIs);

module.exports = router;