import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCheckoutSession } from '../api/billing';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, isPro, isPastDue, isExpired, logout } = useAuth();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await createCheckoutSession();
      window.location.href = res.data.url;
    } catch (err) {
      alert('Upgrade failed: ' + err.message);
      setUpgrading(false);
    }
  }

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        Simu<span>API</span>
      </NavLink>
      <div className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Endpoints
        </NavLink>
        <NavLink
          to="/logs"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Logs
        </NavLink>
        {isAuthenticated && (
          <NavLink
            to="/teams"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Teams
          </NavLink>
        )}
      </div>
      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            {!isPro && (
              <button className="btn btn-upgrade btn-sm" onClick={handleUpgrade} disabled={upgrading}>
                {upgrading ? '…' : isPastDue ? 'Fix Payment' : isExpired ? 'Renew PRO' : 'Upgrade to PRO'}
              </button>
            )}
            <span className="navbar-user">
              {user.email}
              <span className={`plan-badge plan-${user.plan?.toLowerCase()}`}>{user.plan}</span>
            </span>
            <button className="btn btn-ghost btn-sm navbar-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-ghost btn-sm navbar-btn">Sign In</NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm navbar-btn">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
