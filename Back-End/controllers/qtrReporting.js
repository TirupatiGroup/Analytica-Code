const { executeQuery } = require('../config/db');

// Fetch reported dates for a specific user
const getReportedDatesForUser = async (req, res) => {
    const { userId } = req.params;

    const query = 'SELECT report_date FROM reports WHERE user_id = ?';

    try {
        const results = await executeQuery(query, [userId]);
        const reportedDates = results.map((row) => new Date(row.report_date).toLocaleDateString('en-GB'));
        return res.status(200).json(reportedDates);
    } catch (err) {
        console.error('Error fetching reports:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update the report details
const updateReportDetails = async (req, res) => {
    const { id, report_date, report_details } = req.body;

    if (!id || !report_date || !report_details) {
        return res.status(400).json({ error: 'Missing required fields (id, report_date, report_details)' });
    }

    const formattedReportDate = new Date(report_date);
    if (isNaN(formattedReportDate.getTime())) {
        return res.status(400).json({ error: 'Invalid report_date format, should be YYYY-MM-DD' });
    }

    const query = `
        UPDATE reports 
        SET report_details = ? 
        WHERE id = ? AND report_date = ?
    `;
    const values = [report_details, id, report_date];

    try {
        const result = await executeQuery(query, values);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Report updated successfully' });
        } else {
            return res.status(404).json({ message: 'Report not found for the given ID and date' });
        }
    } catch (err) {
        console.error('Error updating report:', err);
        return res.status(500).json({ message: 'Error updating report', error: err.message });
    }
};

// Search products based on pname and prepix
const searchProductsByPrefix = async (req, res) => {
    const { pname, prepix } = req.query;

    let query = `SELECT * FROM products_for_reporting WHERE 1=1`;
    const queryParams = [];

    if (pname) {
        query += ` AND pname LIKE ?`;
        queryParams.push(`%${pname}%`);
    }

    if (prepix) {
        query += ` AND prepix LIKE ?`;
        queryParams.push(`%${prepix}%`);
    }

    try {
        const results = await executeQuery(query, queryParams);
        return res.json(results);
    } catch (err) {
        console.error('Error searching product prefix:', err.message);
        return res.status(500).json({ error: 'Internal server error while searching product prefix.' });
    }
};

// Post quarterly report
const postQuarterlyReport = async (req, res) => {
    const { username, date, one_prefix_column, two_prefix_column, three_prefix_column, four_prefix_column, onLeave } = req.body;

    if (!username || !date || !one_prefix_column || !two_prefix_column || !three_prefix_column || !four_prefix_column) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const duplicateCheckQuery = `SELECT COUNT(*) AS count FROM qtr_report WHERE username = ? AND date = ?`;

    try {
        const results = await executeQuery(duplicateCheckQuery, [username, date]);

        if (results[0].count > 0) {
            return res.status(400).json({ error: 'You have already reported on this date for this user.' });
        }

        const query = `INSERT INTO qtr_report (username, date, one_prefix_column, two_prefix_column, three_prefix_column, four_prefix_column, onLeave) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            username,
            date,
            onLeave ? 'On leave' : one_prefix_column,
            onLeave ? 'On leave' : two_prefix_column,
            onLeave ? 'On leave' : three_prefix_column,
            onLeave ? 'On leave' : four_prefix_column,
            onLeave,
        ];

        await executeQuery(query, values);
        return res.json({ message: 'Report submitted successfully' });
    } catch (err) {
        console.error('Error submitting quarterly report:', err);
        return res.status(500).json({ error: 'Failed to save report' });
    }
};

// Fetch reported dates for a specific user
const getQuarterlyReportedDatesForUser = async (req, res) => {
    const username = req.params.username;

    const query = `SELECT date FROM qtr_report WHERE username = ?`;

    try {
        const results = await executeQuery(query, [username]);
        const reportedDates = results.map(row => row.date.toLocaleDateString('en-GB'));
        return res.json(reportedDates);
    } catch (err) {
        console.error('Error fetching reported dates:', err);
        return res.status(500).json({ message: 'Error fetching reported dates' });
    }
};

module.exports = {
    getReportedDatesForUser,
    updateReportDetails,
    searchProductsByPrefix,
    postQuarterlyReport,
    getQuarterlyReportedDatesForUser
};
