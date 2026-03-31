const studentService = require('./student.service');
const { successResponse, errorResponse } = require('../../utils/response');

const getStudents = async (req, res) => {
    try {
        const students = await studentService.getStudents(req.query, req.user.id);
        return successResponse(res, students);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

const getStudentById = async (req, res) => {
    try {
        const data = await studentService.getStudentById(req.params.id);
        return successResponse(res, data);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

const createOrUpdateStudent = async (req, res) => {
    try {
        const result = await studentService.createOrUpdateStudent(req.body, req.user.id, req.user.branch_id);
        return successResponse(res, result);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

const deleteStudent = async (req, res) => {
    try {
        const result = await studentService.deleteStudent(req.params.id);
        return successResponse(res, result);
    } catch (err) {
        return errorResponse(res, err.message, err.status || 500);
    }
};

const getStudentApplication = async (req, res) => {
    try {
        const data = await studentService.getStudentApplication(req.params.id);
        return successResponse(res, data);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

const saveStudentApplication = async (req, res) => {
    try {
        const result = await studentService.saveStudentApplication(req.params.id, req.body);
        return successResponse(res, result);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

const getStudentRegistration = async (req, res) => {
    try {
        const data = await studentService.getStudentRegistration(req.params.id);
        return successResponse(res, data);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

const saveStudentRegistration = async (req, res) => {
    try {
        const result = await studentService.saveStudentRegistration(req.params.id, req.body);
        return successResponse(res, result);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

module.exports = {
    getStudents,
    getStudentById,
    createOrUpdateStudent,
    deleteStudent,
    getStudentApplication,
    saveStudentApplication,
    getStudentRegistration,
    saveStudentRegistration
};
