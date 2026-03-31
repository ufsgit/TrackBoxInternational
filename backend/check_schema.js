const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');

db.query('DESCRIBE student_applications', (err, rows) => {
    if (err) {
        console.error('Error describing table:', err);
        process.exit(1);
    }
    console.log('TABLE_SCHEMA:', JSON.stringify(rows));
    process.exit(0);
});
