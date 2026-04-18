const { client } = require('../connexion/connexion');
const randomStringGenerator = require('random-string-generator');

// VALIDATIONS
function validateProduct({ name, category }) {
    if (!name || !category) return "Missing fields";
    if (name.trim() === "" || category.trim() === "") return "Empty fields";
    if (name.length > 100) return "Name too long";
    return null;
}

function validateId(id) {
    if (!id || id.trim() === "") return "Product ID is required";
    if (!/^[a-zA-Z0-9]+$/.test(id)) return "Invalid ID format";
    return null;
}

// CREATE
exports.createProduct = async (req, res) => {
    try {
        const { name, category } = req.body;

        const error = validateProduct({ name, category });
        if (error) {
            return res.status(400).json({ message: error });
        }

        const product_id = randomStringGenerator(8, 'alphanumeric');

        await client.execute(
            `INSERT INTO products (product_id, name, category)
             VALUES (?, ?, ?)`,
            [product_id, name, category],
            { prepare: true }
        );

        await client.execute(
            `UPDATE kpi_stats SET value = value + 1
             WHERE kpi_type = 'total_products' AND key = 'all'`
        );

        await client.execute(
            `UPDATE kpi_stats SET value = value + 1
             WHERE kpi_type = 'products_by_category' AND key = ?`,
            [category],
            { prepare: true }
        );

        return res.status(201).json({
            success: true,
            message: 'Product created',
            product_id
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: err.message
        });
    }
};

// READ
exports.getProduct = async (req, res) => {
    const product_id = req.params.id;

    try {
        const error = validateId(product_id);
        if (error) return res.status(400).json({ message: error });

        const result = await client.execute(
            `SELECT * FROM products WHERE product_id = ?`,
            [product_id],
            { prepare: true }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching product'
        });
    }
};

// UPDATE
exports.updateProduct = async (req, res) => {
    const product_id = req.params.id;
    const { name, category } = req.body;

    try {
        const error = validateId(product_id);
        if (error) return res.status(400).json({ message: error });

        const error2 = validateProduct(req.body);
        if (error2) return res.status(400).json({ message: error2 });

        const result = await client.execute(
            `SELECT category FROM products WHERE product_id = ?`,
            [product_id],
            { prepare: true }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const oldCategory = result.rows[0].category;

        // 🔵 4. Update
        await client.execute(
            `UPDATE products SET name = ?, category = ?
             WHERE product_id = ?`,
            [name, category, product_id],
            { prepare: true }
        );

        // 🔵 5. KPI update (if needed)
        if (oldCategory !== category) {
            await client.execute(
                `UPDATE kpi_stats SET value = value - 1
                 WHERE kpi_type = 'products_by_category' AND key = ?`,
                [oldCategory],
                { prepare: true }
            );

            await client.execute(
                `UPDATE kpi_stats SET value = value + 1
                 WHERE kpi_type = 'products_by_category' AND key = ?`,
                [category],
                { prepare: true }
            );
        }

        res.json({ message: "Product updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error updating product",
            error: err.message
        });
    }
};

// DELETE
exports.deleteProduct = async (req, res) => {
    const product_id = req.params.id;

    try {
        const error = validateId(product_id);
        if (error) return res.status(400).json({ message: error });

        const result = await client.execute(
            `SELECT category FROM products WHERE product_id = ?`,
            [product_id],
            { prepare: true }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const category = result.rows[0].category;

        await client.execute(
            `DELETE FROM products WHERE product_id = ?`,
            [product_id],
            { prepare: true }
        );

        await client.execute(
            `UPDATE kpi_stats SET value = value - 1
             WHERE kpi_type = 'total_products' AND key = 'all'`
        );

        await client.execute(
            `UPDATE kpi_stats SET value = value - 1
             WHERE kpi_type = 'products_by_category' AND key = ?`,
            [category],
            { prepare: true }
        );

        return res.json({
            success: true,
            message: "Product deleted"
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: err.message
        });
    }
};