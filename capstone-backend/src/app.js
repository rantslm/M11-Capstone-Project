require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('../models');

const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const activityRoutes = require('./routes/activityRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/applications', applicationRoutes);
app.use('/contacts', contactRoutes);
app.use('/activities', activityRoutes);
app.use('/tasks', taskRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Capstone API running' });
});

/**
 * Temporary test route
 * This confirms:
 * - Sequelize is connected
 * - Models are loaded
 * - Associations work
 */
app.get('/test', async (req, res) => {
  try {
    const apps = await db.Application.findAll({
      include: ['contacts', 'activities', 'tasks'],
    });

    res.json(apps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = app;
