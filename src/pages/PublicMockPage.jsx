import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicMock, getPublicOpenApiSpec, getPublicCodeSnippets, exportPublicPostman, exportPublicOpenApi } from '../api/mocks';
import JsonViewer from '../components/JsonViewer';
import ApiDocsTab from '../components/mockdetail/ApiDocsTab';
import CodeSnippetsTab from '../components/mockdetail/CodeSnippetsTab';
import ExportDropdown from '../components/ExportDropdown';
import ThemeToggle from '../components/ThemeToggle';
import axios from 'axios';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'api-docs', label: 'API Docs' },
  { key: 'snippets', label: 'Code Snippets' },
  { key: 'try-it',   label: 'Try It' },
];

export default function PublicMockPage() {
  const { publicId } = useParams();
  const [data, setData]       = useState(null);
  const [openApiSpec, setOpenApiSpec] = useState(null);
  const [snippets, setSnippets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPublicMock(publicId),
      getPublicOpenApiSpec(publicId).catch(() => ({ data: null })),
      getPublicCodeSnippets(publicId).catch(() => ({ data: null })),
    ])
      .then(([mockRes, specRes, snippetsRes]) => {
        setData(mockRes.data);
        setOpenApiSpec(specRes.data);
        setSnippets(snippetsRes.data);
      })
      .catch(err => setError(err.message || 'Mock not found'))
      .finally(() => setLoading(false));
  }, [publicId]);

  if (loading) return <div className="pm-loading">Loading…</div>;
  if (error)   return <div className="pm-error">{error}</div>;
  if (!data)   return <div className="pm-error">Mock not found</div>;

  const method = (data.method ?? 'GET').toUpperCase();
  const authType = data.authConfig?.type && data.authConfig.type !== 'NONE'
    ? data.authConfig.type : null;
  const isOAuth = data.authConfig?.type === 'OAUTH2' && data.authConfig?.tokenEndpointEnabled;

  return (
    <div className="pm-page">
      {/* Header */}
      <header className="pm-header">
        <div className="pm-header-top">
          <Link to="/landing" className="pm-logo">
            <img src="/logo.png" alt="MockCraft" />
          </Link>
          <div className="pm-header-top-right">
            <ThemeToggle />
            <ExportDropdown
              onExportPostman={() => exportPublicPostman(publicId)}
              onExportOpenApi={() => exportPublicOpenApi(publicId)}
              label="Export"
            />
            <span className="pm-header-badge">Public Mock</span>
          </div>
        </div>
        <div className="pm-header-main">
          <div className="pm-header-title-row">
            <span className={`pm-method-badge pm-method-${method.toLowerCase()}`}>{method}</span>
            <h1 className="pm-title">{data.name}</h1>
            {authType && <span className="pm-auth-badge">🔐 {authType}</span>}
          </div>
          <EndpointUrl slug={data.slug} path={data.path} />
        </div>
      </header>

      {/* Tabs */}
      <div className="pm-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`pm-tab ${activeTab === tab.key ? 'pm-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pm-content">
        {activeTab === 'overview' && <OverviewPanel data={data} />}
        {activeTab === 'api-docs' && <ApiDocsTab spec={openApiSpec} />}
        {activeTab === 'snippets' && <CodeSnippetsTab snippets={snippets} />}
        {activeTab === 'try-it'   && <TryItPanel data={data} />}
      </div>
    </div>
  );
}

/* ────── Endpoint URL with Copy ────── */
function EndpointUrl({ slug, path }) {
  const [copied, setCopied] = useState(false);
  const base = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const safePath = path || '';
  const fullUrl = slug
    ? `${base}/mock/${slug}${safePath.startsWith('/') ? '' : '/'}${safePath}`
    : `${base}${safePath.startsWith('/') ? '' : '/'}${safePath}`;

  function copy() {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="pm-endpoint-url">
      <code>{fullUrl}</code>
      <button className="pm-copy-btn" onClick={copy}>{copied ? '✓ Copied' : 'Copy'}</button>
    </div>
  );
}

/* ────── OVERVIEW TAB ────── */
function OverviewPanel({ data }) {
  const method = (data.method ?? 'GET').toUpperCase();
  const authType = data.authConfig?.type && data.authConfig.type !== 'NONE'
    ? data.authConfig.type : 'None';

  return (
    <div className="pm-overview">
      <div className="pm-card">
        <h3>Endpoint Details</h3>
        <div className="pm-detail-grid">
          <div className="pm-detail-item">
            <span className="pm-detail-label">Method</span>
            <span className={`pm-method-badge pm-method-${method.toLowerCase()}`}>{method}</span>
          </div>
          <div className="pm-detail-item">
            <span className="pm-detail-label">Status Code</span>
            <span className="pm-detail-value">{data.statusCode}</span>
          </div>
          <div className="pm-detail-item">
            <span className="pm-detail-label">Delay</span>
            <span className="pm-detail-value">{data.delayMs}ms</span>
          </div>
          <div className="pm-detail-item">
            <span className="pm-detail-label">Content Type</span>
            <span className="pm-detail-value">{data.contentType || 'application/json'}</span>
          </div>
          <div className="pm-detail-item">
            <span className="pm-detail-label">Auth Type</span>
            <span className="pm-detail-value">{authType}</span>
          </div>
          {data.simulateTimeout && (
            <div className="pm-detail-item">
              <span className="pm-detail-label">Timeout</span>
              <span className="pm-detail-value pm-timeout">Simulated</span>
            </div>
          )}
        </div>
      </div>

      {data.scenarios && data.scenarios.length > 0 && (
        <div className="pm-card">
          <h3>Scenarios ({data.scenarios.length})</h3>
          <div className="pm-scenario-list">
            {data.scenarios.map((s, i) => (
              <div key={i} className="pm-scenario-item">
                <span className="pm-scenario-name">{s.name}</span>
                <span className={`pm-method-badge pm-status-${String(s.statusCode || data.statusCode).charAt(0)}xx`}>
                  {s.statusCode || data.statusCode}
                </span>
                {s.priority != null && <span className="pm-scenario-priority">Priority: {s.priority}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.authConfig?.type === 'OAUTH2' && data.authConfig?.tokenEndpointEnabled && (
        <OAuthTokenPanel mockId={data.id} slug={data.slug} />
      )}
    </div>
  );
}

/* ────── OAUTH TOKEN PANEL ────── */
function OAuthTokenPanel({ mockId, slug }) {
  const BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const tokenUrl = `${BASE}/mock/${mockId}/oauth/token`;
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [copied, setCopied]   = useState(false);

  async function requestToken() {
    setLoading(true);
    setError(null);
    setToken(null);
    try {
      const res = await axios.post(tokenUrl, null, {
        params: { grant_type: 'client_credentials' },
        validateStatus: () => true,
      });
      if (res.status === 200) {
        setToken(res.data);
      } else {
        setError(res.data?.error || `Error ${res.status}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyToken() {
    if (token?.access_token) {
      navigator.clipboard.writeText(token.access_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function copyCurl() {
    const cmd = `curl -X POST "${tokenUrl}?grant_type=client_credentials"`;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="pm-card pm-oauth-card">
      <h3>🔐 OAuth2 Token Endpoint</h3>
      <p className="pm-oauth-description">
        This mock requires OAuth2 authentication. Use the token endpoint below to get an access token,
        then include it as a <code>Bearer</code> token in your requests.
      </p>

      <div className="pm-oauth-url-row">
        <span className="pm-method-badge pm-method-post">POST</span>
        <code className="pm-oauth-url">{tokenUrl}</code>
        <button className="btn btn-ghost btn-sm" onClick={copyCurl}>Copy cURL</button>
      </div>

      <div className="pm-oauth-actions">
        <button className="btn btn-primary btn-sm" onClick={requestToken} disabled={loading}>
          {loading ? 'Requesting…' : 'Get Token'}
        </button>
      </div>

      {error && <div className="pm-oauth-error">Error: {error}</div>}

      {token && (
        <div className="pm-oauth-result">
          <div className="pm-oauth-result-header">
            <span className="pm-oauth-result-label">Access Token</span>
            <div className="pm-oauth-result-meta">
              <span>Type: {token.token_type}</span>
              <span>Expires in: {token.expires_in}s</span>
            </div>
          </div>
          <div className="pm-oauth-token-box">
            <input readOnly value={token.access_token} className="pm-oauth-token-input" />
            <button className="btn btn-primary btn-sm" onClick={copyToken}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="pm-oauth-usage-hint">
            Use this token in your request header: <code>Authorization: Bearer {'<token>'}</code>
          </p>
        </div>
      )}
    </div>
  );
}

/* ────── TRY IT TAB ────── */
function TryItPanel({ data }) {
  const BASE = import.meta.env.VITE_API_BASE_URL ?? '';
  const method = (data.method ?? 'GET').toUpperCase();
  const showBody = ['POST', 'PUT', 'PATCH'].includes(method);

  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
  const [headers, setHeaders]         = useState([{ key: '', value: '' }]);
  const [body, setBody]               = useState(data.requestBodyTemplate || '');
  const [response, setResponse]       = useState(null);
  const [sending, setSending]         = useState(false);

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

  async function handleSend() {
    setSending(true);
    setResponse(null);

    const safePath = data.path || '';
    const path = safePath.startsWith('/') ? safePath : `/${safePath}`;
    const url = data.slug ? `${BASE}/mock/${data.slug}${path}` : `${BASE}${path}`;
    const params = {};
    queryParams.forEach(({ key, value }) => { if (key) params[key] = value; });
    const hdrs = {};
    headers.forEach(({ key, value }) => { if (key) hdrs[key] = value; });

    const start = performance.now();
    try {
      const res = await axios({
        method: method.toLowerCase(),
        url,
        params,
        headers: hdrs,
        data: showBody ? body || undefined : undefined,
        validateStatus: () => true,
        timeout: 60000,
      });
      const duration = Math.round(performance.now() - start);
      const matchedScenario = res.headers['x-matched-scenario'] || null;
      setResponse({ status: res.status, statusText: res.statusText, headers: res.headers, body: res.data, duration, matchedScenario });
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      setResponse({ status: 0, statusText: 'Network Error', headers: {}, body: err.message, duration });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="pm-tryit">
      {/* Request */}
      <div className="pm-tryit-panel">
        <div className="pm-tryit-panel-header">
          <span>Request</span>
          <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={sending}>
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
        <div className="pm-tryit-panel-body">
          <div className="pm-tryit-url-bar">
            <span className={`pm-method-badge pm-method-${method.toLowerCase()}`}>{method}</span>
            <input readOnly value={`/mock/${data.slug || ''}${(data.path || '').startsWith('/') ? '' : '/'}${data.path || ''}`} />
          </div>

          {/* Query Params */}
          <div className="pm-tryit-section">
            <div className="pm-tryit-section-header">
              <span>Query Parameters</span>
              <button className="btn btn-ghost btn-sm" onClick={() => addRow(queryParams, setQueryParams)}>+ Add</button>
            </div>
            {queryParams.map((row, i) => (
              <div className="pm-tryit-kv-row" key={i}>
                <input placeholder="Key" value={row.key} onChange={e => updateRow(queryParams, setQueryParams, i, 'key', e.target.value)} />
                <input placeholder="Value" value={row.value} onChange={e => updateRow(queryParams, setQueryParams, i, 'value', e.target.value)} />
                <button className="btn btn-ghost btn-sm" onClick={() => removeRow(queryParams, setQueryParams, i)}>×</button>
              </div>
            ))}
          </div>

          {/* Headers */}
          <div className="pm-tryit-section">
            <div className="pm-tryit-section-header">
              <span>Headers</span>
              <button className="btn btn-ghost btn-sm" onClick={() => addRow(headers, setHeaders)}>+ Add</button>
            </div>
            {headers.map((row, i) => (
              <div className="pm-tryit-kv-row" key={i}>
                <input placeholder="Header name" value={row.key} onChange={e => updateRow(headers, setHeaders, i, 'key', e.target.value)} />
                <input placeholder="Value" value={row.value} onChange={e => updateRow(headers, setHeaders, i, 'value', e.target.value)} />
                <button className="btn btn-ghost btn-sm" onClick={() => removeRow(headers, setHeaders, i)}>×</button>
              </div>
            ))}
          </div>

          {/* Body */}
          {showBody && (
            <div className="pm-tryit-section">
              <span className="pm-tryit-section-label">Request Body</span>
              <textarea
                className="pm-tryit-body-editor"
                placeholder='{"key": "value"}'
                rows={8}
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Response */}
      <div className="pm-tryit-panel">
        <div className="pm-tryit-panel-header">
          <span>Response</span>
          {response && (
            <div className="pm-tryit-response-meta">
              <span className={`pm-status-badge pm-status-${String(response.status).charAt(0)}xx`}>
                {response.status} {response.statusText}
              </span>
              <span className="pm-tryit-time">{response.duration}ms</span>
            </div>
          )}
        </div>
        <div className="pm-tryit-panel-body">
          {!response ? (
            <div className="pm-tryit-empty">Send a request to see the response</div>
          ) : (
            <>
              {response.matchedScenario && (
                <div className="pm-matched-scenario">
                  <span className="pm-matched-label">Matched Scenario:</span>
                  <span className="pm-matched-name">{response.matchedScenario}</span>
                </div>
              )}
              <JsonViewer data={response.body} label="Response Body" maxHeight={500} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
