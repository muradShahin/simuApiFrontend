import { useState } from 'react';

export default function ConfirmModal({
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'primary'
  onConfirm,
  onClose,
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      // let caller handle
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">
          {variant === 'danger' ? (
            <span className="confirm-icon-danger">⚠</span>
          ) : (
            <span className="confirm-icon-primary">ℹ</span>
          )}
        </div>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
