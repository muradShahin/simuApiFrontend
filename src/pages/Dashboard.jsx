import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllMocks, deleteMock } from '../api/mocks';
import { openPaddleCheckout } from '../api/billing';
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
import ShareMockModal from '../components/ShareMockModal';
import VerificationBanner from '../components/VerificationBanner';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export default function Dashboard() {
  const [mocks, setMocks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [copied, setCopied]     = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isPro, isPastDue, isExpired, isVerified, user, refreshUser } = useAuth();

  const [collections, setCollections]       = useState([]);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [movingMock, setMovingMock] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null); // { title, message, variant, confirmText, onConfirm }
  const [sharingMock, setSharingMock] = useState(null);

  const maxMocks = !isAuthenticated ? 3 : (isPro ? Infinity : 6);
  const upgradeStatus = searchParams.get('upgrade');

  // After returning from Paddle checkout, refresh user to pick up webhook changes
  useEffect(() => {
    if (upgradeStatus === 'success') {
      refreshUser();
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
    const mockPath = mock.path.startsWith('/') ? mock.path : `/${mock.path}`;
    const url = `${BASE}/mock/${user?.slug}${mockPath}`;
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
      await openPaddleCheckout();
    } catch (err) {
      if (err.message !== 'Checkout closed') alert('Upgrade failed: ' + err.message);
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/import')}
            >
              ↓ Import
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/mocks/new')}
              disabled={mocks.length >= maxMocks}
              title={mocks.length >= maxMocks ? 'Mock limit reached' : ''}
            >
              + New Mock
            </button>
          </div>
        </div>

      {!isAuthenticated && (
        <div className="alert alert-info">
          You're using MockCraft as a <strong>guest</strong> — mocks are stored in memory and limited to 3.{' '}
          <a href="/register" style={{ fontWeight: 600 }}>Register free</a> to persist your mocks.
        </div>
      )}
      {isAuthenticated && isPro && upgradeStatus === null && (
        <div className="alert alert-success">
          <strong>PRO plan</strong> — Unlimited mocks, scenarios, and 200 req/min per mock.
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
            <strong>Subscription expired</strong> — Your PRO plan has ended. You're now on the Free plan (6 mocks, 2 scenarios per mock).
          </span>
          <button className="btn btn-upgrade btn-sm" onClick={handleUpgrade} disabled={upgrading}>
            {upgrading ? 'Redirecting…' : 'Renew PRO'}
          </button>
        </div>
      )}
      {isAuthenticated && !isPro && !isPastDue && !isExpired && (
        <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span>
            <strong>Free plan</strong> — {mocks.length}/6 mocks used. 2 scenarios per mock. 30 req/min per mock.
          </span>
          <button className="btn btn-upgrade btn-sm" onClick={() => navigate('/pricing')}>
            Upgrade to PRO
          </button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {isAuthenticated && !isVerified && <VerificationBanner />}

      {/* Dashboard Stats */}
      {!loading && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-card-label">Mocks</span>
            <span className="stat-card-value">{mocks.length}</span>
            <span className="stat-card-hint">{maxMocks === Infinity ? '∞' : `/ ${maxMocks}`}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Collections</span>
            <span className="stat-card-value">{collections.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Teams</span>
            <span className="stat-card-value">{teams.length}</span>
          </div>
          {invitations.length > 0 && (
            <div className="stat-card">
              <span className="stat-card-label">Invites</span>
              <span className="stat-card-value">{invitations.length}</span>
            </div>
          )}
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
                        className="action-btn action-view"
                        onClick={() => navigate(`/mocks/${mock.id}`)}
                        title="View mock details"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        View
                      </button>
                      <button
                        className="action-btn action-curl"
                        onClick={() => copyCurl(mock)}
                        title="Copy curl command"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                        {copied === mock.id ? '✓ Copied' : 'cURL'}
                      </button>
                      {isAuthenticated && (
                        <button
                          className={`action-btn ${mock.publicShared ? 'action-shared' : 'action-share'}`}
                          onClick={() => {
                            if (!isVerified) { alert('Please verify your email before sharing mocks.'); return; }
                            setSharingMock(mock);
                          }}
                          title={!isVerified ? 'Verify email to share' : mock.publicShared ? 'Manage sharing' : 'Share mock'}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                          {mock.publicShared ? 'Shared' : 'Share'}
                        </button>
                      )}
                      {isAuthenticated && collections.length > 1 && (
                        <button
                          className="action-btn action-move"
                          onClick={() => setMovingMock(mock)}
                          title="Move to another collection"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                          Move
                        </button>
                      )}
                      <button
                        className="action-btn action-edit"
                        onClick={() => navigate(`/mocks/${mock.id}/edit`)}
                        title="Edit mock"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      {(!mock.userId || mock.userId === user?.id) && (
                        <button
                          className="action-btn action-delete"
                          onClick={() => handleDelete(mock)}
                          title="Delete mock"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
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

      {sharingMock && (
        <ShareMockModal
          mock={sharingMock}
          onClose={() => setSharingMock(null)}
          onUpdated={() => {
            setMocks(prev => prev.map(m =>
              m.id === sharingMock.id ? { ...m, publicShared: true } : m
            ));
          }}
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
