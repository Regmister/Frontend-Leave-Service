import { useState, useEffect, useCallback } from 'react';
import { getAllLeaves } from '../../api/leave.js';
import { LeaveTable } from '../leave/LeaveTable.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Spinner } from '../ui/Spinner.jsx';

const STATUS_OPTIONS = ['', 'Pending', 'Approved', 'Declined', 'Cancelled'];

export function AdminLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterEmpId, setFilterEmpId] = useState('');
  const [filterMgrId, setFilterMgrId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllLeaves({
        employee_id: filterEmpId || undefined,
        manager_id: filterMgrId || undefined,
        status: filterStatus || undefined,
      });
      setLeaves(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterEmpId, filterMgrId, filterStatus]);

  useEffect(() => { load(); }, [load]);

  function clearFilters() {
    setFilterEmpId('');
    setFilterMgrId('');
    setFilterStatus('');
  }

  const hasFilters = filterEmpId || filterMgrId || filterStatus;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">All Leaves</h1>
        <p className="page-header__sub">Company-wide leave requests. Use filters to narrow results.</p>
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Filters</h2>
          {hasFilters && (
            <button className="btn btn--ghost btn--sm" onClick={clearFilters}>
              Clear all
            </button>
          )}
        </div>

        <div className="filter-bar">
          <div className="form-group">
            <label htmlFor="f-emp" className="form-label">Employee ID</label>
            <input
              id="f-emp"
              type="number"
              className="form-input"
              value={filterEmpId}
              onChange={(e) => setFilterEmpId(e.target.value)}
              placeholder="Any"
            />
          </div>

          <div className="form-group">
            <label htmlFor="f-mgr" className="form-label">Manager ID</label>
            <input
              id="f-mgr"
              type="number"
              className="form-input"
              value={filterMgrId}
              onChange={(e) => setFilterMgrId(e.target.value)}
              placeholder="Any"
            />
          </div>

          <div className="form-group">
            <label htmlFor="f-status" className="form-label">Status</label>
            <select
              id="f-status"
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s || 'All statuses'}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="divider" />

        {loading ? (
          <div className="loading-center"><Spinner size="lg" /></div>
        ) : error ? (
          <Alert type="error">{error}</Alert>
        ) : (
          <>
            <p className="text-muted text-sm mb-4">
              Showing {leaves.length} result{leaves.length !== 1 ? 's' : ''}
            </p>
            <LeaveTable leaves={leaves} showEmployee />
          </>
        )}
      </div>
    </div>
  );
}
