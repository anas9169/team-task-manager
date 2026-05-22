const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');

const USER_FIELDS = 'name email role';
const USER_POPULATE = { path: 'createdBy members', select: USER_FIELDS };

const formatUser = (user) => {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const formatProject = (project) => ({
  id: project._id,
  title: project.title,
  description: project.description,
  createdBy: formatUser(project.createdBy),
  members: (project.members || []).map(formatUser),
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateMemberIds = async (memberIds) => {
  if (!memberIds || memberIds.length === 0) {
    return { valid: true, members: [] };
  }

  if (!Array.isArray(memberIds)) {
    return { valid: false, message: 'Members must be an array of user IDs' };
  }

  const uniqueIds = [...new Set(memberIds.map(String))];

  for (const id of uniqueIds) {
    if (!isValidObjectId(id)) {
      return { valid: false, message: `Invalid member ID: ${id}` };
    }
  }

  const users = await User.find({ _id: { $in: uniqueIds } }).select('_id');

  if (users.length !== uniqueIds.length) {
    return { valid: false, message: 'One or more member IDs do not exist' };
  }

  return { valid: true, members: uniqueIds };
};

const createProject = async (req, res, next) => {
  try {
    const { title, description, members } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required',
      });
    }

    const memberCheck = await validateMemberIds(members);
    if (!memberCheck.valid) {
      return res.status(400).json({
        success: false,
        message: memberCheck.message,
      });
    }

    const project = await Project.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      createdBy: req.user._id,
      members: memberCheck.members,
    });

    await project.populate(USER_POPULATE);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project: formatProject(project) },
    });
  } catch (error) {
    next(error);
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate(USER_POPULATE)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: { projects: projects.map(formatProject) },
    });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID',
      });
    }

    const project = await Project.findById(id).populate(USER_POPULATE);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { project: formatProject(project) },
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, members } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID',
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Project title cannot be empty',
        });
      }
      project.title = String(title).trim();
    }

    if (description !== undefined) {
      project.description = String(description).trim();
    }

    if (members !== undefined) {
      const memberCheck = await validateMemberIds(members);
      if (!memberCheck.valid) {
        return res.status(400).json({
          success: false,
          message: memberCheck.message,
        });
      }
      project.members = memberCheck.members;
    }

    if (
      title === undefined &&
      description === undefined &&
      members === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update',
      });
    }

    await project.save();
    await project.populate(USER_POPULATE);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project: formatProject(project) },
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID',
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
