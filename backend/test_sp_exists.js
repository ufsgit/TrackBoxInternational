require('dotenv').config();
const mysql = require('mysql2');
const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

conn.query("SELECT 1 FROM information_schema.ROUTINES WHERE ROUTINE_NAME = 'sp_UpsertStudentApplication'", (err, results) => {
    if (results.length > 0) {
        console.log('SP EXISTS');
    } else {
        console.log('SP DOES NOT EXIST');
    }
    process.exit();
});
