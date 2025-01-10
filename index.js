const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { Pool } = require('pg');
const stabilityProductsRoutes = require('./routes/stabilityProducts');

// const mockdate = require('mockdate');
// mockdate.set('2024-12-31');

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure upload directory exists
const dir = 'uploads/profile_pics';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }
    console.log('MySQL Connected...');
});
// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir); // Store images in the uploads/profile_pics directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use('/api/stability_products', stabilityProductsRoutes); // Base path for the API

app.post('/register', upload.single('profile_pic'), async (req, res) => {
    const {
        username,
        password,
        ename, // Employee name
        des, // Designation
        depart, // Department
        vertical, // Vertical
        regby, // Registered by
        auth_role, // Auth role
        email, // Email (can be empty)
        mno, // Mobile number (can be empty)
    } = req.body;

    // Check if profile pic was uploaded, if so, save the file path
    const profilePic = req.file ? req.file.path : null;

    // Normalize the file path to ensure forward slashes
    const normalizedProfilePic = profilePic ? profilePic.replace(/\\/g, '/') : null;

    // Validate required fields (mno is now optional)
    if (!username || !password || !ename) {
        return res.status(400).send('Missing required fields.');
    }

    // Validate password (at least 6 characters)
    if (password.length < 6) {
        return res.status(400).send('Password must be at least 6 characters long.');
    }

    // Validate mobile number format (assuming a 10-digit number, but this should be optional)
    if (mno && !/^\d{10}$/.test(mno)) {
        return res.status(400).send('Invalid mobile number format.');
    }

    try {
        // Check if the username or email already exists (email is now optional)
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE username = ? OR (email = ? AND email IS NOT NULL)', [username, email]);

        if (existingUser.length > 0) {
            return res.status(400).send('Username or email already exists.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const query = `
            INSERT INTO users (
                username, password, ename, des, depart, vertical, regby, 
                auth_role, email, mno, profile_pic
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // If email or mno are not provided, insert NULL
        const values = [
            username,
            hashedPassword,
            ename,
            des,
            depart,
            vertical,
            regby, // regby should come from the session or localStorage
            auth_role,
            email || null, // If email is empty, insert NULL
            mno || null, // If mno is empty, insert NULL
            normalizedProfilePic, // Save the normalized path of the profile picture
        ];

        // Execute the query
        await db.promise().query(query, values);

        // Successfully registered
        res.status(201).json({
            message: 'User registered successfully',
            profilePic: normalizedProfilePic ? `http://localhost:3000/${normalizedProfilePic}` : null // Return full URL to the profile pic if available
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Error processing registration');
    }
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query to get the user by username
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error fetching user');
        }

        // If no user found
        if (results.length === 0) {
            return res.status(400).send('User not found');
        }

        const user = results[0];

        // Compare the entered password with the stored hashed password
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).send('Error comparing passwords');
            }

            // If passwords do not match
            if (!match) {
                return res.status(400).send('Invalid password');
            }

            // Omit the password from the user object before sending response
            const { password, ...userDetails } = user;
            return res.status(200).send({
                message: 'Login successful',
                user: userDetails
            });
        });
    });
});
// Get all employee details endpoint
app.get('/employees', (req, res) => {
    db.query(`
        SELECT *
        FROM users
    `, (err, results) => {
        if (err) {
            console.error('Error fetching employees:', err);
            return res.status(500).send('Error fetching employees');
        }

        if (results.length === 0) {
            return res.status(404).send('No employees found');
        }

        // Return the full list of employees in JSON format
        res.json(results);
    });
});
// Get single employee details by ID
app.get('/employees/:id', (req, res) => {
    const userId = req.params.id; // Get the user ID from the URL parameter

    // Query to fetch the details of the user by their ID
    db.query(`
        SELECT *
        FROM users
        WHERE id = ?;
    `, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching employee details:', err);
            return res.status(500).send('Error fetching employee details');
        }

        if (result.length === 0) {
            return res.status(404).send('Employee not found');
        }

        // Return the single employee data in JSON format
        res.json(result[0]);
    });
});
//Edit User Details
app.put('/employees/:id', (req, res) => {
    const userId = req.params.id; // Get user ID from URL parameter
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
        password // New password, if provided
    } = req.body; // Destructure the fields from the request body

    // Validate at least one field has been provided for update
    if (!username && !ename && !des && !role && !depart && !vertical && !email && !extno && !mno && !mnot && !profile_pic && !password) {
        return res.status(400).send('At least one field must be provided for update');
    }

    // Start building the query dynamically
    let updateFields = [];
    let values = [];
    let valueIndex = 1;

    // Add fields to update
    if (username) {
        updateFields.push(`username = ?`);
        values.push(username);
    }
    if (ename) {
        updateFields.push(`ename = ?`);
        values.push(ename);
    }
    if (des) {
        updateFields.push(`des = ?`);
        values.push(des);
    }
    if (role) {
        updateFields.push(`role = ?`);
        values.push(role);
    }
    if (depart) {
        updateFields.push(`depart = ?`);
        values.push(depart);
    }
    if (vertical) {
        updateFields.push(`vertical = ?`);
        values.push(vertical);
    }
    if (regby) {
        updateFields.push(`regby = ?`);
        values.push(regby);
    }
    if (email) {
        updateFields.push(`email = ?`);
        values.push(email);
    }
    if (extno) {
        updateFields.push(`extno = ?`);
        values.push(extno);
    }
    if (mno) {
        updateFields.push(`mno = ?`);
        values.push(mno);
    }
    if (mnot) {
        updateFields.push(`mnot = ?`);
        values.push(mnot);
    }
    if (profile_pic) {
        updateFields.push(`profile_pic = ?`);
        values.push(profile_pic);
    }

    // Hash password if provided
    if (password) {
        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        updateFields.push(`password = ?`);
        values.push(hashedPassword);
    }

    // Add pass_update and pass_update_by to the query
    updateFields.push('pass_update = CURRENT_TIMESTAMP');
    updateFields.push('pass_update_by = ?');
    values.push('admin'); // You can replace 'admin' with the actual user performing the update

    // Check if we have any fields to update
    if (updateFields.length === 0) {
        return res.status(400).send('No valid fields provided for update');
    }

    // Build the final query string for the UPDATE
    const updateQuery = `
        UPDATE users
        SET
            ${updateFields.join(', ')}
        WHERE id = ?;
    `;
    values.push(userId); // Add the user ID as the last parameter

    // Log the query and values for debugging
    // console.log("Query:", updateQuery);
    // console.log("Values:", values);

    // Execute the UPDATE query to update the user in the database
    db.query(updateQuery, values, (err, result) => {
        if (err) {
            console.error('Error updating employee data:', err);
            return res.status(500).send('Error updating employee data');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Employee not found');
        }

        // Query to fetch the updated employee data
        const selectQuery = `SELECT * FROM users WHERE id = ?`;

        // Execute the SELECT query to get the updated user details
        db.query(selectQuery, [userId], (err, result) => {
            if (err) {
                console.error('Error fetching updated employee data:', err);
                return res.status(500).send('Error fetching updated employee data');
            }

            if (result.length === 0) {
                return res.status(404).send('Employee not found');
            }

            // Send back the updated employee data
            res.json(result[0]);
        });
    });
});
app.delete('/employees/:id', (req, res) => {
    const userId = req.params.id; // Get the user ID from the URL parameter

    // Query to delete the user by their ID
    db.query(`
        DELETE FROM users
        WHERE id = ?;
    `, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting employee:', err);
            return res.status(500).send('Error deleting employee');
        }

        if (result.affectedRows === 0) {
            // If no rows were affected, the employee wasn't found
            return res.status(404).send('Employee not found');
        }

        // Successfully deleted the employee
        res.status(200).send('Employee deleted successfully');
    });
});

app.get('/trfs/:vertical', (req, res) => {
    const vertical = req.params.vertical;

    if (!vertical) {
        return res.status(400).json({ message: 'Vertical not found' });
    }

    let query;
    switch (vertical) {
        case 'ay':
            query = 'SELECT * FROM trfforayurveda';
            break;
        case 'nt':
            query = 'SELECT * FROM trffornutra';
            break;
        case 'ph':
            query = 'SELECT * FROM trfforpharma';
            break;
        case 'sp':
            query = 'SELECT * FROM trfforsports';
            break;
        default:
            return res.status(400).json({ message: 'Invalid vertical' });
    }

    db.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database query error', error });
        }
        res.json(results); // Make sure this is returning JSON
    });
});
app.post('/trfs/:vertical/test-request-form', (req, res) => {
    const vertical = req.params.vertical;
    const { pname, mfgdate, expdate, batchno, batchsize, sampleqty, toard, toardmicro, samplestage, avgwtvol, reqby } = req.body;

    // Check for missing required fields
    if (!vertical || !pname || !mfgdate || !batchno || !samplestage) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Define the table name, ARNSPORT column, SRN column, and prefix for each vertical
    const prefixMap = {
        'ay': { table: 'trfforayurveda', arnColumn: 'arnayurveda', srnColumn: 'aysrn', prefix: 'TIC/ARD/AY/' },
        'nt': { table: 'trffornutra', arnColumn: 'arnnutra', srnColumn: 'ntsrn', prefix: 'TIC/ARD/NT/' },
        'ph': { table: 'trfforpharma', arnColumn: 'arnpharma', srnColumn: 'phsrn', prefix: 'TIC/ARD/PH/' },
        'sp': { table: 'trfforsports', arnColumn: 'arnsports', srnColumn: 'spsrn', prefix: 'TIC/ARD/SP/' }
    };

    // Check if the vertical is valid
    if (!prefixMap[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical' });
    }

    const { table, arnColumn, srnColumn, prefix } = prefixMap[vertical];

    // Determine the suffix based on the sampling stage
    let samplingSuffix = '';
    switch (samplestage) {
        case 'Raw Material':
            samplingSuffix = 'RM';
            break;
        case 'In-Progress':
            samplingSuffix = 'IP';
            break;
        case 'Semi-Finished':
            samplingSuffix = 'SF';
            break;
        case 'Finished Good':
            samplingSuffix = 'FP';
            break;
        default:
            return res.status(400).json({ message: 'Invalid sampling stage' });
    }

    // Construct the prefix with the appropriate suffix
    const fullPrefix = `${prefix}${samplingSuffix}/`;

    // Get the current year to construct the prefix (e.g., 24 for 2024)
    const currentYear = new Date().getFullYear().toString().slice(-2); // Extract last 2 digits of the year

    // Fetch the greatest numeric ARNSPORT for the current year (based on year prefix)
    db.query(`
        SELECT MAX(CAST(SUBSTRING(${arnColumn}, 3) AS UNSIGNED)) AS maxArnsport
        FROM ${table}
        WHERE ${arnColumn} LIKE '${currentYear}%'
    `, (error, results) => {
        if (error) {
            console.error('Error fetching greatest ARNSPORT:', error);
            return res.status(500).json({ message: 'Error fetching greatest ARNSPORT', error });
        }

        // Get the greatest numeric ARNSPORT and increment it
        const maxArnsport = results[0].maxArnsport || 0; // If no ARNSPORT exists, start from 0
        const newArnsport = maxArnsport + 1;  // Increment the greatest ARNSPORT by 1

        // Format the new ARNSPORT with the current year and padded to 4 digits (e.g., 240001)
        const newArnsportFormatted = `${currentYear}${newArnsport.toString().padStart(4, '0')}`;

        // Fetch the greatest SRN value (ensure it's treated as a number)
        db.query(`
            SELECT MAX(CAST(${srnColumn} AS UNSIGNED)) AS maxSrn
            FROM ${table}
        `, (error, results) => {
            if (error) {
                console.error('Error fetching greatest SRN:', error);
                return res.status(500).json({ message: 'Error fetching greatest SRN', error });
            }

            // Ensure SRN is treated as an integer and increment it
            const maxSrn = results[0].maxSrn || 0; // If no SRN exists, start from 0
            const newSrn = maxSrn + 1;  // Increment the greatest SRN by 1

            // Construct the insert query based on the vertical (including arnprefix)
            let insertQuery = `INSERT INTO ${table} 
                (pname, mfgdate, expdate, batchno, batchsize, sampleqty, toard, toardmicro, samplestage, avgwtvol, reqby, ${arnColumn}, ${srnColumn}, arnprefix) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;  // Include arnprefix and srn

            // Get the value for `toard` and `toardmicro`
            const toardValue = toard ? 'ARD' : null;
            const toardmicroValue = toardmicro ? 'ARD-Micro' : null;

            // Values to insert into the table (formatted ARNSPORT and SRN)
            const values = [
                pname,
                mfgdate,
                expdate,
                batchno,
                batchsize,
                sampleqty,
                toardValue,
                toardmicroValue,
                samplestage,
                avgwtvol,
                reqby,
                newArnsportFormatted, // ARNSPORT value
                newSrn,               // SRN value (simple increment)
                fullPrefix            // ARNPREFIX value
            ];

            // Perform the database insert
            db.query(insertQuery, values, (error, results) => {
                if (error) {
                    console.error('Database insert error:', error);
                    return res.status(500).json({ message: 'Database insert error', error });
                }

                res.status(201).json({ message: 'Data inserted successfully', id: results.insertId, arnsport: newArnsportFormatted, srn: newSrn, prefix: fullPrefix });
            });
        });
    });
});

app.get('/trfs/:vertical/:arn/:field', (req, res) => {
    const vertical = req.params.vertical;
    const arn = req.params.arn;
    const field = req.params.field;

    // Define the table and SRN column based on the vertical
    const prefixMap = {
        'ay': { table: 'trfforayurveda', srnColumn: 'arnayurveda' },
        'nt': { table: 'trffornutra', srnColumn: 'arnnutra' },
        'ph': { table: 'trfforpharma', srnColumn: 'arnpharma' },
        'sp': { table: 'trfforsports', srnColumn: 'arnsports' }
    };

    if (!prefixMap[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical' });
    }

    const { table, srnColumn } = prefixMap[vertical];

    // Construct the query to fetch the field data
    const query = `SELECT ${field} FROM ${table} WHERE ${srnColumn} = ?`;

    // Perform the database query to get the updated field data
    db.query(query, [arn], (error, results) => {
        if (error) {
            console.error('Database fetch error:', error);
            return res.status(500).json({ message: 'Database fetch error', error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }

        // Return the updated field data
        res.status(200).json({ [field]: results[0][field] });
    });
});
const updateField = (fieldName, req, res) => {
    const vertical = req.params.vertical;
    const arn = req.params.arn;
    const fieldValue = req.body[fieldName];

    // Log incoming request data for debugging
    // console.log(`Received ${fieldName} update request for vertical: ${vertical}, ARN: ${arn}`);

    // Check for missing required fields
    if (!vertical || !arn || !fieldValue) {
        return res.status(400).json({ message: `Missing vertical, ARN, or ${fieldName}` });
    }

    // Define the table name and SRN column for each vertical
    const prefixMap = {
        'ay': {
            table: 'trfforayurveda',
            srnColumn: 'arnayurveda',
            dateColumns: {
                checkedby: 'chkdate',
                receivedby: 'receivedate',
                reviewby: 'reviewdate',
                approvedby: 'approvedate',
                prepby: 'prepdate' // Add prepby and prepdate
            }
        },
        'nt': {
            table: 'trffornutra',
            srnColumn: 'arnnutra',
            dateColumns: {
                checkedby: 'chkdate',
                receivedby: 'receivedate',
                reviewby: 'reviewdate',
                approvedby: 'approvedate',
                prepby: 'prepdate' // Add prepby and prepdate
            }
        },
        'ph': {
            table: 'trfforpharma',
            srnColumn: 'arnpharma',
            dateColumns: {
                checkedby: 'chkdate',
                receivedby: 'receivedate',
                reviewby: 'reviewdate',
                approvedby: 'approvedate',
                prepby: 'prepdate' // Add prepby and prepdate
            }
        },
        'sp': {
            table: 'trfforsports',
            srnColumn: 'arnsports',
            dateColumns: {
                checkedby: 'chkdate',
                receivedby: 'receivedate',
                reviewby: 'reviewdate',
                approvedby: 'approvedate',
                prepby: 'prepdate' // Add prepby and prepdate
            }
        },
    };

    // Check if the vertical is valid
    if (!prefixMap[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical' });
    }

    const { table, srnColumn, dateColumns } = prefixMap[vertical];

    // Get the correct date column based on the field name
    const dateColumn = dateColumns[fieldName];
    if (!dateColumn) {
        return res.status(400).json({ message: `Invalid field name: ${fieldName}` });
    }

    // Construct the update query based on the field
    const updateQuery = `
        UPDATE ${table}
        SET ${fieldName} = ?, ${dateColumn} = NOW()
        WHERE ${srnColumn} = ?`;

    // Perform the database update
    db.query(updateQuery, [fieldValue, arn], (error, results) => {
        if (error) {
            console.error('Database update error:', error);  // log error for debugging
            return res.status(500).json({ message: 'Database update error', error });
        }

        // Check if any rows were affected
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }

        // Successful update response
        res.status(200).json({ message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully` });
    });
};
// Generic Update Route for all fields
app.put('/trfs/:vertical/:arn/:field', (req, res) => {
    const { field } = req.params;

    // Check if field is one of the allowed fields
    const allowedFields = ['checkedby', 'receivedby', 'reviewby', 'approvedby', 'prepby']; // Add prepby here
    if (!allowedFields.includes(field)) {
        return res.status(400).json({ message: 'Invalid field name' });
    }

    // Call the updateField utility function
    updateField(field, req, res);
});
// API to fetch combined data from relevant tables based on vertical and trfid
app.get('/trfs/:vertical/:trfid', (req, res) => {
    const { vertical, trfid } = req.params;  // Get vertical and trfid from URL parameters

    // Define the table names for different verticals
    const tableMap = {
        'ay': { table: 'trfforayurveda', testTable: 'trftestforayurveda', reviseTable: 'trf_revise_results_for_ayurveda', subTestTable: 'trf_sub_testforayurveda', arn: 'ayurveda' },
        'nt': { table: 'trffornutra', testTable: 'trftestfornutra', reviseTable: 'trf_revise_results_for_nutra', subTestTable: 'trf_sub_testfornutra', arn: 'nutra' },
        'ph': { table: 'trfforpharma', testTable: 'trftestforpharma', reviseTable: 'trf_revise_results_for_pharma', subTestTable: 'trf_sub_testforpharma', arn: 'pharma' },
        'sp': { table: 'trfforsports', testTable: 'trftestforsports', reviseTable: 'trf_revise_results_for_sports', subTestTable: 'trf_sub_testforsports', arn: 'sports' }
    };

    // Check if the vertical is valid
    if (!tableMap[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical' });
    }

    // Get the correct table names based on the vertical
    const { table, testTable, reviseTable, subTestTable, arn } = tableMap[vertical];

    // Queries to fetch data from different tables
    const queryTrf = `SELECT * FROM ${table} WHERE arn${arn} = ?`;
    const queryTest = `SELECT * FROM ${testTable} WHERE trfid = ?`;  // Data from the test table (multiple records)
    const queryReviseResults = `SELECT * FROM ${reviseTable} WHERE trfid = ?`;  // Data from the revise results table (multiple records)
    const querySubTestResults = `SELECT * FROM ${subTestTable} WHERE trfid = ?`;  // Data from the sub-test results table (multiple records)

    // Fetch data from the main table (single record)
    db.query(queryTrf, [trfid], (errTrf, resultsTrf) => {
        if (errTrf) {
            console.error('Error fetching data from main table:', errTrf);
            return res.status(500).json({ message: 'Error fetching data from the main table', error: errTrf });
        }

        if (resultsTrf.length === 0) {
            return res.status(404).json({ message: 'Main table record not found' });
        }

        // Fetch related data from the test table
        db.query(queryTest, [trfid], (errTest, resultsTest) => {
            if (errTest) {
                console.error('Error fetching data from test table:', errTest);
                return res.status(500).json({ message: 'Error fetching data from test table', error: errTest });
            }

            // Fetch related data from the revise results table
            db.query(queryReviseResults, [trfid], (errReviseResults, resultsReviseResults) => {
                if (errReviseResults) {
                    console.error('Error fetching data from revise results table:', errReviseResults);
                    return res.status(500).json({ message: 'Error fetching data from revise results table', error: errReviseResults });
                }

                // Fetch related data from the sub-test results table
                db.query(querySubTestResults, [trfid], (errSubTestResults, resultsSubTestResults) => {
                    if (errSubTestResults) {
                        console.error('Error fetching data from sub-test results table:', errSubTestResults);
                        return res.status(500).json({ message: 'Error fetching data from sub-test results table', error: errSubTestResults });
                    }

                    // Combine the data and send the response
                    res.json({
                        trfData: resultsTrf[0],
                        testData: resultsTest,
                        // reviseResults: resultsReviseResults,  
                        subTestResults: resultsSubTestResults
                    });
                });
            });
        });
    });
});
// Delete API for trf 
app.delete('/trfs/:vertical/:trfid', (req, res) => {
    const { vertical, trfid } = req.params;

    const tableMap = {
        'ay': { table: 'trfforayurveda', testTable: 'trftestforayurveda', reviseTable: 'trf_revise_results_for_ayurveda', subTestTable: 'trf_sub_testforayurveda', arn: 'ayurveda', arnColumn: 'arnayurveda' },
        'nt': { table: 'trffornutra', testTable: 'trftestfornutra', reviseTable: 'trf_revise_results_for_nutra', subTestTable: 'trf_sub_testfornutra', arn: 'nutra', arnColumn: 'arnnutra' },
        'ph': { table: 'trfforpharma', testTable: 'trftestforpharma', reviseTable: 'trf_revise_results_for_pharma', subTestTable: 'trf_sub_testforpharma', arn: 'pharma', arnColumn: 'arnpharma' },
        'sp': { table: 'trfforsports', testTable: 'trftestforsports', reviseTable: 'trf_revise_results_for_sports', subTestTable: 'trf_sub_testforsports', arn: 'sports', arnColumn: 'arnsports' }
    };

    if (!tableMap[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical' });
    }

    const { table, testTable, reviseTable, subTestTable, arn, arnColumn } = tableMap[vertical];

    db.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ message: 'Error starting transaction', error: err });
        }

        // Step 1: Check if the main record exists
        const checkExistsQuery = `SELECT COUNT(*) as count FROM ${table} WHERE ${arnColumn} = ?`;
        db.query(checkExistsQuery, [trfid], (errCheck, resultsCheck) => {
            if (errCheck) {
                return db.rollback(() => {
                    console.error('Error checking existence in main table:', errCheck);
                    return res.status(500).json({ message: 'Error checking existence in main table', error: errCheck });
                });
            }

            if (resultsCheck[0].count === 0) {
                return db.rollback(() => {
                    return res.status(404).json({ message: 'Record not found in main table' });
                });
            }

            // Step 2: Proceed with deletions
            const deleteQueries = [
                { query: `DELETE FROM ${testTable} WHERE trfid = ?`, params: [trfid] },
                { query: `DELETE FROM ${reviseTable} WHERE trfid = ?`, params: [trfid] },
                { query: `DELETE FROM ${subTestTable} WHERE trfid = ?`, params: [trfid] },
                { query: `DELETE FROM ${table} WHERE ${arnColumn} = ?`, params: [trfid] }
            ];

            let queryCounter = 0;

            deleteQueries.forEach(({ query, params }) => {
                db.query(query, params, (errDelete) => {
                    queryCounter++;
                    if (errDelete) {
                        console.error('Error during deletion:', errDelete);
                        return db.rollback(() => {
                            return res.status(500).json({ message: 'Error deleting records', error: errDelete });
                        });
                    }

                    // Step 3: Check if all delete queries are complete
                    if (queryCounter === deleteQueries.length) {
                        // Step 4: Adjust the auto-increment based on the last ARN value
                        const getMaxArnQuery = `
                            SELECT MAX(${arnColumn}) AS max_arn 
                            FROM ${table}
                        `;
                        db.query(getMaxArnQuery, (errMaxArn, result) => {
                            if (errMaxArn) {
                                console.error('Error getting max ARN value:', errMaxArn);
                                return db.rollback(() => {
                                    return res.status(500).json({ message: 'Error getting max ARN value', error: errMaxArn });
                                });
                            }

                            const lastArnNumber = result[0].max_arn || 0;
                            const nextAutoIncrement = lastArnNumber + 1;

                            // Step 5: Set the auto-increment value to the next available ARN number
                            const setAutoIncrementQuery = `ALTER TABLE ${table} AUTO_INCREMENT = ?`;
                            db.query(setAutoIncrementQuery, [nextAutoIncrement], (errAutoIncrement) => {
                                if (errAutoIncrement) {
                                    console.error('Error setting auto-increment value:', errAutoIncrement);
                                    return db.rollback(() => {
                                        return res.status(500).json({ message: 'Error setting auto-increment value', error: errAutoIncrement });
                                    });
                                }

                                // Commit the transaction after all operations are successful
                                db.commit((errCommit) => {
                                    if (errCommit) {
                                        return db.rollback(() => {
                                            console.error('Error committing transaction:', errCommit);
                                            return res.status(500).json({ message: 'Error committing transaction', error: errCommit });
                                        });
                                    }

                                    res.status(200).json({ message: 'TRF data and related records deleted successfully, and auto-increment updated' });
                                });
                            });
                        });
                    }
                });
            });
        });
    });
});
// Add a new Test
app.post('/trfs/:vertical/:trfid', (req, res) => {
    const { vertical, trfid } = req.params;
    const {
        test, claim, spes, results, file, updateby, resultupdateon, reqby, reqtime, unit, samplestage, upby, updateon
    } = req.body;

    // List of valid verticals and corresponding table names
    const tables = {
        'ay': 'trftestforayurveda',
        'nt': 'trftestfornutra',
        'sp': 'trftestforsports',
        'ph': 'trftestforpharma'
    };

    // Check if the vertical is valid
    if (!tables[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical type. Use ay, nt, sp, or ph.' });
    }

    const table = tables[vertical];

    // Query to insert data into the corresponding table
    const query = `
      INSERT INTO ${table} (trfid, test, claim, spes, results, file, updateby, resultupdateon, reqby, reqtime, unit, samplestage, upby, updateon)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [trfid, test, claim, spes, results, file, updateby, resultupdateon, reqby, reqtime, unit, samplestage, upby, updateon];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error adding test:', err);
            return res.status(500).json({ message: 'Error adding new test record', error: err });
        }
        res.status(201).json({ message: 'Test added successfully', testId: result.insertId });
    });
});
app.put('/trfs/:vertical/:trfid/:id/test', (req, res) => {
    const { vertical, trfid, id } = req.params; // Destructure 'id' and 'trfid' from params
    const {
        test, claim, spes, upby, unit, reqby, reqtime
    } = req.body; // Get the data to update from the request body

    // List of valid verticals and corresponding table names
    const tables = {
        'ay': 'trftestforayurveda',
        'nt': 'trftestfornutra',
        'sp': 'trftestforsports',
        'ph': 'trftestforpharma'
    };

    // Check if the vertical is valid
    if (!tables[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical type. Use ay, nt, sp, or ph.' });
    }

    const table = tables[vertical];

    // Query to update the test record in the corresponding table
    const query = `
      UPDATE ${table} 
      SET 
        test = ?, 
        claim = ?, 
        spes = ?, 
        upby = ?, 
        updateon = NOW(),   
        unit = ?
      WHERE trfid = ? AND id = ? 
    `;

    const values = [
        test, claim, spes, upby,
        unit, trfid, id
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating test:', err);
            return res.status(500).json({ message: 'Error updating test record', error: err });
        }

        // If no rows are affected, that means the test wasn't found or the trfid didn't match
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Test not found or invalid TRF ID' });
        }

        // Respond with success message
        res.status(200).json({ message: 'Test updated successfully', testId: id });
    });
});
// add result data 
app.put('/trfs/:vertical/:trfid/:id/result', (req, res) => {
    const { vertical, trfid, id } = req.params; // Destructure 'id' and 'trfid' from params
    const {
        updateby, results
    } = req.body; // Get the data to update from the request body

    // List of valid verticals and corresponding table names
    const tables = {
        'ay': 'trftestforayurveda',
        'nt': 'trftestfornutra',
        'sp': 'trftestforsports',
        'ph': 'trftestforpharma'
    };

    // Check if the vertical is valid
    if (!tables[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical type. Use ay, nt, sp, or ph.' });
    }

    const table = tables[vertical];

    // Query to update the result record in the corresponding table
    const query = `
      UPDATE ${table} 
      SET 
        updateby = ?, 
        results = ?, 
        resultupdateon = NOW()
      WHERE trfid = ? AND id = ?
    `;

    const values = [
        updateby, results, trfid, id
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating result:', err);
            return res.status(500).json({ message: 'Error updating result record', error: err });
        }

        // If no rows are affected, that means the record wasn't found or the trfid didn't match
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Result not found or invalid TRF ID' });
        }

        // Respond with success message
        res.status(200).json({ message: 'Result updated successfully', resultId: id });
    });
});
// remove result data 
app.put('/trfs/:vertical/:trfid/:id/result/clear', (req, res) => {
    const { vertical, trfid, id } = req.params; // Extract parameters from URL
    // List of valid verticals and corresponding table names
    const tables = {
        'ay': 'trftestforayurveda',
        'nt': 'trftestfornutra',
        'sp': 'trftestforsports',
        'ph': 'trftestforpharma'
    };

    // Check if the vertical is valid
    if (!tables[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical type. Use ay, nt, sp, or ph.' });
    }

    const table = tables[vertical];

    // Query to clear the results field in the corresponding table
    const query = `
        UPDATE ${table} 
        SET results = NULL, resultupdateon = NOW()
        WHERE trfid = ? AND id = ?
    `;

    const values = [trfid, id];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error clearing result:', err);
            return res.status(500).json({ message: 'Error clearing result record', error: err });
        }

        // If no rows are affected, that means the record wasn't found or the trfid didn't match
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Result not found or invalid TRF ID' });
        }

        // Respond with success message
        res.status(200).json({ message: 'Result cleared successfully' });
    });
});
app.delete('/trfs/:vertical/:trfid/:testid', (req, res) => {
    const { vertical, trfid, testid } = req.params;

    // Map of valid verticals and corresponding table names
    const tables = {
        'ay': 'trftestforayurveda',
        'nt': 'trftestfornutra',
        'sp': 'trftestforsports',
        'ph': 'trftestforpharma'
    };

    // Map of vertical shorthand to full name for sub-test tables
    const subTestTables = {
        'ay': 'trf_sub_testforayurveda',
        'nt': 'trf_sub_testfornutra',
        'sp': 'trf_sub_testforsports',
        'ph': 'trf_sub_testforpharma'
    };

    // Check if the vertical is valid
    if (!tables[vertical] || !subTestTables[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical type. Use ay, nt, sp, or ph.' });
    }

    const table = tables[vertical];
    const subTestTable = subTestTables[vertical];

    // Step 1: Delete associated sub-tests using testid
    const deleteSubTestsQuery = `
        DELETE FROM ${subTestTable}
        WHERE testid = ? AND trfid = ?
    `;

    db.query(deleteSubTestsQuery, [testid, trfid], (err) => {
        if (err) {
            console.error('Error deleting sub-tests:', err);
            return res.status(500).json({ message: 'Error deleting associated sub-tests', error: err });
        }

        // Step 2: Delete the test record using id from the main table
        const deleteTestQuery = `
            DELETE FROM ${table}
            WHERE trfid = ? AND id = ?  -- Use 'id' for the main table
        `;

        db.query(deleteTestQuery, [trfid, testid], (err, result) => {
            if (err) {
                console.error('Error deleting test:', err);
                return res.status(500).json({ message: 'Error deleting test record', error: err });
            }

            // Check if the test was found and deleted
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Test not found or invalid TRF ID' });
            }

            // Respond with success message
            res.status(200).json({ message: 'Test and related sub-tests deleted successfully', testId: testid });
        });
    });
});
// Add Subtest Api's
app.post('/trfs/:vertical/:trfid/subtests', (req, res) => {
    const { vertical, trfid } = req.params;
    const { testid, test, claim, spes, unit } = req.body;

    // List of valid verticals and corresponding table names
    const tables = {
        'ay': 'trf_sub_testforayurveda',
        'nt': 'trf_sub_testfornutra',
        'sp': 'trf_sub_testforsports',
        'ph': 'trf_sub_testforpharma'
    };

    // Check if the vertical is valid
    if (!tables[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical type. Use ay, nt, sp, or ph.' });
    }

    const table = tables[vertical];

    // Query to insert data into the corresponding sub-test table (no results field)
    const query = `
        INSERT INTO ${table} (trfid, testid, test, claim, spes, unit)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [trfid, testid, test, claim, spes, unit];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error adding sub-test:', err);
            return res.status(500).json({ message: 'Error adding new sub-test record', error: err });
        }
        res.status(201).json({ message: 'Sub-test added successfully', subTestId: result.insertId });
    });
});
// edit spes and claim
app.put('/trfs/:vertical/:trfid/subtests/:sub_testid', (req, res) => {
    const { vertical, trfid, sub_testid } = req.params;
    const {
        test, claim, spes, unit, upby, updateon
    } = req.body; // Only these fields will be updated

    // List of valid verticals and corresponding table names
    const tables = {
        'ay': 'trf_sub_testforayurveda',
        'nt': 'trf_sub_testfornutra',
        'sp': 'trf_sub_testforsports',
        'ph': 'trf_sub_testforpharma'
    };

    // Check if the vertical is valid
    if (!tables[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical type. Use ay, nt, sp, or ph.' });
    }

    const table = tables[vertical];

    // Query to update only the required fields
    const query = `
        UPDATE ${table}
        SET test = ?, claim = ?, spes = ?, unit = ?, upby = ?, updateon = ?
        WHERE sub_testid = ? AND trfid = ?
    `;

    const values = [test, claim, spes, unit, upby, updateon, sub_testid, trfid];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating sub-test:', err);
            return res.status(500).json({ message: 'Error updating sub-test record', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sub-test not found' });
        }

        res.status(200).json({ message: 'Sub-test updated successfully' });
    });
});
// add result subtest api 
app.put('/trfs/:vertical/:trfid/subtests/:sub_testid/subresults', (req, res) => {
    const { vertical, trfid, sub_testid } = req.params;
    const { results, updateby } = req.body; // `updateby` is now coming from the frontend

    // List of valid verticals and corresponding table names
    const tables = {
        'ay': 'trf_sub_testforayurveda',
        'nt': 'trf_sub_testfornutra',
        'sp': 'trf_sub_testforsports',
        'ph': 'trf_sub_testforpharma'
    };

    // Check if the vertical is valid
    if (!tables[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical type. Use ay, nt, sp, or ph.' });
    }

    const table = tables[vertical];

    // Current date for `resultupdateon`
    const resultupdateon = new Date().toISOString(); // Current timestamp in ISO format

    // Query to update only the required fields: results, updateby, and resultupdateon
    const query = `
        UPDATE ${table}
        SET results = ?, updateby = ?, resultupdateon = ?
        WHERE sub_testid = ? AND trfid = ?
    `;

    const values = [results, updateby, resultupdateon, sub_testid, trfid];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating results:', err);
            return res.status(500).json({ message: 'Error updating results', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sub-test not found' });
        }

        res.status(200).json({ message: 'Results updated successfully' });
    });
});
// clear result subtest data
app.put('/trfs/:vertical/:trfid/subtests/:sub_testid/subresults/clear', (req, res) => {
    const { vertical, trfid, sub_testid } = req.params; // Extract parameters from URL

    // List of valid verticals and corresponding table names
    const tables = {
        'ay': 'trf_sub_testforayurveda',
        'nt': 'trf_sub_testfornutra',
        'sp': 'trf_sub_testforsports',
        'ph': 'trf_sub_testforpharma'
    };

    // Check if the vertical is valid
    if (!tables[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical type. Use ay, nt, sp, or ph.' });
    }

    const table = tables[vertical];

    // Query to clear the results field in the corresponding table
    const query = `
        UPDATE ${table}
        SET results = NULL, resultupdateon = NOW()
        WHERE sub_testid = ? AND trfid = ?
    `;

    const values = [sub_testid, trfid];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error clearing results:', err);
            return res.status(500).json({ message: 'Error clearing results', error: err });
        }

        // If no rows are affected, that means the record wasn't found or the sub_testid/trfid didn't match
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sub-test not found or invalid TRF ID' });
        }

        // Respond with success message
        res.status(200).json({ message: 'Results cleared successfully' });
    });
});
app.delete('/trfs/:vertical/:trfid/subtests/:sub_testid', (req, res) => {
    const { vertical, trfid, sub_testid } = req.params;

    // List of valid verticals and corresponding table names
    const tables = {
        'ay': 'trf_sub_testforayurveda',
        'nt': 'trf_sub_testfornutra',
        'sp': 'trf_sub_testforsports',
        'ph': 'trf_sub_testforpharma'
    };

    // Check if the vertical is valid
    if (!tables[vertical]) {
        return res.status(400).json({ message: 'Invalid vertical type. Use ay, nt, sp, or ph.' });
    }

    const table = tables[vertical];

    // Query to delete the sub-test
    const query = `
        DELETE FROM ${table}
        WHERE sub_testid = ? AND trfid = ?
        `;

    const values = [sub_testid, trfid];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error deleting sub-test:', err);
            return res.status(500).json({ message: 'Error deleting sub-test record', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sub-test not found' });
        }

        res.status(200).json({ message: 'Sub-test deleted successfully' });
    });
});

// Endpoint to fetch all products
app.get('/all-products', (req, res) => {
    // SQL query to select all products
    const query = `
        SELECT id, prepix, pname, createdon  
        FROM products_for_reporting
        ORDER BY createdon DESC`;  // Sorting by 'createdon' instead of 'created_at'

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({
                error: 'Database error while fetching products'
            });
        }

        // Respond with the fetched products
        res.status(200).json(results);
    });
});
// Endpoint to add a product
app.post('/Add-Product', (req, res) => {
    const { prepix, pname } = req.body;  // Change 'product_name' to 'pname'

    // Input validation
    if (!prepix || !pname) {
        return res.status(400).json({ error: 'prepix and pname are required' });  // Change 'product_name' to 'pname'
    }

    // Start a transaction to ensure atomicity
    db.beginTransaction((err) => {
        if (err) {
            console.error('Transaction error:', err);
            return res.status(500).json({ error: 'Transaction initialization failed' });
        }

        // SQL query to get the highest suffix for the given prefix
        const selectMaxIdQuery = `
            SELECT MAX(CAST(SUBSTRING(prepix, LENGTH(?) + 1) AS UNSIGNED)) AS max_id
            FROM products_for_reporting
            WHERE prepix LIKE ?`;

        db.query(selectMaxIdQuery, [prepix, `${prepix}%`], (err, result) => {
            if (err) {
                console.error('Error fetching last ID:', err);
                return db.rollback(() => {
                    res.status(500).json({ error: 'Error fetching the last ID' });
                });
            }

            // Calculate the next suffix for the prefix
            const nextId = result[0]?.max_id ? result[0].max_id + 1 : 1;
            const newPrepix = `${prepix}${nextId}`;

            console.log(`Generated new prefix: ${newPrepix}`);

            // SQL query to insert a new product
            const insertQuery = `
                INSERT INTO products_for_reporting (prepix, pname)
                VALUES (?, ?)`;

            db.query(insertQuery, [newPrepix, pname], (err, result) => {
                if (err) {
                    console.error('Error inserting product:', err);
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Error inserting product data' });
                    });
                }

                // Commit the transaction
                db.commit((err) => {
                    if (err) {
                        console.error('Transaction commit error:', err);
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Transaction commit failed' });
                        });
                    }

                    res.status(201).json({
                        message: 'Product added successfully',
                        id: result.insertId,
                        prepix_column: newPrepix,  // Change 'prefix_column' to 'prepix_column'
                    });
                });
            });
        });
    });
});
// Endpoint to edit a product
app.put('/Edit-Product/:id', (req, res) => {
    const { id } = req.params; // Get the product ID from URL parameter
    const { prepix, pname } = req.body; // Get the updated prepix and pname from the request body

    // Input validation
    if (!prepix || !pname) {
        return res.status(400).json({ error: 'prepix and pname are required' });
    }

    // Start a transaction to ensure atomicity
    db.beginTransaction((err) => {
        if (err) {
            console.error('Transaction error:', err);
            return res.status(500).json({ error: 'Transaction initialization failed' });
        }

        // SQL query to check if the product exists
        const checkProductQuery = 'SELECT * FROM products_for_reporting WHERE id = ?';

        db.query(checkProductQuery, [id], (err, result) => {
            if (err) {
                console.error('Error checking product existence:', err);
                return db.rollback(() => {
                    res.status(500).json({ error: 'Error checking product existence' });
                });
            }

            // If the product doesn't exist
            if (result.length === 0) {
                return db.rollback(() => {
                    res.status(404).json({ error: 'Product not found' });
                });
            }

            // SQL query to update the product
            const updateQuery = `
                UPDATE products_for_reporting
                SET prepix = ?, pname = ?
                WHERE id = ?`;

            db.query(updateQuery, [prepix, pname, id], (err, result) => {
                if (err) {
                    console.error('Error updating product:', err);
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Error updating product data' });
                    });
                }

                // Commit the transaction
                db.commit((err) => {
                    if (err) {
                        console.error('Transaction commit error:', err);
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Transaction commit failed' });
                        });
                    }

                    res.status(200).json({
                        message: 'Product updated successfully',
                        id: result.insertId, // You can return the updated product ID if needed
                        prepix_column: prepix, // Return the updated prepix
                        pname_column: pname,   // Return the updated pname
                    });
                });
            });
        });
    });
});
// Endpoint to delete a product
app.delete('/Delete-Product/:id', (req, res) => {
    const { id } = req.params; // Get the product ID from URL parameter

    // Check if the ID is a valid number
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }

    // SQL query to delete the product with the given ID
    const deleteQuery = 'DELETE FROM products_for_reporting WHERE id = ?';

    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: 'Error deleting product. Please try again.' });
        }

        // If no rows are affected, the product doesn't exist
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    });
});
// API endpoint to count all prefixes and calculate time worked
app.get('/count-prefixes', (req, res) => {
    // SQL query to count occurrences of all prefixes and calculate time worked
    const query = `
    SELECT prefix, 
           COUNT(*) AS prefix_count,
           COUNT(*) * 2 AS hours_worked,                    -- Each occurrence represents 2 hours of work
           CASE 
               WHEN COUNT(*) * 2 = 2 THEN 0.25
               WHEN COUNT(*) * 2 = 4 THEN 0.50
               WHEN COUNT(*) * 2 = 6 THEN 0.75
               WHEN COUNT(*) * 2 = 8 THEN 1.00
               WHEN COUNT(*) * 2 > 8 THEN ROUND((COUNT(*) * 2) / 8.0, 2) -- Round to 2 decimal places
               ELSE 0
           END AS days_worked                            -- Convert hours to days (increments of 2 hours = 0.25 days)
    FROM (
        SELECT one_prefix_column AS prefix FROM qtr_report WHERE one_prefix_column IS NOT NULL
        UNION ALL
        SELECT two_prefix_column AS prefix FROM qtr_report WHERE two_prefix_column IS NOT NULL
        UNION ALL
        SELECT three_prefix_column AS prefix FROM qtr_report WHERE three_prefix_column IS NOT NULL
        UNION ALL
        SELECT four_prefix_column AS prefix FROM qtr_report WHERE four_prefix_column IS NOT NULL
    ) AS combined_prefixes
    GROUP BY prefix
    ORDER BY prefix_count DESC;
    `;

    // Execute the query
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error executing the query:', err);
            return res.status(500).json({ message: 'Database query failed', error: err });
        }

        // Optional: Ensure all `days_worked` values are displayed with 2 decimal places in the response
        const formattedResult = result.map(item => {
            // Ensure that days_worked is a valid number before calling toFixed
            let daysWorked = Number(item.days_worked); // Convert to number
            if (!isNaN(daysWorked)) {
                item.days_worked = daysWorked.toFixed(2); // Format the days_worked to 2 decimal places
            } else {
                item.days_worked = "0.00"; // If it's not a number, set it to 0.00
            }
            return item;
        });

        // Send the formatted result as JSON response
        res.json(formattedResult);
    });
});
// API endpoint to count all prefixes and calculate time worked
app.get('/count-prefixes', (req, res) => {
    // SQL query to count occurrences of all prefixes and calculate time worked
    const query = `
    SELECT prefix, 
           COUNT(*) AS prefix_count,
           COUNT(*) * 2 AS hours_worked,                    -- Each occurrence represents 2 hours of work
           CASE 
               WHEN COUNT(*) * 2 = 2 THEN 0.25
               WHEN COUNT(*) * 2 = 4 THEN 0.50
               WHEN COUNT(*) * 2 = 6 THEN 0.75
               WHEN COUNT(*) * 2 = 8 THEN 1.00
               WHEN COUNT(*) * 2 > 8 THEN ROUND((COUNT(*) * 2) / 8.0, 2) -- Round to 2 decimal places
               ELSE 0
           END AS days_worked                            -- Convert hours to days (increments of 2 hours = 0.25 days)
    FROM (
        SELECT one_prefix_column AS prefix FROM qtr_report WHERE one_prefix_column IS NOT NULL
        UNION ALL
        SELECT two_prefix_column AS prefix FROM qtr_report WHERE two_prefix_column IS NOT NULL
        UNION ALL
        SELECT three_prefix_column AS prefix FROM qtr_report WHERE three_prefix_column IS NOT NULL
        UNION ALL
        SELECT four_prefix_column AS prefix FROM qtr_report WHERE four_prefix_column IS NOT NULL
    ) AS combined_prefixes
    GROUP BY prefix
    ORDER BY prefix_count DESC;
    `;

    // Execute the query
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error executing the query:', err);
            return res.status(500).json({ message: 'Database query failed', error: err });
        }

        // Optional: Ensure all `days_worked` values are displayed with 2 decimal places in the response
        const formattedResult = result.map(item => {
            item.days_worked = item.days_worked.toFixed(2); // Format the days_worked to 2 decimal places
            return item;
        });

        // Send the formatted result as JSON response
        res.json(formattedResult);
    });
});






/* Reporting System API's */
// for user drop down code 
app.get('/api/pass-users', (req, res) => {
    // Query all users from the users table
    const query = 'SELECT id, username, ename FROM users';

    db.execute(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        // Send response with all users
        res.json(results);
    });
});
// Post Daily Reporting data 
app.post('/reports', (req, res) => {
    const { user_id, report_date, report_details } = req.body;

    // Check if report_details is undefined or empty
    if (!report_details || report_details.trim() === "") {
        return res.status(400).send('Report details cannot be empty');
    }

    console.log('Received data:', { user_id, report_date, report_details });

    // First, check if a report for the same user and date already exists
    const checkReportQuery = 'SELECT * FROM reports WHERE user_id = ? AND report_date = ?';

    db.query(checkReportQuery, [user_id, report_date], (err, result) => {
        if (err) {
            console.error("Error checking existing report:", err);
            return res.status(500).send('Error checking report');
        }

        if (result.length > 0) {
            // If a report already exists, append the new details to the existing report
            const existingReportDetails = result[0].report_details;
            const updatedReportDetails = existingReportDetails + '\n' + report_details;

            // Update the existing report with the appended details
            const updateReportQuery = 'UPDATE reports SET report_details = ? WHERE id = ?';

            db.query(updateReportQuery, [updatedReportDetails, result[0].id], (err, result) => {
                if (err) {
                    console.error("Error updating report:", err);
                    return res.status(500).send('Error updating report');
                }
                res.status(200).send('Report details updated successfully');
            });
        } else {
            // If no report exists, create a new one
            const createReportQuery = 'INSERT INTO reports (user_id, report_date, report_details) VALUES (?, ?, ?)';

            db.query(createReportQuery, [user_id, report_date, report_details], (err, result) => {
                if (err) {
                    console.error("Error creating report:", err);
                    return res.status(500).send('Error creating report');
                }
                res.status(200).send('Report created successfully');
            });
        }
    });
});
app.get('/reports/:date', (req, res) => {
    const { date } = req.params;

    // Query to fetch reports and corresponding user details
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

    db.query(query, [date], (err, results) => {
        if (err) {
            console.error("Error fetching reports:", err);
            return res.status(500).send('Error fetching reports');
        }

        if (results.length === 0) {
            return res.status(404).send('No reports found for the selected date');
        }

        // Send back the result as a JSON response
        res.status(200).json(results);
    });
});
// Update Daily Reporting data
app.put('/reports/:id', (req, res) => {
    const { id } = req.params;  // Get the report ID from the URL parameter
    const { report_details } = req.body;  // Extract report_details from the request body

    // Check if report_details is undefined or empty
    if (!report_details || report_details.trim() === "") {
        return res.status(400).send('Report details cannot be empty');
    }

    const updateReportQuery = 'UPDATE reports SET report_details = ? WHERE id = ?';

    db.query(updateReportQuery, [report_details, id], (err, result) => {
        if (err) {
            console.error("Error updating report:", err);
            return res.status(500).send('Error updating report');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('No report found with the provided ID');
        }

        res.status(200).send('Report details updated successfully');
    });
});
app.delete('/reports/:id', (req, res) => {
    const { id } = req.params;

    // First, check if the report with the given ID exists
    const checkReportQuery = 'SELECT * FROM reports WHERE id = ?';

    db.query(checkReportQuery, [id], (err, result) => {
        if (err) {
            console.error('Error checking report:', err);
            return res.status(500).send('Error checking report');
        }

        if (result.length === 0) {
            // If the report is not found, return a 404 response
            return res.status(404).send('Report not found');
        }

        // Proceed with deleting the report if it exists
        const deleteQuery = 'DELETE FROM reports WHERE id = ?';

        db.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Error deleting report:', err);
                return res.status(500).send('Error deleting report');
            }

            // Successfully deleted the report
            res.status(200).send({ message: 'Report deleted successfully' });
        });
    });
});
// Fetch reported dates for a specific user
app.get('/reports/user/:userId', (req, res) => {
    const { userId } = req.params;

    // MySQL query to get report dates for the given userId
    const query = 'SELECT report_date FROM reports WHERE user_id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching reports:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        // Map the results to return only the date in 'en-GB' format
        const reportedDates = results.map((row) =>
            new Date(row.report_date).toLocaleDateString('en-GB')
        );

        return res.status(200).json(reportedDates);
    });
});

// API endpoint to update the report details
app.put('/update-report', (req, res) => {
    console.log('Request body:', req.body); // Log the request body for debugging
    const { id, report_date, report_details } = req.body;

    // Validation for required fields
    if (!id || !report_date || !report_details) {
        return res.status(400).json({ error: 'Missing required fields (id, report_date, report_details)' });
    }

    // Ensure report_date is in the correct format (YYYY-MM-DD) for SQL query consistency
    const formattedReportDate = new Date(report_date);
    if (isNaN(formattedReportDate.getTime())) {
        return res.status(400).json({ error: 'Invalid report_date format, should be YYYY-MM-DD' });
    }

    // SQL Query to update only the report_details (NOT the report_date)
    const query = `
      UPDATE reports 
      SET report_details = ? 
      WHERE id = ? AND report_date = ?
    `;
    const values = [report_details, id, report_date];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating report:', err);
            return res.status(500).json({ message: 'Error updating report', error: err.message });
        }

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Report updated successfully' });
        } else {
            return res.status(404).json({ message: 'Report not found for the given ID and date' });
        }
    });
});


// Express route to search products based on pname
app.get('/search-prefix-columns', (req, res) => {
    const { pname, prepix } = req.query;

    // Build dynamic SQL query based on query parameters
    let query = `SELECT * FROM products_for_reporting WHERE 1=1`;
    const queryParams = [];

    // Add conditions based on provided parameters
    if (pname) {
        query += ` AND pname LIKE ?`;
        queryParams.push(`%${pname}%`);
    }
    if (prepix) {
        query += ` AND prepix LIKE ?`;
        queryParams.push(`%${prepix}%`);
    }
    // Execute the query
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error searching product prefix:', err.message);
            return res.status(500).json({ error: 'Internal server error while searching product prefix.' });
        }

        // Return results in JSON format
        res.json(results);
    });
});
// post qtr report 
app.post('/qtr-report', (req, res) => {
    const { username, date, one_prefix_column, two_prefix_column, three_prefix_column, four_prefix_column, onLeave } = req.body;

    // Ensure all required fields are provided
    if (!username || !date || !one_prefix_column || !two_prefix_column || !three_prefix_column || !four_prefix_column) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Check for duplicate entry
    const duplicateCheckQuery = `SELECT COUNT(*) AS count FROM qtr_report WHERE username = ? AND date = ?`;
    db.execute(duplicateCheckQuery, [username, date], (err, results) => {
        if (err) {
            console.error('Error checking duplicate report:', err);
            return res.status(500).json({ error: 'An error occurred while checking duplicate report' });
        }

        if (results[0].count > 0) {
            return res.status(400).json({ error: 'You have already reported on this date for this user.' });
        }

        // Insert the new report
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

        db.execute(query, values, (insertErr) => {
            if (insertErr) {
                console.error('Error saving report:', insertErr);
                return res.status(500).json({ error: 'Failed to save report' });
            }

            res.json({ message: 'Report submitted successfully' });
        });
    });
});

app.get('/qtr_report/user/:username', (req, res) => {
    const username = req.params.username; // Corrected to use `username` from the URL params

    // Query to get reported dates for the user using the username
    const query = `SELECT date FROM qtr_report WHERE username = ?`;

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching reported dates:', err);
            return res.status(500).json({ message: 'Error fetching reported dates' });
        }

        // Extract dates from results and send back as an array of formatted strings (en-GB)
        const reportedDates = results.map(row => row.date.toLocaleDateString('en-GB'));

        res.json(reportedDates);
    });
});

app.get('/reports/:depart/:date?', (req, res) => {
    const { depart, date } = req.params;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;  // Months are 0-indexed
    const currentYear = currentDate.getFullYear();

    // If no date is provided, show current month's reports by default
    const targetDate = date ? date : `${currentYear}-${currentMonth < 10 ? '0' + currentMonth : currentMonth}`;

    // Query to fetch reports for a specific department and month
    const query = `
      SELECT 
        reports.id AS report_id, 
        reports.report_date, 
        reports.report_details, 
        users.username, 
        users.ename, 
        users.vertical, 
        users.depart
      FROM reports
      JOIN users ON reports.user_id = users.id
      WHERE reports.report_date LIKE ? AND users.depart = ?
      ORDER BY users.username, reports.report_date
    `;

    // Modify the date format to match (e.g., '2024-12%')
    const datePattern = `${targetDate}%`;

    db.query(query, [datePattern, depart], (err, results) => {
        if (err) {
            console.error("Error fetching reports:", err);
            return res.status(500).send('Error fetching reports');
        }

        if (results.length === 0) {
            return res.status(404).send(`No reports found for the selected department: ${depart} and month: ${targetDate}`);
        }

        // Grouping results by user (username or ename)
        const groupedResults = {};

        results.forEach((row) => {
            const userKey = row.username;  // Use username as the key to group by user

            if (!groupedResults[userKey]) {
                // If the user doesn't exist in the grouped results, add them
                groupedResults[userKey] = {
                    username: row.username,
                    ename: row.ename,
                    vertical: row.vertical,
                    depart: row.depart,
                    reports: [] // Initialize reports array
                };
            }

            // Add the current report date, details, and id to the user's report array
            groupedResults[userKey].reports.push({
                report_id: row.report_id,  // Include report_id here
                report_date: row.report_date,
                report_details: row.report_details
            });
        });

        // Now format the grouped results to combine report_date and report_details
        const finalResults = Object.values(groupedResults).map(user => {
            return {
                username: user.username,
                ename: user.ename,
                vertical: user.vertical,
                depart: user.depart,
                reports: user.reports // Directly use the reports array
            };
        });

        // Send back the grouped and formatted result as a JSON response
        res.status(200).json(finalResults);
    });
});


const executeQuery = (query) => {
    return new Promise((resolve, reject) => {
        db.query(query, (error, results) => {
            if (error) reject(error);
            else resolve(results.length);
        });
    });
};
// Modify fetchCount function to handle dynamic categories
const fetchCount = async (conditions, category) => {
    const baseQuery = `SELECT arn${category} FROM trffor${category}`;
    const query = `${baseQuery} WHERE ${conditions}`;
    return executeQuery(query);
};
// Main Logic
const getCategoryData = async (firstdate, lastdate) => {
    try {
        // Conditions for Raw Material (RM)
        const conditionsRM = {
            totalRMReceived: `trfdate >= '${firstdate}' AND trfdate < '${lastdate}' AND samplestage LIKE '%Raw Material%' AND receivedby LIKE '% %'`,
            totalRMApproved: `trfdate >= '${firstdate}' AND trfdate < '${lastdate}' AND samplestage LIKE '%Raw Material%' AND approvedby LIKE '% %'`,
            totalRMReceivedFromFirstDate: `trfdate < '${firstdate}' AND samplestage LIKE '%Raw Material%'`,
            totalRMApprovedFromFirstDate: `trfdate < '${firstdate}' AND samplestage LIKE '%Raw Material%' AND approvedby LIKE '% %'`,
            totalRMApprovedNow: `trfdate < '${firstdate}' AND samplestage LIKE '%Raw Material%' AND approvedby LIKE '% %' AND approvedate > '${firstdate}'`
        };

        // Conditions for Non-Raw Material (Non-RM)
        const conditionsNonRM = {
            totalNonRMReceived: `trfdate >= '${firstdate}' AND trfdate < '${lastdate}' AND samplestage NOT LIKE '%Raw Material%' AND receivedby LIKE '% %'`,
            totalNonRMApproved: `trfdate >= '${firstdate}' AND trfdate < '${lastdate}' AND samplestage NOT LIKE '%Raw Material%' AND approvedby LIKE '% %'`,
            totalNonRMReceivedFromFirstDate: `trfdate < '${firstdate}' AND samplestage NOT LIKE '%Raw Material%'`,
            totalNonRMApprovedFromFirstDate: `trfdate < '${firstdate}' AND samplestage NOT LIKE '%Raw Material%' AND approvedby LIKE '% %'`,
            totalNonRMApprovedNow: `trfdate < '${firstdate}' AND samplestage NOT LIKE '%Raw Material%' AND approvedby LIKE '% %' AND approvedate > '${firstdate}'`
        };

        // Categories
        const categories = ['ayurveda', 'pharma', 'nutra', 'sports'];

        // Fetch and calculate for each category
        const categoryResults = await Promise.all(categories.map(async (category) => {
            // Fetch Raw Material data
            const [
                totalRMReceived,
                totalRMApproved,
                totalRMReceivedFromFirstDate,
                totalRMApprovedFromFirstDate,
                totalRMApprovedNow
            ] = await Promise.all(Object.values(conditionsRM).map(condition => fetchCount(condition, category)));

            // Fetch Non-Raw Material data
            const [
                totalNonRMReceived,
                totalNonRMApproved,
                totalNonRMReceivedFromFirstDate,
                totalNonRMApprovedFromFirstDate,
                totalNonRMApprovedNow
            ] = await Promise.all(Object.values(conditionsNonRM).map(condition => fetchCount(condition, category)));

            // Derived calculations for Raw Material
            const totalRMReceivedPending = totalRMReceivedFromFirstDate - totalRMApprovedFromFirstDate;
            const totalRMApprovedPendingIncludingOld = totalRMApprovedNow + totalRMReceivedPending;
            const ReceivedRMFinalCount = totalRMReceived + totalRMApprovedPendingIncludingOld;
            const ReleasedRMFinalCount = totalRMApproved + totalRMApprovedNow;
            const TotalPending = ReceivedRMFinalCount - ReleasedRMFinalCount;

            // Derived calculations for Non-Raw Material
            const totalNonRMReceivedPending = totalNonRMReceivedFromFirstDate - totalNonRMApprovedFromFirstDate;
            const totalNonRMApprovedPendingIncludingOld = totalNonRMApprovedNow + totalNonRMReceivedPending;
            const ReceivedNONRMFinalCount = totalNonRMReceived + totalNonRMApprovedPendingIncludingOld;
            const ReleasedNONRMFinalCount = totalNonRMApproved + totalNonRMApprovedNow;
            const TotalNONRMPending = ReceivedNONRMFinalCount - ReleasedNONRMFinalCount;

            // Return the category result object
            return {
                category,
                totalRMReceived,
                totalRMApprovedPendingIncludingOld,
                ReceivedRMFinalCount,
                totalRMApproved,
                totalRMApprovedNow,
                ReleasedRMFinalCount,
                TotalPending,
                totalNonRMReceived,
                totalNonRMApprovedPendingIncludingOld,
                ReceivedNONRMFinalCount,
                totalNonRMApproved,
                totalNonRMApprovedNow,
                ReleasedNONRMFinalCount,
                TotalNONRMPending,


            };
        }));

        return categoryResults;
    } catch (error) {
        throw new Error(`Error fetching category data: ${error.message}`);
    }
};
// Helper function to get the first and last date of a given month and year
const getMonthRange = (month, year) => {
    const firstDate = new Date(year, month - 1, 1); // month is 0-indexed in JavaScript
    const lastDate = new Date(year, month, 0); // last day of the month
    return {
        firstdate: firstDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        lastdate: lastDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
    };
};
app.get('/category-data-month', async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ error: 'Please provide both month and year.' });
    }

    // Validate month and year values
    if (month < 1 || month > 12 || year < 1000 || year > 9999) {
        return res.status(400).json({ error: 'Invalid month or year provided.' });
    }

    try {
        // Get the first and last date for the given month and year
        const { firstdate, lastdate } = getMonthRange(month, year);

        // Fetch the category data for the month range
        const result = await getCategoryData(firstdate, lastdate);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/category-data', async (req, res) => {
    const { firstdate, lastdate } = req.query;

    if (!firstdate || !lastdate) {
        return res.status(400).json({ error: 'Please provide both firstdate and lastdate.' });
    }

    try {
        const result = await getCategoryData(firstdate, lastdate);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
