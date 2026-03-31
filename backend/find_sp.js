require('dotenv').config();
const db = require('./db');

db.query("SHOW PROCEDURE STATUS WHERE Db = ? AND Name LIKE '%Application%'", [process.env.DB_NAME], (err, results) => {
    if (err) {
        console.error('Error fetching procedures:', err.message);
    } else {
        console.table(results.map(r => r.Name));
    }
    process.exit();
});
