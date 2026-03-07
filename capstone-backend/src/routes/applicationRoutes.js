const express = require('express');
const router = express.Router();

const applicationController = require('../controllers/applicationController');

// Get all applications
router.get('/', applicationController.getApplications);

// Get one application by id
router.get('/:id', applicationController.getApplicationById);

// Create a new application
router.post('/', applicationController.createApplication);

// Update an application
router.put('/:id', applicationController.updateApplication);

// Delete an application
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
