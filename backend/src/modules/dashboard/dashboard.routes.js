const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authenticateToken = require('../../middlewares/auth.middleware');

router.use(authenticateToken);

router.get('/', dashboardController.getStats);

module.exports = router;
