const db = require('../../models');

/**
 * Get all contacts for the authenticated user across all applications
 */
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await db.Contact.findAll({
      include: [
        {
          model: db.Application,
          as: 'application',
          where: { user_id: req.user.id },
          attributes: ['id', 'company_name', 'position_title'],
        },
      ],
      order: [['name', 'ASC']],
    });

    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching all contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

/**
 * Get all contacts for a specific application
 */
exports.getContactsByApplication = async (req, res) => {
  try {
    const application = await db.Application.findOne({
      where: {
        id: req.params.applicationId,
        user_id: req.user.id,
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const contacts = await db.Contact.findAll({
      where: { application_id: req.params.applicationId },
    });

    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

/**
 * Create a new contact for a specific application
 */
exports.createContact = async (req, res) => {
  try {
    const application = await db.Application.findOne({
      where: {
        id: req.params.applicationId,
        user_id: req.user.id,
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const newContact = await db.Contact.create({
      ...req.body,
      application_id: req.params.applicationId,
    });

    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
};

/**
 * Update a contact
 */
exports.updateContact = async (req, res) => {
  try {
    const contact = await db.Contact.findByPk(req.params.id, {
      include: {
        model: db.Application,
        as: 'application',
      },
    });

    if (!contact || contact.application.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await contact.update(req.body);

    res.status(200).json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

/**
 * Delete a contact
 */
exports.deleteContact = async (req, res) => {
  try {
    const contact = await db.Contact.findByPk(req.params.id, {
      include: {
        model: db.Application,
        as: 'application',
      },
    });

    if (!contact || contact.application.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await contact.destroy();

    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};
