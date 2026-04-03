import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getProfile } from '../api/profile';
import { createCheckoutSession } from '../api/billing';

export default function ProfilePage() {
  const { isAuthenticated, user, isPro, isPastDue, isExpired } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated]);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await getProfile();
      setProfile(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await createCheckoutSession();
      window.location.href = res.data.url;
    } catch (err) {
      alert('Upgrade failed: ' + (err.response?.data?.message || err.message));
      setUpgrading(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  if (loading) {
    return <div className="page"><div className="loading">Loading profile…</div></div>;
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!profile) return null;

  const isDark = theme === 'dark';

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
      </div>

      <div className="profile-grid">
        {/* Account Info Card */}
        <div className="card profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar">
              {profile.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="profile-card-title">Account</h2>
              <p className="profile-card-subtitle">{profile.email}</p>
            </div>
          </div>
          <div className="profile-card-body">
            <div className="profile-field">
              <span className="profile-label">Email</span>
              <span className="profile-value">{profile.email}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">User ID</span>
              <span className="profile-value profile-mono">{profile.slug}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Role</span>
              <span className="profile-value">
                <span className="badge" style={{
                  background: profile.role === 'ADMIN' ? 'var(--red-dim)' : 'var(--bg-3)',
                  color: profile.role === 'ADMIN' ? 'var(--red)' : 'var(--text-2)',
                  fontSize: 11
                }}>
                  {profile.role}
                </span>
              </span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Joined</span>
              <span className="profile-value">{formatDate(profile.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="card profile-card">
          <h2 className="profile-card-title">Subscription</h2>
          <div className="profile-card-body">
            <div className="profile-field">
              <span className="profile-label">Plan</span>
              <span className="profile-value">
                <span className={`plan-badge plan-${profile.subscriptionPlan?.toLowerCase()}`}>
                  {profile.subscriptionPlan}
                </span>
              </span>
            </div>
            {profile.subscriptionPlan === 'PRO' && (
              <>
                <div className="profile-field">
                  <span className="profile-label">Status</span>
                  <span className="profile-value">
                    <span className="badge" style={{
                      background: profile.subscriptionStatus === 'ACTIVE' ? 'var(--green-dim)' : profile.subscriptionStatus === 'PAST_DUE' ? 'var(--yellow-dim)' : 'var(--red-dim)',
                      color: profile.subscriptionStatus === 'ACTIVE' ? 'var(--green)' : profile.subscriptionStatus === 'PAST_DUE' ? 'var(--yellow)' : 'var(--red)',
                      fontSize: 11
                    }}>
                      {profile.subscriptionStatus}
                    </span>
                  </span>
                </div>
                {profile.subscriptionExpiry && (
                  <div className="profile-field">
                    <span className="profile-label">Expires</span>
                    <span className="profile-value">{formatDate(profile.subscriptionExpiry)}</span>
                  </div>
                )}
              </>
            )}
            <div className="profile-plan-info">
              {isPro ? (
                <div className="alert alert-success" style={{ marginBottom: 0 }}>
                  You're on the <strong>PRO</strong> plan with access to all features.
                </div>
              ) : isPastDue ? (
                <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                  Your payment is past due. Please update your payment method.
                </div>
              ) : isExpired ? (
                <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                  Your PRO subscription has expired. Renew to regain access.
                </div>
              ) : (
                <div className="alert alert-info" style={{ marginBottom: 0 }}>
                  Free plan — up to 6 endpoints, 2 scenarios per mock, 3 imports/month, 30 req/min per mock, 100 req/min total. Upgrade to PRO for unlimited access.
                </div>
              )}
            </div>
            {!isPro && (
              <button
                className="btn btn-upgrade"
                onClick={handleUpgrade}
                disabled={upgrading}
                style={{ marginTop: 12, width: '100%' }}
              >
                {upgrading ? 'Redirecting…' : isPastDue ? 'Fix Payment' : isExpired ? 'Renew PRO' : 'Upgrade to PRO'}
              </button>
            )}
          </div>
        </div>

        {/* Usage Stats Card */}
        <div className="card profile-card">
          <h2 className="profile-card-title">Usage</h2>
          <div className="profile-card-body">
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">{profile.mockCount}</span>
                <span className="profile-stat-label">Endpoints</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{profile.collectionCount}</span>
                <span className="profile-stat-label">Collections</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{profile.teamCount}</span>
                <span className="profile-stat-label">Teams</span>
              </div>
            </div>
            {!isPro && (
              <div className="profile-limit-bar">
                <div className="profile-limit-header">
                  <span className="profile-label">Endpoints</span>
                  <span className="profile-label">{profile.mockCount} / 6</span>
                </div>
                <div className="profile-limit-track">
                  <div
                    className="profile-limit-fill"
                    style={{ width: `${Math.min((profile.mockCount / 6) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preferences Card */}
        <div className="card profile-card">
          <h2 className="profile-card-title">Preferences</h2>
          <div className="profile-card-body">
            <div className="profile-field profile-field-action">
              <div>
                <span className="profile-label">Theme</span>
                <span className="profile-value" style={{ fontSize: 12, marginTop: 2 }}>
                  {isDark ? 'Dark mode' : 'Light mode'}
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className="btn btn-secondary btn-sm"
              >
                {isDark ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
                Switch to {isDark ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </div>

        {/* Teams Card */}
        <div className="card profile-card profile-card-wide">
          <div className="profile-card-header-row">
            <h2 className="profile-card-title">Teams</h2>
            {isPro && (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/teams')}>
                Manage Teams
              </button>
            )}
          </div>
          <div className="profile-card-body">
            {!profile.teams || profile.teams.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <strong>No teams</strong>
                <p>{isPro ? 'Create a team from the Teams page.' : 'Teams are a PRO feature.'}</p>
              </div>
            ) : (
              <div className="profile-teams-list">
                {profile.teams.map(team => (
                  <div key={team.id} className="profile-team-item" onClick={() => navigate('/teams')}>
                    <div className="profile-team-info">
                      <strong>{team.name}</strong>
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="badge" style={{
                      background: team.ownerEmail === profile.email ? 'var(--accent-dim)' : 'var(--bg-3)',
                      color: team.ownerEmail === profile.email ? 'var(--accent)' : 'var(--text-2)',
                      fontSize: 10
                    }}>
                      {team.ownerEmail === profile.email ? 'OWNER' : 'MEMBER'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
