import { STATUS_OPTIONS, statusStyles } from '../utils/taskStyles';

const TaskStatusSelect = ({ value, onChange, disabled = false, updating = false }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled || updating}
      className={`min-w-[9.5rem] rounded-lg border px-2.5 py-1.5 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 ${
        statusStyles[value] || 'border-slate-300 bg-white text-slate-700'
      }`}
      aria-label="Update task status"
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {updating ? 'Updating...' : option.label}
        </option>
      ))}
    </select>
  );
};

export default TaskStatusSelect;
