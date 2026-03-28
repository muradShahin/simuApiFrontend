import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMock, getMockById, updateMock } from '../api/mocks';
import { getScenarios, createScenario, updateScenario, deleteScenario } from '../api/scenarios';
import { getCollections } from '../api/collections';
import { getAuthConfig, saveAuthConfig } from '../api/authConfig';
import { useAuth } from '../context/AuthContext';
import ScenarioBuilder from '../components/ScenarioBuilder';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

const EMPTY_FORM = {
  name: '',
  path: '/',
  method: 'GET',
  statusCode: 200,
  delayMs: 0,
  responseBody: '',
  responseHeaders: '',
  simulateTimeout: false,
  collectionId: '',
};

export default function MockForm() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const isEdit      = Boolean(id);
  const { isPro, isAuthenticated } = useAuth();

  const [form, setForm]             = useState(EMPTY_FORM);
  const [scenarios, setScenarios]   = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading]       = useState(isEdit);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [loaded, setLoaded]         = useState(false);

  const [authConfig, setAuthConfig] = useState({
    type: 'NONE',
    username: '',
    password: '',
    secretKey: '',
    issuer: '',
    expirationSeconds: 3600,
    tokenEndpointEnabled: true,
  });

  let _tempCounter = 0;

  function parseResponseHeaders(val) {
    if (!val) return [];
    try {
      if (typeof val === 'string') {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
        return Object.entries(parsed).map(([key, value]) => ({ key, value }));
      }
      if (Array.isArray(val)) return val;
      return Object.entries(val).map(([key, value]) => ({ key, value }));
    } catch { return []; }
  }

  function serializeResponseHeaders(rows) {
    if (rows.length === 0) return '';
    return JSON.stringify(rows);
  }

  function headersToObject(val) {
    const rows = parseResponseHeaders(val);
    if (rows.length === 0) return null;
    const obj = {};
    rows.forEach(({ key, value }) => { if (key && key.trim()) obj[key.trim()] = value; });
    return Object.keys(obj).length > 0 ? JSON.stringify(obj) : null;
  }

  // Load collections for the picker
  useEffect(() => {
    if (isAuthenticated) {
      getCollections()
        .then((res) => setCollections(res.data))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Load existing mock + scenarios + auth config when editing (once only)
  useEffect(() => {
    if (!isEdit || loaded) return;
    Promise.all([
      getMockById(id),
      isAuthenticated ? getScenarios(id).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      isAuthenticated ? getAuthConfig(id).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
    ])
      .then(([mockRes, scenRes, authRes]) => {
        const m = mockRes.data;
        setForm({
          name:            m.name,
          path:            m.path,
          method:          m.method,
          statusCode:      m.statusCode,
          delayMs:         m.delayMs,
          responseBody:    m.responseBody ?? '',
          responseHeaders: m.responseHeaders ?? '',
          simulateTimeout: m.simulateTimeout,
          collectionId:    m.collectionId || '',
        });
        setScenarios(scenRes.data.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          priority: s.priority,
          statusCode: s.statusCode,
          responseBody: s.responseBody || '',
          responseHeaders: s.responseHeaders || '',
          delayMs: s.delayMs,
          conditions: (s.conditions || []).map((c) => ({
            type: c.type,
            field: c.field,
            operator: c.operator,
            value: c.value,
          })),
          _dirty: false,
        })));
        // Load auth config
        if (authRes.data && authRes.data.type) {
          setAuthConfig({
            type: authRes.data.type || 'NONE',
            username: authRes.data.username || '',
            password: authRes.data.password || '',
            secretKey: authRes.data.secretKey || '',
            issuer: authRes.data.issuer || '',
            expirationSeconds: authRes.data.expirationSeconds || 3600,
            tokenEndpointEnabled: authRes.data.tokenEndpointEnabled ?? true,
          });
        }
        setLoaded(true);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit, isPro, loaded]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked
            : (name === 'statusCode' || name === 'delayMs') ? Number(value)
            : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      responseBody: form.responseBody.trim() || null,
      responseHeaders: headersToObject(form.responseHeaders),
      collectionId: form.collectionId || null,
    };

    try {
      let mockId = id;
      if (isEdit) {
        await updateMock(id, payload);
      } else {
        const res = await createMock(payload);
        mockId = res.data.id;
      }

      // Persist scenarios (PRO only)
      if (isPro && mockId) {
        for (const sc of scenarios) {
          const body = {
            name: sc.name,
            description: sc.description,
            priority: sc.priority,
            statusCode: sc.statusCode,
            responseBody: sc.responseBody,
            responseHeaders: headersToObject(sc.responseHeaders),
            delayMs: sc.delayMs,
            conditions: sc.conditions,
          };
          if (sc._new) {
            await createScenario(mockId, body);
          } else if (sc._dirty && sc.id) {
            await updateScenario(mockId, sc.id, body);
          }
        }
      }

      // Persist auth config
      if (isAuthenticated && mockId) {
        await saveAuthConfig(mockId, authConfig);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ---- Scenario handlers ----
  function handleAddScenario(template) {
    setScenarios((prev) => [
      ...prev,
      { ...template, _tempId: `new-${Date.now()}-${++_tempCounter}`, _new: true, _dirty: true },
    ]);
  }

  function handleUpdateScenario(updated) {
    setScenarios((prev) =>
      prev.map((s) =>
        (s.id && s.id === updated.id) || (s._tempId && s._tempId === updated._tempId)
          ? { ...updated, _dirty: true }
          : s
      )
    );
  }

  async function handleDeleteScenario(sc) {
    if (sc.id && !sc._new) {
      try {
        await deleteScenario(id, sc.id);
      } catch (err) {
        setError(err.message);
        return;
      }
    }
    setScenarios((prev) => prev.filter((s) => s !== sc && s.id !== sc.id && s._tempId !== sc._tempId));
  }

  if (loading) return <div className="loading">Loading mock…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Mock' : 'New Mock Endpoint'}</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            {/* Name */}
            <div className="form-group full-width">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. CRIF Credit Check"
                required
              />
            </div>

            {/* Collection */}
            {isAuthenticated && collections.length > 0 && (
              <div className="form-group">
                <label htmlFor="collectionId">Collection</label>
                <select
                  id="collectionId"
                  name="collectionId"
                  value={form.collectionId}
                  onChange={handleChange}
                >
                  <option value="">None</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Method */}
            <div className="form-group">
              <label htmlFor="method">HTTP Method *</label>
              <select
                id="method"
                name="method"
                value={form.method}
                onChange={handleChange}
                required
              >
                {HTTP_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Path */}
            <div className="form-group">
              <label htmlFor="path">Path *</label>
              <input
                id="path"
                name="path"
                value={form.path}
                onChange={handleChange}
                placeholder="/crif/check"
                required
              />
              <span className="form-hint">Must start with /. Accessible at /mock{form.path || '...'}</span>
            </div>

            {/* Status code */}
            <div className="form-group">
              <label htmlFor="statusCode">Response Status Code *</label>
              <input
                id="statusCode"
                name="statusCode"
                type="number"
                min={100}
                max={599}
                value={form.statusCode}
                onChange={handleChange}
                required
              />
            </div>

            {/* Delay */}
            <div className="form-group">
              <label htmlFor="delayMs">Artificial Delay (ms)</label>
              <input
                id="delayMs"
                name="delayMs"
                type="number"
                min={0}
                max={300000}
                value={form.delayMs}
                onChange={handleChange}
              />
              <span className="form-hint">0 = no delay. Max 300 000 ms (5 min).</span>
            </div>

            {/* Simulate Timeout */}
            <div className="form-group">
              <label>Options</label>
              <div className="checkbox-row" style={{ marginTop: 4 }}>
                <input
                  id="simulateTimeout"
                  name="simulateTimeout"
                  type="checkbox"
                  checked={form.simulateTimeout}
                  onChange={handleChange}
                />
                <label htmlFor="simulateTimeout">
                  Simulate timeout — apply delay then return HTTP 408
                </label>
              </div>
            </div>

            {/* Response Body */}
            <div className="form-group full-width">
              <label htmlFor="responseBody">Response Body (JSON)</label>
              <textarea
                id="responseBody"
                name="responseBody"
                rows={8}
                value={form.responseBody}
                onChange={handleChange}
                placeholder={'{\n  "status": "ok",\n  "data": {}\n}'}
              />
            </div>

            {/* Response Headers */}
            <div className="form-group full-width">
              <div className="conditions-header">
                <label>Response Headers</label>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    const rows = parseResponseHeaders(form.responseHeaders);
                    rows.push({ key: '', value: '' });
                    setForm((prev) => ({ ...prev, responseHeaders: serializeResponseHeaders(rows) }));
                  }}
                >
                  + Header
                </button>
              </div>
              {parseResponseHeaders(form.responseHeaders).length === 0 && (
                <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                  No custom response headers. Click "+ Header" to add.
                </p>
              )}
              {parseResponseHeaders(form.responseHeaders).map((h, hi) => (
                <div className="header-input-row" key={hi}>
                  <input
                    placeholder="Header name (e.g. X-Request-Id)"
                    value={h.key}
                    onChange={(e) => {
                      const rows = parseResponseHeaders(form.responseHeaders);
                      rows[hi] = { ...rows[hi], key: e.target.value };
                      setForm((prev) => ({ ...prev, responseHeaders: serializeResponseHeaders(rows) }));
                    }}
                  />
                  <input
                    placeholder="Value"
                    value={h.value}
                    disabled={h.value === '{{$guid}}'}
                    onChange={(e) => {
                      const rows = parseResponseHeaders(form.responseHeaders);
                      rows[hi] = { ...rows[hi], value: e.target.value };
                      setForm((prev) => ({ ...prev, responseHeaders: serializeResponseHeaders(rows) }));
                    }}
                  />
                  <button
                    type="button"
                    className={`btn btn-sm ${h.value === '{{$guid}}' ? 'btn-guid-active' : 'btn-ghost'}`}
                    title="Auto-generate GUID on each request"
                    onClick={() => {
                      const rows = parseResponseHeaders(form.responseHeaders);
                      rows[hi] = { ...rows[hi], value: rows[hi].value === '{{$guid}}' ? '' : '{{$guid}}' };
                      setForm((prev) => ({ ...prev, responseHeaders: serializeResponseHeaders(rows) }));
                    }}
                  >GUID</button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      const rows = parseResponseHeaders(form.responseHeaders).filter((_, i) => i !== hi);
                      setForm((prev) => ({ ...prev, responseHeaders: serializeResponseHeaders(rows) }));
                    }}
                  >×</button>
                </div>
              ))}
            </div>

            {/* Authentication Simulation */}
            {isAuthenticated && (
              <div className="form-group full-width">
                <div className="conditions-header">
                  <label>Authentication Simulation</label>
                </div>

                <div className="auth-config-section">
                  <div className="form-group">
                    <label htmlFor="authType">Auth Type</label>
                    <select
                      id="authType"
                      value={authConfig.type}
                      onChange={(e) => setAuthConfig((prev) => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="NONE">None</option>
                      <option value="BASIC">Basic Auth</option>
                      <option value="JWT">JWT Bearer</option>
                      <option value="OAUTH2">OAuth2</option>
                    </select>
                  </div>

                  {/* BASIC fields */}
                  {authConfig.type === 'BASIC' && (
                    <>
                      <div className="auth-fields-row">
                        <div className="form-group">
                          <label>Username</label>
                          <input
                            value={authConfig.username}
                            onChange={(e) => setAuthConfig((prev) => ({ ...prev, username: e.target.value }))}
                            placeholder="mock-user"
                          />
                        </div>
                        <div className="form-group">
                          <label>Password</label>
                          <input
                            type="password"
                            value={authConfig.password}
                            onChange={(e) => setAuthConfig((prev) => ({ ...prev, password: e.target.value }))}
                            placeholder="mock-password"
                          />
                        </div>
                      </div>
                      <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                        Requests must include <code>Authorization: Basic base64(username:password)</code>
                      </p>
                    </>
                  )}

                  {/* JWT fields */}
                  {authConfig.type === 'JWT' && (
                    <>
                      <div className="auth-fields-row">
                        <div className="form-group">
                          <label>Secret Key *</label>
                          <input
                            value={authConfig.secretKey}
                            onChange={(e) => setAuthConfig((prev) => ({ ...prev, secretKey: e.target.value }))}
                            placeholder="my-secret-key-at-least-32-chars"
                          />
                        </div>
                        <div className="form-group">
                          <label>Issuer (optional)</label>
                          <input
                            value={authConfig.issuer}
                            onChange={(e) => setAuthConfig((prev) => ({ ...prev, issuer: e.target.value }))}
                            placeholder="simuapi"
                          />
                        </div>
                        <div className="form-group">
                          <label>Expiration (sec)</label>
                          <input
                            type="number"
                            min={60}
                            value={authConfig.expirationSeconds}
                            onChange={(e) => setAuthConfig((prev) => ({ ...prev, expirationSeconds: Number(e.target.value) }))}
                          />
                        </div>
                      </div>
                      <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                        Requests must include a valid <code>Authorization: Bearer &lt;jwt-token&gt;</code> signed with this secret.
                      </p>
                    </>
                  )}

                  {/* OAUTH2 fields */}
                  {authConfig.type === 'OAUTH2' && (
                    <>
                      <div className="auth-fields-row">
                        <div className="form-group">
                          <label>Secret Key *</label>
                          <input
                            value={authConfig.secretKey}
                            onChange={(e) => setAuthConfig((prev) => ({ ...prev, secretKey: e.target.value }))}
                            placeholder="my-secret-key-at-least-32-chars"
                          />
                        </div>
                        <div className="form-group">
                          <label>Issuer (optional)</label>
                          <input
                            value={authConfig.issuer}
                            onChange={(e) => setAuthConfig((prev) => ({ ...prev, issuer: e.target.value }))}
                            placeholder="simuapi"
                          />
                        </div>
                        <div className="form-group">
                          <label>Expiration (sec)</label>
                          <input
                            type="number"
                            min={60}
                            value={authConfig.expirationSeconds}
                            onChange={(e) => setAuthConfig((prev) => ({ ...prev, expirationSeconds: Number(e.target.value) }))}
                          />
                        </div>
                      </div>
                      <div className="checkbox-row" style={{ marginTop: 8 }}>
                        <input
                          id="tokenEndpointEnabled"
                          type="checkbox"
                          checked={authConfig.tokenEndpointEnabled}
                          onChange={(e) => setAuthConfig((prev) => ({ ...prev, tokenEndpointEnabled: e.target.checked }))}
                        />
                        <label htmlFor="tokenEndpointEnabled">Enable token endpoint</label>
                      </div>
                      {authConfig.tokenEndpointEnabled && isEdit && (
                        <div className="oauth-info-box">
                          <p className="oauth-info-title">OAuth2 Token Endpoint</p>
                          <code className="oauth-endpoint-url">POST /mock/{id}/oauth/token</code>
                          <p className="oauth-info-subtitle">Example curl:</p>
                          <pre className="oauth-curl-example">{`curl -X POST "${window.location.origin}/mock/${id}/oauth/token" \\\n  -d "grant_type=client_credentials"`}</pre>
                          <p className="oauth-info-subtitle">Example response:</p>
                          <pre className="oauth-curl-example">{`{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": ${authConfig.expirationSeconds}
}`}</pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Scenarios (PRO) */}
            {isPro && isEdit && (
              <div className="form-group full-width">
                <ScenarioBuilder
                  scenarios={scenarios}
                  onAdd={handleAddScenario}
                  onUpdate={handleUpdateScenario}
                  onDelete={handleDeleteScenario}
                  saving={saving}
                />
              </div>
            )}
            {isPro && !isEdit && (
              <div className="form-group full-width">
                <p className="text-muted" style={{ fontSize: 12 }}>
                  Save the mock first, then add scenarios with conditions.
                </p>
              </div>
            )}
            {!isPro && (
              <div className="form-group full-width">
                <label>
                  Scenarios{' '}
                  <span className="plan-badge plan-pro" style={{ marginLeft: 8, fontSize: 10 }}>PRO</span>
                </label>
                <p className="text-muted" style={{ fontSize: 12 }}>
                  Upgrade to PRO to use rule-based scenarios with conditions.
                </p>
              </div>
            )}

          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Mock'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
