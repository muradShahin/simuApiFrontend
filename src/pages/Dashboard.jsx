import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllMocks, deleteMock } from '../api/mocks';
import { createCheckoutSession, verifyCheckoutSession } from '../api/billing';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection as deleteCollectionApi,
  moveMock as moveMockApi,
} from '../api/collections';
import { getMyTeams, getMyInvitations, acceptInvitation, declineInvitation } from '../api/teams';
import { useAuth } from '../context/AuthContext';
import MethodBadge from '../components/MethodBadge';
import StatusBadge from '../components/StatusBadge';
import CollectionSidebar from '../components/CollectionSidebar';
import CollectionModal from '../components/CollectionModal';
import MoveMockModal from '../components/MoveMockModal';
import ConfirmModal from '../components/ConfirmModal';

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

  const [collections, setCollections]       = useState([]);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [movingMock, setMovingMock] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null); // { title, message, variant, confirmText, onConfirm }

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
      const [mocksRes, colsRes, invRes, teamsRes] = await Promise.all([
        getAllMocks(),
        isAuthenticated ? getCollections().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        isAuthenticated ? getMyInvitations().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        isAuthenticated ? getMyTeams().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);
      setMocks(mocksRes.data);
      setCollections(colsRes.data);
      setInvitations(invRes.data);
      setTeams(teamsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const displayedMocks = activeCollectionId
    ? mocks.filter((m) => m.collectionId === activeCollectionId)
    : mocks;

  async function handleDelete(mock) {
    setConfirmAction({
      title: 'Delete Mock',
      message: `Are you sure you want to delete "${mock.name}"? This action cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        await deleteMock(mock.id);
        setMocks((prev) => prev.filter((m) => m.id !== mock.id));
        setConfirmAction(null);
      },
    });
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

  /* ---- Collection handlers ---- */

  function handleNewCollection() {
    setEditingCollection(null);
    setShowCollectionModal(true);
  }

  function handleEditCollection(col) {
    setEditingCollection(col);
    setShowCollectionModal(true);
  }

  async function handleSaveCollection(data) {
    if (editingCollection) {
      await updateCollection(editingCollection.id, data);
    } else {
      await createCollection(data);
    }
    setShowCollectionModal(false);
    setEditingCollection(null);
    const res = await getCollections();
    setCollections(res.data);
  }

  async function handleDeleteCollection(col) {
    setConfirmAction({
      title: 'Delete Collection',
      message: `Are you sure you want to delete "${col.name}"? Mocks inside will become unassigned.`,
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        await deleteCollectionApi(col.id);
        if (activeCollectionId === col.id) setActiveCollectionId(null);
        const res = await getCollections();
        setCollections(res.data);
        setConfirmAction(null);
      },
    });
  }

  async function handleMoveMock(mockId, targetCollectionId) {
    await moveMockApi(mockId, targetCollectionId);
    setMovingMock(null);
    await load();
  }

  async function handleAcceptInvitation(invId) {
    try {
      await acceptInvitation(invId);
      await load();
    } catch (err) {
      alert('Accept failed: ' + err.message);
    }
  }

  async function handleDeclineInvitation(invId) {
    try {
      await declineInvitation(invId);
      setInvitations((prev) => prev.filter((i) => i.id !== invId));
    } catch (err) {
      alert('Decline failed: ' + err.message);
    }
  }

  return (
    <div className="dashboard-layout">
      {isAuthenticated && (
        <CollectionSidebar
          collections={collections}
          activeId={activeCollectionId}
          onSelect={setActiveCollectionId}
          onNew={handleNewCollection}
          onEdit={handleEditCollection}
          onDelete={handleDeleteCollection}
        />
      )}

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

      {/* Dashboard Stats */}
      {!loading && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-card-label">Total Mocks</span>
            <span className="stat-card-value">{mocks.length}</span>
            <span className="stat-card-hint">{maxMocks === Infinity ? 'Unlimited' : `${mocks.length}/${maxMocks} used`}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Collections</span>
            <span className="stat-card-value">{collections.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Teams</span>
            <span className="stat-card-value">{teams.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Pending Invites</span>
            <span className="stat-card-value">{invitations.length}</span>
          </div>
        </div>
      )}

      {/* Pending team invitations */}
      {invitations.length > 0 && (
        <div className="invitation-banner">
          <h4>Team Invitations</h4>
          {invitations.map((inv) => (
            <div key={inv.id} className="invitation-row">
              <span>
                <strong>{inv.inviterEmail}</strong> invited you to join <strong>{inv.teamName}</strong>
              </span>
              <div className="invitation-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleAcceptInvitation(inv.id)}>
                  Accept
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleDeclineInvitation(inv.id)}>
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading…</div>
      ) : displayedMocks.length === 0 ? (
        <div className="empty-state">
          <strong>{activeCollectionId ? 'No mocks in this collection' : 'No mock endpoints yet'}</strong>
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
                {isAuthenticated && <th>Collection</th>}
                <th>Status</th>
                <th>Delay (ms)</th>
                <th>Timeout sim.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedMocks.map((mock) => (
                <tr key={mock.id}>
                  <td><strong>{mock.name}</strong></td>
                  <td><MethodBadge method={mock.method} /></td>
                  <td><code>{mock.path}</code></td>
                  {isAuthenticated && (
                    <td>
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        {mock.collectionName || '—'}
                      </span>
                    </td>
                  )}
                  <td><StatusBadge code={mock.statusCode} /></td>
                  <td>{mock.delayMs > 0 ? `${mock.delayMs} ms` : '—'}</td>
                  <td>{mock.simulateTimeout ? '⚡ Yes' : '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/mocks/${mock.id}`)}
                        title="View mock details"
                      >
                        View
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => copyCurl(mock)}
                        title="Copy curl command"
                      >
                        {copied === mock.id ? '✓ Copied' : 'curl'}
                      </button>
                      {isAuthenticated && collections.length > 1 && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setMovingMock(mock)}
                          title="Move to another collection"
                        >
                          Move
                        </button>
                      )}
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/mocks/${mock.id}/edit`)}
                      >
                        Edit
                      </button>
                      {(!mock.userId || mock.userId === user?.id) && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(mock)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCollectionModal && (
        <CollectionModal
          collection={editingCollection}
          teams={teams}
          onSave={handleSaveCollection}
          onClose={() => { setShowCollectionModal(false); setEditingCollection(null); }}
        />
      )}

      {movingMock && (
        <MoveMockModal
          mock={movingMock}
          collections={collections}
          onMove={handleMoveMock}
          onClose={() => setMovingMock(null)}
        />
      )}

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          variant={confirmAction.variant}
          confirmText={confirmAction.confirmText}
          onConfirm={confirmAction.onConfirm}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  </div>
  );
}
