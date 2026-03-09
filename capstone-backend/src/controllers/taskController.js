const db = require('../../models');

/**
 * Get all tasks for a specific application.
 */
exports.getTasksByApplication = async (req, res) => {
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

    const tasks = await db.Task.findAll({
      where: { application_id: req.params.applicationId },
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

/**
 * Create a new task for a specific application.
 */
exports.createTask = async (req, res) => {
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

    const newTask = await db.Task.create({
      ...req.body,
      application_id: req.params.applicationId,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

/**
 * Update a task.
 */
exports.updateTask = async (req, res) => {
  try {
    const task = await db.Task.findByPk(req.params.id, {
      include: {
        model: db.Application,
        as: 'application',
      },
    });

    if (!task || !task.application || task.application.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.update(req.body);

    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

/**
 * Delete a task.
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await db.Task.findByPk(req.params.id, {
      include: {
        model: db.Application,
        as: 'application',
      },
    });

    if (!task || !task.application || task.application.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.destroy();

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
