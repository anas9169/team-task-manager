import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import FormInput from './FormInput';
import Modal from './Modal';
import { getProjects } from '../services/projectService';
import { createTask } from '../services/taskService';
import { collectUsersFromProjects, getUsers } from '../services/userService';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../utils/taskStyles';

const initialForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  project: '',
  assignedTo: '',
};

const selectClass =
  'w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100';

const CreateTaskModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(initialForm);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [usersSource, setUsersSource] = useState('');

  const assigneeOptions = useMemo(() => {
    if (!formData.project) {
      return users;
    }

    const project = projects.find((item) => item.id === formData.project);
    if (!project) {
      return users;
    }

    const projectUsers = collectUsersFromProjects([project]);
    if (!projectUsers.length) {
      return users;
    }

    return projectUsers;
  }, [formData.project, projects, users]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchOptions = async () => {
      setLoadingOptions(true);

      try {
        const projectsResponse = await getProjects();
        const projectList = projectsResponse.data.projects || [];
        setProjects(projectList);

        const apiUsers = await getUsers();

        if (apiUsers) {
          setUsers(apiUsers);
          setUsersSource('team directory');
        } else {
          const fallbackUsers = collectUsersFromProjects(projectList);
          setUsers(fallbackUsers);
          setUsersSource('project members');
        }
      } catch (error) {
        const message =
          error.response?.data?.message || 'Failed to load form options';
        toast.error(message);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [isOpen]);

  const handleClose = () => {
    setFormData(initialForm);
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'project') {
        updated.assignedTo = '';
      }

      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    if (!formData.project) {
      toast.error('Please select a project');
      return;
    }

    if (!formData.assignedTo) {
      toast.error('Please select an assigned user');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        project: formData.project,
        assignedTo: formData.assignedTo,
      };

      if (formData.dueDate) {
        payload.dueDate = formData.dueDate;
      }

      const response = await createTask(payload);
      toast.success(response.message || 'Task created successfully');
      setFormData(initialForm);
      onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Task"
      size="lg"
    >
      {loadingOptions ? (
        <div className="py-10 text-center text-sm text-slate-600">
          Loading projects and users...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Title"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Design homepage layout"
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
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Add task details..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={selectClass}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="priority"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={selectClass}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FormInput
            label="Due date"
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
          />

          <div>
            <label htmlFor="project" className="mb-1.5 block text-sm font-medium text-slate-700">
              Project
            </label>
            <select
              id="project"
              name="project"
              value={formData.project}
              onChange={handleChange}
              required
              className={selectClass}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            {!projects.length && (
              <p className="mt-1.5 text-sm text-amber-700">
                No projects found. Create a project first.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="assignedTo"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Assigned user
            </label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              required
              disabled={!formData.project || !assigneeOptions.length}
              className={selectClass}
            >
              <option value="">
                {!formData.project
                  ? 'Select a project first'
                  : assigneeOptions.length
                    ? 'Select a user'
                    : 'No users available'}
              </option>
              {assigneeOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
            {usersSource && (
              <p className="mt-1.5 text-xs text-slate-500">
                Users loaded from {usersSource}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !projects.length}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CreateTaskModal;
