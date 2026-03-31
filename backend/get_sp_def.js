const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');

db.query('SHOW CREATE PROCEDURE sp_UpsertStudentApplication', (err, rows) => {
    if (err) {
        console.error('Error showing procedure:', err);
        process.exit(1);
    }
    console.log('SP_DEFINITION:', rows[0]['Create Procedure']);
    process.exit(0);
});
