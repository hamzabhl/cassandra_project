const express = require('express');
const router = express.Router();

const { getTotals } = require('../controller/totals');

// ✅ Let Express handle req, res automatically
router.get('/', getTotals);

module.exports = router;