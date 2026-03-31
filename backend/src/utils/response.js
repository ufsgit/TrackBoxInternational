const logger = require('./logger');

const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json(data);
};

const errorResponse = (res, message = 'Error', statusCode = 500) => {
    if (statusCode >= 500) {
        logger.error(`Response Error (${statusCode}):`, message);
    } else {
        logger.warn(`Response Warning (${statusCode}):`, message);
    }
    return res.status(statusCode).json({ error: message });
};

module.exports = {
    successResponse,
    errorResponse
};
