const { executeQuery } = require('../config/db'); // Import executeQuery function

// Count prefixes and calculate time worked
exports.countPrefixes = async (req, res) => {
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

    try {
        // Execute the query using the executeQuery function
        const result = await executeQuery(query);

        // Format days_worked to always have 2 decimal places
        const formattedResult = result.map(item => {
            const daysWorked = Number(item.days_worked);
            item.days_worked = isNaN(daysWorked) ? "0.00" : daysWorked.toFixed(2);
            return item;
        });

        // Send the formatted result as JSON response
        res.status(200).json(formattedResult);
    } catch (error) {
        console.error('Error executing the query:', error);
        res.status(500).json({ message: 'Database query failed', error });
    }
};
