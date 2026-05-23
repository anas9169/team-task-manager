import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import {
  addProjectMember,
  removeProjectMember,
} from '../services/projectService';
import { getUsers } from '../services/userService';

const ProjectMembersModal = ({ isOpen, onClose, project, onUpdate }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchUsers = async () => {
      setLoadingUsers(true);
      const apiUsers = await getUsers();
      setUsers(apiUsers || []);
      setLoadingUsers(false);
    };

    fetchUsers();
    setSelectedUserId('');
  }, [isOpen]);

  const availableUsers = useMemo(() => {
    const memberIds = new Set(project?.members?.map((member) => member.id) || []);
    return users.filter((user) => !memberIds.has(user.id));
  }, [project, users]);

  const handleAddMember = async (event) => {
    event.preventDefault();

    if (!selectedUserId) {
      toast.error('Please select a user to add');
      return;
    }

    setUpdating(true);

    try {
      const response = await addProjectMember(project, selectedUserId);
      toast.success('Member added to project');
      onUpdate(response.data.project);
      setSelectedUserId('');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to add member';
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (project.createdBy?.id === userId) {
      toast.error('Cannot remove the project creator');
      return;
    }

    setUpdating(true);

    try {
      const response = await removeProjectMember(project, userId);
      toast.success('Member removed from project');
      onUpdate(response.data.project);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to remove member';
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  if (!project) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Team — ${project.title}`}
      size="lg"
    >
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-slate-900">Current members</h3>
          <p className="mt-1 text-sm text-slate-600">
            {project.members?.length || 0} member
            {(project.members?.length || 0) === 1 ? '' : 's'} on this project
          </p>

          {!project.members?.length ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No members yet. Add team members below.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {project.members.map((member) => (
                <li
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{member.name}</p>
                    <p className="text-sm text-slate-600">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium capitalize text-indigo-800">
                      {member.role}
                    </span>
                    {project.createdBy?.id === member.id ? (
                      <span className="text-xs text-slate-500">Creator</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={updating}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-900">Add member</h3>
          <p className="mt-1 text-sm text-slate-600">
            Select a user from your team to add to this project.
          </p>

          {loadingUsers ? (
            <p className="mt-4 text-sm text-slate-500">Loading users...</p>
          ) : (
            <form onSubmit={handleAddMember} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                disabled={updating || !availableUsers.length}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
              >
                <option value="">
                  {availableUsers.length
                    ? 'Select a user'
                    : 'All users are already members'}
                </option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={updating || !availableUsers.length}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? 'Saving...' : 'Add Member'}
              </button>
            </form>
          )}
        </section>
      </div>
    </Modal>
  );
};

export default ProjectMembersModal;
