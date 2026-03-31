const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
    const statusCode = err.status || 500;
    logger.error(`GLOBAL_ERROR_HANDLER [${statusCode}]:`, err.message);
    if (statusCode >= 500) {
        logger.error(err.stack);
    }
    res.status(statusCode).json({ error: err.message || 'Internal Server Error' });
}

module.exports = errorHandler;
