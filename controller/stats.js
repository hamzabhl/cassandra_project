const { client } = require('../connexion/connexion');

async function getAggregations(req, res) {
    try {
        const [customers, products, organizations] = await Promise.all([
            client.execute("SELECT key, value FROM kpi_stats WHERE kpi_type='customers_by_country' LIMIT 20"),
            client.execute("SELECT key, value FROM kpi_stats WHERE kpi_type='products_by_category' LIMIT 20"),
            client.execute("SELECT key, value FROM kpi_stats WHERE kpi_type='organizations_by_industry' LIMIT 20")
        ]);

        const customers_by_country = customers.rows.map(r => ({
            country: r.key,
            count: r.value
        }));

        const products_by_category = products.rows.map(r => ({
            category: r.key,
            count: r.value
        }));

        const organizations_by_industry = organizations.rows.map(r => ({
            industry: r.key,
            count: r.value
        }));

        res.json({
            customers_by_country,
            products_by_category,
            organizations_by_industry
        });

    } catch (err) {
        console.error("Error fetching statistics:", err);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
}

module.exports = { getAggregations };