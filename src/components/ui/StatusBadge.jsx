const STATUS_MAP = {
  Pending: 'pending',
  Approved: 'approved',
  Declined: 'declined',
  Cancelled: 'cancelled',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};

export function StatusBadge({ value }) {
  const mod = STATUS_MAP[value] ?? 'pending';
  return (
    <span className={`badge badge--${mod}`} aria-label={`Status: ${value}`}>
      {value}
    </span>
  );
}
