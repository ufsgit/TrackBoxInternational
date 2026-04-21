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
        console.log("--- student_registrations ---");
        const [rows1] = await db.query("DESCRIBE student_registrations");
        console.log(rows1.map(r => r.Field).join(', '));

        console.log("\n--- student_applications ---");
        const [rows2] = await db.query("DESCRIBE student_applications");
        console.log(rows2.map(r => r.Field).join(', '));
    } catch (err) {
        console.error(err.message);
    } finally {
        await db.end();
    }
}

checkTable();
