import { useState, useEffect, useRef } from 'react';

/**
 * Reusable export dropdown. Provides "Postman" and "OpenAPI" options.
 * Each option can download as file or copy to clipboard.
 *
 * Props:
 *  - onExportPostman()  → returns Promise with { data }
 *  - onExportOpenApi()  → returns Promise with { data }
 *  - label (optional)   → button text, default "Export"
 */
export default function ExportDropdown({ onExportPostman, onExportOpenApi, label = 'Export' }) {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(type, message) {
    clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  async function handleExport(fetchFn, filename) {
    setBusy(true);
    try {
      const res = await fetchFn();
      const json = JSON.stringify(res.data, null, 2);
      downloadJson(json, filename);
    } catch (err) {
      showToast('error', 'Export failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy(fetchFn) {
    setBusy(true);
    try {
      const res = await fetchFn();
      const json = JSON.stringify(res.data, null, 2);
      await navigator.clipboard.writeText(json);
      showToast('success', 'Copied to clipboard!');
    } catch (err) {
      showToast('error', 'Copy failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBusy(false);
    }
  }

  function downloadJson(jsonStr, filename) {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="export-dropdown">
      <button className="btn btn-ghost btn-sm export-trigger" disabled={busy}>
        {busy ? 'Exporting…' : `↓ ${label}`}
      </button>
      <div className="export-menu">
        <div className="export-menu-section">
          <span className="export-menu-label">Postman Collection</span>
          <button className="export-menu-item" onClick={() => handleExport(onExportPostman, 'postman-collection.json')}>
            ↓ Download
          </button>
          <button className="export-menu-item" onClick={() => handleCopy(onExportPostman)}>
            📋 Copy JSON
          </button>
        </div>
        <div className="export-menu-divider" />
        <div className="export-menu-section">
          <span className="export-menu-label">OpenAPI 3.0</span>
          <button className="export-menu-item" onClick={() => handleExport(onExportOpenApi, 'openapi-spec.json')}>
            ↓ Download
          </button>
          <button className="export-menu-item" onClick={() => handleCopy(onExportOpenApi)}>
            📋 Copy JSON
          </button>
        </div>
      </div>

      {toast && (
        <div className={`export-toast export-toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
