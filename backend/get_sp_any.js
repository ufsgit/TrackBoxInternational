require('dotenv').config();
const db = require('./db');
const spName = process.argv[2] || 'sp_Login';

db.query(`SHOW CREATE PROCEDURE ${spName}`, (err, results) => {
    if (err) {
        console.error('Error fetching procedure:', err.message);
    } else {
        console.log(results[0]['Create Procedure']);
    }
    process.exit();
});
