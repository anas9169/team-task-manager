import { formatLabel, priorityStyles } from '../utils/taskStyles';

const PriorityBadge = ({ priority }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        priorityStyles[priority] || priorityStyles.medium
      }`}
    >
      {formatLabel(priority)}
    </span>
  );
};

export default PriorityBadge;
