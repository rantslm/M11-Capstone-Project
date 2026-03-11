const db = require('../../models');

/**
 * Get all applications
 * Returns only non-archived application records with their related contacts,
 * activities, and tasks.
 */
exports.getApplications = async (req, res) => {
  try {
    const applications = await db.Application.findAll({
      where: {
        user_id: req.user.id,
        is_archived: false,
      },
      include: ['contacts', 'activities', 'tasks'],
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};
/**
 * Get all archived applications for the authenticated user.
 */
exports.getArchivedApplications = async (req, res) => {
  try {
    const applications = await db.Application.findAll({
      where: {
        user_id: req.user.id,
        is_archived: true,
      },
      order: [['archived_at', 'DESC']],
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching archived applications:', error);
    res.status(500).json({ error: 'Failed to fetch archived applications' });
  }
};
/**
 * Get one application by id
 */
exports.getApplicationById = async (req, res) => {
  try {
    const application = await db.Application.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
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
      is_archived: false,
      archived_at: null,
      archive_reason: null,
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
    const application = await db.Application.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

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
 * Archive an application with a reason and archive timestamp.
 */
exports.archiveApplication = async (req, res) => {
  try {
    const application = await db.Application.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (!req.body.archive_reason) {
      return res.status(400).json({ error: 'Archive reason is required' });
    }

    await application.update({
      is_archived: true,
      archived_at: new Date(),
      archive_reason: req.body.archive_reason,
    });

    res.status(200).json(application);
  } catch (error) {
    console.error('Error archiving application:', error);
    res.status(500).json({ error: 'Failed to archive application' });
  }
};
/**
 * Restore an archived application back to the active applications list.
 */
exports.restoreApplication = async (req, res) => {
  try {
    const application = await db.Application.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await application.update({
      is_archived: false,
      archived_at: null,
      archive_reason: null,
    });

    res.status(200).json(application);
  } catch (error) {
    console.error('Error restoring application:', error);
    res.status(500).json({ error: 'Failed to restore application' });
  }
};
/**
 * Permanently delete an application
 */
exports.deleteApplication = async (req, res) => {
  try {
    const application = await db.Application.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

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
