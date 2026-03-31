const dashboardService = require('./dashboard.service');
const { successResponse, errorResponse } = require('../../utils/response');

const getStats = async (req, res) => {
    try {
        const filters = req.query; // { filter, startDate, endDate }
        const result = await dashboardService.getStats(
            filters,
            req.user.id,
            req.user.branch_id,
            req.user.user_type // using user_type as established
        );
        return successResponse(res, result);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

module.exports = {
    getStats
};
