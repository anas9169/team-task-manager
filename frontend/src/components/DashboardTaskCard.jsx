import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { formatDate, isTaskOverdue, priorityIndicator } from '../utils/taskStyles';

const DashboardTaskCard = ({ task, highlightOverdue = true }) => {
  const overdue = highlightOverdue && isTaskOverdue(task);
  const priority = priorityIndicator[task.priority] || priorityIndicator.medium;

  return (
    <article
      className={`rounded-xl border p-4 transition ${
        overdue
          ? 'border-red-300 bg-red-50/80 shadow-sm shadow-red-100'
          : 'border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md'
      }`}
    >
      {overdue && (
        <p className="mb-3 inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
          <span aria-hidden="true">⚠</span> Overdue
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">{task.title}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {task.project?.title || 'No project'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2" title={priority.label}>
        <span className="text-xs font-medium text-slate-500">Priority</span>
        <div className="h-2 flex-1 max-w-[120px] overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${priority.bar}`}
            style={{
              width:
                task.priority === 'high'
                  ? '100%'
                  : task.priority === 'medium'
                    ? '66%'
                    : '33%',
            }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <p>
          <span className="font-medium text-slate-700">Assigned:</span>{' '}
          {task.assignedTo?.name || 'Unassigned'}
        </p>
        <p className={overdue ? 'font-medium text-red-700' : ''}>
          <span className="font-medium text-slate-700">Due:</span>{' '}
          {formatDate(task.dueDate)}
        </p>
      </div>
    </article>
  );
};

export default DashboardTaskCard;
