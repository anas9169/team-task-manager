import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardTaskCard from '../components/DashboardTaskCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/dashboardService';
import { formatLabel, statusStyles } from '../utils/taskStyles';

const STATUS_SUMMARY = [
  { key: 'todo', label: 'Todo', icon: '📋', accent: 'border-slate-200 bg-slate-50' },
  {
    key: 'in-progress',
    label: 'In Progress',
    icon: '⚡',
    accent: 'border-amber-200 bg-amber-50',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: '✓',
    accent: 'border-emerald-200 bg-emerald-50',
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (showRefreshToast = false) => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);

      if (showRefreshToast) {
        toast.success('Dashboard updated');
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to load dashboard stats';
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchStats();
      setLoading(false);
    };

    load();
  }, [fetchStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats(true);
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const tasksByStatus = stats?.tasksByStatus || {
    todo: 0,
    'in-progress': 0,
    completed: 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-2 max-w-xl text-slate-600">
            Track projects, tasks, and deadlines across your team in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-indigo-100">Total Projects</p>
          <p className="mt-2 text-4xl font-bold">{stats?.totalProjects ?? 0}</p>
          <p className="mt-2 text-sm text-indigo-100">Active team workspaces</p>
          <Link
            to="/projects"
            className="mt-4 inline-block text-sm font-semibold text-white underline-offset-2 hover:underline"
          >
            View projects →
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-violet-100">Total Tasks</p>
          <p className="mt-2 text-4xl font-bold">{stats?.totalTasks ?? 0}</p>
          <p className="mt-2 text-sm text-violet-100">
            {stats?.pendingTasks ?? 0} pending · {stats?.completedTasks ?? 0} completed
          </p>
          <Link
            to="/tasks"
            className="mt-4 inline-block text-sm font-semibold text-white underline-offset-2 hover:underline"
          >
            View tasks →
          </Link>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Tasks by status</h2>
        <p className="mt-1 text-sm text-slate-600">Summary of all task statuses</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {STATUS_SUMMARY.map((item) => (
            <div
              key={item.key}
              className={`rounded-xl border p-5 ${item.accent}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl" aria-hidden="true">
                  {item.icon}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    statusStyles[item.key]
                  }`}
                >
                  {formatLabel(item.key)}
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {tasksByStatus[item.key] ?? 0}
              </p>
              <p className="mt-1 text-sm text-slate-600">{item.label} tasks</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">Completed</p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">
            {stats?.completedTasks ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">
            {stats?.pendingTasks ?? 0}
          </p>
        </div>
        <div
          className={`rounded-xl border p-4 ${
            (stats?.overdueTasks ?? 0) > 0
              ? 'border-red-300 bg-red-50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <p
            className={`text-sm ${
              (stats?.overdueTasks ?? 0) > 0 ? 'text-red-800' : 'text-slate-600'
            }`}
          >
            Overdue
          </p>
          <p
            className={`mt-1 text-2xl font-bold ${
              (stats?.overdueTasks ?? 0) > 0 ? 'text-red-900' : 'text-slate-900'
            }`}
          >
            {stats?.overdueTasks ?? 0}
          </p>
        </div>
      </div>

      {(stats?.overdueTasksList?.length ?? 0) > 0 && (
        <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-red-900">Overdue tasks</h2>
              <p className="mt-1 text-sm text-red-800">
                These tasks are past their due date and not completed
              </p>
            </div>
            <span className="rounded-full bg-red-200 px-3 py-1 text-sm font-bold text-red-900">
              {stats.overdueTasks}
            </span>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {stats.overdueTasksList.map((task) => (
              <DashboardTaskCard key={task.id} task={task} highlightOverdue />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent tasks</h2>
            <p className="mt-1 text-sm text-slate-600">
              Latest activity with status and priority indicators
            </p>
          </div>
          <Link
            to="/tasks"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            See all tasks
          </Link>
        </div>

        {!stats?.recentTasks?.length ? (
          <div className="mt-6">
            <EmptyState
              title="No recent tasks"
              description="Tasks you create will appear here on the dashboard."
              action={
                <Link
                  to="/tasks"
                  className="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Go to Tasks
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {stats.recentTasks.map((task) => (
              <DashboardTaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
