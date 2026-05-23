import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CreateTaskModal from '../components/CreateTaskModal';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import TaskStatusSelect from '../components/TaskStatusSelect';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateTask } from '../services/taskService';
import { formatDate } from '../utils/taskStyles';

const Tasks = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const canUpdateTask = (task) => {
    if (isAdmin) return true;
    return task.assignedTo?.id === user?.id;
  };

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data.tasks || []);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load tasks';
      toast.error(message);
    }
  };

  useEffect(() => {
    const loadTasks = async () => {
      await fetchTasks();
      setLoading(false);
    };

    loadTasks();
  }, []);

  const handleTaskCreated = async () => {
    await fetchTasks();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === newStatus) {
      return;
    }

    const previousStatus = task.status;

    setUpdatingTaskId(taskId);
    setTasks((prev) =>
      prev.map((item) => (item.id === taskId ? { ...item, status: newStatus } : item))
    );

    try {
      const response = await updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((item) => (item.id === taskId ? response.data.task : item))
      );
      toast.success('Task status updated');
    } catch (error) {
      setTasks((prev) =>
        prev.map((item) =>
          item.id === taskId ? { ...item, status: previousStatus } : item
        )
      );
      const message =
        error.response?.data?.message || 'Failed to update task status';
      toast.error(message);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const renderStatusControl = (task) => {
    if (canUpdateTask(task)) {
      return (
        <TaskStatusSelect
          value={task.status}
          updating={updatingTaskId === task.id}
          onChange={(event) => handleStatusChange(task.id, event.target.value)}
        />
      );
    }

    return <StatusBadge status={task.status} />;
  };

  if (loading) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="mt-2 text-slate-600">
            Create and manage tasks. Update status from the list below.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + New Task
          </button>
        )}
      </div>

      {!tasks.length ? (
        <div className="mt-8">
          <EmptyState
            title="No tasks yet"
            description={
              isAdmin
                ? 'Create a task and assign it to a team member.'
                : 'Tasks will appear here once they are created.'
            }
            action={
              isAdmin ? (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Create Task
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {['Title', 'Status', 'Priority', 'Assigned To', 'Project', 'Due Date'].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">
                      {task.title}
                    </td>
                    <td className="px-4 py-4">{renderStatusControl(task)}</td>
                    <td className="px-4 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {task.assignedTo?.name || '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {task.project?.title || '—'}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {formatDate(task.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {tasks.map((task) => (
              <article key={task.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="font-semibold text-slate-900">{task.title}</h2>
                  <PriorityBadge priority={task.priority} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Status:</span>
                  {renderStatusControl(task)}
                </div>

                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-700">Assigned:</span>{' '}
                    {task.assignedTo?.name}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">Project:</span>{' '}
                    {task.project?.title}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">Due:</span>{' '}
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <CreateTaskModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default Tasks;
