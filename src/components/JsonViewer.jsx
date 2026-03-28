import { useState, useCallback } from 'react';

/**
 * Lightweight JSON viewer with syntax highlighting, collapsible nodes, and copy button.
 */
export default function JsonViewer({ data, maxHeight = 400, label }) {
  const [copied, setCopied] = useState(false);

  const formatted = formatData(data);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [formatted]);

  if (!formatted || formatted === '(empty)') {
    return <div className="json-viewer-empty">(empty)</div>;
  }

  return (
    <div className="json-viewer">
      <div className="json-viewer-toolbar">
        {label && <span className="json-viewer-label">{label}</span>}
        <button className="json-viewer-copy" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div className="json-viewer-content" style={{ maxHeight }}>
        <JsonNode value={parseData(data)} depth={0} />
      </div>
    </div>
  );
}

function parseData(data) {
  if (data === null || data === undefined) return null;
  if (typeof data === 'object') return data;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return data; }
  }
  return data;
}

function formatData(data) {
  if (data === null || data === undefined) return '(empty)';
  if (typeof data === 'string') {
    try { return JSON.stringify(JSON.parse(data), null, 2); } catch { return data; }
  }
  if (typeof data === 'object') return JSON.stringify(data, null, 2);
  return String(data);
}

function JsonNode({ value, depth, keyName }) {
  const [collapsed, setCollapsed] = useState(depth > 2);

  if (value === null) return <JsonLine keyName={keyName}><span className="jv-null">null</span></JsonLine>;
  if (value === undefined) return <JsonLine keyName={keyName}><span className="jv-null">undefined</span></JsonLine>;

  if (typeof value === 'boolean')
    return <JsonLine keyName={keyName}><span className="jv-bool">{String(value)}</span></JsonLine>;
  if (typeof value === 'number')
    return <JsonLine keyName={keyName}><span className="jv-num">{value}</span></JsonLine>;
  if (typeof value === 'string')
    return <JsonLine keyName={keyName}><span className="jv-str">"{value}"</span></JsonLine>;

  if (Array.isArray(value)) {
    if (value.length === 0)
      return <JsonLine keyName={keyName}><span className="jv-bracket">[]</span></JsonLine>;

    return (
      <div className="jv-node">
        <div className="jv-toggle" onClick={() => setCollapsed(!collapsed)}>
          <span className={`jv-arrow ${collapsed ? '' : 'jv-arrow-open'}`}>▶</span>
          {keyName !== undefined && <span className="jv-key">"{keyName}"</span>}
          {keyName !== undefined && <span className="jv-colon">: </span>}
          <span className="jv-bracket">[</span>
          {collapsed && <span className="jv-ellipsis">{value.length} items</span>}
          {collapsed && <span className="jv-bracket">]</span>}
        </div>
        {!collapsed && (
          <div className="jv-children">
            {value.map((item, i) => (
              <JsonNode key={i} value={item} depth={depth + 1} keyName={i} />
            ))}
            <div className="jv-closing"><span className="jv-bracket">]</span></div>
          </div>
        )}
      </div>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0)
      return <JsonLine keyName={keyName}><span className="jv-bracket">{'{}'}</span></JsonLine>;

    return (
      <div className="jv-node">
        <div className="jv-toggle" onClick={() => setCollapsed(!collapsed)}>
          <span className={`jv-arrow ${collapsed ? '' : 'jv-arrow-open'}`}>▶</span>
          {keyName !== undefined && <span className="jv-key">"{keyName}"</span>}
          {keyName !== undefined && <span className="jv-colon">: </span>}
          <span className="jv-bracket">{'{'}</span>
          {collapsed && <span className="jv-ellipsis">{entries.length} keys</span>}
          {collapsed && <span className="jv-bracket">{'}'}</span>}
        </div>
        {!collapsed && (
          <div className="jv-children">
            {entries.map(([k, v]) => (
              <JsonNode key={k} value={v} depth={depth + 1} keyName={k} />
            ))}
            <div className="jv-closing"><span className="jv-bracket">{'}'}</span></div>
          </div>
        )}
      </div>
    );
  }

  return <JsonLine keyName={keyName}><span className="jv-str">{String(value)}</span></JsonLine>;
}

function JsonLine({ keyName, children }) {
  return (
    <div className="jv-line">
      {keyName !== undefined && (
        <>
          <span className="jv-key">"{keyName}"</span>
          <span className="jv-colon">: </span>
        </>
      )}
      {children}
    </div>
  );
}
