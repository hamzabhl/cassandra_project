const { client } = require('../connexion/connexion');

async function getTotals(req, res) {
    try {
        const types = [
            'total_customers',
            'total_products',
            'total_organizations'
        ];

        const query = 'SELECT * FROM kpi_stats WHERE kpi_type = ?';

        const results = {};

        // Run queries in parallel (faster)
        const promises = types.map(type =>
            client.execute(query, [type], { prepare: true })
        );

        const responses = await Promise.all(promises);

        responses.forEach((result, index) => {
            const type = types[index];

            if (result.rows.length > 0) {
                // assuming key = 'all'
                results[type] = result.rows[0].value;
            } else {
                results[type] = 0;
            }
        });

        res.json(results);

    } catch (error) {
        console.error('Error fetching main KPIs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { getTotals };