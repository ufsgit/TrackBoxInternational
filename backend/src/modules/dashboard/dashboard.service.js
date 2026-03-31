const db = require('../../config/db');

const getStats = (filters, userId, userBranchId, userRole) => {
    return new Promise((resolve, reject) => {
        const { filter = 'month', fromDate, toDate } = filters;

        // Prepare params for SP: p_filter, p_startDate, p_endDate, p_userId, p_branchId, p_userRole
        const params = [
            filter,
            fromDate || null,
            toDate || null,
            userId,
            userBranchId,
            userRole
        ];

        db.query('CALL sp_GetDashboardStats(?, ?, ?, ?, ?, ?)', params, (err, results) => {
            if (err) return reject(err);

            // results[0] -> Summary (Total Students)
            // results[1] -> Status Distribution
            // results[2] -> Graph Data

            const summary = results[0][0]; // { totalStudents: X }
            const statusData = results[1];
            const chartData = results[2];

            resolve({
                summary: summary,
                statusData: statusData,
                chartData: chartData
            });
        });
    });
};

module.exports = {
    getStats
};
