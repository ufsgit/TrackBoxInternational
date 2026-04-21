require('dotenv').config();
const db = require('./db');

const sql = `
CREATE PROCEDURE sp_UpsertStudentApplication(
    IN p_student_id INT,
    IN p_passport_name VARCHAR(255),
    IN p_age INT,
    IN p_dob DATE,
    IN p_gender ENUM('Male', 'Female', 'Other'),
    IN p_marital_status VARCHAR(50),
    IN p_spouse_accompanying TINYINT(1),
    IN p_address_country VARCHAR(100),
    IN p_address_state VARCHAR(100),
    IN p_address_suburb VARCHAR(100),
    IN p_contact1 VARCHAR(50),
    IN p_contact2 VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_citizenship_country VARCHAR(100),
    IN p_passport_country VARCHAR(100),
    IN p_has_second_passport TINYINT(1),
    IN p_second_passport_country VARCHAR(100),
    IN p_highest_education VARCHAR(100),
    IN p_education_field VARCHAR(100),
    IN p_has_canadian_edu TINYINT(1),
    IN p_canadian_edu_level VARCHAR(100),
    IN p_canadian_edu_field VARCHAR(100),
    IN p_has_australian_edu TINYINT(1),
    IN p_australian_edu_level VARCHAR(100),
    IN p_australian_edu_field VARCHAR(100),
    IN p_has_aus_specialised_edu TINYINT(1),
    IN p_aus_specialised_edu_level VARCHAR(100),
    IN p_aus_specialised_edu_field VARCHAR(100),
    IN p_has_nz_edu TINYINT(1),
    IN p_nz_edu_level VARCHAR(100),
    IN p_nz_edu_field VARCHAR(100),
    IN p_has_work_experience TINYINT(1),
    IN p_total_work_experience VARCHAR(50),
    IN p_canadian_work_years VARCHAR(50),
    IN p_australian_work_years VARCHAR(50),
    IN p_nz_work_years VARCHAR(50),
    IN p_has_language_test TINYINT(1),
    IN p_language_test_type VARCHAR(50),
    IN p_writing_score VARCHAR(20),
    IN p_listening_score VARCHAR(20),
    IN p_speaking_score VARCHAR(20),
    IN p_reading_score VARCHAR(20),
    IN p_has_admission_test TINYINT(1),
    IN p_admission_test_type VARCHAR(50),
    IN p_quant_score VARCHAR(20),
    IN p_verbal_score VARCHAR(20),
    IN p_data_insights_score VARCHAR(20),
    IN p_spouse_age INT,
    IN p_spouse_edu_level VARCHAR(100),
    IN p_spouse_canadian_edu TINYINT(1),
    IN p_spouse_canadian_edu_level VARCHAR(100),
    IN p_spouse_canadian_edu_field VARCHAR(100),
    IN p_spouse_australian_edu TINYINT(1),
    IN p_spouse_australian_edu_level VARCHAR(100),
    IN p_spouse_australian_edu_field VARCHAR(100),
    IN p_spouse_aus_specialised_edu TINYINT(1),
    IN p_spouse_aus_specialised_edu_level VARCHAR(100),
    IN p_spouse_aus_specialised_edu_field VARCHAR(100),
    IN p_spouse_work_exp VARCHAR(50),
    IN p_spouse_canadian_work VARCHAR(50),
    IN p_spouse_australian_work VARCHAR(50),
    IN p_spouse_nz_work VARCHAR(50),
    IN p_spouse_lang_test_type VARCHAR(50),
    IN p_spouse_writing VARCHAR(20),
    IN p_spouse_listening VARCHAR(20),
    IN p_spouse_speaking VARCHAR(20),
    IN p_spouse_reading VARCHAR(20),
    IN p_has_relatives TINYINT(1),
    IN p_relative_relationship VARCHAR(100),
    IN p_relative_related_to VARCHAR(50),
    IN p_education_data JSON,
    IN p_migration_data JSON,
    IN p_migration_spouse_data JSON,
    IN p_relatives_data JSON
)
BEGIN
    DECLARE v_app_id INT;
    
    -- Check if application exists for the student
    SELECT application_id INTO v_app_id FROM student_applications WHERE student_id = p_student_id LIMIT 1;
    
    IF v_app_id IS NULL THEN
        INSERT INTO student_applications (
            student_id, passport_name, age, dob, gender, marital_status,
            spouse_accompanying, address_country, address_state, address_suburb,
            contact1, contact2, email, citizenship_country, passport_country,
            has_second_passport, second_passport_country,
            highest_education, education_field, has_canadian_edu,
            canadian_edu_level, canadian_edu_field, has_australian_edu,
            australian_edu_level, australian_edu_field, has_aus_specialised_edu,
            aus_specialised_edu_level, aus_specialised_edu_field, has_nz_edu,
            nz_edu_level, nz_edu_field, has_work_experience, total_work_experience,
            canadian_work_years, australian_work_years, nz_work_years,
            has_language_test, language_test_type, writing_score, listening_score,
            speaking_score, reading_score, has_admission_test, admission_test_type,
            quant_score, verbal_score, data_insights_score, spouse_age,
            spouse_edu_level, spouse_canadian_edu, spouse_canadian_edu_level,
            spouse_canadian_edu_field, spouse_australian_edu, spouse_australian_edu_level,
            spouse_australian_edu_field, spouse_aus_specialised_edu,
            spouse_aus_specialised_edu_level, spouse_aus_specialised_edu_field,
            spouse_work_exp, spouse_canadian_work, spouse_australian_work,
            spouse_nz_work, spouse_lang_test_type, spouse_writing, spouse_listening,
            spouse_speaking, spouse_reading, has_relatives, relative_relationship,
            relative_related_to, education_data, migration_data,
            migration_spouse_data, relatives_data
        ) VALUES (
            p_student_id, p_passport_name, p_age, p_dob, p_gender, p_marital_status,
            p_spouse_accompanying, p_address_country, p_address_state, p_address_suburb,
            p_contact1, p_contact2, p_email, p_citizenship_country, p_passport_country,
            p_has_second_passport, p_second_passport_country,
            p_highest_education, p_education_field, p_has_canadian_edu,
            p_canadian_edu_level, p_canadian_edu_field, p_has_australian_edu,
            p_australian_edu_level, p_australian_edu_field, p_has_aus_specialised_edu,
            p_aus_specialised_edu_level, p_aus_specialised_edu_field, p_has_nz_edu,
            p_nz_edu_level, p_nz_edu_field, p_has_work_experience, p_total_work_experience,
            p_canadian_work_years, p_australian_work_years, p_nz_work_years,
            p_has_language_test, p_language_test_type, p_writing_score, p_listening_score,
            p_speaking_score, p_reading_score, p_has_admission_test, p_admission_test_type,
            p_quant_score, p_verbal_score, p_data_insights_score, p_spouse_age,
            p_spouse_edu_level, p_spouse_canadian_edu, p_spouse_canadian_edu_level,
            p_spouse_canadian_edu_field, p_spouse_australian_edu, p_spouse_australian_edu_level,
            p_spouse_australian_edu_field, p_spouse_aus_specialised_edu,
            p_spouse_aus_specialised_edu_level, p_spouse_aus_specialised_edu_field,
            p_spouse_work_exp, p_spouse_canadian_work, p_spouse_australian_work,
            p_spouse_nz_work, p_spouse_lang_test_type, p_spouse_writing, p_spouse_listening,
            p_spouse_speaking, p_spouse_reading, p_has_relatives, p_relative_relationship,
            p_relative_related_to, p_education_data, p_migration_data,
            p_migration_spouse_data, p_relatives_data
        );
        SET v_app_id = LAST_INSERT_ID();
    ELSE
        UPDATE student_applications SET
            passport_name = p_passport_name, age = p_age, dob = p_dob, gender = p_gender,
            marital_status = p_marital_status, spouse_accompanying = p_spouse_accompanying,
            address_country = p_address_country, address_state = p_address_state,
            address_suburb = p_address_suburb, contact1 = p_contact1, contact2 = p_contact2,
            email = p_email, citizenship_country = p_citizenship_country,
            passport_country = p_passport_country, has_second_passport = p_has_second_passport,
            second_passport_country = p_second_passport_country,
            highest_education = p_highest_education, education_field = p_education_field,
            has_canadian_edu = p_has_canadian_edu, canadian_edu_level = p_canadian_edu_level,
            canadian_edu_field = p_canadian_edu_field, has_australian_edu = p_has_australian_edu,
            australian_edu_level = p_australian_edu_level, australian_edu_field = p_australian_edu_field,
            has_aus_specialised_edu = p_has_aus_specialised_edu,
            aus_specialised_edu_level = p_aus_specialised_edu_level,
            aus_specialised_edu_field = p_aus_specialised_edu_field, has_nz_edu = p_has_nz_edu,
            nz_edu_level = p_nz_edu_level, nz_edu_field = p_nz_edu_field,
            has_work_experience = p_has_work_experience, total_work_experience = p_total_work_experience,
            canadian_work_years = p_canadian_work_years, australian_work_years = p_australian_work_years,
            nz_work_years = p_nz_work_years, has_language_test = p_has_language_test,
            language_test_type = p_language_test_type, writing_score = p_writing_score,
            listening_score = p_listening_score, speaking_score = p_speaking_score,
            reading_score = p_reading_score, has_admission_test = p_has_admission_test,
            admission_test_type = p_admission_test_type, quant_score = p_quant_score,
            verbal_score = p_verbal_score, data_insights_score = p_data_insights_score,
            spouse_age = p_spouse_age, spouse_edu_level = p_spouse_edu_level,
            spouse_canadian_edu = p_spouse_canadian_edu, spouse_canadian_edu_level = p_spouse_canadian_edu_level,
            spouse_canadian_edu_field = p_spouse_canadian_edu_field,
            spouse_australian_edu = p_spouse_australian_edu,
            spouse_australian_edu_level = p_spouse_australian_edu_level,
            spouse_australian_edu_field = p_spouse_australian_edu_field,
            spouse_aus_specialised_edu = p_spouse_aus_specialised_edu,
            spouse_aus_specialised_edu_level = p_spouse_aus_specialised_edu_level,
            spouse_aus_specialised_edu_field = p_spouse_aus_specialised_edu_field,
            spouse_work_exp = p_spouse_work_exp, spouse_canadian_work = p_spouse_canadian_work,
            spouse_australian_work = p_spouse_australian_work, spouse_nz_work = p_spouse_nz_work,
            spouse_lang_test_type = p_spouse_lang_test_type, spouse_writing = p_spouse_writing,
            spouse_listening = p_spouse_listening, spouse_speaking = p_spouse_speaking,
            spouse_reading = p_spouse_reading, has_relatives = p_has_relatives,
            relative_relationship = p_relative_relationship, relative_related_to = p_relative_related_to,
            education_data = p_education_data, migration_data = p_migration_data,
            migration_spouse_data = p_migration_spouse_data, relatives_data = p_relatives_data,
            updated_at = CURRENT_TIMESTAMP
        WHERE application_id = v_app_id;
    END IF;
    SELECT v_app_id AS application_id;
END;
`;

(async () => {
    try {
        // 1. Add missing column first
        await new Promise((resolve, reject) => {
            db.query("ALTER TABLE student_applications ADD COLUMN IF NOT EXISTS education_data JSON AFTER relative_related_to", (err) => {
                if (err) console.log('Note: Column might already exist or error adding it:', err.message);
                resolve();
            });
        });

        // 2. Drop existing procedure if any
        await new Promise((resolve, reject) => {
            db.query("DROP PROCEDURE IF EXISTS sp_UpsertStudentApplication", (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // 3. Create new procedure
        await new Promise((resolve, reject) => {
            db.query(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('Procedure sp_UpsertStudentApplication created successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error creating procedure:', err.message);
        process.exit(1);
    }
})();
