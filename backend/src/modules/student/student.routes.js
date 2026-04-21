const express = require('express');
const router = express.Router();
const studentController = require('./student.controller');
const authenticateToken = require('../../middlewares/auth.middleware');

router.use(authenticateToken);

router.get('/', studentController.getStudents);
router.post('/', studentController.createOrUpdateStudent);
router.get('/:id', studentController.getStudentById);
router.delete('/:id', studentController.deleteStudent);
router.get('/:id/application', studentController.getStudentApplication);
router.get('/:id/assessment', studentController.getStudentApplication);
router.post('/:id/application', studentController.saveStudentApplication);
router.get('/:id/registration', studentController.getStudentRegistration);
router.post('/:id/registration', studentController.saveStudentRegistration);

module.exports = router;
