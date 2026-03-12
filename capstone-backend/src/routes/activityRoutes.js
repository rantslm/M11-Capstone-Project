const express = require('express');
const router = express.Router();

const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all activities for authenticated user across all applications
router.get('/', authMiddleware, activityController.getAllActivities);

// Get activities for one application
router.get(
  '/application/:applicationId',
  authMiddleware,
  activityController.getActivitiesByApplication
);

// Create activity for one application
router.post(
  '/application/:applicationId',
  authMiddleware,
  activityController.createActivity
);

// Update one activity
router.put('/:id', authMiddleware, activityController.updateActivity);

// Delete one activity
router.delete('/:id', authMiddleware, activityController.deleteActivity);

module.exports = router;
