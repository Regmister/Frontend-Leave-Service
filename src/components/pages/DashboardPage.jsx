import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getTotalDays } from '../../api/leave.js';
import { BalanceTiles } from '../leave/BalanceTiles.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { Alert } from '../ui/Alert.jsx';

export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role;
  const employeeId = user?.sub;

  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    getTotalDays(employeeId)
      .then(setBalance)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [employeeId]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">
          Welcome back
        </h1>
        <p className="page-header__sub">
          Employee #{employeeId} <span style={{ fontWeight: 500 }}>{role}</span>
        </p>
      </div>

      {loading && <div className="loading-center"><Spinner /></div>}
      {error && <Alert type="error">{error}</Alert>}
      {balance && (
        <BalanceTiles
          daysUsed={balance.daysUsed}
          remainingBalance={balance.remainingBalance}
        />
      )}

      <div className="stats-grid">
        <QuickLink to="/my-leave" label="My Leave" desc="View and submit your leave requests." />

        {(role === 'MANAGER' || role === 'ADMIN') && (
          <QuickLink to="/team" label="Team" desc="Review and action team leave requests." />
        )}

        {role === 'ADMIN' && (
          <>
            <QuickLink to="/admin/leaves" label="All Leaves" desc="Company-wide leave overview." />
            <QuickLink to="/admin/users" label="Users" desc="Create and manage employees." />
          </>
        )}

        <QuickLink to="/change-password" label="Change Password" desc="Update your account password." />
      </div>
    </div>
  );
}

function QuickLink({ to, label, desc }) {
  return (
    <Link
      to={to}
      className="stat-tile"
      style={{ textDecoration: 'none', cursor: 'pointer', transition: 'box-shadow 150ms ease' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
    >
      <div className="stat-tile__label">{label}</div>
      <p className="text-sm" style={{ marginTop: '4px', color: 'var(--color-muted)' }}>{desc}</p>
    </Link>
  );
}
