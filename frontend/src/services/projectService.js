import api from './api';

export const getProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

export const updateProject = async (projectId, projectData) => {
  const response = await api.put(`/projects/${projectId}`, projectData);
  return response.data;
};

export const addProjectMember = async (project, userId) => {
  const currentIds = project.members.map((member) => member.id);

  if (currentIds.includes(userId)) {
    throw new Error('User is already a project member');
  }

  return updateProject(project.id, {
    members: [...currentIds, userId],
  });
};

export const removeProjectMember = async (project, userId) => {
  const updatedIds = project.members
    .map((member) => member.id)
    .filter((id) => id !== userId);

  return updateProject(project.id, { members: updatedIds });
};
