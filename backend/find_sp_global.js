require('dotenv').config();
const db = require('./db');

db.query("SELECT ROUTINE_SCHEMA, ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_NAME = 'sp_UpsertStudentApplication'", (err, results) => {
    if (err) {
        console.error('Error fetching routines:', err.message);
    } else {
        console.table(results);
    }
    process.exit();
});
