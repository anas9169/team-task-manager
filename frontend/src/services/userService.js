import api from './api';

export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data.data.users || [];
  } catch {
    return null;
  }
};

export const collectUsersFromProjects = (projects = []) => {
  const usersMap = new Map();

  projects.forEach((project) => {
    if (project.createdBy) {
      usersMap.set(project.createdBy.id, project.createdBy);
    }
    project.members?.forEach((member) => {
      usersMap.set(member.id, member);
    });
  });

  return Array.from(usersMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};
