import { useState, useEffect, useRef } from 'react';
import { exportCollectionPostman, exportCollectionOpenApi } from '../api/export';

export default function CollectionSidebar({
  collections,
  activeId,
  onSelect,
  onNew,
  onEdit,
  onDelete,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(type, message) {
    clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  function handleContextMenu(e, col) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(col.id === contextMenu ? null : col.id);
  }

  async function handleExport(colId, fetchFn, filename) {
    setContextMenu(null);
    try {
      const res = await fetchFn(colId);
      const json = JSON.stringify(res.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast('error', 'Export failed: ' + (err.response?.data?.message || err.message));
    }
  }

  return (
    <aside className="collection-sidebar">
      <div className="sidebar-header">
        <h3>Collections</h3>
        <button className="btn btn-primary btn-sm" onClick={onNew} title="New collection">
          +
        </button>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${activeId === null ? 'active' : ''}`}
          onClick={() => onSelect(null)}
        >
          <span className="sidebar-item-icon">📋</span>
          <span className="sidebar-item-label">All Mocks</span>
        </button>

        {collections.map((col) => (
          <div key={col.id} className="sidebar-item-wrapper">
            <button
              className={`sidebar-item ${activeId === col.id ? 'active' : ''}`}
              onClick={() => onSelect(col.id)}
              onContextMenu={(e) => handleContextMenu(e, col)}
            >
              <span className="sidebar-item-icon">📁</span>
              <span className="sidebar-item-label">
                {col.name}
                {col.teamName && <span className="team-badge" title={`Team: ${col.teamName}`}>👥</span>}
              </span>
              <span className="sidebar-item-count">{col.mockCount}</span>
            </button>

            <button
              className="sidebar-item-menu"
              onClick={(e) => handleContextMenu(e, col)}
              title="Options"
            >
              ⋮
            </button>

            {contextMenu === col.id && (
              <div className="sidebar-context-menu">
                <button onClick={() => { setContextMenu(null); onEdit(col); }}>
                  Edit
                </button>
                <button onClick={() => handleExport(col.id, exportCollectionPostman, `${col.name}-postman.json`)}>
                  Export Postman
                </button>
                <button onClick={() => handleExport(col.id, exportCollectionOpenApi, `${col.name}-openapi.json`)}>
                  Export OpenAPI
                </button>
                <button
                  className="text-danger"
                  onClick={() => { setContextMenu(null); onDelete(col); }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </nav>
      {toast && (
        <div className={`export-toast export-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </aside>
  );
}
