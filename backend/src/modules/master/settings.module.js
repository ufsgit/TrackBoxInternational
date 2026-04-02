const express = require('express');
const router = express.Router();
const db = require('../../../db');

// Helper for Admin check
const checkAdmin = (req, res, next) => {
    if (req.user && req.user.user_type === 'admin') return next();
    res.status(403).json({ error: 'Permission denied. Admin only.' });
};

const genericCrud = (tableName, idName) => {
    router.get(`/${tableName}`, (req, res) => {
        db.query(`SELECT * FROM ${tableName} ORDER BY name`, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    });

    router.post(`/${tableName}`, (req, res) => {
        const { id, name } = req.body;
        if (id) {
            db.query(`UPDATE ${tableName} SET name = ? WHERE ${idName} = ?`, [name, id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Updated successfully' });
            });
        } else {
            db.query(`INSERT INTO ${tableName} (name) VALUES (?)`, [name], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Added successfully' });
            });
        }
    });

    router.delete(`/${tableName}/:id`, (req, res) => {
        db.query(`DELETE FROM ${tableName} WHERE ${idName} = ?`, [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Deleted successfully' });
        });
    });
};

genericCrud('countries', 'country_id');
genericCrud('occupations', 'occ_id');
genericCrud('visa_categories', 'visa_cat_id');
genericCrud('migration_categories', 'migration_cat_id');
genericCrud('work_categories', 'work_cat_id');
genericCrud('coaching_courses', 'course_id');

module.exports = router;
