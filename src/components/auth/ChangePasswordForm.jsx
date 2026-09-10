import { useState } from 'react';
import { changePassword } from '../../api/auth.js';
import { Alert } from '../ui/Alert.jsx';
import { Spinner } from '../ui/Spinner.jsx';

export function ChangePasswordForm({ onSuccess, forced = false }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const mismatch = confirm && newPassword !== confirm;

  async function handleSubmit(e) {
    e.preventDefault();
    if (mismatch) return;
    setError(null);
    setLoading(true);

    try {
      await changePassword(newPassword);
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message ?? 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Alert type="success">
        Password changed successfully. You can now access all features.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {forced && (
        <div className="mb-4">
          <Alert type="warning">
            You must set a new password before continuing.
          </Alert>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Alert type="error" onDismiss={() => setError(null)}>{error}</Alert>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="new-password" className="form-label">
          New password <span className="required" aria-hidden="true">*</span>
        </label>
        <input
          id="new-password"
          type="password"
          className="form-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirm-password" className="form-label">
          Confirm new password <span className="required" aria-hidden="true">*</span>
        </label>
        <input
          id="confirm-password"
          type="password"
          className="form-input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          aria-describedby={mismatch ? 'pw-mismatch' : undefined}
          style={mismatch ? { borderColor: '#b91c1c' } : {}}
        />
        {mismatch && (
          <span id="pw-mismatch" className="form-error" role="alert">
            Passwords do not match.
          </span>
        )}
      </div>

      <button
        type="submit"
        className="btn btn--primary btn--full mt-4"
        disabled={loading || !newPassword || !confirm || mismatch}
      >
        {loading ? <><Spinner size="sm" />&nbsp;Saving…</> : 'Change password'}
      </button>
    </form>
  );
}
