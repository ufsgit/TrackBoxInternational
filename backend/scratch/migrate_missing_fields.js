const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        const addColumn = async (table, col, type, after) => {
            try {
                const [cols] = await db.query(`SHOW COLUMNS FROM ${table} LIKE '${col}'`);
                if (cols.length === 0) {
                    console.log(`Adding ${col} to ${table}...`);
                    await db.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${type} AFTER ${after}`);
                } else {
                    console.log(`${col} already exists in ${table}.`);
                }
            } catch (e) {
                console.error(`Error adding ${col} to ${table}:`, e.message);
            }
        };

        await addColumn('student_applications', 'dob', 'DATE', 'age');
        await addColumn('student_applications', 'passport_country', 'VARCHAR(100)', 'citizenship_country');
        await addColumn('student_applications', 'has_second_passport', 'TINYINT(1) DEFAULT 0', 'passport_country');
        await addColumn('student_applications', 'second_passport_country', 'VARCHAR(100)', 'has_second_passport');

        await addColumn('student_registrations', 'dob', 'DATE', 'age');
        await addColumn('student_registrations', 'passport_country', 'VARCHAR(100)', 'citizenship_country');
        await addColumn('student_registrations', 'has_second_passport', 'TINYINT(1) DEFAULT 0', 'passport_country');
        await addColumn('student_registrations', 'second_passport_country', 'VARCHAR(100)', 'has_second_passport');

        console.log("Migration complete.");
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await db.end();
    }
}

migrate();
