const { client } = require('../connexion/connexion');

async function getCustomersByCountry() {
    const result = await client.execute(
        'SELECT country, total FROM customers_by_country'
    );

    return result.rows;
}

module.exports = { getCustomersByCountry };