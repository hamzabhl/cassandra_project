const { client } = require('../connexion/connexion');
const randomStringGenerator = require('random-string-generator');

// VALIDATIONS
function validateOrganization({ name, industry }) {
    if (!name || !industry) return "Missing fields";
    if (name.trim() === "" || industry.trim() === "") return "Empty fields";
    if (name.length > 100) return "Name too long";
    return null;
}

function validateId(id) {
    if (!id || id.trim() === "") return "Organization ID is required";
    if (!/^[a-zA-Z0-9]+$/.test(id)) return "Invalid ID format";
    return null;
}

// CREATE
exports.createOrganization = async (req, res) => {
    try {
        const { name, industry } = req.body;

        const error = validateOrganization({ name, industry });
        if (error) {
            return res.status(400).json({ message: error });
        }

        const organization_id = randomStringGenerator(8, 'alphanumeric');

        await client.execute(
            `INSERT INTO organizations (organization_id, name, industry)
             VALUES (?, ?, ?)`,
            [organization_id, name, industry],
            { prepare: true }
        );

        await client.execute(
            `UPDATE kpi_stats SET value = value + 1
             WHERE kpi_type = 'total_organizations' AND key = 'all'`
        );

        await client.execute(
            `UPDATE kpi_stats SET value = value + 1
             WHERE kpi_type = 'organizations_by_industry' AND key = ?`,
            [industry],
            { prepare: true }
        );

        return res.status(201).json({
            success: true,
            message: 'Organization created',
            organization_id
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: 'Failed to create organization',
            error: err.message
        });
    }
};

// READ
exports.getOrganization = async (req, res) => {
    const organization_id = req.params.id;

    try {
        const error = validateId(organization_id);
        if (error) return res.status(400).json({ message: error });

        const result = await client.execute(
            `SELECT * FROM organizations WHERE organization_id = ?`,
            [organization_id],
            { prepare: true }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        return res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching organization'
        });
    }
};

// UPDATE
exports.updateOrganization = async (req, res) => {
    const organization_id = req.params.id;
    const { name, industry } = req.body;

    try {
        const error = validateId(organization_id);
        if (error) return res.status(400).json({ message: error });

        const error2 = validateOrganization(req.body);
        if (error2) return res.status(400).json({ message: error2 });

        const result = await client.execute(
            `SELECT industry FROM organizations WHERE organization_id = ?`,
            [organization_id],
            { prepare: true }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Organization not found"
            });
        }

        const oldIndustry = result.rows[0].industry;

        // 🔵 4. Update
        await client.execute(
            `UPDATE organizations SET name = ?, industry = ?
             WHERE organization_id = ?`,
            [name, industry, organization_id],
            { prepare: true }
        );

        // 🔵 5. KPI update (if needed)
        if (oldIndustry !== industry) {
            await client.execute(
                `UPDATE kpi_stats SET value = value - 1
                 WHERE kpi_type = 'organizations_by_industry' AND key = ?`,
                [oldIndustry],
                { prepare: true }
            );

            await client.execute(
                `UPDATE kpi_stats SET value = value + 1
                 WHERE kpi_type = 'organizations_by_industry' AND key = ?`,
                [industry],
                { prepare: true }
            );
        }

        res.json({ message: "Organization updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error updating organization",
            error: err.message
        });
    }
};

// DELETE
exports.deleteOrganization = async (req, res) => {
    const organization_id = req.params.id;

    try {
        const error = validateId(organization_id);
        if (error) return res.status(400).json({ message: error });

        const result = await client.execute(
            `SELECT industry FROM organizations WHERE organization_id = ?`,
            [organization_id],
            { prepare: true }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Organization not found"
            });
        }

        const industry = result.rows[0].industry;

        await client.execute(
            `DELETE FROM organizations WHERE organization_id = ?`,
            [organization_id],
            { prepare: true }
        );

        await client.execute(
            `UPDATE kpi_stats SET value = value - 1
             WHERE kpi_type = 'total_organizations' AND key = 'all'`
        );

        await client.execute(
            `UPDATE kpi_stats SET value = value - 1
             WHERE kpi_type = 'organizations_by_industry' AND key = ?`,
            [industry],
            { prepare: true }
        );

        return res.json({
            success: true,
            message: "Organization deleted"
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Error deleting organization",
            error: err.message
        });
    }
};