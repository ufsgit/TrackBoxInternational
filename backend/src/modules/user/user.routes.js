const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authenticateToken = require('../../middlewares/auth.middleware');

// All routes here require authentication
router.use(authenticateToken);

router.get('/list', userController.getList);
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.createOrUpdate);

module.exports = router;
