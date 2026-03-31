var mysql = require("mysql2");

console.log('DB.JS: Creating connection pool with:');
console.log('  Host:', process.env.DB_HOST);
console.log('  User:', process.env.DB_USER);
console.log('  Pass:', process.env.DB_PASS ? '***SET***' : 'NOT SET');
console.log('  Database:', process.env.DB_NAME);
console.log('  Database:', process.env.DB_NAME);
console.log('  PORT:',  process.env.PORT);


var connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
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