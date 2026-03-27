import { useState, useEffect, useCallback } from 'react';
import { getAllLogs, getLogsByEndpoint } from '../api/logs';
import { getAllMocks } from '../api/mocks';
import MethodBadge from '../components/MethodBadge';
import StatusBadge from '../components/StatusBadge';

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

function tryPretty(str) {
  if (!str) return '—';
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

export default function Logs() {
  const [logs, setLogs]         = useState([]);
  const [mocks, setMocks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState('');   // endpoint id or ''
  const [expanded, setExpanded] = useState(null); // log id
  const [page, setPage]         = useState(0);
  const PAGE_SIZE = 50;

  // Load mock endpoint list for the filter dropdown
  useEffect(() => {
    getAllMocks()
      .then((r) => setMocks(r.data))
      .catch(() => {/* non-critical */});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (filter) {
        res = await getLogsByEndpoint(filter);
        setLogs(res.data);
      } else {
        res = await getAllLogs(page, PAGE_SIZE);
        setLogs(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleExpand(id) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  function handleFilterChange(e) {
    setFilter(e.target.value);
    setPage(0);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Request Logs</h1>
        <button className="btn btn-ghost btn-sm" onClick={load}>
          ↺ Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <select value={filter} onChange={handleFilterChange}>
          <option value="">All endpoints</option>
          {mocks.map((m) => (
            <option key={m.id} value={m.id}>
              [{m.method}] {m.path} — {m.name}
            </option>
          ))}
        </select>
        {filter && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilter('')}>
            Clear filter
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading logs…</div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <strong>No logs found</strong>
          <p>Logs appear after a mock endpoint is called.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Method</th>
                  <th>Path</th>
                  <th>Status</th>
                  <th>Endpoint</th>
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
                      <td>{log.endpointName ?? <span className="text-muted">—</span>}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleExpand(log.id)}
                        >
                          {expanded === log.id ? '▲ Hide' : '▼ Show'}
                        </button>
                      </td>
                    </tr>

                    {expanded === log.id && (
                      <tr key={`${log.id}-expanded`} style={{ background: '#f8fafc' }}>
                        <td colSpan={6} style={{ padding: '16px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <strong style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Request Body
                              </strong>
                              <div className="log-body">{tryPretty(log.requestBody)}</div>
                            </div>
                            <div>
                              <strong style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

          {/* Pagination (only when showing all logs) */}
          {!filter && (
            <div className="pagination">
              <button
                className="btn btn-ghost btn-sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span>Page {page + 1}</span>
              <button
                className="btn btn-ghost btn-sm"
                disabled={logs.length < PAGE_SIZE}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
