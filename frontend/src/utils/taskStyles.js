export const STATUS_OPTIONS = [
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const statusStyles = {
  todo: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  'in-progress': 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  completed: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
};

export const priorityStyles = {
  low: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',
  medium: 'bg-orange-100 text-orange-800 ring-1 ring-orange-200',
  high: 'bg-red-100 text-red-800 ring-1 ring-red-200',
};

export const formatLabel = (value) =>
  value
    ? value
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';

export const formatDate = (dateString) => {
  if (!dateString) return 'No due date';

  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const isTaskOverdue = (task) => {
  if (!task?.dueDate || task.status === 'completed') {
    return false;
  }

  const due = new Date(task.dueDate);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
};

export const priorityIndicator = {
  low: { bar: 'bg-sky-500', label: 'Low priority' },
  medium: { bar: 'bg-orange-500', label: 'Medium priority' },
  high: { bar: 'bg-red-500', label: 'High priority' },
};
