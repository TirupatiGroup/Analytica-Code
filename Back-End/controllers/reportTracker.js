const moment = require('moment');
const { executeQuery } = require('../config/db'); // Importing executeQuery from the config file

// Fetch users by department
const getUsersByDepartment = async (req, res) => {
    const departmentCondition = req.query.depart || 'ard';

    const query = `
        SELECT 
            id, 
            username, 
            ename, 
            vertical, 
            depart 
        FROM users
        WHERE depart = ?
        ORDER BY username
    `;

    console.log(`Fetching users for department: ${departmentCondition}`);

    try {
        const results = await executeQuery(query, [departmentCondition]);

        if (results.length === 0) {
            console.log(`No users found for department: ${departmentCondition}`);
            return res.status(404).json({ message: `No users found in department: ${departmentCondition}` });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching users:", err.message);
        return res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
};

// Fetch reports for the department in a given month and year
const getReportsForDepartment = async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and Year are required.' });
    }

    // Ensuring month is always two digits
    const formattedMonth = month.padStart(2, '0');
    
    // Creating start and end date for the month
    const startOfMonth = moment(`${year}-${formattedMonth}-01`).startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(`${year}-${formattedMonth}-01`).endOf('month').format('YYYY-MM-DD');

    const query = `
        SELECT 
            reports.id AS report_id, 
            reports.report_date, 
            reports.report_details, 
            users.id AS user_id,
            users.username,
            users.ename
        FROM reports
        JOIN users ON reports.user_id = users.id
        WHERE users.depart = 'ard'
            AND reports.report_date BETWEEN ? AND ?
        ORDER BY users.username, reports.report_date
    `;

    try {
        const results = await executeQuery(query, [startOfMonth, endOfMonth]);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching reports:", err.message);
        return res.status(500).send('Error fetching reports');
    }
};

// Fetch users by department for 'frd'
const getUsersByDepartmentFRD = async (req, res) => {
    const departmentCondition = req.query.depart || 'frd';  // Default to 'frd'

    const query = `
        SELECT 
            id, 
            username, 
            ename, 
            vertical, 
            depart 
        FROM users
        WHERE depart = ?
        ORDER BY username
    `;

    console.log(`Fetching users for department: ${departmentCondition}`);

    try {
        const results = await executeQuery(query, [departmentCondition]);

        if (results.length === 0) {
            console.log(`No users found for department: ${departmentCondition}`);
            return res.status(404).json({ message: `No users found in department: ${departmentCondition}` });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching users:", err.message);
        return res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
};

// Fetch reports for the 'frd' department in a given month and year
const getReportsForFRD = async (req, res) => {
    const { month, year, depart } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and Year are required.' });
    }

    // Default to 'frd' if no department is specified
    const departmentCondition = depart || 'frd';

    // Ensuring month is always two digits
    const formattedMonth = month.padStart(2, '0');

    // Creating start and end date for the month
    const startOfMonth = moment(`${year}-${formattedMonth}-01`).startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(`${year}-${formattedMonth}-01`).endOf('month').format('YYYY-MM-DD');

    const query = `
        SELECT 
            reports.id AS report_id, 
            reports.report_date, 
            reports.report_details, 
            users.id AS user_id,
            users.username,
            users.ename
        FROM reports
        JOIN users ON reports.user_id = users.id
        WHERE users.depart = ?
            AND reports.report_date BETWEEN ? AND ?
        ORDER BY users.username, reports.report_date
    `;

    try {
        const results = await executeQuery(query, [departmentCondition, startOfMonth, endOfMonth]);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching reports:", err.message);
        return res.status(500).send('Error fetching reports');
    }
};

module.exports = {
    getUsersByDepartment,
    getReportsForDepartment,
    getUsersByDepartmentFRD,
    getReportsForFRD
};
