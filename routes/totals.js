const express = require('express');
const router = express.Router();

const { getTotals } = require('../controller/kpis_total');

router.get('/', async (req, res) => {
    try {
        const data = await getTotals();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch KPIs' });
    }
});

module.exports = router;