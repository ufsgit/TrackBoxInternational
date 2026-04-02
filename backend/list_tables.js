require('dotenv').config();
const db = require('./db');
db.query('SHOW TABLES', (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log(rows);
    }
    process.exit(0);
});
