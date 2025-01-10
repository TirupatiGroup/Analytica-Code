const db = require('../config/db'); // Import the db object that has the executeQuery function
const bcrypt = require('bcryptjs');

// Get all employee details
const getEmployees = async (req, res) => {
    try {
        const results = await db.executeQuery('SELECT * FROM users');  // Using executeQuery instead of db.query
        if (results.length === 0) {
            return res.status(404).send('No employees found');
        }
        res.json(results);
    } catch (err) {
        console.error('Error fetching employees:', err);
        return res.status(500).send('Error fetching employees');
    }
};

// Get single employee details by ID
const getEmployeeById = async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await db.executeQuery('SELECT * FROM users WHERE id = ?', [userId]);  // Using executeQuery instead of db.query
        if (result.length === 0) {
            return res.status(404).send('Employee not found');
        }
        res.json(result[0]);
    } catch (err) {
        console.error('Error fetching employee details:', err);
        return res.status(500).send('Error fetching employee details');
    }
};

// Edit employee details
const updateEmployee = async (req, res) => {
    const userId = req.params.id;
    const {
        username,
        ename,
        des,
        role,
        depart,
        vertical,
        regby,
        email,
        extno,
        mno,
        mnot,
        profile_pic,
        password
    } = req.body;

    if (!username && !ename && !des && !role && !depart && !vertical && !email && !extno && !mno && !mnot && !profile_pic && !password) {
        return res.status(400).send('At least one field must be provided for update');
    }

    let updateFields = [];
    let values = [];

    if (username) {
        updateFields.push('username = ?');
        values.push(username);
    }
    if (ename) {
        updateFields.push('ename = ?');
        values.push(ename);
    }
    if (des) {
        updateFields.push('des = ?');
        values.push(des);
    }
    if (role) {
        updateFields.push('role = ?');
        values.push(role);
    }
    if (depart) {
        updateFields.push('depart = ?');
        values.push(depart);
    }
    if (vertical) {
        updateFields.push('vertical = ?');
        values.push(vertical);
    }
    if (regby) {
        updateFields.push('regby = ?');
        values.push(regby);
    }
    if (email) {
        updateFields.push('email = ?');
        values.push(email);
    }
    if (extno) {
        updateFields.push('extno = ?');
        values.push(extno);
    }
    if (mno) {
        updateFields.push('mno = ?');
        values.push(mno);
    }
    if (mnot) {
        updateFields.push('mnot = ?');
        values.push(mnot);
    }
    if (profile_pic) {
        updateFields.push('profile_pic = ?');
        values.push(profile_pic);
    }

    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        updateFields.push('password = ?');
        values.push(hashedPassword);
    }

    updateFields.push('pass_update = CURRENT_TIMESTAMP');
    updateFields.push('pass_update_by = ?');
    values.push('admin');

    if (updateFields.length === 0) {
        return res.status(400).send('No valid fields provided for update');
    }

    const updateQuery = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = ?;
    `;
    values.push(userId);

    try {
        const result = await db.executeQuery(updateQuery, values);  // Using executeQuery instead of db.query
        if (result.affectedRows === 0) {
            return res.status(404).send('Employee not found');
        }

        const updatedResult = await db.executeQuery('SELECT * FROM users WHERE id = ?', [userId]);
        res.json(updatedResult[0]);
    } catch (err) {
        console.error('Error updating employee data:', err);
        return res.status(500).send('Error updating employee data');
    }
};

// Delete employee
const deleteEmployee = async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await db.executeQuery('DELETE FROM users WHERE id = ?', [userId]);  // Using executeQuery instead of db.query
        if (result.affectedRows === 0) {
            return res.status(404).send('Employee not found');
        }
        res.status(200).send('Employee deleted successfully');
    } catch (err) {
        console.error('Error deleting employee:', err);
        return res.status(500).send('Error deleting employee');
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};
