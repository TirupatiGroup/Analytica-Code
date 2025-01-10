const { executeQuery } = require('../Back-End/config/db'); // Import executeQuery function from your DB module

// Fetch count for dynamic categories
const fetchCount = async (conditions, category) => {
  const baseQuery = `SELECT arn${category} FROM trffor${category}`;
  const query = `${baseQuery} WHERE ${conditions}`;
  return executeQuery(query);
};

// Fetch category data based on date range
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
      totalNonRMApprovedNow: `trfdate < '${firstdate}' AND samplestage NOT LIKE '%Raw Material%' AND approvedby LIKE '% %' AND approvedate > '${firstdate}'`,
      totalNonRMReceivedBeforeFirstDatePending: `trfdate < '${firstdate}' AND samplestage NOT LIKE '%Raw Material%' AND approvedby IS NULL`,
      totalNonRMReceivedInRangePending: `trfdate >= '${firstdate}' AND trfdate < '${lastdate}' AND samplestage NOT LIKE '%Raw Material%' AND approvedby IS NULL`
    };

    const categories = ['nutra', 'pharma', 'ayurveda', 'sports'];

    const categoryResults = await Promise.all(categories.map(async (category) => {
      const categoryConditionsRM = Object.entries(conditionsRM).map(([key, condition]) =>
        fetchCount(condition, category)
      );

      const categoryConditionsNonRM = Object.entries(conditionsNonRM).map(([key, condition]) =>
        fetchCount(condition, category)
      );

      const [
        totalRMReceived,
        totalRMApproved,
        totalRMReceivedFromFirstDate,
        totalRMApprovedFromFirstDate,
        totalRMApprovedNow
      ] = await Promise.all(categoryConditionsRM);

      const [
        totalNonRMReceived,
        totalNonRMApproved,
        totalNonRMReceivedFromFirstDate,
        totalNonRMApprovedFromFirstDate,
        totalNonRMApprovedNow,
        totalNonRMReceivedBeforeFirstDatePending,
        totalNonRMReceivedInRangePending
      ] = await Promise.all(categoryConditionsNonRM);

      const totalRMReceivedPending = totalRMReceivedFromFirstDate - totalRMApprovedFromFirstDate;
      const totalRMApprovedPendingIncludingOld = totalRMApprovedNow + totalRMReceivedPending;
      const totalRMFinalCount = totalRMReceived + totalRMApprovedPendingIncludingOld;
      const totalRlcount = totalRMApprovedPendingIncludingOld - totalRMReceivedPending;

      const totalNonRMReceivedPending = totalNonRMReceivedBeforeFirstDatePending + totalNonRMReceivedInRangePending;
      const totalNonRMApprovedPendingIncludingOld = totalNonRMApprovedNow + totalNonRMReceivedPending;
      const totalNonRMFinalCount = totalNonRMReceived + totalNonRMApprovedPendingIncludingOld;

      return {
        category,
        totalRMReceived,
        totalRMApprovedPendingIncludingOld,
        totalRMFinalCount,
        totalRMApproved,
        totalRlcount,
        totalRMReceivedPending,
        totalNonRMReceived,
        totalNonRMApproved,
        totalNonRMReceivedPending,
        totalNonRMApprovedPendingIncludingOld,
        totalNonRMFinalCount
      };
    }));

    return categoryResults;
  } catch (error) {
    throw new Error(`Error fetching category data: ${error.message}`);
  }
};

// Global variable to store latest category data
let latestCategoryData = null;

// Function to refresh the data every 10 seconds
const refreshCategoryData = async (firstdate, lastdate) => {
  try {
    latestCategoryData = await getCategoryData(firstdate, lastdate);
    console.log('Category data refreshed:', latestCategoryData);
  } catch (error) {
    console.error('Error refreshing category data:', error);
  }
};

// Refresh category data every 10 seconds
setInterval(() => {
  const { firstdate, lastdate } = getDefaultDateRange(); // Assuming this function returns default date range
  refreshCategoryData(firstdate, lastdate);
}, 10000); // Refresh every 10 seconds

// Return the latest category data
const getLatestCategoryData = () => latestCategoryData;

module.exports = { getLatestCategoryData };
