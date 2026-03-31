const authService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/response');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('LOGIN_DEBUG: Request received for username:', username);

        const result = await authService.login(username, password);
        return successResponse(res, result);
    } catch (err) {
        return errorResponse(res, err.message, err.status || 500);
    }
};

module.exports = {
    login
};
