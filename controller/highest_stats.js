const { client } = require('../connexion/connexion');

// 🔥 reusable function
function getMax(rows) {
    let max = 0;
    let maxKey = null;

    rows.forEach(row => {
        if (row.value > max) {
            max = row.value;
            maxKey = row.key;
        }
    });

    return { key: maxKey, value: max };
}

async function getTopKPIs(req, res) {
    try {
        // 🚀 run all queries in parallel
        const [countryRes, categoryRes, industryRes] = await Promise.all([
            client.execute(`
                SELECT key, value 
                FROM kpi_stats 
                WHERE kpi_type = 'customers_by_country'
            `),
            client.execute(`
                SELECT key, value 
                FROM kpi_stats 
                WHERE kpi_type = 'products_by_category'
            `),
            client.execute(`
                SELECT key, value 
                FROM kpi_stats 
                WHERE kpi_type = 'organizations_by_industry'
            `)
        ]);

        const top_country = getMax(countryRes.rows);
        const top_category = getMax(categoryRes.rows);
        const top_industry = getMax(industryRes.rows);

        res.json({
            success: true,
            data: {
                top_country,
                top_category,
                top_industry
            }
        });

    } catch (error) {
        console.error("Error fetching top KPIs:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

module.exports = {
    getTopKPIs
};