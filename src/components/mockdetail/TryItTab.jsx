import { useState } from 'react';
import axios from 'axios';
import JsonViewer from '../JsonViewer';

export default function TryItTab({ mock, slug }) {
  const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
  const [headers, setHeaders]         = useState([{ key: '', value: '' }]);
  const [body, setBody]               = useState('');
  const [response, setResponse]       = useState(null);
  const [loading, setLoading]         = useState(false);

  const updateRow = (arr, setArr, idx, field, val) => {
    const copy = [...arr];
    copy[idx] = { ...copy[idx], [field]: val };
    setArr(copy);
  };
  const addRow = (arr, setArr) => setArr([...arr, { key: '', value: '' }]);
  const removeRow = (arr, setArr, idx) => {
    const copy = arr.filter((_, i) => i !== idx);
    setArr(copy.length === 0 ? [{ key: '', value: '' }] : copy);
  };

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);

    const path = mock.path.startsWith('/') ? mock.path : `/${mock.path}`;
    const url = `${BASE}/mock/${slug}${path}`;
    const params = {};
    queryParams.forEach(({ key, value }) => { if (key) params[key] = value; });

    const hdrs = {};
    headers.forEach(({ key, value }) => { if (key) hdrs[key] = value; });

    // Include auth token so mock execution resolves the correct user's mocks
    const token = localStorage.getItem('mockcraft_token');
    if (token) {
      hdrs['Authorization'] = `Bearer ${token}`;
    }

    const method = (mock.method ?? 'GET').toLowerCase();
    const start = performance.now();

    try {
      const res = await axios({
        method,
        url,
        params,
        headers: hdrs,
        data: ['post', 'put', 'patch'].includes(method) ? body || undefined : undefined,
        validateStatus: () => true,
        timeout: 60000,
      });
      const duration = Math.round(performance.now() - start);
      const matchedScenario = res.headers['x-matched-scenario'] || null;
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        body: res.data,
        duration,
        matchedScenario,
      });
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: err.message,
        duration,
      });
    } finally {
      setLoading(false);
    }
  };

  const method = (mock.method ?? 'GET').toUpperCase();
  const showBody = ['POST', 'PUT', 'PATCH'].includes(method);

  return (
    <div className="tryit-tab">
      {/* Request Panel (left) */}
      <div className="tryit-panel">
        <div className="tryit-panel-header">
          <span className="tryit-panel-title">Request</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
        <div className="tryit-panel-body">
          <div className="tryit-url-bar">
            <span className={`badge badge-${method.toLowerCase()}`}>{method}</span>
            <input readOnly value={`/mock/${slug}${mock.path.startsWith('/') ? '' : '/'}${mock.path}`} />
          </div>

          {/* Query Parameters */}
          <div>
            <div className="tryit-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="tryit-section-label">Query Parameters</span>
              <button className="btn btn-ghost btn-sm" onClick={() => addRow(queryParams, setQueryParams)}>+ Add</button>
            </div>
            {queryParams.map((row, i) => (
              <div className="tryit-header-row" key={i}>
                <input
                  placeholder="Key"
                  value={row.key}
                  onChange={(e) => updateRow(queryParams, setQueryParams, i, 'key', e.target.value)}
                />
                <input
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => updateRow(queryParams, setQueryParams, i, 'value', e.target.value)}
                />
                <button className="btn btn-ghost btn-sm" onClick={() => removeRow(queryParams, setQueryParams, i)}>×</button>
              </div>
            ))}
          </div>

          {/* Headers */}
          <div>
            <div className="tryit-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="tryit-section-label">Headers</span>
              <button className="btn btn-ghost btn-sm" onClick={() => addRow(headers, setHeaders)}>+ Add</button>
            </div>
            {headers.map((row, i) => (
              <div className="tryit-header-row" key={i}>
                <input
                  placeholder="Header name"
                  value={row.key}
                  onChange={(e) => updateRow(headers, setHeaders, i, 'key', e.target.value)}
                />
                <input
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => updateRow(headers, setHeaders, i, 'value', e.target.value)}
                />
                <button className="btn btn-ghost btn-sm" onClick={() => removeRow(headers, setHeaders, i)}>×</button>
              </div>
            ))}
          </div>

          {/* Request Body */}
          {showBody && (
            <div>
              <span className="tryit-section-label">Request Body</span>
              <textarea
                className="tryit-body-editor"
                placeholder='{"key": "value"}'
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Response Panel (right) */}
      <div className="tryit-panel">
        <div className="tryit-panel-header">
          <span className="tryit-panel-title">Response</span>
          {response && (
            <div className="tryit-response-meta">
              <span className={`badge badge-${String(response.status).charAt(0)}xx`}>
                {response.status} {response.statusText}
              </span>
              <span className="tryit-meta-item">
                <span className="tryit-meta-label">Time</span>
                <span className="tryit-meta-value">{response.duration}ms</span>
              </span>
            </div>
          )}
        </div>
        <div className="tryit-panel-body">
          {!response ? (
            <div className="tryit-empty">
              Send a request to see the response
            </div>
          ) : (
            <>
              {/* Matched Scenario */}
              {response.matchedScenario && (
                <div className="tryit-matched-scenario">
                  <span className="tryit-matched-label">Matched Scenario:</span>
                  <span className="tryit-matched-name">{response.matchedScenario}</span>
                </div>
              )}

              {/* Response Headers */}
              {response.headers && typeof response.headers === 'object' && (
                <details className="tryit-response-headers">
                  <summary>Response Headers</summary>
                  <div className="tryit-response-headers-list">
                    {Object.entries(response.headers).map(([k, v]) => (
                      <div key={k}><strong>{k}:</strong> {String(v)}</div>
                    ))}
                  </div>
                </details>
              )}

              {/* Response Body */}
              <div className="tryit-response-body">
                <JsonViewer data={response.body} label="Response Body" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
