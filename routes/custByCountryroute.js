const express = require('express');
const router = express.Router();

const { getCustomersByCountry } = require('../controller/customersByCountry');

// GET /customers-by-country
router.get('/', async (req, res) => {
    try {
        const data = await getCustomersByCountry();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch customers by country' });
    }
});

module.exports = router;