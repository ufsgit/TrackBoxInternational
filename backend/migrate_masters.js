require('dotenv').config();
const db = require('./db');

const tables = [
    {
        name: 'countries',
        sql: `CREATE TABLE IF NOT EXISTS countries (
            country_id int NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            PRIMARY KEY (country_id),
            UNIQUE KEY name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    },
    {
        name: 'occupations',
        sql: `CREATE TABLE IF NOT EXISTS occupations (
            occ_id int NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            PRIMARY KEY (occ_id),
            UNIQUE KEY name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    },
    {
        name: 'visa_categories',
        sql: `CREATE TABLE IF NOT EXISTS visa_categories (
            visa_cat_id int NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            PRIMARY KEY (visa_cat_id),
            UNIQUE KEY name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    },
    {
        name: 'migration_categories',
        sql: `CREATE TABLE IF NOT EXISTS migration_categories (
            migration_cat_id int NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            PRIMARY KEY (migration_cat_id),
            UNIQUE KEY name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    },
    {
        name: 'work_categories',
        sql: `CREATE TABLE IF NOT EXISTS work_categories (
            work_cat_id int NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            PRIMARY KEY (work_cat_id),
            UNIQUE KEY name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    },
    {
        name: 'coaching_courses',
        sql: `CREATE TABLE IF NOT EXISTS coaching_courses (
            course_id int NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            PRIMARY KEY (course_id),
            UNIQUE KEY name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    }
];

const spSql = `
CREATE PROCEDURE sp_GetMasterLookups()
BEGIN
    -- 0: Countries
    SELECT * FROM countries ORDER BY name;
    
    -- 1: Levels
    SELECT * FROM educational_levels ORDER BY name;
    
    -- 2: Intakes
    SELECT * FROM study_intakes ORDER BY name;
    
    -- 3: Occupations (Used in Work and Migration)
    SELECT * FROM occupations ORDER BY name;
    
    -- 4: Fields (Used in Study and Coaching)
    SELECT * FROM study_fields ORDER BY name;
    
    -- 5: Categories (Used primarily for Migration categories)
    SELECT * FROM migration_categories ORDER BY name;
    
    -- 6: Years (Static list)
    SELECT '2024' as name UNION SELECT '2025' UNION SELECT '2026' UNION SELECT '2027' UNION SELECT '2028' UNION SELECT '2029' UNION SELECT '2030';
    
    -- 7: Enquiry Sources
    SELECT * FROM enquiry_sources ORDER BY source_name;
    
    -- 8: Visa Categories
    SELECT * FROM visa_categories ORDER BY name;
    
    -- 9: Work Categories
    SELECT * FROM work_categories ORDER BY name;
    
    -- 10: Coaching Courses
    SELECT * FROM coaching_courses ORDER BY name;
END;
`;

(async () => {
    try {
        console.log('Running master data migration...');
        
        for (const t of tables) {
            await new Promise((resolve, reject) => {
                db.query(t.sql, (err) => {
                    if (err) { console.error(`Error creating ${t.name}:`, err.message); resolve(); }
                    else { console.log(`Table ${t.name} created/checked.`); resolve(); }
                });
            });
        }
        
        await new Promise((resolve, reject) => {
            db.query("DROP PROCEDURE IF EXISTS sp_GetMasterLookups", (err) => {
                if (err) reject(err); else resolve();
            });
        });
        
        await new Promise((resolve, reject) => {
            db.query(spSql, (err) => {
                if (err) reject(err); else resolve();
            });
        });
        
        console.log('Master data tables and procedure updated successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
})();
