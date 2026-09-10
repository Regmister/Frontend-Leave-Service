export function EmptyState({ icon = '', message = 'Nothing to show here.' }) {
  return (
    <div className="empty" role="status">
      <div className="empty__icon" aria-hidden="true">{icon}</div>
      <p className="empty__text">{message}</p>
    </div>
  );
}
