const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');

// GET all contacts across applications
router.get('/', authMiddleware, contactController.getAllContacts);

// Get all contacts for one application
router.get(
  '/application/:applicationId',
  authMiddleware,
  contactController.getContactsByApplication
);

// Create contact for one application
router.post(
  '/application/:applicationId',
  authMiddleware,
  contactController.createContact
);

// Update one contact
router.put('/:id', authMiddleware, contactController.updateContact);

// Delete one contact
router.delete('/:id', authMiddleware, contactController.deleteContact);

module.exports = router;
