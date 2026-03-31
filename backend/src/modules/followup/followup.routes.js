const db = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middlewares/auth.middleware');

// Service
const addFollowup = (data, userId, userBranchId) => {
    return new Promise((resolve, reject) => {
        db.query(
            'CALL sp_AddFollowup(?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.student_id,
                data.branch_id || userBranchId,
                data.department_id,
                data.status,
                data.assigned_to || null,
                data.follow_up_date,
                data.remark,
                userId
            ],
            function (err, results) {
                if (err) return reject(err);
                resolve({
                    message: 'Follow-up created successfully'
                });
            }
        );
    });
};

// Controller
const createFollowup = async (req, res) => {
    try {
        const result = await addFollowup(req.body, req.user.id, req.user.branch_id);
        return successResponse(res, result, 'Followup created', 201);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

// Routes
router.use(authenticateToken);
router.post('/', createFollowup);

module.exports = router; // Exporting router directly as this module is simple
