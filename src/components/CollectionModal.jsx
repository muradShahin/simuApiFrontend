import { useState } from 'react';

export default function CollectionModal({ collection, teams = [], onSave, onClose }) {
  const isEdit = Boolean(collection?.id);
  const [name, setName] = useState(collection?.name || '');
  const [description, setDescription] = useState(collection?.description || '');
  const [teamId, setTeamId] = useState(collection?.teamId || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        teamId: teamId || null,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Collection' : 'New Collection'}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="col-name">Name *</label>
            <input
              id="col-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Payment APIs"
              required
              autoFocus
            />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="col-desc">Description</label>
            <textarea
              id="col-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          {teams.length > 0 && (
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label htmlFor="col-team">Share with Team</label>
              <select
                id="col-team"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
              >
                <option value="">None (personal)</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-actions" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Collection'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
