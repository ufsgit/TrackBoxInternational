require('dotenv').config();

const studentId = 7;
const data = {
    application: {
        passport_name: 'Test',
        migration_data: {},
        migration_spouse_data: {},
        relatives_data: {},
        education_data: {}
    },
    children: [],
    suggestedPrograms: [
        { program: 'Poland', details: 'Master', status: 'Application Status', sub_status: '', remarks: '', is_selected: true }
    ]
};

const service = require('./src/modules/student/student.service');

service.saveStudentApplication(studentId, data)
    .then(res => {
        console.log('SUCCESS:', res);
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE:', err);
        process.exit(1);
    });
