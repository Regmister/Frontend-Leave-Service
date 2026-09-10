import { StatusBadge } from '../ui/StatusBadge.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';

export function LeaveTable({ leaves = [], actions, showEmployee = false }) {
  if (leaves.length === 0) {
    return <EmptyState message="No leave requests found." />;
  }

  return (
    <div className="table-wrapper" role="region" aria-label="Leave requests">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            {showEmployee && <th scope="col">Employee</th>}
            <th scope="col">Start</th>
            <th scope="col">End</th>
            <th scope="col">Status</th>
            <th scope="col">Reviewed by</th>
            {actions && <th scope="col"><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <LeaveRow
              key={leave.id}
              leave={leave}
              actions={actions}
              showEmployee={showEmployee}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeaveRow({ leave, actions, showEmployee }) {
  return (
    <tr>
      <td className="font-mono text-sm">{leave.id}</td>
      {showEmployee && <td className="font-mono text-sm">{leave.employeed}</td>}
      <td>{leave.startDate}</td>
      <td>{leave.endDate}</td>
      <td><StatusBadge value={leave.status} /></td>
      <td className="text-muted text-sm">{leave.reviewedBy ?? '—'}</td>
      {actions && (
        <td>
          <div className="flex gap-2">
            {actions(leave)}
          </div>
        </td>
      )}
    </tr>
  );
}
