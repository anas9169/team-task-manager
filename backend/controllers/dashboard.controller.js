const Project = require('../models/Project');
const Task = require('../models/Task');

const USER_FIELDS = 'name email role';
const PROJECT_FIELDS = 'title description';
const RECENT_TASK_LIMIT = 5;

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

const formatRecentTask = (task) => ({
  id: task._id,
  title: task.title,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate,
  project: formatProject(task.project),
  assignedTo: formatUser(task.assignedTo),
  createdAt: task.createdAt,
});

const buildTasksByStatus = (statusCounts) => {
  const result = {
    todo: 0,
    'in-progress': 0,
    completed: 0,
  };

  statusCounts.forEach((item) => {
    if (Object.prototype.hasOwnProperty.call(result, item._id)) {
      result[item._id] = item.count;
    }
  });

  return result;
};

const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    const overdueFilter = {
      dueDate: { $exists: true, $ne: null, $lt: now },
      status: { $ne: 'completed' },
    };

    const taskPopulate = [
      { path: 'project', select: PROJECT_FIELDS },
      { path: 'assignedTo', select: USER_FIELDS },
    ];

    const [
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      statusCounts,
      recentTasks,
      overdueTasksList,
    ] = await Promise.all([
      Project.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: { $ne: 'completed' } }),
      Task.countDocuments(overdueFilter),
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.find().populate(taskPopulate).sort({ createdAt: -1 }).limit(RECENT_TASK_LIMIT),
      Task.find(overdueFilter)
        .populate(taskPopulate)
        .sort({ dueDate: 1 })
        .limit(RECENT_TASK_LIMIT),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        tasksByStatus: buildTasksByStatus(statusCounts),
        recentTasks: recentTasks.map(formatRecentTask),
        overdueTasksList: overdueTasksList.map(formatRecentTask),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
