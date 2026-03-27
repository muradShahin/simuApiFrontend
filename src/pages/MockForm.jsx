import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMock, getMockById, updateMock } from '../api/mocks';
import { getScenarios, createScenario, updateScenario, deleteScenario } from '../api/scenarios';
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
  simulateTimeout: false,
};

export default function MockForm() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const isEdit      = Boolean(id);
  const { isPro, isAuthenticated } = useAuth();

  const [form, setForm]             = useState(EMPTY_FORM);
  const [scenarios, setScenarios]   = useState([]);
  const [loading, setLoading]       = useState(isEdit);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [loaded, setLoaded]         = useState(false);

  let _tempCounter = 0;

  // Load existing mock + scenarios when editing (once only)
  useEffect(() => {
    if (!isEdit || loaded) return;
    Promise.all([getMockById(id), isPro ? getScenarios(id).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })])
      .then(([mockRes, scenRes]) => {
        const m = mockRes.data;
        setForm({
          name:            m.name,
          path:            m.path,
          method:          m.method,
          statusCode:      m.statusCode,
          delayMs:         m.delayMs,
          responseBody:    m.responseBody ?? '',
          simulateTimeout: m.simulateTimeout,
        });
        setScenarios(scenRes.data.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          priority: s.priority,
          statusCode: s.statusCode,
          responseBody: s.responseBody || '',
          delayMs: s.delayMs,
          conditions: (s.conditions || []).map((c) => ({
            type: c.type,
            field: c.field,
            operator: c.operator,
            value: c.value,
          })),
          _dirty: false,
        })));
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
