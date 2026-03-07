require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import Sequelize models (loaded through models/index.js)
const db = require('../models');
// application route
const applicationRoutes = require('./routes/applicationRoutes');
// auth route
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/applications', applicationRoutes);
app.use('/auth', authRoutes);

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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
