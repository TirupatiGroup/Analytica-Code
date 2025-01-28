const { executeQuery } = require('../config/db');

// Fetch all users for the dropdown
const getUsersForDropdown = async (req, res) => {
    const query = 'SELECT id, username, ename FROM users';

    try {
        const results = await executeQuery(query);
        res.json(results);
    } catch (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Post Daily Reporting data
const createOrUpdateReport = async (req, res) => {
    const { user_id, report_date, report_details } = req.body;

    if (!report_details || report_details.trim() === "") {
        return res.status(400).send('Report details cannot be empty');
    }

    const checkReportQuery = 'SELECT * FROM reports WHERE user_id = ? AND report_date = ?';

    try {
        const result = await executeQuery(checkReportQuery, [user_id, report_date]);

        if (result.length > 0) {
            const existingReportDetails = result[0].report_details;
            const updatedReportDetails = existingReportDetails + '\n' + report_details;

            const updateReportQuery = 'UPDATE reports SET report_details = ? WHERE id = ?';
            await executeQuery(updateReportQuery, [updatedReportDetails, result[0].id]);

            return res.status(200).send('Report details updated successfully');
        } else {
            const createReportQuery = 'INSERT INTO reports (user_id, report_date, report_details) VALUES (?, ?, ?)';
            await executeQuery(createReportQuery, [user_id, report_date, report_details]);

            return res.status(200).send('Report created successfully');
        }
    } catch (err) {
        console.error("Error checking or creating/updating report:", err);
        return res.status(500).send('Error processing report');
    }
};

// Fetch Daily Reporting data
const getReportsByDate = async (req, res) => {
    const { date } = req.params;

    const query = `
        SELECT 
            reports.id AS report_id, 
            reports.report_date, 
            reports.report_details, 
            users.username, 
            users.ename, 
            users.des, 
            users.depart
        FROM reports
        JOIN users ON reports.user_id = users.id
        WHERE reports.report_date = ?
    `;

    try {
        const results = await executeQuery(query, [date]);

        if (results.length === 0) {
            return res.status(404).send('No reports found for the selected date');
        }

        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching reports:", err);
        return res.status(500).send('Error fetching reports');
    }
};

// Update Daily Reporting data
const updateReport = async (req, res) => {
    const { id } = req.params;
    const { report_details } = req.body;

    if (!report_details || report_details.trim() === "") {
        return res.status(400).send('Report details cannot be empty');
    }

    const updateReportQuery = 'UPDATE reports SET report_details = ? WHERE id = ?';

    try {
        const result = await executeQuery(updateReportQuery, [report_details, id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('No report found with the provided ID');
        }

        res.status(200).send('Report details updated successfully');
    } catch (err) {
        console.error("Error updating report:", err);
        return res.status(500).send('Error updating report');
    }
};

// Delete Daily Reporting data
const deleteReport = async (req, res) => {
    const { id } = req.params;

    const checkReportQuery = 'SELECT * FROM reports WHERE id = ?';

    try {
        const result = await executeQuery(checkReportQuery, [id]);

        if (result.length === 0) {
            return res.status(404).send('Report not found');
        }

        const deleteQuery = 'DELETE FROM reports WHERE id = ?';
        await executeQuery(deleteQuery, [id]);

        res.status(200).send({ message: 'Report deleted successfully' });
    } catch (err) {
        console.error('Error checking or deleting report:', err);
        return res.status(500).send('Error deleting report');
    }
};

module.exports = {
    getUsersForDropdown,
    createOrUpdateReport,
    getReportsByDate,
    updateReport,
    deleteReport
};
