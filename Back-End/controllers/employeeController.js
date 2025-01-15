const bcrypt = require('bcrypt');
const { executeQuery } = require('../config/db');

// Get all employees
exports.getAllEmployees = async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM users');
        if (results.length === 0) {
            return res.status(404).send('No employees found');
        }
        res.json(results);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).send('Error fetching employees');
    }
};

// Get single employee by ID
exports.getEmployeeById = async (req, res) => {
    const userId = req.params.id;

    try {
        const results = await executeQuery('SELECT * FROM users WHERE id = ?', [userId]);
        if (results.length === 0) {
            return res.status(404).send('Employee not found');
        }
        res.json(results[0]);
    } catch (error) {
        console.error('Error fetching employee details:', error);
        res.status(500).send('Error fetching employee details');
    }
};

// Update employee details
exports.updateEmployee = async (req, res) => {
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

    try {
        const updateFields = [];
        const values = [];

        if (username) updateFields.push('username = ?'), values.push(username);
        if (ename) updateFields.push('ename = ?'), values.push(ename);
        if (des) updateFields.push('des = ?'), values.push(des);
        if (role) updateFields.push('role = ?'), values.push(role);
        if (depart) updateFields.push('depart = ?'), values.push(depart);
        if (vertical) updateFields.push('vertical = ?'), values.push(vertical);
        if (regby) updateFields.push('regby = ?'), values.push(regby);
        if (email) updateFields.push('email = ?'), values.push(email);
        if (extno) updateFields.push('extno = ?'), values.push(extno);
        if (mno) updateFields.push('mno = ?'), values.push(mno);
        if (mnot) updateFields.push('mnot = ?'), values.push(mnot);
        if (profile_pic) updateFields.push('profile_pic = ?'), values.push(profile_pic);
        if (password) {
            const saltRounds = 10;
            const hashedPassword = bcrypt.hashSync(password, saltRounds);
            updateFields.push('password = ?'), values.push(hashedPassword);
        }

        updateFields.push('pass_update = CURRENT_TIMESTAMP');
        updateFields.push('pass_update_by = ?');
        values.push('admin');
        values.push(userId);

        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

        const result = await executeQuery(updateQuery, values);

        if (result.affectedRows === 0) {
            return res.status(404).send('Employee not found');
        }

        const updatedEmployee = await executeQuery('SELECT * FROM users WHERE id = ?', [userId]);

        if (updatedEmployee.length === 0) {
            return res.status(404).send('Employee not found');
        }

        res.json(updatedEmployee[0]);
    } catch (error) {
        console.error('Error updating employee data:', error);
        res.status(500).send('Error updating employee data');
    }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await executeQuery('DELETE FROM users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Employee not found');
        }

        res.status(200).send('Employee deleted successfully');
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).send('Error deleting employee');
    }
};
