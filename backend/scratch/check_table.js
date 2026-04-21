const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTable() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await db.query("DESCRIBE student_applications");
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err.message);
    } finally {
        await db.end();
    }
}

checkTable();
