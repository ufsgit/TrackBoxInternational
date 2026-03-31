require('dotenv').config();
const db = require('./db');

db.query("SELECT PARAMETER_NAME, DATA_TYPE FROM information_schema.PARAMETERS WHERE SPECIFIC_NAME = 'sp_UpsertStudentApplication' AND ROUTINE_TYPE = 'PROCEDURE' ORDER BY ORDINAL_POSITION", (err, results) => {
    if (err) {
        console.error('Error fetching procedure info:', err.message);
    } else {
        console.table(results);
    }
    process.exit();
});
