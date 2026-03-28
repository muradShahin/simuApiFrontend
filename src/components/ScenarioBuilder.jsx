import { useState } from 'react';

const CONDITION_TYPES = [
  { value: 'QUERY_PARAM', label: 'Query Param' },
  { value: 'BODY',        label: 'JSON Body' },
  { value: 'HEADER',      label: 'Header' },
];

const OPERATORS = [
  { value: 'EQUALS',       label: '=' },
  { value: 'NOT_EQUALS',   label: '≠' },
  { value: 'CONTAINS',     label: 'contains' },
  { value: 'GREATER_THAN', label: '>' },
  { value: 'LESS_THAN',    label: '<' },
];

const EMPTY_CONDITION = { type: 'QUERY_PARAM', field: '', operator: 'EQUALS', value: '' };

function ConditionRow({ condition, index, onChange, onRemove }) {
  function update(key, val) {
    onChange(index, { ...condition, [key]: val });
  }

  return (
    <div className="condition-row">
      <select value={condition.type} onChange={(e) => update('type', e.target.value)}>
        {CONDITION_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <input
        placeholder={condition.type === 'BODY' ? 'customer.id' : condition.type === 'HEADER' ? 'Authorization' : 'paramName'}
        value={condition.field}
        onChange={(e) => update('field', e.target.value)}
      />

      <select value={condition.operator} onChange={(e) => update('operator', e.target.value)}>
        {OPERATORS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <input
        placeholder="value"
        value={condition.value}
        onChange={(e) => update('value', e.target.value)}
      />

      <button type="button" className="btn btn-danger btn-sm" onClick={() => onRemove(index)}>×</button>
    </div>
  );
}

const ERROR_TEMPLATES = [
  { label: '400 Bad Request',  statusCode: 400, responseBody: '{"error":"Bad Request","message":"Invalid request parameters"}' },
  { label: '401 Unauthorized', statusCode: 401, responseBody: '{"error":"Unauthorized","message":"Authentication required"}' },
  { label: '403 Forbidden',    statusCode: 403, responseBody: '{"error":"Forbidden","message":"Insufficient permissions"}' },
  { label: '404 Not Found',    statusCode: 404, responseBody: '{"error":"Not Found","message":"Resource not found"}' },
  { label: '429 Rate Limited', statusCode: 429, responseBody: '{"error":"Too Many Requests","message":"Rate limit exceeded"}' },
  { label: '500 Server Error', statusCode: 500, responseBody: '{"error":"Internal Server Error","message":"Something went wrong"}' },
  { label: '503 Unavailable',  statusCode: 503, responseBody: '{"error":"Service Unavailable","message":"Service temporarily unavailable"}' },
];

export default function ScenarioBuilder({ scenarios, onAdd, onUpdate, onDelete, saving }) {
  const [expanded, setExpanded] = useState(null);

  function toggleExpand(id) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  function handleFieldChange(scenario, key, value) {
    const updated = { ...scenario, [key]: key === 'statusCode' || key === 'delayMs' || key === 'priority' ? Number(value) : value };
    onUpdate(updated);
  }

  function handleConditionChange(scenario, condIndex, updated) {
    const conditions = [...scenario.conditions];
    conditions[condIndex] = updated;
    onUpdate({ ...scenario, conditions });
  }

  function handleConditionRemove(scenario, condIndex) {
    const conditions = scenario.conditions.filter((_, i) => i !== condIndex);
    onUpdate({ ...scenario, conditions });
  }

  function handleAddCondition(scenario) {
    onUpdate({ ...scenario, conditions: [...scenario.conditions, { ...EMPTY_CONDITION }] });
  }

  function parseHeaders(val) {
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

  function serializeHeaders(rows) {
    if (rows.length === 0) return '';
    return JSON.stringify(rows);
  }

  function handleHeaderChange(scenario, idx, field, val) {
    const rows = parseHeaders(scenario.responseHeaders);
    rows[idx] = { ...rows[idx], [field]: val };
    onUpdate({ ...scenario, responseHeaders: serializeHeaders(rows) });
  }

  function handleAddHeader(scenario) {
    const rows = parseHeaders(scenario.responseHeaders);
    rows.push({ key: '', value: '' });
    onUpdate({ ...scenario, responseHeaders: serializeHeaders(rows) });
  }

  function handleRemoveHeader(scenario, idx) {
    const rows = parseHeaders(scenario.responseHeaders).filter((_, i) => i !== idx);
    onUpdate({ ...scenario, responseHeaders: serializeHeaders(rows) });
  }

  function applyTemplate(tmpl) {
    onAdd({
      name: tmpl.label,
      description: '',
      priority: 0,
      statusCode: tmpl.statusCode,
      responseBody: tmpl.responseBody,
      delayMs: 0,
      conditions: [],
    });
  }

  return (
    <div className="scenario-builder">
      <div className="scenario-header">
        <h3>Scenarios</h3>
        <div className="scenario-header-actions">
          <div className="template-dropdown">
            <button type="button" className="btn btn-ghost btn-sm template-trigger">
              Quick Add ▾
            </button>
            <div className="template-menu">
              {ERROR_TEMPLATES.map((t) => (
                <button key={t.label} type="button" className="template-item" onClick={() => applyTemplate(t)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onAdd({ name: '', description: '', priority: 0, statusCode: 200, responseBody: '', responseHeaders: '', delayMs: 0, conditions: [] })}
          >
            + Add Scenario
          </button>
        </div>
      </div>

      {scenarios.length === 0 && (
        <div className="empty-state" style={{ padding: '32px 16px' }}>
          <p>No scenarios yet. Add one to return different responses based on request data.</p>
        </div>
      )}

      {scenarios.map((sc) => (
        <div key={sc.id || sc._tempId} className="scenario-card">
          <div className="scenario-card-header" onClick={() => toggleExpand(sc.id || sc._tempId)}>
            <div className="scenario-card-title">
              <span className="scenario-expand">{expanded === (sc.id || sc._tempId) ? '▾' : '▸'}</span>
              <span className="scenario-name">{sc.name || '(unnamed)'}</span>
              <span className="badge badge-2xx" style={{ marginLeft: 8 }}>{sc.statusCode}</span>
              {sc.conditions.length > 0 && (
                <span className="text-muted" style={{ marginLeft: 8, fontSize: 11 }}>
                  {sc.conditions.length} condition{sc.conditions.length > 1 ? 's' : ''}
                </span>
              )}
              <span className="text-muted" style={{ marginLeft: 'auto', fontSize: 11 }}>
                Priority: {sc.priority}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={(e) => { e.stopPropagation(); onDelete(sc); }}
              disabled={saving}
            >
              Delete
            </button>
          </div>

          {expanded === (sc.id || sc._tempId) && (
            <div className="scenario-card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input value={sc.name} onChange={(e) => handleFieldChange(sc, 'name', e.target.value)} placeholder="e.g. Validation Error" />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <input type="number" min={0} value={sc.priority} onChange={(e) => handleFieldChange(sc, 'priority', e.target.value)} />
                  <span className="form-hint">Higher = evaluated first</span>
                </div>
                <div className="form-group">
                  <label>Status Code</label>
                  <input type="number" min={100} max={599} value={sc.statusCode} onChange={(e) => handleFieldChange(sc, 'statusCode', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Delay (ms)</label>
                  <input type="number" min={0} max={300000} value={sc.delayMs} onChange={(e) => handleFieldChange(sc, 'delayMs', e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <input value={sc.description || ''} onChange={(e) => handleFieldChange(sc, 'description', e.target.value)} placeholder="Optional description" />
                </div>
                <div className="form-group full-width">
                  <label>Response Body</label>
                  <textarea
                    rows={5}
                    value={sc.responseBody || ''}
                    onChange={(e) => handleFieldChange(sc, 'responseBody', e.target.value)}
                    placeholder={'{\n  "error": "..."\n}'}
                  />
                </div>

                {/* Response Headers */}
                <div className="form-group full-width">
                  <div className="conditions-header">
                    <label>Response Headers</label>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleAddHeader(sc)}>
                      + Header
                    </button>
                  </div>
                  {parseHeaders(sc.responseHeaders).length === 0 && (
                    <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                      No custom response headers.
                    </p>
                  )}
                  {parseHeaders(sc.responseHeaders).map((h, hi) => (
                    <div className="header-input-row" key={hi}>
                      <input
                        placeholder="Header name"
                        value={h.key}
                        onChange={(e) => handleHeaderChange(sc, hi, 'key', e.target.value)}
                      />
                      <input
                        placeholder="Value"
                        value={h.value}
                        disabled={h.value === '{{$guid}}'}
                        onChange={(e) => handleHeaderChange(sc, hi, 'value', e.target.value)}
                      />
                      <button
                        type="button"
                        className={`btn btn-sm ${h.value === '{{$guid}}' ? 'btn-guid-active' : 'btn-ghost'}`}
                        title="Auto-generate GUID on each request"
                        onClick={() => {
                          const rows = parseHeaders(sc.responseHeaders);
                          rows[hi] = { ...rows[hi], value: rows[hi].value === '{{$guid}}' ? '' : '{{$guid}}' };
                          onUpdate({ ...sc, responseHeaders: serializeHeaders(rows) });
                        }}
                      >GUID</button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveHeader(sc, hi)}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div className="conditions-section">
                <div className="conditions-header">
                  <label>Conditions <span className="text-muted">(all must match)</span></label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleAddCondition(sc)}>
                    + Condition
                  </button>
                </div>
                {sc.conditions.length === 0 && (
                  <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                    No conditions — this scenario will always match (use priority to control order).
                  </p>
                )}
                {sc.conditions.map((cond, ci) => (
                  <ConditionRow
                    key={ci}
                    condition={cond}
                    index={ci}
                    onChange={(idx, updated) => handleConditionChange(sc, idx, updated)}
                    onRemove={(idx) => handleConditionRemove(sc, idx)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
