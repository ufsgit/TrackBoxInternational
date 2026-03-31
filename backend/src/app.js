const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/error.middleware');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const studentRoutes = require('./modules/student/student.routes');
const followupRoutes = require('./modules/followup/followup.routes');
const masterRoutes = require('./modules/master/master.routes'); // Handling all master data routes inside this
const reportRoutes = require('./modules/report/report.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(express.json());

// Request logging
app.use(morgan('dev'));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Master routes are a bit mixed in hierarchy in index.js (e.g. /api/branches, /api/lookups)
// I will mount them at /api and let the router handle the specific paths
app.use('/api', masterRoutes);

// Root Health Check
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'OTRACKBOX BACKEND V3 (MODULAR) RUNNING' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
