import { ChangePasswordForm } from '../auth/ChangePasswordForm.jsx';
import { useNavigate } from 'react-router-dom';

export function ChangePasswordPage({ forced = false }) {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 440, margin: '0 auto', paddingTop: '2rem' }}>
      <div className="page-header">
        <h1 className="page-header__title">
          {forced ? 'Set your password' : 'Change password'}
        </h1>
        <p className="page-header__sub">
          {forced
            ? 'Your account was created with a default password. Set a new one to continue.'
            : 'Update your account password.'}
        </p>
      </div>

      <div className="card">
        <ChangePasswordForm
          forced={forced}
          onSuccess={() => {
            if (forced) navigate('/', { replace: true });
          }}
        />
      </div>
    </div>
  );
}
