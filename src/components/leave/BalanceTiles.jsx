export function BalanceTiles({ daysUsed, remainingBalance }) {
  return (
    <div className="stats-grid" role="region" aria-label="Leave balance summary">
      <div className="stat-tile">
        <div className="stat-tile__label">Days used</div>
        <div className="stat-tile__value" aria-live="polite">{daysUsed ?? '—'}</div>
      </div>
      <div className="stat-tile">
        <div className="stat-tile__label">Remaining balance</div>
        <div className="stat-tile__value" aria-live="polite">
          {remainingBalance != null ? Number(remainingBalance).toFixed(1) : '—'}
        </div>
      </div>
    </div>
  );
}
