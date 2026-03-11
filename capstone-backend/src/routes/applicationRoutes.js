const express = require('express');
const router = express.Router();

const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all applications
router.get('/', authMiddleware, applicationController.getApplications);

// Get archived applications
router.get('/archive', authMiddleware, applicationController.getArchivedApplications);

// Get one application by id
router.get('/:id', authMiddleware, applicationController.getApplicationById);

// Create a new application
router.post('/', authMiddleware, applicationController.createApplication);

// Archive an application
router.put('/:id/archive', authMiddleware, applicationController.archiveApplication);

// Restore an archived application
router.put('/:id/restore', authMiddleware, applicationController.restoreApplication);

// Update an application
router.put('/:id', authMiddleware, applicationController.updateApplication);

// Delete an application permanently
router.delete('/:id', authMiddleware, applicationController.deleteApplication);

module.exports = router;
