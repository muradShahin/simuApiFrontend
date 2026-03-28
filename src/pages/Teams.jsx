import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMyTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  removeMember,
  inviteToTeam,
  getTeamInvitations,
} from '../api/teams';

export default function Teams() {
  const { isAuthenticated, isPro } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingTeam, setEditingTeam] = useState(null);
  const [editName, setEditName] = useState('');

  const [expandedTeam, setExpandedTeam] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [teamInvitations, setTeamInvitations] = useState({});

  useEffect(() => {
    if (isAuthenticated) load();
    else setLoading(false);
  }, [isAuthenticated]);

  async function load() {
    setLoading(true);
    try {
      const res = await getMyTeams();
      setTeams(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await createTeam({ name: newName.trim() });
      setNewName('');
      setShowCreate(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editName.trim() || !editingTeam) return;
    setError(null);
    try {
      await updateTeam(editingTeam.id, { name: editName.trim() });
      setEditingTeam(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(team) {
    if (!window.confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    try {
      await deleteTeam(team.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveMember(teamId, userId) {
    if (!window.confirm('Remove this member from the team?')) return;
    try {
      await removeMember(teamId, userId);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleExpand(team) {
    if (expandedTeam === team.id) {
      setExpandedTeam(null);
      return;
    }
    setExpandedTeam(team.id);
    try {
      const res = await getTeamInvitations(team.id);
      setTeamInvitations((prev) => ({ ...prev, [team.id]: res.data }));
    } catch {
      // User may not be owner — that's fine
    }
  }

  async function handleInvite(e, teamId) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError(null);
    try {
      await inviteToTeam(teamId, { email: inviteEmail.trim() });
      setInviteEmail('');
      // Refresh invitations
      const res = await getTeamInvitations(teamId);
      setTeamInvitations((prev) => ({ ...prev, [teamId]: res.data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="page">
        <div className="alert alert-info">
          <a href="/login" style={{ fontWeight: 600 }}>Log in</a> to manage teams.
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Teams</h1>
        {isPro && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + New Team
          </button>
        )}
      </div>

      {!isPro && (
        <div className="alert alert-info">
          Teams are a <span className="plan-badge plan-pro" style={{ fontSize: 10 }}>PRO</span> feature. Upgrade to create and manage teams.
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {showCreate && (
        <div className="card" style={{ marginBottom: 16 }}>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="team-name">Team Name</label>
              <input
                id="team-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Backend Team"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading…</div>
      ) : teams.length === 0 ? (
        <div className="empty-state">
          <strong>No teams yet</strong>
          {isPro && <p>Click <em>New Team</em> to create one.</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {teams.map((team) => (
            <div key={team.id} className="card team-card">
              <div className="team-card-header" onClick={() => handleExpand(team)}>
                <div style={{ flex: 1 }}>
                  {editingTeam?.id === team.id ? (
                    <form onSubmit={handleUpdate} onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        autoFocus
                        style={{ padding: '4px 8px', fontSize: 14 }}
                      />
                      <button type="submit" className="btn btn-primary btn-sm">Save</button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingTeam(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <strong style={{ fontSize: 15 }}>{team.name}</strong>
                      <span className="text-muted" style={{ marginLeft: 12, fontSize: 12 }}>
                        {team.memberCount} member{team.memberCount !== 1 ? 's' : ''} · Owner: {team.ownerEmail}
                      </span>
                    </>
                  )}
                </div>
                <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setEditingTeam(team); setEditName(team.name); }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(team)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedTeam === team.id && (
                <div className="team-card-body">
                  {/* Members */}
                  <h4 style={{ fontSize: 13, marginBottom: 8, color: 'var(--text-2)' }}>Members</h4>
                  <div className="team-members-list">
                    {team.members?.map((m) => (
                      <div key={m.id} className="team-member-row">
                        <span>{m.email}</span>
                        <span className="badge" style={{ marginLeft: 8, background: m.role === 'OWNER' ? 'var(--accent-dim)' : 'var(--bg-3)', color: m.role === 'OWNER' ? 'var(--accent)' : 'var(--text-3)', fontSize: 10 }}>
                          {m.role}
                        </span>
                        {m.role !== 'OWNER' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ marginLeft: 'auto', fontSize: 11 }}
                            onClick={() => handleRemoveMember(team.id, m.userId)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Invite */}
                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: 13, marginBottom: 8, color: 'var(--text-2)' }}>Invite User</h4>
                    <form onSubmit={(e) => handleInvite(e, team.id)} style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="email"
                        placeholder="user@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                        style={{ flex: 1 }}
                      />
                      <button type="submit" className="btn btn-primary btn-sm" disabled={inviting}>
                        {inviting ? 'Sending…' : 'Send Invite'}
                      </button>
                    </form>
                  </div>

                  {/* Pending invitations */}
                  {teamInvitations[team.id]?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <h4 style={{ fontSize: 13, marginBottom: 8, color: 'var(--text-2)' }}>Invitations</h4>
                      {teamInvitations[team.id].map((inv) => (
                        <div key={inv.id} className="team-member-row">
                          <span>{inv.invitedEmail}</span>
                          <span
                            className="badge"
                            style={{
                              marginLeft: 8,
                              background: inv.status === 'PENDING' ? 'var(--yellow-dim)' : inv.status === 'ACCEPTED' ? 'var(--green-dim)' : 'var(--red-dim)',
                              color: inv.status === 'PENDING' ? 'var(--yellow)' : inv.status === 'ACCEPTED' ? 'var(--green)' : 'var(--red)',
                              fontSize: 10,
                            }}
                          >
                            {inv.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
