import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function NavItem({ to, children }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `nav__link${isActive ? ' nav__link--active' : ''}`
        }
      >
        {children}
      </NavLink>
    </li>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const role = user?.role;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="nav" aria-label="Main navigation">
      <NavLink to="/" className="nav__brand" aria-label="Leave Service home">
        Leave Service
      </NavLink>

      <button
        className="nav__toggle"
        aria-expanded={open}
        aria-controls="nav-links"
        aria-label="Toggle navigation"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? '✕' : '☰'}
      </button>

      <ul
        id="nav-links"
        className={`nav__links${open ? ' nav__links--open' : ''}`}
      >
        {role && (
          <NavItem to="/my-leave">My Leave</NavItem>
        )}

        {(role === 'MANAGER' || role === 'ADMIN') && (
          <NavItem to="/team">Team</NavItem>
        )}

        {role === 'ADMIN' && (
          <>
            <NavItem to="/admin/leaves">All Leaves</NavItem>
            <NavItem to="/admin/users">Users</NavItem>
          </>
        )}
      </ul>

      <div className="nav__actions">
        {user && (
          <span className="nav__user" aria-label={`Logged in as employee ${user.sub}`}>
            #{user.sub} {role}
          </span>
        )}
        <button className="btn btn--ghost btn--sm" onClick={handleLogout} style={{ color: 'rgba(255,255,255,0.7)' }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
