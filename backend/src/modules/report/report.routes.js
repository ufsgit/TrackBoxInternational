const db = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middlewares/auth.middleware');

router.use(authenticateToken);

router.get('/enquiry', (req, res) => {
    const { fromDate, toDate, search, branchId, staffId } = req.query;

    const params = [
        fromDate || null,
        toDate || null,
        search || null,
        branchId || null,
        staffId || null
    ];

    db.query('CALL sp_GetEnquiryReport(?, ?, ?, ?, ?)', params, (err, results) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, results[0]);
    });
});

module.exports = router;
