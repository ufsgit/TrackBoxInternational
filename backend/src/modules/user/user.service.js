const db = require('../../config/db');
const bcrypt = require('bcryptjs');

const getList = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT user_id, username FROM users WHERE status = "Working" ORDER BY username', function (err, results) {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const getAll = () => {
    return new Promise((resolve, reject) => {
        db.query('CALL sp_GetUsers()', function (err, results) {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

const getById = (userId) => {
    return new Promise((resolve, reject) => {
        db.query('CALL sp_GetUserById(?)', [userId], function (err, userResults) {
            if (err) return reject(err);

            const user = userResults[0][0];
            if (!user) return reject({ status: 404, message: 'User not found' });

            db.query('CALL sp_GetUserPermissions(?)', [userId], function (err, permResults) {
                if (err) return reject(err);
                resolve({
                    user: user,
                    branchPermissions: permResults[0],
                    pagePermissions: permResults[1]
                });
            });
        });
    });
};

const createOrUpdate = (data) => {
    const { user, branchPermissions, pagePermissions } = data;
    return new Promise((resolve, reject) => {
        db.getConnection(async function (err, connection) {
            if (err) return reject(err);

            try {
                await new Promise((res, rej) => connection.beginTransaction(err => err ? rej(err) : res()));

                // 1. Upsert User
                let passwordToSave = user.password || '';
                if (passwordToSave.length > 0) {
                    passwordToSave = await bcrypt.hash(passwordToSave, 10);
                }

                const userResult = await new Promise((res, rej) => {
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
                        (err, result) => err ? rej(err) : res(result)
                    );
                });

                const userId = userResult[0][0].user_id;

                // 2. Clear old permissions if it's an update
                if (user.id) {
                    const delDocs = new Promise((res, rej) => connection.query('DELETE FROM user_permissions_docs WHERE user_id = ?', [userId], (err) => err ? rej(err) : res()));
                    const delPages = new Promise((res, rej) => connection.query('DELETE FROM user_permissions_pages WHERE user_id = ?', [userId], (err) => err ? rej(err) : res()));
                    await Promise.all([delDocs, delPages]);
                }

                // 3. Insert document permissions
                if (branchPermissions && branchPermissions.length > 0) {
                    const docValues = branchPermissions
                        .filter(p => p.view || p.viewAll || p.transfer)
                        .map(p => [userId, p.branchId, p.deptId, p.view, p.viewAll, p.transfer]);

                    if (docValues.length > 0) {
                        await new Promise((res, rej) => {
                            connection.query(
                                'INSERT INTO user_permissions_docs (user_id, branch_id, department_id, can_view, can_view_all, can_transfer) VALUES ?',
                                [docValues],
                                (err, result) => err ? rej(err) : res(result)
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
                        await new Promise((res, rej) => {
                            connection.query(
                                'INSERT INTO user_permissions_pages (user_id, menu_name, can_view, can_save, can_edit, can_delete) VALUES ?',
                                [pageValues],
                                (err, result) => err ? rej(err) : res(result)
                            );
                        });
                    }
                }

                await new Promise((res, rej) => connection.commit(err => err ? rej(err) : res()));
                resolve({ id: userId, message: 'User and permissions saved successfully' });

            } catch (error) {
                await new Promise((res) => connection.rollback(() => res()));
                reject(error);
            } finally {
                connection.release();
            }
        });
    });
};

module.exports = {
    getList,
    getAll,
    getById,
    createOrUpdate
};
