const express = require('express');
const cors = require('cors');
const path = require('path');
const auth = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const quizRoutes = require('./routes/quizzes');
const tutorRoutes = require('./routes/tutors');
const resourceRoutes = require('./routes/resources');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req,res)=>res.json({ok:true, service:'studysync'}));
app.use('/api/auth', authRoutes);
app.use('/api/groups', auth, groupRoutes);
app.use('/api/quizzes', auth, quizRoutes);
app.use('/api/tutors', auth, tutorRoutes);
app.use('/api/resources', auth, resourceRoutes);

module.exports = app;
