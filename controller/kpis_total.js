const { client } = require('../connexion/connexion');

async function getTotals() {
    const result = await client.execute('SELECT * FROM kpis');

    const kpis = {};
    result.rows.forEach(row => {
        kpis[row.kpi_name] = row.value;
    });

    return kpis;
}

module.exports = { getTotals };