const db = require('../../config/db');

const getStudents = (filters, userId) => {
    const {
        deptId = 0,
        assignedTo = 0,
        fromDate = null,
        toDate = null,
        status = '',
        useDate = 'false',
        search = '',
        page = 1,
        limit = 20
    } = filters;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    return new Promise((resolve, reject) => {
        db.query(
            'CALL sp_GetStudentList(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                userId,
                parseInt(deptId),
                parseInt(assignedTo),
                fromDate,
                toDate,
                status,
                useDate === 'true',
                search,
                parseInt(limit),
                offset
            ],
            function (err, results) {
                if (err) return reject(err);
                resolve({
                    total: results[0][0].total,
                    students: results[1]
                });
            }
        );
    });
};

const getStudentById = (studentId) => {
    return new Promise((resolve, reject) => {
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
            if (index === queries.length) return resolve(results);

            db.query(queries[index], [studentId], (err, rows) => {
                if (err) return reject(err);

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
};

const createOrUpdateStudent = (data, userId, userBranchId) => {
    const { student, programs } = data;
    return new Promise((resolve, reject) => {
        db.getConnection(async function (err, connection) {
            if (err) return reject(err);

            try {
                await new Promise((res, rej) => connection.beginTransaction(err => err ? rej(err) : res()));

                // 1. Upsert Student Profile
                const studentResult = await new Promise((res, rej) => {
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
                            student.branch_id || userBranchId, userId,
                            student.assigned_to || null
                        ],
                        (err, results) => err ? rej(err) : res(results)
                    );
                });

                const studentId = studentResult[0][0].student_id;

                // 2. Clear existing programs if updating
                if (student.id) {
                    const tables = ['student_study_programs', 'student_migration', 'student_coaching', 'student_visa', 'student_work'];
                    for (const table of tables) {
                        await new Promise((res, rej) => {
                            connection.query(`DELETE FROM ${table} WHERE student_id = ?`, [studentId], err => err ? rej(err) : res());
                        });
                    }
                }

                // 3. Insert new programs
                if (programs) {
                    const programTypes = [
                        { key: 'study', table: 'student_study_programs', columns: 'student_id, country, level, field, intake, year', params: p => [studentId, p.country, p.level, p.field, p.intake, p.year] },
                        { key: 'migration', table: 'student_migration', columns: 'student_id, country, occupation, category', params: p => [studentId, p.country, p.occupation, p.category] },
                        { key: 'coaching', table: 'student_coaching', columns: 'student_id, course, batch', params: p => [studentId, p.course, p.batch] },
                        { key: 'visa', table: 'student_visa', columns: 'student_id, country, category', params: p => [studentId, p.country, p.category] },
                        { key: 'work', table: 'student_work', columns: 'student_id, country, occupation', params: p => [studentId, p.country, p.occupation] }
                    ];

                    for (const type of programTypes) {
                        if (programs[type.key]) {
                            for (const p of programs[type.key]) {
                                await new Promise((res, rej) => {
                                    connection.query(
                                        `INSERT INTO ${type.table} (${type.columns}) VALUES (${type.columns.split(',').map(() => '?').join(',')})`,
                                        type.params(p),
                                        err => err ? rej(err) : res()
                                    );
                                });
                            }
                        }
                    }
                }

                await new Promise((res, rej) => connection.commit(err => err ? rej(err) : res()));
                resolve({ id: studentId, message: 'Student and programs saved successfully' });

            } catch (error) {
                await new Promise((res) => connection.rollback(() => res()));
                reject(error);
            } finally {
                connection.release();
            }
        });
    });
};

const deleteStudent = (studentId) => {
    return new Promise((resolve, reject) => {
        db.query('CALL sp_DeleteStudent(?)', [studentId], (err, results) => {
            if (err) return reject(err);

            const affectedRows = results[0][0].affected_rows;
            if (affectedRows === 0) {
                return reject({ status: 404, message: 'Student not found' });
            }
            resolve({ message: 'Student deleted successfully' });
        });
    });
};

const getStudentApplication = (studentId) => {
    return new Promise((resolve, reject) => {
        db.query('CALL sp_GetStudentApplication(?)', [studentId], (err, results) => {
            if (err) return reject(err);
            resolve({
                application: results[0] && results[0][0] ? results[0][0] : null,
                children: results[1] || [],
                suggestedPrograms: results[2] || []
            });
        });
    });
};

const saveStudentApplication = (studentId, data) => {
    const { application, children, suggestedPrograms } = data;
    return new Promise((resolve, reject) => {
        db.getConnection(async function (err, connection) {
            if (err) return reject(err);

            try {
                await new Promise((res, rej) => connection.beginTransaction(err => err ? rej(err) : res()));

                // 1. Upsert Application Details
                const upsertResult = await new Promise((res, rej) => {
                    connection.query(
                        'CALL sp_UpsertStudentApplication(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            studentId, 
                            application.passport_name || '', 
                            application.age || null,
                            application.dob || null,
                            application.gender || 'Other', 
                            application.marital_status || 'Single',
                            application.spouse_accompanying || false, 
                            application.address_country || '',
                            application.address_state || '', 
                            application.address_suburb || '',
                            application.contact1 || '', 
                            application.contact2 || '', 
                            application.email || '',
                            application.citizenship_country || '', 
                            application.passport_country || '',
                            application.has_second_passport || false,
                            application.second_passport_country || '',
                            application.highest_education || '',
                            application.education_field || '', 
                            application.has_canadian_edu || false,
                            application.canadian_edu_level || '', 
                            application.canadian_edu_field || '',
                            application.has_australian_edu || false, 
                            application.australian_edu_level || '',
                            application.australian_edu_field || '', 
                            application.has_aus_specialised_edu || false,
                            application.aus_specialised_edu_level || '', 
                            application.aus_specialised_edu_field || '',
                            application.has_nz_edu || false, 
                            application.nz_edu_level || '', 
                            application.nz_edu_field || '',
                            application.has_work_experience || false, 
                            application.total_work_experience || '',
                            application.canadian_work_years || '', 
                            application.australian_work_years || '',
                            application.nz_work_years || '', 
                            application.has_language_test || false,
                            application.language_test_type || '', 
                            application.writing_score || '',
                            application.listening_score || '', 
                            application.speaking_score || '',
                            application.reading_score || '', 
                            application.has_admission_test || false,
                            application.admission_test_type || '', 
                            application.quant_score || '',
                            application.verbal_score || '', 
                            application.data_insights_score || '',
                            application.spouse_age || null, 
                            application.spouse_edu_level || '',
                            application.spouse_canadian_edu || false, 
                            application.spouse_canadian_edu_level || '',
                            application.spouse_canadian_edu_field || '', 
                            application.spouse_australian_edu || false,
                            application.spouse_australian_edu_level || '', 
                            application.spouse_australian_edu_field || '',
                            application.spouse_aus_specialised_edu || false, 
                            application.spouse_aus_specialised_edu_level || '',
                            application.spouse_aus_specialised_edu_field || '', 
                            application.spouse_work_exp || '',
                            application.spouse_canadian_work || '', 
                            application.spouse_australian_work || '',
                            application.spouse_nz_work || '', 
                            application.spouse_lang_test_type || '',
                            application.spouse_writing || '', 
                            application.spouse_listening || '',
                            application.spouse_speaking || '', 
                            application.spouse_reading || '',
                            application.has_relatives || false, 
                            application.relative_relationship || '',
                            application.relative_related_to || '',
                            JSON.stringify(application.education_data || {}),
                            JSON.stringify(application.migration_data || {}),
                            JSON.stringify(application.migration_spouse_data || {}),
                            JSON.stringify(application.relatives_data || {})
                        ],
                        (err, results) => err ? rej(err) : res(results)
                    );
                });

                const applicationId = upsertResult[0][0].application_id;

                // 2. Clear existing children and suggested programs
                await new Promise((res, rej) => {
                    connection.query('DELETE FROM application_children WHERE application_id = ?', [applicationId], err => err ? rej(err) : res());
                });
                await new Promise((res, rej) => {
                    connection.query('DELETE FROM suggested_programs WHERE application_id = ?', [applicationId], err => err ? rej(err) : res());
                });

                // 3. Insert Children
                if (children && children.length > 0) {
                    for (const child of children) {
                        await new Promise((res, rej) => {
                            connection.query(
                                'INSERT INTO application_children (application_id, age, is_accompanying) VALUES (?, ?, ?)',
                                [applicationId, child.age, child.is_accompanying],
                                err => err ? rej(err) : res()
                            );
                        });
                    }
                }

                // 4. Insert Suggested Programs
                if (suggestedPrograms && suggestedPrograms.length > 0) {
                    for (const prog of suggestedPrograms) {
                        await new Promise((res, rej) => {
                            connection.query(
                                'INSERT INTO suggested_programs (application_id, program, details, status, sub_status, remarks, is_selected, branch_id, department_id, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                [
                                    applicationId,
                                    prog.program,
                                    prog.details,
                                    prog.status,
                                    prog.sub_status,
                                    prog.remarks,
                                    prog.is_selected,
                                    prog.branch_id || null,
                                    prog.department_id || null,
                                    prog.assigned_to || null
                                ],
                                err => err ? rej(err) : res()
                            );
                        });
                    }
                }

                await new Promise((res, rej) => connection.commit(err => err ? rej(err) : res()));
                resolve({ message: 'Application saved successfully', applicationId });

            } catch (error) {
                console.error('SERVER ERROR IN saveStudentApplication:', error);
                await new Promise((res) => connection.rollback(() => res()));
                reject(error);
            } finally {
                connection.release();
            }
        });
    });
};

const getStudentRegistration = (studentId) => {
    return new Promise((resolve, reject) => {
        db.query('CALL sp_GetStudentRegistration(?)', [studentId], (err, results) => {
            if (err) return reject(err);
            resolve({
                application: results[0] && results[0][0] ? results[0][0] : null,
                children: results[1] || [],
                suggestedPrograms: results[2] || []
            });
        });
    });
};

const saveStudentRegistration = (studentId, data) => {
    const { application, children, suggestedPrograms } = data;
    return new Promise((resolve, reject) => {
        db.getConnection(async function (err, connection) {
            if (err) return reject(err);

            try {
                await new Promise((res, rej) => connection.beginTransaction(err => err ? rej(err) : res()));

                // 1. Upsert Registration Details
                const upsertResult = await new Promise((res, rej) => {
                    connection.query(
                        'CALL sp_UpsertStudentRegistration(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            studentId, 
                            application.passport_name || '', 
                            application.age || null,
                            application.dob || null,
                            application.gender || 'Other', 
                            application.marital_status || 'Single',
                            application.spouse_accompanying || false, 
                            application.address_country || '',
                            application.address_state || '', 
                            application.address_suburb || '',
                            application.contact1 || '', 
                            application.contact2 || '', 
                            application.email || '',
                            application.citizenship_country || '', 
                            application.passport_country || '',
                            application.has_second_passport || false,
                            application.second_passport_country || '',
                            application.highest_education || '',
                            application.education_field || '', 
                            application.has_canadian_edu || false,
                            application.canadian_edu_level || '', 
                            application.canadian_edu_field || '',
                            application.has_australian_edu || false, 
                            application.australian_edu_level || '',
                            application.australian_edu_field || '', 
                            application.has_aus_specialised_edu || false,
                            application.aus_specialised_edu_level || '', 
                            application.aus_specialised_edu_field || '',
                            application.has_nz_edu || false, 
                            application.nz_edu_level || '', 
                            application.nz_edu_field || '',
                            application.has_work_experience || false, 
                            application.total_work_experience || '',
                            application.canadian_work_years || '', 
                            application.australian_work_years || '',
                            application.nz_work_years || '', 
                            application.has_language_test || false,
                            application.language_test_type || '', 
                            application.writing_score || '',
                            application.listening_score || '', 
                            application.speaking_score || '',
                            application.reading_score || '', 
                            application.has_admission_test || false,
                            application.admission_test_type || '', 
                            application.quant_score || '',
                            application.verbal_score || '', 
                            application.data_insights_score || '',
                            application.spouse_age || null, 
                            application.spouse_edu_level || '',
                            application.spouse_canadian_edu || false, 
                            application.spouse_canadian_edu_level || '',
                            application.spouse_canadian_edu_field || '', 
                            application.spouse_australian_edu || false,
                            application.spouse_australian_edu_level || '', 
                            application.spouse_australian_edu_field || '',
                            application.spouse_aus_specialised_edu || false, 
                            application.spouse_aus_specialised_edu_level || '',
                            application.spouse_aus_specialised_edu_field || '', 
                            application.spouse_work_exp || '',
                            application.spouse_canadian_work || '', 
                            application.spouse_australian_work || '',
                            application.spouse_nz_work || '', 
                            application.spouse_lang_test_type || '',
                            application.spouse_writing || '', 
                            application.spouse_listening || '',
                            application.spouse_speaking || '', 
                            application.spouse_reading || '',
                            application.has_relatives || false, 
                            application.relative_relationship || '',
                            application.relative_related_to || '',
                            JSON.stringify(application.education_data || {}),
                            JSON.stringify(application.migration_data || {}),
                            JSON.stringify(application.migration_spouse_data || {}),
                            JSON.stringify(application.relatives_data || {})
                        ],
                        (err, results) => err ? rej(err) : res(results)
                    );
                });

                const registrationId = upsertResult[0][0].registration_id;

                // 2. Clear existing children and suggested programs
                await new Promise((res, rej) => {
                    connection.query('DELETE FROM registration_children WHERE registration_id = ?', [registrationId], err => err ? rej(err) : res());
                });
                await new Promise((res, rej) => {
                    connection.query('DELETE FROM registration_suggested_programs WHERE registration_id = ?', [registrationId], err => err ? rej(err) : res());
                });

                // 3. Insert Children
                if (children && children.length > 0) {
                    for (const child of children) {
                        await new Promise((res, rej) => {
                            connection.query(
                                'INSERT INTO registration_children (registration_id, age, is_accompanying) VALUES (?, ?, ?)',
                                [registrationId, child.age, child.is_accompanying],
                                err => err ? rej(err) : res()
                            );
                        });
                    }
                }

                // 4. Insert Suggested Programs
                if (suggestedPrograms && suggestedPrograms.length > 0) {
                    for (const prog of suggestedPrograms) {
                        await new Promise((res, rej) => {
                            connection.query(
                                'INSERT INTO registration_suggested_programs (registration_id, program, details, status, sub_status, remarks, is_selected, branch_id, department_id, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                [
                                    registrationId,
                                    prog.program,
                                    prog.details,
                                    prog.status,
                                    prog.sub_status,
                                    prog.remarks,
                                    prog.is_selected,
                                    prog.branch_id || null,
                                    prog.department_id || null,
                                    prog.assigned_to || null
                                ],
                                err => err ? rej(err) : res()
                            );
                        });
                    }
                }

                await new Promise((res, rej) => connection.commit(err => err ? rej(err) : res()));
                resolve({ message: 'Registration saved successfully', registrationId });

            } catch (error) {
                console.error('SERVER ERROR IN saveStudentRegistration:', error);
                await new Promise((res) => connection.rollback(() => res()));
                reject(error);
            } finally {
                connection.release();
            }
        });
    });
};

module.exports = {
    getStudents,
    getStudentById,
    createOrUpdateStudent,
    deleteStudent,
    getStudentApplication,
    saveStudentApplication,
    getStudentRegistration,
    saveStudentRegistration
};
