const env = require('./config/env');
const app = require('./app');
const db = require('./config/db'); // Ensure DB connection is initialized

const PORT = env.PORT;

app.listen(PORT, () => {
    console.log(`\n\n\n#################################################`);
    console.log(`###  OTRACKBOX BACKEND V3 (MODULAR) STARTING  ###`);
    console.log(`#################################################\n`);
    console.log(`>>> OTRACKBOX V3 is listening on port ${PORT} <<<`);
    console.log('--- READY FOR REQUESTS ---');
});
