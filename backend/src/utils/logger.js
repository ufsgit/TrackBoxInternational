const getTimestamp = () => new Date().toISOString();

const logger = {
    info: (...args) => console.log(`[${getTimestamp()}] [INFO]`, ...args),
    error: (...args) => console.error(`[${getTimestamp()}] [ERROR]`, ...args),
    warn: (...args) => console.warn(`[${getTimestamp()}] [WARN]`, ...args),
};

module.exports = logger;
