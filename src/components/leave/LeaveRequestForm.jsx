import { useState } from 'react';
import { submitLeave } from '../../api/leave.js';
import { Alert } from '../ui/Alert.jsx';
import { Spinner } from '../ui/Spinner.jsx';

export function LeaveRequestForm({ employeeId, onSuccess }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const endBeforeStart = endDate && startDate && endDate < startDate;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await submitLeave(employeeId, startDate, endDate);
      onSuccess?.(result);
      setStartDate('');
      setEndDate('');
    } catch (err) {
      setError(err.message ?? 'Failed to submit leave request.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="mb-4">
          <Alert type="error" onDismiss={() => setError(null)}>{error}</Alert>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="start-date" className="form-label">
            Start date <span className="required" aria-hidden="true">*</span>
          </label>
          <input
            id="start-date"
            type="date"
            className="form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={today}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="end-date" className="form-label">
            End date <span className="required" aria-hidden="true">*</span>
          </label>
          <input
            id="end-date"
            type="date"
            className="form-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || today}
            required
            aria-describedby={endBeforeStart ? 'date-error' : undefined}
            style={endBeforeStart ? { borderColor: '#b91c1c' } : {}}
          />
          {endBeforeStart && (
            <span id="date-error" className="form-error" role="alert">
              End date must be on or after the start date.
            </span>
          )}
        </div>
      </div>

      <p className="form-hint mb-4">
        Only working days (Mon–Fri) count against your balance. Weekends are excluded.
      </p>

      <button
        type="submit"
        className="btn btn--primary"
        disabled={loading || !startDate || !endDate || !!endBeforeStart}
      >
        {loading ? <><Spinner size="sm" />&nbsp;Submitting…</> : 'Submit request'}
      </button>
    </form>
  );
}
