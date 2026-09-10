import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../api/auth.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Spinner } from '../ui/Spinner.jsx';

export function LoginForm() {
  const { storeToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname ?? '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(employeeId, password);
      storeToken(data.jwt);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.status === 429) {
        setError('Too many login attempts. Please wait a minute and try again.');
      } else if (err.status === 400) {
        setError('Invalid employee ID or password. Please check your credentials.');
      } else {
        setError(err.message ?? 'Unable to connect. Is the API running?');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo" aria-label="Leave Service">LS</div>
        <p className="login-card__tagline">Leave Service Portal</p>

        {error && (
          <div className="mb-4">
            <Alert type="error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="employee-id" className="form-label">
              Employee ID <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              id="employee-id"
              type="number"
              className="form-input"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. 1001"
              required
              min="1"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full btn--lg mt-4"
            disabled={loading || !employeeId || !password}
          >
            {loading ? <><Spinner size="sm" />&nbsp;Signing in…</> : 'Sign in'}
          </button>
        </form>

        <p className="text-muted text-xs mt-4" style={{ textAlign: 'center' }}>
          New account? You will be prompted to change your password on first sign in.
        </p>
      </div>
    </div>
  );
}
