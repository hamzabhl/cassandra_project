const { client } = require('../connexion/connexion');
const randomStringGenerator = require('random-string-generator');

// VALIDATIONS
function validateCustomer({ first_name, country }) {
    if (!first_name || !country) return "Missing fields";
    if (first_name.trim() === "" || country.trim() === "") return "Empty fields";
    if (first_name.length > 100) return "Name too long";
    return null;
}

function validateId(id) {
    if (!id || id.trim() === "") return "Customer ID is required";
    if (!/^[a-zA-Z0-9]+$/.test(id)) return "Invalid ID format";
    return null;
}

// CREATE
exports.createCustomer = async (req, res) => {
    try {
        const { first_name, country } = req.body;

        const error = validateCustomer({ first_name, country });
        if (error) {
            return res.status(400).json({ message: error });
        }

        const customer_id = randomStringGenerator(8, 'alphanumeric');

        await client.execute(
            `INSERT INTO customers (customer_id, first_name, country)
             VALUES (?, ?, ?)`,
            [customer_id, first_name, country],
            { prepare: true }
        );

        await client.execute(
            `UPDATE kpi_stats SET value = value + 1
             WHERE kpi_type = 'total_customers' AND key = 'all'`
        );

        await client.execute(
            `UPDATE kpi_stats SET value = value + 1
             WHERE kpi_type = 'customers_by_country' AND key = ?`,
            [country],
            { prepare: true }
        );

        return res.status(201).json({
            success: true,
            message: 'Customer created',
            customer_id
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: 'Failed to create customer',
            error: err.message
        });
    }
};

// READ
exports.getCustomer = async (req, res) => {
    const customer_id = req.params.id;

    try {
        const error = validateId(customer_id);
        if (error) return res.status(400).json({ message: error });

        const result = await client.execute(
            `SELECT * FROM customers WHERE customer_id = ?`,
            [customer_id],
            { prepare: true }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching customer'
        });
    }
};

// UPDATE
exports.updateCustomer = async (req, res) => {
    const customer_id = req.params.id;
    const { first_name, country } = req.body;

    try {
        const error = validateId(customer_id);
        if (error) return res.status(400).json({ message: error });

        const error2 = validateCustomer(req.body);
        if (error2) return res.status(400).json({ message: error2 });

        // 🔵 3. Check if customer exists
        const result = await client.execute(
            `SELECT country FROM customers WHERE customer_id = ?`,
            [customer_id],
            { prepare: true }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        const oldCountry = result.rows[0].country;

        // 🔵 4. Update
        await client.execute(
            `UPDATE customers SET first_name = ?, country = ?
             WHERE customer_id = ?`,
            [first_name, country, customer_id],
            { prepare: true }
        );

        // 🔵 5. KPI update (if needed)
        if (oldCountry !== country) {
            await client.execute(
                `UPDATE kpi_stats SET value = value - 1
                 WHERE kpi_type = 'customers_by_country' AND key = ?`,
                [oldCountry],
                { prepare: true }
            );

            await client.execute(
                `UPDATE kpi_stats SET value = value + 1
                 WHERE kpi_type = 'customers_by_country' AND key = ?`,
                [country],
                { prepare: true }
            );
        }

        res.json({ message: "Customer updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error updating customer",
            error: err.message
        });
    }
};

// DELETE
exports.deleteCustomer = async (req, res) => {
    const customer_id = req.params.id;

    try {
        const error = validateId(customer_id);
        if (error) return res.status(400).json({ message: error });

        const result = await client.execute(
            `SELECT country FROM customers WHERE customer_id = ?`,
            [customer_id],
            { prepare: true }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        const country = result.rows[0].country;

        await client.execute(
            `DELETE FROM customers WHERE customer_id = ?`,
            [customer_id],
            { prepare: true }
        );

        await client.execute(
            `UPDATE kpi_stats SET value = value - 1
             WHERE kpi_type = 'total_customers' AND key = 'all'`
        );

        await client.execute(
            `UPDATE kpi_stats SET value = value - 1
             WHERE kpi_type = 'customers_by_country' AND key = ?`,
            [country],
            { prepare: true }
        );

        return res.json({
            success: true,
            message: "Customer deleted"
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Error deleting customer",
            error: err.message
        });
    }
};