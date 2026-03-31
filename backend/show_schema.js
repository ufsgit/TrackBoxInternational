const mysql = require('mysql2/promise');
require('dotenv').config();

async function showSchema() {
    try {
        console.log('Connecting to database...');
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const tables = ['student_applications', 'application_children', 'suggested_programs'];

        for (const table of tables) {
            console.log(`--- Table: ${table} ---`);
            const [rows] = await db.query(`SHOW CREATE TABLE ${table}`);
            console.log(rows[0]['Create Table']);
            console.log('\n');
        }
        await db.end();
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

showSchema();
