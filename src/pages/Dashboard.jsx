import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllMocks, deleteMock } from '../api/mocks';
import { createCheckoutSession, verifyCheckoutSession } from '../api/billing';
import { useAuth } from '../context/AuthContext';
import MethodBadge from '../components/MethodBadge';
import StatusBadge from '../components/StatusBadge';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export default function Dashboard() {
  const [mocks, setMocks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [copied, setCopied]     = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isPro, isPastDue, isExpired, user, refreshUser } = useAuth();

  const maxMocks = !isAuthenticated ? 3 : (isPro ? Infinity : 3);
  const upgradeStatus = searchParams.get('upgrade');

  // After returning from Stripe, verify the session and upgrade user
  useEffect(() => {
    if (upgradeStatus === 'success') {
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        verifyCheckoutSession(sessionId)
          .then(() => refreshUser())
          .catch((err) => console.error('Session verification failed:', err));
      } else {
        refreshUser();
      }
      setSearchParams({}, { replace: true });
    } else if (upgradeStatus === 'canceled') {
      setSearchParams({}, { replace: true });
    }
  }, [upgradeStatus, refreshUser, setSearchParams]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllMocks();
      setMocks(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(mock) {
    if (!window.confirm(`Delete mock "${mock.name}"?\nThis cannot be undone.`)) return;
    try {
      await deleteMock(mock.id);
      setMocks((prev) => prev.filter((m) => m.id !== mock.id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  }

  function copyCurl(mock) {
    const url = `${BASE}/mock${mock.path}`;
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(mock.method);
    const bodyPart = hasBody && mock.responseBody
      ? ` \\\n  -d '${mock.responseBody.replace(/'/g, "\\'")}'`
      : '';
    const curl = `curl -X ${mock.method} "${url}"${bodyPart}`;
    navigator.clipboard.writeText(curl);
    setCopied(mock.id);
    setTimeout(() => setCopied(null), 2000);
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
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Mock Endpoints</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/mocks/new')}
          disabled={mocks.length >= maxMocks}
          title={mocks.length >= maxMocks ? 'Mock limit reached' : ''}
        >
          + New Mock
        </button>
      </div>

      {!isAuthenticated && (
        <div className="alert alert-info">
          You're using SimuAPI as a <strong>guest</strong> — mocks are stored in memory and limited to 3.{' '}
          <a href="/register" style={{ fontWeight: 600 }}>Register free</a> to persist your mocks.
        </div>
      )}
      {isAuthenticated && isPro && upgradeStatus === null && (
        <div className="alert alert-success">
          <strong>PRO plan</strong> — Unlimited mocks and scenarios enabled.
          {user.subscriptionExpiry && <span> Renews {new Date(user.subscriptionExpiry).toLocaleDateString()}</span>}
        </div>
      )}
      {isAuthenticated && isPastDue && (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span>
            <strong>Payment failed</strong> — Your PRO subscription payment could not be processed.
            Please update your payment method to keep PRO features.
          </span>
          <button className="btn btn-upgrade btn-sm" onClick={handleUpgrade} disabled={upgrading}>
            {upgrading ? 'Redirecting…' : 'Retry Payment'}
          </button>
        </div>
      )}
      {isAuthenticated && isExpired && (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span>
            <strong>Subscription expired</strong> — Your PRO plan has ended. You're now on the Free plan (3 mocks, no scenarios).
          </span>
          <button className="btn btn-upgrade btn-sm" onClick={handleUpgrade} disabled={upgrading}>
            {upgrading ? 'Redirecting…' : 'Renew PRO'}
          </button>
        </div>
      )}
      {isAuthenticated && !isPro && !isPastDue && !isExpired && (
        <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span>
            <strong>Free plan</strong> — {mocks.length}/3 mocks used. Scenarios are disabled.
          </span>
          <button className="btn btn-upgrade btn-sm" onClick={handleUpgrade} disabled={upgrading}>
            {upgrading ? 'Redirecting…' : 'Upgrade to PRO'}
          </button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading…</div>
      ) : mocks.length === 0 ? (
        <div className="empty-state">
          <strong>No mock endpoints yet</strong>
          <p>Click <em>New Mock</em> to configure your first one.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Method</th>
                <th>Path</th>
                <th>Status</th>
                <th>Delay (ms)</th>
                <th>Timeout sim.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mocks.map((mock) => (
                <tr key={mock.id}>
                  <td><strong>{mock.name}</strong></td>
                  <td><MethodBadge method={mock.method} /></td>
                  <td><code>{mock.path}</code></td>
                  <td><StatusBadge code={mock.statusCode} /></td>
                  <td>{mock.delayMs > 0 ? `${mock.delayMs} ms` : '—'}</td>
                  <td>{mock.simulateTimeout ? '⚡ Yes' : '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => copyCurl(mock)}
                        title="Copy curl command"
                      >
                        {copied === mock.id ? '✓ Copied' : 'curl'}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/mocks/${mock.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(mock)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
