const { executeQuery } = require('../config/db');

// Fetch count based on dynamic categories and conditions
const fetchCount = async (conditions, category) => {
    const baseQuery = `SELECT arn${category} FROM trffor${category}`;
    const query = `${baseQuery} WHERE ${conditions}`;
    const results = await executeQuery(query);
    return results.length;
};

// Get category data logic
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

const getCategoryDataByMonth = async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ error: 'Please provide both month and year.' });
    }

    if (month < 1 || month > 12 || year < 1000 || year > 9999) {
        return res.status(400).json({ error: 'Invalid month or year provided.' });
    }

    try {
        const firstDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const lastDate = new Date(year, month, 0).toISOString().split('T')[0];
        const result = await getCategoryData(firstDate, lastDate);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCategoryDataByRange = async (req, res) => {
    const { firstdate, lastdate } = req.query;

    if (!firstdate || !lastdate) {
        return res.status(400).json({ error: 'Please provide both firstdate and lastdate.' });
    }

    try {
        const result = await getCategoryData(firstdate, lastdate);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getCategoryDataByMonth,
    getCategoryDataByRange
};
