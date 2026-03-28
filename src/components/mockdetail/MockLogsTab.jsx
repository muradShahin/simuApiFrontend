import { useState } from 'react';
import MethodBadge from '../MethodBadge';
import StatusBadge from '../StatusBadge';

function tryPretty(str) {
  if (!str) return '—';
  try { return JSON.stringify(JSON.parse(str), null, 2); } catch { return str; }
}

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

export default function MockLogsTab({ logs, onRefresh }) {
  const [expanded, setExpanded] = useState(null);

  if (!logs || logs.length === 0) {
    return (
      <div className="empty-state">
        <strong>No request logs yet</strong>
        <p>Logs will appear here after this mock endpoint receives requests.</p>
        {onRefresh && (
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={onRefresh}>
            ↺ Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={onRefresh}>↺ Refresh</button>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Method</th>
              <th>Path</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <>
                <tr key={log.id}>
                  <td className="mono">{formatDate(log.timestamp)}</td>
                  <td><MethodBadge method={log.method} /></td>
                  <td><code>{log.endpointPath}</code></td>
                  <td><StatusBadge code={log.statusCode} /></td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                    >
                      {expanded === log.id ? '▲ Hide' : '▼ Show'}
                    </button>
                  </td>
                </tr>
                {expanded === log.id && (
                  <tr key={`${log.id}-expanded`} style={{ background: 'var(--bg-3)' }}>
                    <td colSpan={5} style={{ padding: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <strong style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Request Body
                          </strong>
                          <div className="log-body">{tryPretty(log.requestBody)}</div>
                        </div>
                        <div>
                          <strong style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Response Body
                          </strong>
                          <div className="log-body">{tryPretty(log.responseBody)}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
