require('dotenv').config();
const db = require('./db');

const sqlGet = `
CREATE PROCEDURE sp_GetStudentApplication(IN p_student_id INT)
BEGIN
    -- 1. Get Application
    SELECT * FROM student_applications WHERE student_id = p_student_id;
    
    -- 2. Get Children
    SELECT * FROM application_children WHERE application_id = (SELECT application_id FROM student_applications WHERE student_id = p_student_id);
    
    -- 3. Get Suggested Programs
    SELECT * FROM suggested_programs WHERE application_id = (SELECT application_id FROM student_applications WHERE student_id = p_student_id);
END;
`;

(async () => {
    try {
        await new Promise((resolve, reject) => {
            db.query("DROP PROCEDURE IF EXISTS sp_GetStudentApplication", (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        await new Promise((resolve, reject) => {
            db.query(sqlGet, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('Procedure sp_GetStudentApplication created successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error creating procedure:', err.message);
        process.exit(1);
    }
})();
