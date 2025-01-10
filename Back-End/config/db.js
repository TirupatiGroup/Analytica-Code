// db.js
const mysql = require('mysql2');

// Create MySQL connection
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

// Function to execute query with parameters
const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.execute(query, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

// Export the connection and executeQuery function
module.exports = { executeQuery, db };
