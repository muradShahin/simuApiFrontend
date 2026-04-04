import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { openPaddleCheckout } from '../api/billing';
import { getMyInvitations } from '../api/teams';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ minimal }) {
  const { isAuthenticated, user, isPro, isPastDue, isExpired, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const [upgrading, setUpgrading] = useState(false);
  const [inviteCount, setInviteCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      getMyInvitations().then(res => setInviteCount(res.data?.length || 0)).catch(() => {});
    }
  }, [isAuthenticated]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      await openPaddleCheckout();
    } catch (err) {
      if (err.message !== 'Checkout closed') alert('Upgrade failed: ' + err.message);
      setUpgrading(false);
    }
  }

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        <img src="/logo.png" alt="MockCraft" className="navbar-logo" />
      </NavLink>
      {!isAuthPage && !minimal && (
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
          <NavLink
            to="/import"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Import
          </NavLink>
          <NavLink
            to="/import/wsdl"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            WSDL
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
      )}
      <div className="navbar-right">
        <ThemeToggle />
        {isAuthenticated ? (
          <>
            {!isPro && (
              <NavLink to="/pricing" className="btn btn-upgrade btn-sm">
                {isPastDue ? 'Fix Payment' : isExpired ? 'Renew PRO' : 'Upgrade to PRO'}
              </NavLink>
            )}
            <button
              className="navbar-notifications"
              title={inviteCount > 0 ? `${inviteCount} pending invitation(s)` : 'No notifications'}
              onClick={() => navigate('/dashboard')}
            >
              🔔
              {inviteCount > 0 && <span className="navbar-notif-dot" />}
            </button>
            <Link to="/profile" className="navbar-user" title="View profile">
              {user.email}
              <span className={`plan-badge plan-${user.plan?.toLowerCase()}`}>{user.plan}</span>
            </Link>
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
