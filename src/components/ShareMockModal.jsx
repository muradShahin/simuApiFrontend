import { useState } from 'react';
import { shareMock, unshareMock } from '../api/mocks';

export default function ShareMockModal({ mock, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [publicUrl, setPublicUrl] = useState(
    mock.publicShared && mock.publicId
      ? `${window.location.origin}/public/mock/${mock.publicId}`
      : null
  );
  const [copied, setCopied] = useState(false);
  const isShared = !!publicUrl;

  async function handleShare() {
    setLoading(true);
    try {
      const res = await shareMock(mock.id);
      const url = `${window.location.origin}${res.data.publicUrl}`;
      setPublicUrl(url);
      onUpdated?.();
    } catch (err) {
      alert('Failed to share: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnshare() {
    setLoading(true);
    try {
      await unshareMock(mock.id);
      setPublicUrl(null);
      onUpdated?.();
    } catch (err) {
      alert('Failed to unshare: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share Mock</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {!isShared ? (
            <div className="share-prompt">
              <div className="share-icon">🔗</div>
              <p className="share-description">
                Generate a public link for <strong>{mock.name}</strong>. Anyone with the link can view
                the API documentation and test the endpoint — but cannot edit anything.
              </p>
              <button
                className="btn btn-primary"
                onClick={handleShare}
                disabled={loading}
              >
                {loading ? 'Generating…' : 'Generate Public Link'}
              </button>
            </div>
          ) : (
            <div className="share-active">
              <div className="share-status">
                <span className="share-status-dot" />
                <span>This mock is publicly shared</span>
              </div>
              <div className="share-url-box">
                <input readOnly value={publicUrl} className="share-url-input" />
                <button className="btn btn-primary btn-sm" onClick={handleCopy}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <button
                className="btn btn-ghost btn-sm share-unshare-btn"
                onClick={handleUnshare}
                disabled={loading}
              >
                {loading ? 'Removing…' : 'Remove Public Link'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
