const db = require('../../models');

/**
 * Get all applications
 * Returns all application records with their related contacts,
 * activities, and tasks.
 */
exports.getApplications = async (req, res) => {
  try {
    const apps = await db.Application.findAll({
      where: { user_id: req.user.id },
      include: ['contacts', 'activities', 'tasks'],
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

/**
 * Get one application by id
 */
exports.getApplicationById = async (req, res) => {
  try {
    const application = await db.Application.findByPk(req.params.id, {
      include: ['contacts', 'activities', 'tasks'],
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

/**
 * Create a new application
 */
exports.createApplication = async (req, res) => {
  try {
    const newApplication = await db.Application.create({
      ...req.body,
      user_id: req.user.id,
    });
    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
};

/**
 * Update an existing application
 */
exports.updateApplication = async (req, res) => {
  try {
    const application = await db.Application.findByPk(req.params.id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await application.update(req.body);

    res.status(200).json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};

/**
 * Delete an application
 */
exports.deleteApplication = async (req, res) => {
  try {
    const application = await db.Application.findByPk(req.params.id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await application.destroy();

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
};
