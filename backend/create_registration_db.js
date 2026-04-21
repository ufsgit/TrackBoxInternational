const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    const sql = `
CREATE TABLE IF NOT EXISTS \`student_registrations\` (
  \`registration_id\` int NOT NULL AUTO_INCREMENT,
  \`student_id\` int NOT NULL,
  \`passport_name\` varchar(255) DEFAULT NULL,
  \`age\` int DEFAULT NULL,
  \`gender\` enum('Male','Female','Other') DEFAULT NULL,
  \`marital_status\` varchar(50) DEFAULT NULL,
  \`spouse_accompanying\` tinyint(1) DEFAULT '0',
  \`address_country\` varchar(100) DEFAULT NULL,
  \`address_state\` varchar(100) DEFAULT NULL,
  \`address_suburb\` varchar(100) DEFAULT NULL,
  \`contact1\` varchar(50) DEFAULT NULL,
  \`contact2\` varchar(50) DEFAULT NULL,
  \`email\` varchar(100) DEFAULT NULL,
  \`citizenship_country\` varchar(100) DEFAULT NULL,
  \`highest_education\` varchar(100) DEFAULT NULL,
  \`education_field\` varchar(100) DEFAULT NULL,
  \`has_canadian_edu\` tinyint(1) DEFAULT '0',
  \`canadian_edu_level\` varchar(100) DEFAULT NULL,
  \`canadian_edu_field\` varchar(100) DEFAULT NULL,
  \`has_australian_edu\` tinyint(1) DEFAULT '0',
  \`australian_edu_level\` varchar(100) DEFAULT NULL,
  \`australian_edu_field\` varchar(100) DEFAULT NULL,
  \`has_aus_specialised_edu\` tinyint(1) DEFAULT '0',
  \`aus_specialised_edu_level\` varchar(100) DEFAULT NULL,
  \`aus_specialised_edu_field\` varchar(100) DEFAULT NULL,
  \`has_nz_edu\` tinyint(1) DEFAULT '0',
  \`nz_edu_level\` varchar(100) DEFAULT NULL,
  \`nz_edu_field\` varchar(100) DEFAULT NULL,
  \`has_work_experience\` tinyint(1) DEFAULT '0',
  \`total_work_experience\` varchar(50) DEFAULT NULL,
  \`canadian_work_years\` varchar(50) DEFAULT NULL,
  \`australian_work_years\` varchar(50) DEFAULT NULL,
  \`nz_work_years\` varchar(50) DEFAULT NULL,
  \`has_language_test\` tinyint(1) DEFAULT '0',
  \`language_test_type\` varchar(50) DEFAULT NULL,
  \`writing_score\` varchar(20) DEFAULT NULL,
  \`listening_score\` varchar(20) DEFAULT NULL,
  \`speaking_score\` varchar(20) DEFAULT NULL,
  \`reading_score\` varchar(20) DEFAULT NULL,
  \`has_admission_test\` tinyint(1) DEFAULT '0',
  \`admission_test_type\` varchar(50) DEFAULT NULL,
  \`quant_score\` varchar(20) DEFAULT NULL,
  \`verbal_score\` varchar(20) DEFAULT NULL,
  \`data_insights_score\` varchar(20) DEFAULT NULL,
  \`spouse_age\` int DEFAULT NULL,
  \`spouse_edu_level\` varchar(100) DEFAULT NULL,
  \`spouse_canadian_edu\` tinyint(1) DEFAULT '0',
  \`spouse_canadian_edu_level\` varchar(100) DEFAULT NULL,
  \`spouse_canadian_edu_field\` varchar(100) DEFAULT NULL,
  \`spouse_australian_edu\` tinyint(1) DEFAULT '0',
  \`spouse_australian_edu_level\` varchar(100) DEFAULT NULL,
  \`spouse_australian_edu_field\` varchar(100) DEFAULT NULL,
  \`spouse_aus_specialised_edu\` tinyint(1) DEFAULT '0',
  \`spouse_aus_specialised_edu_level\` varchar(100) DEFAULT NULL,
  \`spouse_aus_specialised_edu_field\` varchar(100) DEFAULT NULL,
  \`spouse_work_exp\` varchar(50) DEFAULT NULL,
  \`spouse_canadian_work\` varchar(50) DEFAULT NULL,
  \`spouse_australian_work\` varchar(50) DEFAULT NULL,
  \`spouse_nz_work\` varchar(50) DEFAULT NULL,
  \`spouse_lang_test_type\` varchar(50) DEFAULT NULL,
  \`spouse_writing\` varchar(20) DEFAULT NULL,
  \`spouse_listening\` varchar(20) DEFAULT NULL,
  \`spouse_speaking\` varchar(20) DEFAULT NULL,
  \`spouse_reading\` varchar(20) DEFAULT NULL,
  \`has_relatives\` tinyint(1) DEFAULT '0',
  \`relative_relationship\` varchar(100) DEFAULT NULL,
  \`relative_related_to\` varchar(50) DEFAULT NULL,
  \`education_data\` json DEFAULT NULL,
  \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`migration_data\` json DEFAULT NULL,
  \`migration_spouse_data\` json DEFAULT NULL,
  \`relatives_data\` json DEFAULT NULL,
  PRIMARY KEY (\`registration_id\`),
  KEY (\`student_id\`),
  CONSTRAINT \`student_registrations_ibfk_1\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`student_id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`registration_children\` (
  \`child_id\` int NOT NULL AUTO_INCREMENT,
  \`registration_id\` int NOT NULL,
  \`age\` int DEFAULT NULL,
  \`is_accompanying\` tinyint(1) DEFAULT '0',
  PRIMARY KEY (\`child_id\`),
  KEY (\`registration_id\`),
  CONSTRAINT \`registration_children_ibfk_1\` FOREIGN KEY (\`registration_id\`) REFERENCES \`student_registrations\` (\`registration_id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`registration_suggested_programs\` (
  \`sug_program_id\` int NOT NULL AUTO_INCREMENT,
  \`registration_id\` int NOT NULL,
  \`program\` varchar(255) DEFAULT NULL,
  \`applied_for\` varchar(255) DEFAULT NULL,
  \`details\` varchar(255) DEFAULT NULL,
  \`status\` varchar(100) DEFAULT NULL,
  \`sub_status\` varchar(100) DEFAULT NULL,
  \`remarks\` text,
  \`is_selected\` tinyint(1) DEFAULT '0',
  \`branch_id\` int DEFAULT NULL,
  \`department_id\` int DEFAULT NULL,
  \`assigned_to\` int DEFAULT NULL,
  PRIMARY KEY (\`sug_program_id\`),
  KEY (\`registration_id\`),
  CONSTRAINT \`registration_suggested_programs_ibfk_1\` FOREIGN KEY (\`registration_id\`) REFERENCES \`student_registrations\` (\`registration_id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP PROCEDURE IF EXISTS sp_GetStudentRegistration;
CREATE PROCEDURE sp_GetStudentRegistration(IN p_student_id INT)
BEGIN
    DECLARE v_reg_id INT DEFAULT NULL;
    SELECT registration_id INTO v_reg_id FROM student_registrations WHERE student_id = p_student_id LIMIT 1;
    IF v_reg_id IS NOT NULL THEN
        SELECT * FROM student_registrations WHERE student_id = p_student_id;
        SELECT * FROM registration_children WHERE registration_id = v_reg_id;
        SELECT * FROM registration_suggested_programs WHERE registration_id = v_reg_id;
    ELSE
        CALL sp_GetStudentApplication(p_student_id);
    END IF;
END;

DROP PROCEDURE IF EXISTS sp_UpsertStudentRegistration;
CREATE PROCEDURE sp_UpsertStudentRegistration(
    IN p_student_id INT, IN p_passport_name VARCHAR(255), IN p_age INT, IN p_dob DATE, IN p_gender ENUM('Male', 'Female', 'Other'),
    IN p_marital_status VARCHAR(50), IN p_spouse_accompanying TINYINT(1), IN p_address_country VARCHAR(100),
    IN p_address_state VARCHAR(100), IN p_address_suburb VARCHAR(100), IN p_contact1 VARCHAR(50),
    IN p_contact2 VARCHAR(50), IN p_email VARCHAR(100), IN p_citizenship_country VARCHAR(100),
    IN p_passport_country VARCHAR(100), IN p_has_second_passport TINYINT(1), IN p_second_passport_country VARCHAR(100),
    IN p_highest_education VARCHAR(100), IN p_education_field VARCHAR(100), IN p_has_canadian_edu TINYINT(1),
    IN p_canadian_edu_level VARCHAR(100), IN p_canadian_edu_field VARCHAR(100), IN p_has_australian_edu TINYINT(1),
    IN p_australian_edu_level VARCHAR(100), IN p_australian_edu_field VARCHAR(100), IN p_has_aus_specialised_edu TINYINT(1),
    IN p_aus_specialised_edu_level VARCHAR(100), IN p_aus_specialised_edu_field VARCHAR(100), IN p_has_nz_edu TINYINT(1),
    IN p_nz_edu_level VARCHAR(100), IN p_nz_edu_field VARCHAR(100), IN p_has_work_experience TINYINT(1),
    IN p_total_work_experience VARCHAR(50), IN p_canadian_work_years VARCHAR(50), IN p_australian_work_years VARCHAR(50),
    IN p_nz_work_years VARCHAR(50), IN p_has_language_test TINYINT(1), IN p_language_test_type VARCHAR(50),
    IN p_writing_score VARCHAR(20), IN p_listening_score VARCHAR(20), IN p_speaking_score VARCHAR(20),
    IN p_reading_score VARCHAR(20), IN p_has_admission_test TINYINT(1), IN p_admission_test_type VARCHAR(50),
    IN p_quant_score VARCHAR(20), IN p_verbal_score VARCHAR(20), IN p_data_insights_score VARCHAR(20),
    IN p_spouse_age INT, IN p_spouse_edu_level VARCHAR(100), IN p_spouse_canadian_edu TINYINT(1),
    IN p_spouse_canadian_edu_level VARCHAR(100), IN p_spouse_canadian_edu_field VARCHAR(100),
    IN p_spouse_australian_edu TINYINT(1), IN p_spouse_australian_edu_level VARCHAR(100),
    IN p_spouse_australian_edu_field VARCHAR(100), IN p_spouse_aus_specialised_edu TINYINT(1),
    IN p_spouse_aus_specialised_edu_level VARCHAR(100), IN p_spouse_aus_specialised_edu_field VARCHAR(100),
    IN p_spouse_work_exp VARCHAR(50), IN p_spouse_canadian_work VARCHAR(50), IN p_spouse_australian_work VARCHAR(50),
    IN p_spouse_nz_work VARCHAR(50), IN p_spouse_lang_test_type VARCHAR(50), IN p_spouse_writing VARCHAR(20),
    IN p_spouse_listening VARCHAR(20), IN p_spouse_speaking VARCHAR(20), IN p_spouse_reading VARCHAR(20),
    IN p_has_relatives TINYINT(1), IN p_relative_relationship VARCHAR(100), IN p_relative_related_to VARCHAR(50),
    IN p_education_data JSON, IN p_migration_data JSON, IN p_migration_spouse_data JSON, IN p_relatives_data JSON
)
BEGIN
    DECLARE v_reg_id INT;
    SELECT registration_id INTO v_reg_id FROM student_registrations WHERE student_id = p_student_id LIMIT 1;
    IF v_reg_id IS NULL THEN
        INSERT INTO student_registrations (
            student_id, passport_name, age, dob, gender, marital_status, spouse_accompanying, address_country, address_state, address_suburb,
            contact1, contact2, email, citizenship_country, passport_country, has_second_passport, second_passport_country,
            highest_education, education_field, has_canadian_edu, canadian_edu_level,
            canadian_edu_field, has_australian_edu, australian_edu_level, australian_edu_field, has_aus_specialised_edu, aus_specialised_edu_level,
            aus_specialised_edu_field, has_nz_edu, nz_edu_level, nz_edu_field, has_work_experience, total_work_experience, canadian_work_years,
            australian_work_years, nz_work_years, has_language_test, language_test_type, writing_score, listening_score, speaking_score,
            reading_score, has_admission_test, admission_test_type, quant_score, verbal_score, data_insights_score, spouse_age, spouse_edu_level,
            spouse_canadian_edu, spouse_canadian_edu_level, spouse_canadian_edu_field, spouse_australian_edu, spouse_australian_edu_level,
            spouse_australian_edu_field, spouse_aus_specialised_edu, spouse_aus_specialised_edu_level, spouse_aus_specialised_edu_field,
            spouse_work_exp, spouse_canadian_work, spouse_australian_work, spouse_nz_work, spouse_lang_test_type, spouse_writing, spouse_listening,
            spouse_speaking, spouse_reading, has_relatives, relative_relationship, relative_related_to, education_data, migration_data,
            migration_spouse_data, relatives_data
        ) VALUES (
            p_student_id, p_passport_name, p_age, p_dob, p_gender, p_marital_status, p_spouse_accompanying, p_address_country, p_address_state, p_address_suburb,
            p_contact1, p_contact2, p_email, p_citizenship_country, p_passport_country, p_has_second_passport, p_second_passport_country,
            p_highest_education, p_education_field, p_has_canadian_edu, p_canadian_edu_level,
            p_canadian_edu_field, p_has_australian_edu, p_australian_edu_level, p_australian_edu_field, p_has_aus_specialised_edu, p_aus_specialised_edu_level,
            p_aus_specialised_edu_field, p_has_nz_edu, p_nz_edu_level, p_nz_edu_field, p_has_work_experience, p_total_work_experience, p_canadian_work_years,
            p_australian_work_years, p_nz_work_years, p_has_language_test, p_language_test_type, p_writing_score, p_listening_score, p_speaking_score,
            p_reading_score, p_has_admission_test, p_admission_test_type, p_quant_score, p_verbal_score, p_data_insights_score, p_spouse_age, p_spouse_edu_level,
            p_spouse_canadian_edu, p_spouse_canadian_edu_level, p_spouse_canadian_edu_field, p_spouse_australian_edu, p_spouse_australian_edu_level,
            p_spouse_australian_edu_field, p_spouse_aus_specialised_edu, p_spouse_aus_specialised_edu_level, p_spouse_aus_specialised_edu_field,
            p_spouse_work_exp, p_spouse_canadian_work, p_spouse_australian_work, p_spouse_nz_work, p_spouse_lang_test_type, p_spouse_writing, p_spouse_listening,
            p_spouse_speaking, p_spouse_reading, p_has_relatives, p_relative_relationship, p_relative_related_to, p_education_data, p_migration_data,
            p_migration_spouse_data, p_relatives_data
        );
        SET v_reg_id = LAST_INSERT_ID();
    ELSE
        UPDATE student_registrations SET
            passport_name = p_passport_name, age = p_age, dob = p_dob, gender = p_gender, marital_status = p_marital_status, spouse_accompanying = p_spouse_accompanying,
            address_country = p_address_country, address_state = p_address_state, address_suburb = p_address_suburb, contact1 = p_contact1, contact2 = p_contact2,
            email = p_email, citizenship_country = p_citizenship_country, passport_country = p_passport_country, has_second_passport = p_has_second_passport,
            second_passport_country = p_second_passport_country, highest_education = p_highest_education, education_field = p_education_field,
            has_canadian_edu = p_has_canadian_edu, canadian_edu_level = p_canadian_edu_level, canadian_edu_field = p_canadian_edu_field,
            has_australian_edu = p_has_australian_edu, australian_edu_level = p_australian_edu_level, australian_edu_field = p_australian_edu_field,
            has_aus_specialised_edu = p_has_aus_specialised_edu, aus_specialised_edu_level = p_aus_specialised_edu_level,
            aus_specialised_edu_field = p_aus_specialised_edu_field, has_nz_edu = p_has_nz_edu, nz_edu_level = p_nz_edu_level, nz_edu_field = p_nz_edu_field,
            has_work_experience = p_has_work_experience, total_work_experience = p_total_work_experience, canadian_work_years = p_canadian_work_years,
            australian_work_years = p_australian_work_years, nz_work_years = p_nz_work_years, has_language_test = p_has_language_test,
            language_test_type = p_language_test_type, writing_score = p_writing_score, listening_score = p_listening_score, speaking_score = p_speaking_score,
            reading_score = p_reading_score, has_admission_test = p_has_admission_test, admission_test_type = p_admission_test_type, quant_score = p_quant_score,
            verbal_score = p_verbal_score, data_insights_score = p_data_insights_score, spouse_age = p_spouse_age, spouse_edu_level = p_spouse_edu_level,
            spouse_canadian_edu = p_spouse_canadian_edu, spouse_canadian_edu_level = p_spouse_canadian_edu_level, spouse_canadian_edu_field = p_spouse_canadian_edu_field,
            spouse_australian_edu = p_spouse_australian_edu, spouse_australian_edu_level = p_spouse_australian_edu_level,
            spouse_australian_edu_field = p_spouse_australian_edu_field, spouse_aus_specialised_edu = p_spouse_aus_specialised_edu,
            spouse_aus_specialised_edu_level = p_spouse_aus_specialised_edu_level, spouse_aus_specialised_edu_field = p_spouse_aus_specialised_edu_field,
            spouse_work_exp = p_spouse_work_exp, spouse_canadian_work = p_spouse_canadian_work, spouse_australian_work = p_spouse_australian_work,
            spouse_nz_work = p_spouse_nz_work, spouse_lang_test_type = p_spouse_lang_test_type, spouse_writing = p_spouse_writing,
            spouse_listening = p_spouse_listening, spouse_speaking = p_spouse_speaking, spouse_reading = p_spouse_reading, has_relatives = p_has_relatives,
            relative_relationship = p_relative_relationship, relative_related_to = p_relative_related_to, education_data = p_education_data,
            migration_data = p_migration_data, migration_spouse_data = p_migration_spouse_data, relatives_data = p_relatives_data,
            updated_at = CURRENT_TIMESTAMP
        WHERE registration_id = v_reg_id;
    END IF;
    SELECT v_reg_id AS registration_id;
END;
`;

    try {
        await db.query(sql);
        console.log('Migration successful');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await db.end();
    }
}

runMigration();
