import { formatLabel, statusStyles } from '../utils/taskStyles';

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        statusStyles[status] || statusStyles.todo
      }`}
    >
      {formatLabel(status)}
    </span>
  );
};

export default StatusBadge;
