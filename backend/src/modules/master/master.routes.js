const db = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middlewares/auth.middleware');

router.use(authenticateToken);

// --- Services ---

const getLookups = () => {
    return new Promise((resolve, reject) => {
        db.query('CALL sp_GetMasterLookups()', (err, results) => {
            if (err) return reject(err);
            resolve({
                countries: results[0],
                levels: results[1],
                intakes: results[2],
                occupations: results[3],
                fields: results[4],
                categories: results[5],
                years: results[6],
                enquirySources: results[7]
            });
        });
    });
};

// Generic Helper for Admin Check
const checkAdmin = (req, res, next) => {
    if (req.user.user_type !== 'admin') return res.sendStatus(403);
    next();
};

// --- Controllers & Routes ---

// Lookups
router.get('/lookups', async (req, res) => {
    try {
        const data = await getLookups();
        successResponse(res, data);
    } catch (err) { errorResponse(res, err.message); }
});

// Branches
router.get('/branches', (req, res) => {
    db.query('SELECT * FROM branches', (err, results) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, results);
    });
});
router.post('/branches', checkAdmin, (req, res) => {
    const { branch_id, branch_name } = req.body;
    db.query('CALL sp_UpsertBranch(?, ?)', [branch_id || 0, branch_name], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Branch saved successfully' });
    });
});
router.delete('/branches/:id', checkAdmin, (req, res) => {
    db.query('DELETE FROM branches WHERE branch_id = ?', [req.params.id], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Branch deleted successfully' });
    });
});
router.get('/branches/:id/departments', (req, res) => {
    db.query('CALL sp_GetBranchDepartments(?)', [req.params.id], (err, results) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, results[0]);
    });
});
router.post('/branches/:id/departments', checkAdmin, (req, res) => {
    const { departmentIds } = req.body;
    db.query('CALL sp_UpdateBranchDepartments(?, ?)', [req.params.id, JSON.stringify(departmentIds)], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Branch departments updated successfully' });
    });
});

// Departments
router.get('/departments', (req, res) => {
    db.query('SELECT * FROM departments', (err, results) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, results);
    });
});
router.post('/departments', checkAdmin, (req, res) => {
    const { department_id, department_name } = req.body;
    db.query('CALL sp_UpsertDepartment(?, ?)', [department_id || 0, department_name], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Department saved successfully' });
    });
});
router.delete('/departments/:id', checkAdmin, (req, res) => {
    db.query('DELETE FROM departments WHERE department_id = ?', [req.params.id], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Department deleted successfully' });
    });
});
router.get('/departments/:id/statuses', (req, res) => {
    db.query('CALL sp_GetDepartmentStatuses(?)', [req.params.id], (err, results) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, results[0]);
    });
});
router.post('/departments/:id/statuses', checkAdmin, (req, res) => {
    const { statusIds } = req.body;
    db.query('CALL sp_UpdateDepartmentStatuses(?, ?)', [req.params.id, JSON.stringify(statusIds)], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Department statuses updated successfully' });
    });
});

// Statuses
router.get('/statuses', (req, res) => {
    db.query('CALL sp_GetStatuses()', (err, results) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, results[0]);
    });
});
router.post('/statuses', checkAdmin, (req, res) => {
    const { status_id, status_name, requires_followup } = req.body;
    db.query('CALL sp_UpsertStatus(?, ?, ?)', [status_id || 0, status_name, requires_followup === false ? 0 : 1], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Status saved successfully' });
    });
});
router.delete('/statuses/:id', checkAdmin, (req, res) => {
    db.query('DELETE FROM statuses WHERE status_id = ?', [req.params.id], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Status deleted successfully' });
    });
});

// Enquiry Sources
router.get('/enquiry-sources', (req, res) => {
    db.query('CALL sp_GetEnquirySources()', (err, results) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, results[0]);
    });
});
router.post('/enquiry-sources', checkAdmin, (req, res) => {
    const { source_id, source_name } = req.body;
    db.query('CALL sp_UpsertEnquirySource(?, ?)', [source_id || 0, source_name], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Enquiry source saved successfully' });
    });
});
router.delete('/enquiry-sources/:id', checkAdmin, (req, res) => {
    db.query('DELETE FROM enquiry_sources WHERE source_id = ?', [req.params.id], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Enquiry source deleted successfully' });
    });
});

// Educational Levels
router.get('/educational-levels', (req, res) => {
    db.query('SELECT * FROM educational_levels ORDER BY name', (err, results) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, results);
    });
});

router.post('/educational-levels', checkAdmin, (req, res) => {
    const { level_id, name } = req.body;
    if (level_id) {
        db.query('UPDATE educational_levels SET name = ? WHERE level_id = ?', [name, level_id], (err) => {
            if (err) return errorResponse(res, err.message);
            successResponse(res, { message: 'Level updated successfully' });
        });
    } else {
        db.query('INSERT INTO educational_levels (name) VALUES (?)', [name], (err) => {
            if (err) return errorResponse(res, err.message);
            successResponse(res, { message: 'Level added successfully' });
        });
    }
});

router.delete('/educational-levels/:id', checkAdmin, (req, res) => {
    db.query('DELETE FROM educational_levels WHERE level_id = ?', [req.params.id], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Level deleted successfully' });
    });
});

// Study Fields
router.get('/study-fields', (req, res) => {
    db.query('SELECT * FROM study_fields ORDER BY name', (err, results) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, results);
    });
});

router.post('/study-fields', checkAdmin, (req, res) => {
    const { field_id, name } = req.body;
    if (field_id) {
        db.query('UPDATE study_fields SET name = ? WHERE field_id = ?', [name, field_id], (err) => {
            if (err) return errorResponse(res, err.message);
            successResponse(res, { message: 'Field updated successfully' });
        });
    } else {
        db.query('INSERT INTO study_fields (name) VALUES (?)', [name], (err) => {
            if (err) return errorResponse(res, err.message);
            successResponse(res, { message: 'Field added successfully' });
        });
    }
});

router.delete('/study-fields/:id', checkAdmin, (req, res) => {
    db.query('DELETE FROM study_fields WHERE field_id = ?', [req.params.id], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Field deleted successfully' });
    });
});

// Application Statuses
router.get('/application-statuses', (req, res) => {
    const { category } = req.query;
    let sql = `
        SELECT s.*, GROUP_CONCAT(sc.category) as categories
        FROM application_statuses s
        LEFT JOIN application_status_categories sc ON s.status_id = sc.status_id
        GROUP BY s.status_id
        ORDER BY s.name
    `;
    const params = [];
    if (category) {
        sql = `
            SELECT s.*, (SELECT GROUP_CONCAT(category) FROM application_status_categories WHERE status_id = s.status_id) as categories
            FROM application_statuses s
            JOIN application_status_categories sc ON s.status_id = sc.status_id
            WHERE sc.category = ?
            GROUP BY s.status_id
            ORDER BY s.name
        `;
        params.push(category);
    }

    db.query(sql, params, (err, results) => {
        if (err) return errorResponse(res, err.message);
        // Convert comma separated string to array
        const data = results.map(r => ({
            ...r,
            categories: r.categories ? r.categories.split(',') : []
        }));
        successResponse(res, data);
    });
});

router.post('/application-statuses', checkAdmin, (req, res) => {
    const { status_id, name, categories } = req.body; // categories is now an array
    const categoryList = Array.isArray(categories) ? categories : (categories ? [categories] : []);

    db.getConnection((err, connection) => {
        if (err) return errorResponse(res, err.message);

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                return errorResponse(res, err.message);
            }

            try {
                let current_id = status_id;
                if (status_id) {
                    await new Promise((resolve, reject) => {
                        connection.query('UPDATE application_statuses SET name = ? WHERE status_id = ?', [name, status_id], (err) => err ? reject(err) : resolve());
                    });
                    // Clear old categories
                    await new Promise((resolve, reject) => {
                        connection.query('DELETE FROM application_status_categories WHERE status_id = ?', [status_id], (err) => err ? reject(err) : resolve());
                    });
                } else {
                    const result = await new Promise((resolve, reject) => {
                        connection.query('INSERT INTO application_statuses (name) VALUES (?)', [name], (err, res) => err ? reject(err) : resolve(res));
                    });
                    current_id = result.insertId;
                }

                // Insert new categories
                for (const cat of categoryList) {
                    await new Promise((resolve, reject) => {
                        connection.query('INSERT INTO application_status_categories (status_id, category) VALUES (?, ?)', [current_id, cat], (err) => err ? reject(err) : resolve());
                    });
                }

                connection.commit((err) => {
                    connection.release();
                    if (err) return errorResponse(res, err.message);
                    successResponse(res, { message: status_id ? 'Status updated successfully' : 'Status added successfully' });
                });

            } catch (error) {
                connection.rollback(() => {
                    connection.release();
                    errorResponse(res, error.message);
                });
            }
        });
    });
});

router.delete('/application-statuses/:id', checkAdmin, (req, res) => {
    db.query('DELETE FROM application_statuses WHERE status_id = ?', [req.params.id], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Status deleted successfully' });
    });
});

// Application Sub Statuses
router.get('/application-sub-statuses', (req, res) => {
    const sql = `
        SELECT ss.*, s.name as status_name, 
        (SELECT GROUP_CONCAT(category) FROM application_status_categories WHERE status_id = s.status_id) as categories
        FROM application_sub_statuses ss 
        JOIN application_statuses s ON ss.status_id = s.status_id 
        ORDER BY s.name, ss.name
    `;
    db.query(sql, (err, results) => {
        if (err) return errorResponse(res, err.message);
        const data = results.map(r => ({
            ...r,
            categories: r.categories ? r.categories.split(',') : []
        }));
        successResponse(res, data);
    });
});

router.post('/application-sub-statuses', checkAdmin, (req, res) => {
    const { sub_status_id, status_id, name } = req.body;
    if (sub_status_id) {
        db.query('UPDATE application_sub_statuses SET status_id = ?, name = ? WHERE sub_status_id = ?', [status_id, name, sub_status_id], (err) => {
            if (err) return errorResponse(res, err.message);
            successResponse(res, { message: 'Sub-status updated successfully' });
        });
    } else {
        db.query('INSERT INTO application_sub_statuses (status_id, name) VALUES (?, ?)', [status_id, name], (err) => {
            if (err) return errorResponse(res, err.message);
            successResponse(res, { message: 'Sub-status added successfully' });
        });
    }
});

router.delete('/application-sub-statuses/:id', checkAdmin, (req, res) => {
    db.query('DELETE FROM application_sub_statuses WHERE sub_status_id = ?', [req.params.id], (err) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, { message: 'Sub-status deleted successfully' });
    });
});

// Staff for dropdowns
router.get('/staff', (req, res) => {
    const { branch_id, department_id } = req.query;
    let sql = 'SELECT user_id, username FROM users WHERE status = "Working"';
    const params = [];
    if (branch_id) {
        sql += ' AND branch_id = ?';
        params.push(branch_id);
    }
    if (department_id) {
        sql += ' AND department_id = ?';
        params.push(department_id);
    }
    sql += ' ORDER BY username';
    db.query(sql, params, (err, results) => {
        if (err) return errorResponse(res, err.message);
        successResponse(res, results);
    });
});

module.exports = router;
