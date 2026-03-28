import MethodBadge from '../MethodBadge';
import StatusBadge from '../StatusBadge';
import JsonViewer from '../JsonViewer';

export default function OverviewTab({ mock, scenarios, authConfig }) {
  const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
  const endpointUrl = `${BASE}/mock/${mock.path}`;

  let responseHeaders = null;
  if (mock.responseHeaders) {
    try {
      responseHeaders = typeof mock.responseHeaders === 'string'
        ? JSON.parse(mock.responseHeaders)
        : mock.responseHeaders;
    } catch { /* ignore */ }
  }

  return (
    <div className="overview-tab">
      <div className="overview-grid">
        {/* Endpoint Info */}
        <div className="card overview-card">
          <h3 className="overview-card-title">Endpoint</h3>
          <div className="overview-field">
            <span className="overview-label">URL</span>
            <code className="overview-value overview-url">{endpointUrl}</code>
          </div>
          <div className="overview-field">
            <span className="overview-label">Method</span>
            <span className="overview-value"><MethodBadge method={mock.method} /></span>
          </div>
          <div className="overview-field">
            <span className="overview-label">Status Code</span>
            <span className="overview-value"><StatusBadge code={mock.statusCode} /></span>
          </div>
          {mock.collectionName && (
            <div className="overview-field">
              <span className="overview-label">Collection</span>
              <span className="overview-value">{mock.collectionName}</span>
            </div>
          )}
        </div>

        {/* Behavior */}
        <div className="card overview-card">
          <h3 className="overview-card-title">Behavior</h3>
          <div className="overview-field">
            <span className="overview-label">Delay</span>
            <span className="overview-value">{mock.delayMs > 0 ? `${mock.delayMs} ms` : 'None'}</span>
          </div>
          <div className="overview-field">
            <span className="overview-label">Timeout Simulation</span>
            <span className="overview-value">{mock.simulateTimeout ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="overview-field">
            <span className="overview-label">Scenarios</span>
            <span className="overview-value">{scenarios.length} configured</span>
          </div>
        </div>
      </div>

      {/* Response Headers */}
      {responseHeaders && Object.keys(responseHeaders).length > 0 && (
        <div className="card overview-section">
          <h3 className="overview-card-title">Response Headers</h3>
          <div className="headers-list">
            {Object.entries(responseHeaders).map(([key, value]) => (
              <div className="header-row" key={key}>
                <code className="header-key">{key}</code>
                <code className="header-value">{value}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response Body */}
      <div className="card overview-section">
        <h3 className="overview-card-title">Default Response Body</h3>
        <JsonViewer data={mock.responseBody} label="Response" />
      </div>

      {/* Authentication */}
      {authConfig && authConfig.type && authConfig.type !== 'NONE' && (
        <div className="card overview-section auth-overview-section">
          <div className="auth-overview-header">
            <span className="auth-overview-icon">🔒</span>
            <span className="auth-overview-type">{authConfig.type} Authentication</span>
          </div>
          <div className="auth-overview-fields">
            {authConfig.type === 'BASIC' && (
              <>
                <div className="auth-overview-row">
                  <span className="auth-overview-row-label">Credentials</span>
                  <span className="auth-overview-row-value"><code>{authConfig.username}:****</code></span>
                </div>
                <div className="auth-overview-example">Authorization: Basic {btoa(`${authConfig.username}:password`)}</div>
              </>
            )}
            {authConfig.type === 'API_KEY' && (
              <>
                <div className="auth-overview-row">
                  <span className="auth-overview-row-label">Header</span>
                  <span className="auth-overview-row-value"><code>{authConfig.apiKeyHeader || 'X-Api-Key'}</code></span>
                </div>
                <div className="auth-overview-example">{authConfig.apiKeyHeader || 'X-Api-Key'}: {'<your-api-key>'}</div>
              </>
            )}
            {(authConfig.type === 'JWT' || authConfig.type === 'OAUTH2') && (
              <>
                {authConfig.issuer && (
                  <div className="auth-overview-row">
                    <span className="auth-overview-row-label">Issuer</span>
                    <span className="auth-overview-row-value">{authConfig.issuer}</span>
                  </div>
                )}
                <div className="auth-overview-row">
                  <span className="auth-overview-row-label">Token Expiry</span>
                  <span className="auth-overview-row-value">{authConfig.expirationSeconds}s</span>
                </div>
                <div className="auth-overview-example">Authorization: Bearer {'<jwt-token>'}</div>
              </>
            )}
            {authConfig.type === 'OAUTH2' && authConfig.tokenEndpointEnabled && (
              <>
                <div className="auth-overview-row">
                  <span className="auth-overview-row-label">Token Endpoint</span>
                  <span className="auth-overview-row-value">
                    <code style={{ color: 'var(--accent)' }}>POST /mock/{mock.id}/oauth/token</code>
                  </span>
                </div>
                <div className="auth-overview-example">{`curl -X POST ${BASE}/mock/${mock.id}/oauth/token \\
  -d "grant_type=client_credentials&client_id=<id>&client_secret=<secret>"`}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
