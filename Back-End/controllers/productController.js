const { executeQuery, db } = require('../config/db'); // Import the db module

// Fetch all products
exports.getAllProducts = async (req, res) => {
    try {
        const query = `
            SELECT id, prepix, pname, createdon  
            FROM products_for_reporting
            ORDER BY createdon DESC`;
        const results = await executeQuery(query);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Database error while fetching products' });
    }
};

// Add a product
exports.addProduct = async (req, res) => {
    const { prepix, pname } = req.body;

    if (!prepix || !pname) {
        return res.status(400).json({ error: 'prepix and pname are required' });
    }

    db.beginTransaction(async (err) => {
        if (err) {
            console.error('Transaction error:', err);
            return res.status(500).json({ error: 'Transaction initialization failed' });
        }

        try {
            const selectMaxIdQuery = `
                SELECT MAX(CAST(SUBSTRING(prepix, LENGTH(?) + 1) AS UNSIGNED)) AS max_id
                FROM products_for_reporting
                WHERE prepix LIKE ?`;
            const maxIdResult = await executeQuery(selectMaxIdQuery, [prepix, `${prepix}%`]);
            const nextId = maxIdResult[0]?.max_id ? maxIdResult[0].max_id + 1 : 1;
            const newPrepix = `${prepix}${nextId}`;

            const insertQuery = `
                INSERT INTO products_for_reporting (prepix, pname)
                VALUES (?, ?)`;
            const result = await executeQuery(insertQuery, [newPrepix, pname]);

            db.commit((commitErr) => {
                if (commitErr) {
                    throw commitErr;
                }
                res.status(201).json({
                    message: 'Product added successfully',
                    id: result.insertId,
                    prepix_column: newPrepix,
                });
            });
        } catch (error) {
            console.error('Error during transaction:', error);
            db.rollback(() => {
                res.status(500).json({ error: 'Error adding product' });
            });
        }
    });
};

// Edit a product
exports.editProduct = async (req, res) => {
    const { id } = req.params;
    const { prepix, pname } = req.body;

    if (!prepix || !pname) {
        return res.status(400).json({ error: 'prepix and pname are required' });
    }

    db.beginTransaction(async (err) => {
        if (err) {
            console.error('Transaction error:', err);
            return res.status(500).json({ error: 'Transaction initialization failed' });
        }

        try {
            const checkProductQuery = 'SELECT * FROM products_for_reporting WHERE id = ?';
            const productResult = await executeQuery(checkProductQuery, [id]);

            if (productResult.length === 0) {
                return db.rollback(() => {
                    res.status(404).json({ error: 'Product not found' });
                });
            }

            const updateQuery = `
                UPDATE products_for_reporting
                SET prepix = ?, pname = ?
                WHERE id = ?`;
            await executeQuery(updateQuery, [prepix, pname, id]);

            db.commit((commitErr) => {
                if (commitErr) {
                    throw commitErr;
                }
                res.status(200).json({
                    message: 'Product updated successfully',
                    prepix_column: prepix,
                    pname_column: pname,
                });
            });
        } catch (error) {
            console.error('Error during transaction:', error);
            db.rollback(() => {
                res.status(500).json({ error: 'Error updating product' });
            });
        }
    });
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }

    try {
        const deleteQuery = 'DELETE FROM products_for_reporting WHERE id = ?';
        const result = await executeQuery(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Error deleting product. Please try again.' });
    }
};
