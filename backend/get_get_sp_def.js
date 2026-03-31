require('dotenv').config();
const db = require('./db');

db.query("SHOW CREATE PROCEDURE sp_GetStudentApplication", (err, results) => {
    if (err) {
        console.error('Error fetching procedure:', err.message);
    } else {
        console.log(results[0]['Create Procedure']);
    }
    process.exit();
});
