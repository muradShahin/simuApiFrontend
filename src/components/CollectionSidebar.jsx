import { useState } from 'react';

export default function CollectionSidebar({
  collections,
  activeId,
  onSelect,
  onNew,
  onEdit,
  onDelete,
}) {
  const [contextMenu, setContextMenu] = useState(null);

  function handleContextMenu(e, col) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(col.id === contextMenu ? null : col.id);
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
    </aside>
  );
}
