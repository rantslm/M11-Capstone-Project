const db = require('../../models');

/**
 * Get all activities for a specific application.
 */
exports.getActivitiesByApplication = async (req, res) => {
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

    const activities = await db.Activity.findAll({
      where: { application_id: req.params.applicationId },
    });

    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

/**
 * Create a new activity for a specific application.
 */
exports.createActivity = async (req, res) => {
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

    const newActivity = await db.Activity.create({
      ...req.body,
      application_id: req.params.applicationId,
    });

    res.status(201).json(newActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
};

/**
 * Update an activity.
 */
exports.updateActivity = async (req, res) => {
  try {
    const activity = await db.Activity.findByPk(req.params.id, {
      include: {
        model: db.Application,
        as: 'application',
      },
    });

    if (
      !activity ||
      !activity.application ||
      activity.application.user_id !== req.user.id
    ) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    await activity.update(req.body);

    res.status(200).json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
};

/**
 * Delete an activity.
 */
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await db.Activity.findByPk(req.params.id, {
      include: {
        model: db.Application,
        as: 'application',
      },
    });

    if (
      !activity ||
      !activity.application ||
      activity.application.user_id !== req.user.id
    ) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    await activity.destroy();

    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
};
