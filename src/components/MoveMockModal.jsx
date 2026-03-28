import { useState } from 'react';

export default function MoveMockModal({ mock, collections, onMove, onClose }) {
  const [targetId, setTargetId] = useState(mock.collectionId || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!targetId) return;
    setSaving(true);
    setError(null);
    try {
      await onMove(mock.id, targetId);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Move "{mock.name}"</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label htmlFor="target-col">Target Collection</label>
            <select
              id="target-col"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              required
            >
              <option value="">Select a collection…</option>
              {collections
                .filter((c) => c.id !== mock.collectionId)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>
          <div className="form-actions" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
            <button type="submit" className="btn btn-primary" disabled={saving || !targetId}>
              {saving ? 'Moving…' : 'Move'}
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
