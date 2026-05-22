const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const USER_FIELDS = 'name email role';
const PROJECT_FIELDS = 'title description';
const TASK_POPULATE = [
  { path: 'assignedTo', select: USER_FIELDS },
  { path: 'createdBy', select: USER_FIELDS },
  { path: 'project', select: PROJECT_FIELDS },
];

const STATUSES = ['todo', 'in-progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];

const formatUser = (user) => {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const formatProject = (project) => {
  if (!project) return null;
  return {
    id: project._id,
    title: project.title,
    description: project.description,
  };
};

const formatTask = (task) => ({
  id: task._id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate,
  project: formatProject(task.project),
  assignedTo: formatUser(task.assignedTo),
  createdBy: formatUser(task.createdBy),
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isAssignedToUser = (task, userId) =>
  task.assignedTo && task.assignedTo.toString() === userId.toString();

const parseDueDate = (dueDate) => {
  if (dueDate === undefined || dueDate === null || dueDate === '') {
    return { valid: true, value: undefined };
  }

  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    return { valid: false, message: 'Invalid due date' };
  }

  return { valid: true, value: parsed };
};

const validateStatus = (status) => {
  if (status === undefined) return { valid: true };
  if (!STATUSES.includes(status)) {
    return {
      valid: false,
      message: `Status must be one of: ${STATUSES.join(', ')}`,
    };
  }
  return { valid: true };
};

const validatePriority = (priority) => {
  if (priority === undefined) return { valid: true };
  if (!PRIORITIES.includes(priority)) {
    return {
      valid: false,
      message: `Priority must be one of: ${PRIORITIES.join(', ')}`,
    };
  }
  return { valid: true };
};

const validateProjectId = async (projectId) => {
  if (!projectId) {
    return { valid: false, message: 'Project ID is required' };
  }
  if (!isValidObjectId(projectId)) {
    return { valid: false, message: 'Invalid project ID' };
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return { valid: false, message: 'Project not found' };
  }

  return { valid: true, project };
};

const validateUserId = async (userId, fieldName) => {
  if (!userId) {
    return { valid: false, message: `${fieldName} is required` };
  }
  if (!isValidObjectId(userId)) {
    return { valid: false, message: `Invalid ${fieldName}` };
  }

  const user = await User.findById(userId);
  if (!user) {
    return { valid: false, message: `${fieldName} user not found` };
  }

  return { valid: true, user };
};

const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignedTo,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const projectCheck = await validateProjectId(project);
    if (!projectCheck.valid) {
      return res.status(400).json({
        success: false,
        message: projectCheck.message,
      });
    }

    const assigneeCheck = await validateUserId(assignedTo, 'Assigned user');
    if (!assigneeCheck.valid) {
      return res.status(400).json({
        success: false,
        message: assigneeCheck.message,
      });
    }

    const statusCheck = validateStatus(status);
    if (!statusCheck.valid) {
      return res.status(400).json({
        success: false,
        message: statusCheck.message,
      });
    }

    const priorityCheck = validatePriority(priority);
    if (!priorityCheck.valid) {
      return res.status(400).json({
        success: false,
        message: priorityCheck.message,
      });
    }

    const dueDateCheck = parseDueDate(dueDate);
    if (!dueDateCheck.valid) {
      return res.status(400).json({
        success: false,
        message: dueDateCheck.message,
      });
    }

    const task = await Task.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDateCheck.value,
      project,
      assignedTo,
      createdBy: req.user._id,
    });

    await task.populate(TASK_POPULATE);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: formatTask(task) },
    });
  } catch (error) {
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate(TASK_POPULATE)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: { tasks: tasks.map(formatTask) },
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }

    const task = await Task.findById(id).populate(TASK_POPULATE);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { task: formatTask(task) },
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignedTo,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isAssignee = isAssignedToUser(task, req.user._id);

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'You can only update tasks assigned to you',
      });
    }

    if (
      title === undefined &&
      description === undefined &&
      status === undefined &&
      priority === undefined &&
      dueDate === undefined &&
      project === undefined &&
      assignedTo === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update',
      });
    }

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Task title cannot be empty',
        });
      }
      task.title = String(title).trim();
    }

    if (description !== undefined) {
      task.description = String(description).trim();
    }

    if (status !== undefined) {
      const statusCheck = validateStatus(status);
      if (!statusCheck.valid) {
        return res.status(400).json({
          success: false,
          message: statusCheck.message,
        });
      }
      task.status = status;
    }

    if (priority !== undefined) {
      const priorityCheck = validatePriority(priority);
      if (!priorityCheck.valid) {
        return res.status(400).json({
          success: false,
          message: priorityCheck.message,
        });
      }
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      const dueDateCheck = parseDueDate(dueDate);
      if (!dueDateCheck.valid) {
        return res.status(400).json({
          success: false,
          message: dueDateCheck.message,
        });
      }
      task.dueDate = dueDateCheck.value;
    }

    if (project !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only admins can change the project',
        });
      }
      const projectCheck = await validateProjectId(project);
      if (!projectCheck.valid) {
        return res.status(400).json({
          success: false,
          message: projectCheck.message,
        });
      }
      task.project = project;
    }

    if (assignedTo !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only admins can reassign tasks',
        });
      }
      const assigneeCheck = await validateUserId(assignedTo, 'Assigned user');
      if (!assigneeCheck.valid) {
        return res.status(400).json({
          success: false,
          message: assigneeCheck.message,
        });
      }
      task.assignedTo = assignedTo;
    }

    await task.save();
    await task.populate(TASK_POPULATE);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task: formatTask(task) },
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
