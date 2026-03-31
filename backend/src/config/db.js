var mysql = require("mysql2");
const env = require('./env');

console.log('DB.JS: Creating connection pool with:');
console.log('  Host:', env.DB_HOST);
console.log('  User:', env.DB_USER);
console.log('  Pass:', env.DB_PASS ? '***SET***' : 'NOT SET');
console.log('  PORT:', env.PORT);

var connection = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000, // 30 seconds
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Test connection immediately
connection.query('SELECT 1', function (err, results) {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connection successful!');
    }
});

module.exports = connection;
