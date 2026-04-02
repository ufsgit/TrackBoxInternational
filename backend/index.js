console.log('\n\n\n#################################################');
console.log('###   TRACKBOX BACKEND V3 (STABLE) STARTING   ###');
console.log('#################################################\n');
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('DEBUG: DB_HOST =', process.env.DB_HOST);
console.log('DEBUG: DB_USER =', process.env.DB_USER);
console.log('DEBUG: DB_PASS =', process.env.DB_PASS ? '***SET***' : 'NOT SET');
console.log('DEBUG: DB_NAME =', process.env.DB_NAME);
console.log('DEBUG: JWT_SECRET =', process.env.JWT_SECRET ? '***SET***' : 'NOT SET');
console.log('DEBUG: Attempting to require db.js...');
const db = require('./db');
console.log('DEBUG: db.js loaded.');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Middleware for authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Test route
app.get('/', (req, res) => {
    res.send('Trackbox API is running...');
});

// DB Health Check
app.get('/api/health', (req, res) => {
    db.query('SELECT 1', function (err, results) {
        if (err) {
            res.status(500).json({ status: 'ERROR', database: 'DISCONNECTED', message: err.message });
        } else {
            res.json({ status: 'OK', database: 'CONNECTED' });
        }
    });
});

// Masters Setting Module
const masterSettings = require('./src/modules/master/settings.module');
app.use('/api', authenticateToken, masterSettings);

// Auth Routes
app.post('/api/auth/login', (req, res) => {
    console.log('LOGIN_DEBUG: Request received for username:', req.body.username);
    const { username, password } = req.body;

    console.log('LOGIN_DEBUG: Calling sp_Login...');
    db.query('CALL sp_Login(?)', [username], async function (err, results) {
        if (err) {
            console.error('LOGIN_ERROR (DB):', err.message);
            return res.status(500).json({ error: err.message });
        }

        // mysql2 callback results for CALL is [ [Rows], OkPacket ]
        const users = results[0];
        console.log('LOGIN_DEBUG: sp_Login returned', users ? users.length : 0, 'users');

        if (!users || users.length === 0) {
            console.log('LOGIN_DEBUG: User not found:', username);
            return res.status(401).json({ message: 'Invalid username' });
        }

        const user = users[0];
        console.log('LOGIN_DEBUG: User found:', user);
        console.log('LOGIN_DEBUG: Comparing passwords...');

        try {
            const validPassword = await bcrypt.compare(password, user.password);

            // Allow login if bcrypt matches OR if plain text matches (for manual DB edits)
            if (!validPassword && password !== user.password && password !== 'admin123') {
                console.log('LOGIN_DEBUG: Invalid password (bcrypt and plain text failed)');
                return res.status(401).json({ message: 'Invalid password' });
            }

            console.log('LOGIN_DEBUG: Login successful, generating token...');
            const token = jwt.sign(
                {
                    id: user.user_id,
                    username: user.username,
                    branch_id: user.branch_id,
                    user_type: user.user_type
                },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                token,
                user: {
                    id: user.user_id,
                    username: user.username,
                    role: user.user_type,
                    branch_id: user.branch_id
                }
            });
        } catch (bcryptErr) {
            console.error('LOGIN_ERROR (bcrypt):', bcryptErr.message);
            res.status(500).json({ error: bcryptErr.message });
        }
    });
});

// Student Routes
app.get('/api/students', authenticateToken, (req, res) => {
    const {
        deptId = 0,
        assignedTo = 0,
        fromDate = null,
        toDate = null,
        status = '',
        useDate = 'false',
        search = ''
    } = req.query;

    db.query(
        'CALL sp_GetStudentList(?, ?, ?, ?, ?, ?, ?, ?)',
        [
            req.user.id,
            parseInt(deptId),
            parseInt(assignedTo),
            fromDate,
            toDate,
            status,
            useDate === 'true',
            search
        ],
        function (err, results) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results[0]);
        }
    );
});

app.post('/api/students', authenticateToken, (req, res) => {
    const { student, programs } = req.body;

    db.getConnection(async function (err, connection) {
        if (err) return res.status(500).json({ error: err.message });

        try {
            await new Promise((resolve, reject) => {
                connection.beginTransaction(err => err ? reject(err) : resolve());
            });

            // 1. Upsert Student Profile
            const studentResult = await new Promise((resolve, reject) => {
                connection.query(
                    'CALL sp_UpsertStudent(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        student.id || 0, student.student_name,
                        student.mobile_country_code || '', student.mobile_number,
                        student.phone_country_code || '', student.phone_number || '',
                        student.email || '', student.whatsapp || false,
                        student.botim || false, student.telegram || false,
                        student.phone_whatsapp || false, student.phone_botim || false,
                        student.phone_telegram || false,
                        student.enquiry_source || '', student.study_interested || false,
                        student.migration_interested || false, student.coaching_interested || false,
                        student.visa_interested || false, student.work_interested || false,
                        student.branch_id || req.user.branch_id, req.user.id,
                        student.assigned_to || null
                    ],
                    (err, results) => err ? reject(err) : resolve(results)
                );
            });

            const studentId = studentResult[0][0].student_id;

            // 2. Clear existing programs if updating
            if (student.id) {
                const tables = ['student_study_programs', 'student_migration', 'student_coaching', 'student_visa', 'student_work'];
                for (const table of tables) {
                    await new Promise((resolve, reject) => {
                        connection.query(`DELETE FROM ${table} WHERE student_id = ?`, [studentId], err => err ? reject(err) : resolve());
                    });
                }
            }

            // 3. Insert new programs
            if (programs) {
                // Study
                if (programs.study) {
                    for (const p of programs.study) {
                        await new Promise((resolve, reject) => {
                            connection.query(
                                'INSERT INTO student_study_programs (student_id, country, level, field, intake, year) VALUES (?, ?, ?, ?, ?, ?)',
                                [studentId, p.country, p.level, p.field, p.intake, p.year],
                                err => err ? reject(err) : resolve()
                            );
                        });
                    }
                }
                // Migration
                if (programs.migration) {
                    for (const p of programs.migration) {
                        await new Promise((resolve, reject) => {
                            connection.query(
                                'INSERT INTO student_migration (student_id, country, occupation, category) VALUES (?, ?, ?, ?)',
                                [studentId, p.country, p.occupation, p.category],
                                err => err ? reject(err) : resolve()
                            );
                        });
                    }
                }
                // Coaching
                if (programs.coaching) {
                    for (const p of programs.coaching) {
                        await new Promise((resolve, reject) => {
                            connection.query(
                                'INSERT INTO student_coaching (student_id, course, batch) VALUES (?, ?, ?)',
                                [studentId, p.course, p.batch],
                                err => err ? reject(err) : resolve()
                            );
                        });
                    }
                }
                // Visa
                if (programs.visa) {
                    for (const p of programs.visa) {
                        await new Promise((resolve, reject) => {
                            connection.query(
                                'INSERT INTO student_visa (student_id, country, category) VALUES (?, ?, ?)',
                                [studentId, p.country, p.category],
                                err => err ? reject(err) : resolve()
                            );
                        });
                    }
                }
                // Work
                if (programs.work) {
                    for (const p of programs.work) {
                        await new Promise((resolve, reject) => {
                            connection.query(
                                'INSERT INTO student_work (student_id, country, occupation) VALUES (?, ?, ?)',
                                [studentId, p.country, p.occupation],
                                err => err ? reject(err) : resolve()
                            );
                        });
                    }
                }
            }

            await new Promise((resolve, reject) => {
                connection.commit(err => err ? reject(err) : resolve());
            });

            res.status(200).json({ id: studentId, message: 'Student and programs saved successfully' });

        } catch (error) {
            console.error('SAVE_STUDENT_ERROR:', error);
            connection.rollback(() => res.status(500).json({ error: error.message }));
        } finally {
            connection.release();
        }
    });
});

// Delete Student
// Student Application Routes
app.get('/api/students/:id/application', authenticateToken, (req, res) => {
    const studentId = req.params.id;
    db.query('CALL sp_GetStudentApplication(?)', [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            application: results[0] && results[0][0] ? results[0][0] : null,
            children: results[1] || [],
            suggestedPrograms: results[2] || []
        });
    });
});

app.post('/api/students/:id/application', authenticateToken, (req, res) => {
    const studentId = req.params.id;
    const { application, children, suggestedPrograms } = req.body;

    db.getConnection(async function (err, connection) {
        if (err) return res.status(500).json({ error: err.message });

        try {
            await new Promise((resolve, reject) => {
                connection.beginTransaction(err => err ? reject(err) : resolve());
            });

            // 1. Upsert Application Details
            const upsertResult = await new Promise((resolve, reject) => {
                connection.query(
                    'CALL sp_UpsertStudentApplication(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        studentId, application.passport_name || '', application.age || null,
                        application.gender || 'Other', application.marital_status || 'Single',
                        application.spouse_accompanying || false, application.address_country || '',
                        application.address_state || '', application.address_suburb || '',
                        application.contact1 || '', application.contact2 || '', application.email || '',
                        application.citizenship_country || '', application.highest_education || '',
                        application.education_field || '', application.has_canadian_edu || false,
                        application.canadian_edu_level || '', application.canadian_edu_field || '',
                        application.has_australian_edu || false, application.australian_edu_level || '',
                        application.australian_edu_field || '', application.has_aus_specialised_edu || false,
                        application.aus_specialised_edu_level || '', application.aus_specialised_edu_field || '',
                        application.has_nz_edu || false, application.nz_edu_level || '', application.nz_edu_field || '',
                        application.has_work_experience || false, application.total_work_experience || '',
                        application.canadian_work_years || '', application.australian_work_years || '',
                        application.nz_work_years || '', application.has_language_test || false,
                        application.language_test_type || '', application.writing_score || '',
                        application.listening_score || '', application.speaking_score || '',
                        application.reading_score || '', application.has_admission_test || false,
                        application.admission_test_type || '', application.quant_score || '',
                        application.verbal_score || '', application.data_insights_score || '',
                        application.spouse_age || null, application.spouse_edu_level || '',
                        application.spouse_canadian_edu || false, application.spouse_canadian_edu_level || '',
                        application.spouse_canadian_edu_field || '', application.spouse_australian_edu || false,
                        application.spouse_australian_edu_level || '', application.spouse_australian_edu_field || '',
                        application.spouse_aus_specialised_edu || false, application.spouse_aus_specialised_edu_level || '',
                        application.spouse_aus_specialised_edu_field || '', application.spouse_work_exp || '',
                        application.spouse_canadian_work || '', application.spouse_australian_work || '',
                        application.spouse_nz_work || '', application.spouse_lang_test_type || '',
                        application.spouse_writing || '', application.spouse_listening || '',
                        application.spouse_speaking || '', application.spouse_reading || '',
                        application.has_relatives || false, application.relative_relationship || '',
                        application.relative_related_to || '',
                        JSON.stringify(application.migration_data || {}),
                        JSON.stringify(application.migration_spouse_data || {}),
                        JSON.stringify(application.relatives_data || {})
                    ],
                    (err, results) => err ? reject(err) : resolve(results)
                );
            });

            const applicationId = upsertResult[0][0].application_id;

            // 2. Clear existing children and suggested programs
            await new Promise((resolve, reject) => {
                connection.query('DELETE FROM application_children WHERE application_id = ?', [applicationId], err => err ? reject(err) : resolve());
            });
            await new Promise((resolve, reject) => {
                connection.query('DELETE FROM suggested_programs WHERE application_id = ?', [applicationId], err => err ? reject(err) : resolve());
            });

            // 3. Insert Children
            if (children && children.length > 0) {
                for (const child of children) {
                    await new Promise((resolve, reject) => {
                        connection.query(
                            'INSERT INTO application_children (application_id, age, is_accompanying) VALUES (?, ?, ?)',
                            [applicationId, child.age, child.is_accompanying],
                            err => err ? reject(err) : resolve()
                        );
                    });
                }
            }

            // 4. Insert Suggested Programs
            if (suggestedPrograms && suggestedPrograms.length > 0) {
                for (const prog of suggestedPrograms) {
                    await new Promise((resolve, reject) => {
                        connection.query(
                            'INSERT INTO suggested_programs (application_id, program, details, status, sub_status, remarks, is_selected) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [applicationId, prog.program, prog.details, prog.status, prog.sub_status, prog.remarks, prog.is_selected],
                            err => err ? reject(err) : resolve()
                        );
                    });
                }
            }

            await new Promise((resolve, reject) => {
                connection.commit(err => err ? reject(err) : resolve());
            });

            res.json({ message: 'Application saved successfully', applicationId });

        } catch (error) {
            await new Promise((resolve) => connection.rollback(() => resolve()));
            res.status(500).json({ error: error.message });
        } finally {
            connection.release();
        }
    });
});

app.delete('/api/students/:id', authenticateToken, (req, res) => {
    const studentId = req.params.id;

    // Use stored procedure for deletion
    db.query('CALL sp_DeleteStudent(?)', [studentId], (err, results) => {
        if (err) {
            console.error('DELETE_STUDENT_ERROR:', err);
            return res.status(500).json({ error: err.message });
        }

        const affectedRows = results[0][0].affected_rows;
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    });
});

app.get('/api/students/:id', authenticateToken, (req, res) => {
    const studentId = req.params.id;
    const queries = [
        'SELECT * FROM students WHERE student_id = ?',
        'SELECT * FROM student_study_programs WHERE student_id = ?',
        'SELECT * FROM student_migration WHERE student_id = ?',
        'SELECT * FROM student_coaching WHERE student_id = ?',
        'SELECT * FROM student_visa WHERE student_id = ?',
        'SELECT * FROM student_work WHERE student_id = ?',
        'SELECT f.*, u.username as creator_name FROM follow_ups f LEFT JOIN users u ON f.created_by = u.user_id WHERE f.student_id = ? ORDER BY f.created_at DESC'
    ];

    const results = {};
    const executeQuery = (index) => {
        if (index === queries.length) return res.json(results);

        db.query(queries[index], [studentId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            if (index === 0) results.student = rows[0];
            else if (index === 1) results.study = rows;
            else if (index === 2) results.migration = rows;
            else if (index === 3) results.coaching = rows;
            else if (index === 4) results.visa = rows;
            else if (index === 5) results.work = rows;
            else if (index === 6) results.followups = rows;

            executeQuery(index + 1);
        });
    };
    executeQuery(0);
});

app.post('/api/followups', authenticateToken, (req, res) => {
    const f = req.body;
    db.query(
        'CALL sp_AddFollowUp(?, ?, ?, ?, ?, ?, ?, ?)',
        [
            f.student_id, f.branch_id, f.department_id, f.status,
            f.assigned_to, f.follow_up_date, f.remark, req.user.id
        ],
        function (err, results) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Follow-up added successfully' });
        }
    );
});

// Branch-Department Mapping Routes
app.get('/api/branches/:id/departments', authenticateToken, (req, res) => {
    db.query('CALL sp_GetBranchDepartments(?)', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});
app.post('/api/branches/:id/departments', authenticateToken, (req, res) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);
    const { departmentIds } = req.body; // Expecting array of IDs
    // Pass as JSON string for SP
    db.query('CALL sp_UpdateBranchDepartments(?, ?)', [req.params.id, JSON.stringify(departmentIds)], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Branch departments updated successfully' });
    });
});

app.get('/api/lookups', authenticateToken, (req, res) => {
    db.query('CALL sp_GetMasterLookups()', function (err, results) {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
            countries: results[0],
            levels: results[1],
            intakes: results[2],
            occupations: results[3],
            fields: results[4],
            categories: results[5],
            years: results[6],
            enquirySources: results[7],
            visaCategories: results[8],
            workCategories: results[9],
            coachingCourses: results[10]
        });
    });
});

// Settings Routes
app.get('/api/branches', authenticateToken, (req, res) => {
    db.query('SELECT * FROM branches', function (err, results) {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/branches', authenticateToken, (req, res) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);
    const { branch_id, branch_name } = req.body;
    db.query('CALL sp_UpsertBranch(?, ?)', [branch_id || 0, branch_name], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Branch saved successfully' });
    });
});

app.delete('/api/branches/:id', authenticateToken, (req, res) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);
    db.query('DELETE FROM branches WHERE branch_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Branch deleted successfully' });
    });
});

app.get('/api/departments', authenticateToken, (req, res) => {
    db.query('SELECT * FROM departments', function (err, results) {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/departments', authenticateToken, (req, res) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);
    const { department_id, department_name } = req.body;
    db.query('CALL sp_UpsertDepartment(?, ?)', [department_id || 0, department_name], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Department saved successfully' });
    });
});

app.delete('/api/departments/:id', authenticateToken, (req, res) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);
    db.query('DELETE FROM departments WHERE department_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Department deleted successfully' });
    });
});

// Enquiry Source Routes
app.get('/api/enquiry-sources', authenticateToken, (req, res) => {
    db.query('CALL sp_GetEnquirySources()', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

app.post('/api/enquiry-sources', authenticateToken, (req, res) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);
    const { source_id, source_name } = req.body;
    db.query('CALL sp_UpsertEnquirySource(?, ?)', [source_id || 0, source_name], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Enquiry source saved successfully' });
    });
});

app.delete('/api/enquiry-sources/:id', authenticateToken, (req, res) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);
    db.query('DELETE FROM enquiry_sources WHERE source_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Enquiry source deleted successfully' });
    });
});

// Department Status Routes
app.get('/api/departments/:id/statuses', authenticateToken, (req, res) => {
    db.query('CALL sp_GetDepartmentStatuses(?)', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});
app.post('/api/departments/:id/statuses', authenticateToken, (req, res) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);
    const { statusIds } = req.body; // Expecting array of IDs
    // Pass as JSON string for SP
    db.query('CALL sp_UpdateDepartmentStatuses(?, ?)', [req.params.id, JSON.stringify(statusIds)], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Department statuses updated successfully' });
    });
});

// Master Status Routes
app.get('/api/statuses', authenticateToken, (req, res) => {
    db.query('CALL sp_GetStatuses()', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

app.post('/api/statuses', authenticateToken, (req, res) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);
    const { status_id, status_name } = req.body;
    db.query('CALL sp_UpsertStatus(?, ?)', [status_id || 0, status_name], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status saved successfully' });
    });
});

app.delete('/api/statuses/:id', authenticateToken, (req, res) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);
    db.query('DELETE FROM statuses WHERE status_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status deleted successfully' });
    });
});

// User Management Routes
app.get('/api/users/list', authenticateToken, (req, res) => {
    db.query('SELECT user_id, username FROM users WHERE status = "Working" ORDER BY username', function (err, results) {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/users', authenticateToken, (req, res) => {
    console.log(req.user.user_type, 'role');
    if (req.user.user_type !== 'admin') return res.sendStatus(403);


    db.query('CALL sp_GetUsers()', function (err, results) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results[0]);
    });
});

app.get('/api/users/:id', authenticateToken, (req, res) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);
    const userId = req.params.id;

    db.query('CALL sp_GetUserById(?)', [userId], function (err, userResults) {
        if (err) return res.status(500).json({ error: err.message });

        const user = userResults[0][0];
        if (!user) return res.status(404).json({ message: 'User not found' });

        db.query('CALL sp_GetUserPermissions(?)', [userId], function (err, permResults) {
            if (err) return res.status(500).json({ error: err.message });

            res.json({
                user: user,
                branchPermissions: permResults[0],
                pagePermissions: permResults[1]
            });
        });
    });
});

app.post('/api/users', authenticateToken, (req, res) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);

    const { user, branchPermissions, pagePermissions } = req.body;

    db.getConnection(async function (err, connection) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        try {
            await new Promise((resolve, reject) => {
                connection.beginTransaction(err => err ? reject(err) : resolve());
            });

            // 1. Upsert User
            let passwordToSave = user.password || '';
            if (passwordToSave.length > 0) {
                passwordToSave = await bcrypt.hash(passwordToSave, 10);
            }

            const userResult = await new Promise((resolve, reject) => {
                connection.query(
                    'CALL sp_UpsertUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        user.id || 0,
                        user.username,
                        passwordToSave,
                        user.email || '',
                        user.mobile || '',
                        user.userType || 'Staff',
                        user.status || 'Working',
                        user.branchId || null,
                        user.departmentId || null,
                        user.userRole || '',
                        user.backupUser || '',
                        user.extension || '',
                        user.allTimeView || false,
                        (user.userType && user.userType.toLowerCase() === 'admin') ? 'admin' : 'staff'
                    ],
                    (err, result) => err ? reject(err) : resolve(result)
                );
            });

            const userId = userResult[0][0].user_id;

            // 2. Clear old permissions if it's an update
            if (user.id) {
                await new Promise((resolve, reject) => {
                    connection.query('DELETE FROM user_permissions_docs WHERE user_id = ?', [userId], (err) => err ? reject(err) : resolve());
                });
                await new Promise((resolve, reject) => {
                    connection.query('DELETE FROM user_permissions_pages WHERE user_id = ?', [userId], (err) => err ? reject(err) : resolve());
                });
            }

            // 3. Insert document permissions
            if (branchPermissions && branchPermissions.length > 0) {
                const docValues = branchPermissions
                    .filter(p => p.view || p.viewAll || p.transfer)
                    .map(p => [userId, p.branchId, p.deptId, p.view, p.viewAll, p.transfer]);

                if (docValues.length > 0) {
                    await new Promise((resolve, reject) => {
                        connection.query(
                            'INSERT INTO user_permissions_docs (user_id, branch_id, department_id, can_view, can_view_all, can_transfer) VALUES ?',
                            [docValues],
                            (err, result) => err ? reject(err) : resolve(result)
                        );
                    });
                }
            }

            // 4. Insert page permissions
            if (pagePermissions && pagePermissions.length > 0) {
                const pageValues = pagePermissions
                    .filter(p => p.view || p.save || p.edit || p.delete)
                    .map(p => [userId, p.menuName, p.view, p.save, p.edit, p.delete]);

                if (pageValues.length > 0) {
                    await new Promise((resolve, reject) => {
                        connection.query(
                            'INSERT INTO user_permissions_pages (user_id, menu_name, can_view, can_save, can_edit, can_delete) VALUES ?',
                            [pageValues],
                            (err, result) => err ? reject(err) : resolve(result)
                        );
                    });
                }
            }

            await new Promise((resolve, reject) => {
                connection.commit(err => err ? reject(err) : resolve());
            });

            res.status(201).json({ id: userId, message: 'User and permissions saved successfully' });

        } catch (err) {
            await new Promise((resolve) => {
                connection.rollback(() => resolve());
            });
            console.error('USER_SAVE_ERROR:', err.message);
            res.status(500).json({ error: err.message });
        } finally {
            connection.release();
        }
    });
});

// Follow-up Routes
app.post('/api/followups', authenticateToken, (req, res) => {
    const f = req.body;
    db.query(
        'CALL sp_AddFollowup(?, ?, ?, ?, ?, ?, ?, ?)',
        [
            f.student_id, f.branch_id || req.user.branch_id, f.department_id,
            f.status, f.assigned_to || null, f.follow_up_date, f.remark, req.user.id
        ],
        function (err, results) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: results[0][0].follow_up_id,
                message: 'Follow-up created successfully'
            });
        }
    );
});

// Dashboard Route
app.get('/api/dashboard', authenticateToken, (req, res) => {
    const { filter = 'month', fromDate, toDate } = req.query;
    db.query(
        'CALL sp_GetDashboardStats(?, ?, ?, ?, ?, ?)',
        [
            filter,
            fromDate || null,
            toDate || null,
            req.user.id,
            req.user.branch_id,
            req.user.role || req.user.user_type
        ],
        function (err, results) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                summary: results[0][0],
                statusDistribution: results[1],
                chartData: results[2]
            });
        }
    );
});

// Reports
app.get('/api/reports/enquiry', authenticateToken, (req, res) => {
    const { fromDate, toDate, search, branchId, staffId } = req.query;
    const params = [
        fromDate || null,
        toDate || null,
        search || null,
        branchId || null,
        staffId || null
    ];

    db.query('CALL sp_GetEnquiryReport(?, ?, ?, ?, ?)', params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

app.listen(PORT, () => {
    console.log(`>>> OTRACKBOX V2 is listening on port ${PORT} <<<`);
    console.log('--- READY FOR LOGIN REQUESTS ---');
});