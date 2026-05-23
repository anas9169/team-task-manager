import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ProjectMembersModal from '../components/ProjectMembersModal';
import { useAuth } from '../context/AuthContext';
import { createProject, getProjects } from '../services/projectService';

const Projects = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data.projects || []);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load projects';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    setSubmitting(true);

    try {
      const response = await createProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      setProjects((prev) => [response.data.project, ...prev]);
      setFormData({ title: '', description: '' });
      setCreateModalOpen(false);
      toast.success(response.message || 'Project created successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create project';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const openMembersModal = (project) => {
    setActiveProject(project);
    setMembersModalOpen(true);
  };

  const handleProjectUpdate = (updatedProject) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    setActiveProject(updatedProject);
  };

  if (loading) {
    return <LoadingSpinner message="Loading projects..." />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-2 text-slate-600">
            View projects and manage team members on each project.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + New Project
          </button>
        )}
      </div>

      {!projects.length ? (
        <div className="mt-8">
          <EmptyState
            title="No projects yet"
            description={
              isAdmin
                ? 'Create your first project to start organizing team work.'
                : 'Projects will appear here once an admin creates them.'
            }
            action={
              isAdmin ? (
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Create Project
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">{project.title}</h2>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">
                {project.description || 'No description provided'}
              </p>

              <div className="mt-4 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-700">Created by:</span>{' '}
                  {project.createdBy?.name || 'Unknown'}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700">
                  Team members ({project.members?.length || 0})
                </p>

                {!project.members?.length ? (
                  <p className="mt-2 text-sm text-slate-500">No members assigned yet</p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {project.members.map((member) => (
                      <li
                        key={member.id}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        <span>{member.name}</span>
                        <span className="text-slate-400 capitalize">({member.role})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => openMembersModal(project)}
                  className="mt-4 w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  Manage Team
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormInput
            label="Project title"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Website redesign"
            required
          />

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this project about?"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      <ProjectMembersModal
        isOpen={membersModalOpen}
        onClose={() => {
          setMembersModalOpen(false);
          setActiveProject(null);
        }}
        project={activeProject}
        onUpdate={handleProjectUpdate}
      />
    </div>
  );
};

export default Projects;
